'use strict'

/**
 * @author WXP
 * @description 用户余额交易相关逻辑
 */

const TradeGateway = require('../tradeGateway');
const TradeRecord = require('../tradeRecord');
const ddPayDb = require('../../models/ddPayDb');
const {
    //支付账户db
    TradeAccount: TradeAccountDb,
    WithdrawApply: WithdrawApplyDb,
    WithdrawApplyLog: WithdrawApplyLogDb,
    Db
} = ddPayDb;

const { Sequence } = require('../../lib/rpc');
const TRANSFER_APPLY_SEQUENCE_NAME = 'ddpayTransferApplyNo';

const {
    parseRecord,
    transfer,
    transferIn,
    initPayCharge,
    initDecrease,
    TRADE_ACCOUNT_FIELDS,
    TRADE_TYPES,
} = require('./comm');

const {
    freezeBalance,
    dismissFrozenRecord
} = require('./frozen');

const Promise = require('bluebird');


/**
 * 修改记录状态和日志增加
 * @param par
 * @param options
 * @returns {*}
 */
const withDrawCreateAndLogUpdate = function (par, options) {

    let {
        updateInfo,
        createInfo,
        applyId
    } = par;

    let transaction = options.transaction;

    return Promise.props({
        updateWidthDb: WithdrawApplyDb.update(updateInfo, {
            where: {
                id: applyId
            },
            transaction: transaction
        }),
        createLog: WithdrawApplyLogDb.create(createInfo, {
            transaction: transaction
        })
    })
};

/**
 * 转账逻辑
 * @param par
 * @param options
 * @returns {Promise.<TResult>}
 */
const withdrawTransfer = function (par, options) {
    let {
        numberId,
        system,
        orderType,
        amount,
        tradeType,
        realName,
        thirdPartAccount,
        tradePrincipal,
        remark,
        accountId,
        frozenRecordId,
        applyId,
        withStatus,
        tipFrozenRecordId
    } = par;

    let transaction = options.transaction;
    let transferData;
    let isCommit = true;


    //  向支付网关发起提现申请
    return TradeGateway.Transfer.transfer({
        orderType: `${system}|${orderType}`,
        orderId: numberId,
        system: global.SYSTEM,
        fee: amount,
        tradeType: tradeType,
        realName: realName,
        thirdPartAccount: thirdPartAccount,
        tradePrincipal: tradePrincipal,
        remark: remark,
        accountId
    })
        .then((data)=> {
            let {
                userInfoError
            } = data;
            transferData = data;
            //  如果是用户基本信息错误的时候，则将用户金额归还
            if (userInfoError) {
                return dismissFrozenRecord({
                    frozenRecordId: frozenRecordId,
                    numberId: numberId,
                    remark
                }, {
                    transaction: transaction,
                    lock: transaction.LOCK.UPDATE
                })
                    .then(()=> {
                        if (tipFrozenRecordId) {
                            return dismissFrozenRecord({
                                frozenRecordId: tipFrozenRecordId,
                                numberId: numberId,
                                remark
                            }, {
                                transaction: transaction,
                                lock: transaction.LOCK.UPDATE
                            })
                        }
                    })
                    .then(()=> {
                        //  记录日志
                        return withDrawCreateAndLogUpdate({
                            updateInfo: {
                                //  todo 记录单号
                                status: -10,
                                message: userInfoError
                            },
                            createInfo: {
                                beforeStatus: withStatus,
                                afterStatus: -10,
                                message: '用户信息错误，导致提现失败',
                                WithdrawApplyId: applyId
                            },
                            applyId: applyId
                        }, {
                            transaction: transaction
                        })
                    })
                    .catch(()=> {
                        //  如果出现归还的失败的情况，则事物需要回滚
                        isCommit = false;
                    })
                    .finally(()=> {
                        throw ({
                            message: userInfoError,
                            isUserError: true,
                            isCommit: isCommit
                        })
                    })
            }
            return data
        })
        .then((data)=> {
            //  说明不是因为用户错误导致的体现失败，系统问题，此时单据变成处理中
            let updateInfo = {
                transferRecordNo: data.tradeRecordNo,
                status: 1
            };
            let createInfo = {
                beforeStatus: withStatus,
                afterStatus: 1,
                WithdrawApplyId: applyId,
                message: '成功，主表记录转账单号'
            };
            if (data.code) {
                updateInfo = {
                    status: -5,  //转账标记成撤销 可重试
                    message: data.code,
                    transferRecordNo: data.tradeRecordNo
                };
                createInfo = {
                    beforeStatus: withStatus,
                    afterStatus: -5,    //可撤销,可重试
                    WithdrawApplyId: applyId,
                    message: data.code
                }
            }
            //  记录操作日志
            return withDrawCreateAndLogUpdate({
                updateInfo: updateInfo,
                createInfo: createInfo,
                applyId: applyId
            }, {
                transaction: transaction
            })
        })
        .then(()=> {
            return {
                tradeRecordNo: transferData.tradeRecordNo,
                code: transferData.code || null,
                withdrawApplyNo: numberId,
                isCommit: isCommit
            }
        })
        .catch((error)=> {
            if (error.isUserError) {
                return {
                    isCommit: isCommit,
                    error: error.message
                }
            }
            return {
                isCommit: isCommit,
                code: 'system_error',
                withdrawApplyNo: numberId,
                tradeRecordNo: null
            }
        })
};

/**
 * 余额提现
 * @type {Function}
 */
const withdrawCash = function (par) {

    let {
        tradeAccountNo,
        amount,
        operateLogNo,
        orderType,
        orderId,
        remark,
        tradeType = 'ALI_PAY',
        thirdPartAccount,
        realName,
        tradePrincipal,
        system,
        accountId,
        tip
    } = par;

    let transaction;
    let secondTransaction;
    let applyData;
    let frozenData;
    let tipFrozenData;
    let numberId;
    let resp;

    //  获取事物

    return WithdrawApplyDb.find({
        where: {
            system,
            orderType,
            orderId
        }
    })
        .then((data)=> {
            if (data) {
                throw ('此单据已提现， 请勿重复提现')
            }
            return Db.transaction()
        })
        .then((t)=> {
            transaction = t;
            //  创建提现申请记录
            return Sequence.sequence.get({
                name: TRANSFER_APPLY_SEQUENCE_NAME
            })
        })
        .then((result)=> {
            numberId = 'ddpay_transfer_' + result.data;
            return WithdrawApplyDb.create({
                numberId: numberId,
                orderId: orderId,   //业务单号
                system: system,  //来源系统
                orderType,      //业务类型
                reqAccountId: accountId, //账户Id
                amount,     //金额
                thirdPartAccount,   //第三方的账号
                realName,    //真实姓名
                tradeType,
                status: 0,   //申请状态
                remark,     //备注
                tradeAccountNo, //用户账户编号
                tradePrincipal,
                operateLogNo,
                tip
            }, {
                transaction: transaction
            })
        })
        .then((result)=> {
            applyData = result;
            //  冻结金额
            return freezeBalance({
                tradeAccountNo,
                amount,
                numberId: applyData.numberId,
                tradeType: TRADE_TYPES['WITHDRAW_CASH'],
                remark
            },{
                transaction,
                lock: transaction.LOCK.UPDATE   //行锁
            })
                .then((result)=> {
                    return result
                })
                .catch((error)=> {
                    //  冻结金额失败，直接回滚
                    throw (error);
                })
        })
        .then((result)=> {
            frozenData = result;
            if (tip && parseFloat(tip) > 0) {
                //  冻结服务费
                return freezeBalance({
                    tradeAccountNo,
                    amount: tip,
                    numberId: applyData.numberId,
                    tradeType: TRADE_TYPES['WITHDRAW_TIP'],
                    remark
                },{
                    transaction,
                    lock: transaction.LOCK.UPDATE   //行锁
                })
                    .then((result)=> {
                        return result
                    })
                    .catch((error)=> {
                        //  冻结金额失败，直接回滚
                        throw (error);
                    })
            }
        })
        .then((result)=> {
            if (result) {
                tipFrozenData = result;
            }
            //修改状态并记录日志
            return withDrawCreateAndLogUpdate({
                updateInfo: {
                    FrozenRecordId: frozenData.id,
                    tipFrozenRecordId: tipFrozenData && tipFrozenData.id,
                    TradeAccountId: frozenData.TradeAccountId,
                    status: 1   //申请成功
                },
                createInfo: {
                    beforeStatus: null,
                    afterStatus: 1,
                    message: '提现申请记录冻结成功',
                    WithdrawApplyId: applyData.id
                },
                applyId: applyData.id
            }, {
                transaction: transaction
            });
        })
        .then(()=> {
            //  冻结操作完成， 进行下一次操作
            return transaction.commit()
        })
        .then(()=> {
            //  第二段事物开启
            return Db.transaction()
        })
        .then((t)=> {
            secondTransaction = t;
            return withdrawTransfer({
                numberId,
                system,
                orderType,
                amount,
                tradeType,
                realName,
                thirdPartAccount,
                tradePrincipal,
                remark,
                accountId,
                frozenRecordId: frozenData.id,
                tipFrozenRecordId: tipFrozenData && tipFrozenData.id,
                applyId: applyData.id,
                withStatus: 1
            }, {
                transaction: secondTransaction
            })
        })
        .then((data)=> {
            resp = data;
            if (resp.isCommit) {
                return secondTransaction.commit()
                    .then(()=> {
                        if (resp.error) {
                            throw (resp.error)
                        }
                        return {
                            code: resp.code,
                            withdrawApplyNo: resp.withdrawApplyNo,
                            tradeRecordNo: resp.tradeRecordNo
                        }
                    })
            } else {
                return secondTransaction.rollback()
                    .then(()=> {
                        throw (resp.error)
                    })
            }
        })
        .catch((error)=> {
            //  第一段事物直接出错， 第二段还不在的时候，直接回滚
            if (transaction && !secondTransaction) {
                return transaction.rollback()
                    .then(()=> {
                        throw (error)
                    })
            }
            throw (error)
        })
};

/**
 * 撤销转账
 * @param par
 * @param options
 */
const cancelWithdrawCash = function (par, options) {
    let {
        numberId,
        remark
    } = par;

    let transaction = options.transaction;
    let widthData;

    return WithdrawApplyDb.find({
        where: {
            numberId: numberId,
            status: -5  //处于可撤销的单子
        },
        raw: true
    })
        .then((result)=> {
            if (!result) {
                throw ('单据不存在')
            }
            widthData = result;
            return dismissFrozenRecord({
                frozenRecordId: result.FrozenRecordId,
                numberId: result.numberId,
                remark
            }, {
                transaction,
                lock: transaction.LOCK.UPDATE
            })
        })
        .then(()=> {
            if (widthData.tipFrozenRecordId) {
                return dismissFrozenRecord({
                    frozenRecordId: widthData.tipFrozenRecordId,
                    numberId: widthData.numberId,
                    remark
                }, {
                    transaction,
                    lock: transaction.LOCK.UPDATE
                })
            }
        })
        .then(()=> {
            return withDrawCreateAndLogUpdate({
                updateInfo: {
                    status: -10   //撤销成功
                },
                createInfo: {
                    beforeStatus: widthData.status,
                    afterStatus: -10,
                    message: '转账失败，撤销成功',
                    WithdrawApplyId: widthData.id
                },
                applyId: widthData.id
            }, {
                transaction: transaction
            })
        })
        .then(()=> {
            return null;
        })
};

const repeatWithdrawCash = function (par) {

    let {
        numberId,
        remark,
        operateLogNo
    } = par;

    let transaction;
    let widthData;
    let resp;

    return Db.transaction()
        .then((t)=> {
            transaction = t;
            return WithdrawApplyDb.find({
                where: {
                    numberId: numberId,
                    status: -5  //处于可撤销,也可从新发起转账的单子
                },
                raw: true
            })
        })
        .then((result)=> {
            if (!result) {
                throw ('单据不存在')
            }
            widthData = result;

            return withdrawTransfer({
                numberId: widthData.numberId,
                system: widthData.system,
                orderType: widthData.system,
                amount: widthData.amount,
                tradeType: widthData.tradeType,
                realName: widthData.realName,
                thirdPartAccount: widthData.thirdPartAccount,
                tradePrincipal: widthData.tradePrincipal,
                remark: remark,
                accountId: widthData.reqAccountId,
                frozenRecordId: widthData.FrozenRecordId,
                tipFrozenRecordId: widthData.tipFrozenRecordId,
                applyId: widthData.id,
                operateLogNo,
                orderId: widthData.orderId
            }, {
                transaction: transaction,
                repeat: true
            })
        })
        .then((data)=> {
            resp = data;
            if (resp.isCommit) {
                return transaction.commit()
                    .then(()=> {
                        if (resp.error) {
                            throw (resp.error)
                        }
                        return {
                            code: resp.code,
                            withdrawApplyNo: resp.withdrawApplyNo,
                            tradeRecordNo: resp.tradeRecordNo
                        }
                    })
            } else {
                return transaction.rollback()
                    .then(()=> {
                        throw (resp.error)
                    })
            }
        })
        .catch((error)=> {
            throw (error)
        })
};

/**
 * 把余额转到押金
 * @type {Function}
 */
const balanceToDeposit = function (par, options) {
    let {
        tradeAccountNo,
        tradePwd,
        amount,
        operateLogNo,
        orderType,
        orderId,
        remark,
        system,
        tradePrincipal
    } = par;
    let transaction = options.transaction;
    return transfer({
            fromTradeAccountNo: tradeAccountNo,
            toTradeAccountNo: tradeAccountNo,
            tradePwd: tradePwd,
            amount: amount,
            type: TRADE_TYPES.BALANCE_TO_DEPOSIT,
            fromField: TRADE_ACCOUNT_FIELDS.BALANCE,
            toField: TRADE_ACCOUNT_FIELDS.DEPOSIT,
            operateLogNo: operateLogNo,
            orderType: orderType,
            orderId: orderId,
            remark: remark,
            system,
            tradePrincipal
        }, {
            transaction: transaction,
            lock: transaction.LOCK.UPDATE
        })
        .then((data) => {
            return parseRecord(data.inRecord);
        })
};


/**
 * 支付充值余额
 * 需要先去网关支付，等支付成功回调增加交易账户的余额
 * @type {Function}
 */
const payChargeBalance = initPayCharge({
    type: TRADE_TYPES.PAY_CHARGE_BALANCE,
    field: TRADE_ACCOUNT_FIELDS.BALANCE
});

/**
 * 减少余额方法
 */
const decreaseBalance = initDecrease({
    field: TRADE_ACCOUNT_FIELDS.BALANCE,
    type: TRADE_TYPES.DECREASE_BALANCE
});

/**
 * 用户自己账户之间的余额转账
 */
const selfTransfer = function (par, options) {
    let {
        tradeAccountNo: fromTradeAccountNo,
        toTradeAccountNo: toTradeAccountNo,
        tradePwd,
        amount,
        fromField = TRADE_ACCOUNT_FIELDS.BALANCE,
        toField = TRADE_ACCOUNT_FIELDS.BALANCE,
        operateLogNo,
        orderType,
        orderId,
        remark,
        system,
        tradePrincipal
    } = par;
    options.lock = options.transaction.LOCK.UPDATE;
    // 分开查询以校验账户的校验码，批量查询不会校验账户校验码
    return TradeAccountDb.find({
            where: {
                tradeAccountNo: fromTradeAccountNo
            }
        })
        .then((account1) => {
            if (!account1) {
                return Promise.reject('没有对应的账户！');
            }
            return TradeAccountDb.find({
                    where: {
                        tradeAccountNo: toTradeAccountNo
                    }
                })
                .then((account2) => {
                    if (!account2) {
                        return Promise.reject('没有对应的账户！');
                    }
                    if (account1.AccountId != account2.AccountId) {
                        return Promise.reject('两个支付账户不属于同一主账户！');
                    }
                })
        })
        .then(() => {
            return transfer({
                fromTradeAccountNo: fromTradeAccountNo,
                toTradeAccountNo: toTradeAccountNo,
                amount: amount,
                type: TRADE_TYPES.SELF_TRANSFER,
                fromField: fromField,
                toField: toField,
                operateLogNo: operateLogNo,
                orderType: orderType,
                orderId: orderId,
                tradePwd: tradePwd,
                remark: remark,
                system,
                tradePrincipal
            }, options)
        })
        .then((data) => {
            return parseRecord(data.outRecord);
        })
}

/**
 * 增加余额
 * @type {Function}
 */
const chargeBalance = function (par, options) {
    let {
        tradeAccountNo,
        amount,
        operateLogNo,
        orderType,
        orderId,
        remark,
        system,
        tradePrincipal
    } = par;
    let transaction = options.transaction;

    //  单据重复校验
    return TradeRecord.find({
        system,
        orderType,
        orderId,
        tradeType: TRADE_TYPES.CHARGE_COMMISSION
    })
        .then((data)=> {
            if (data) {
                throw ('此订单已充值，请勿重复充值')
            }
            return transferIn({
                tradeAccountNo: tradeAccountNo,
                amount: amount,
                type: TRADE_TYPES.CHARGE_COMMISSION,
                field: TRADE_ACCOUNT_FIELDS.BALANCE,
                operateLogNo: operateLogNo,
                orderType: orderType,
                orderId: orderId,
                remark: remark,
                system,
                tradePrincipal
            }, {
                transferIn: transaction,
                lock: transaction.LOCK.UPDATE
            })
        })
        .then((data) => {
            return parseRecord(data);
        })


};

module.exports = {
    withdrawCash,
    balanceToDeposit,
    payChargeBalance,
    decreaseBalance,
    selfTransfer,
    chargeBalance,
    cancelWithdrawCash,
    repeatWithdrawCash,
    withDrawCreateAndLogUpdate
}