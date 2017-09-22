'use strict';

/**
 * 一些交易需要的公用方法和参数
 * @author 吴秀璞
 * @since 2017/1/16
 */

const ddPayDb = require('../../models/ddPayDb');
const _ = require('lodash');
const moment = require('moment');
const TradeGateway = require('../tradeGateway');

//sequence取号服务
const {
    //支付账户db
    TradeAccount: TradeAccountDb,
    TradeRecord: TradeRecordDb,
    Db
} = ddPayDb;
const TradeRecord = require('../tradeRecord');
const PaymentRecord = require('../paymentRecord');
const TRADE_ACCOUNT_FIELDS = {
    //余额
    BALANCE: 'balance',
    //押金
    DEPOSIT: 'deposit'
};

const TRADE_RECORD_TYPES = TradeRecordDb.getTypes();

const TRADE_TYPES = {
    WITHDRAW_CASH: 'withdrawCash',
    WITHDRAW_TIP: 'withdrawTip',
    DEPOSIT_TO_BALANCE: 'depositToBalance',
    BALANCE_TO_DEPOSIT: 'balanceToDeposit',
    CHARGE_COMMISSION: 'chargeBalance',
    CHARGE_DEPOSIT: 'chargeDeposit',
    PAY_CHARGE_BALANCE: 'payChargeBalance',
    DECREASE_BALANCE: 'decreaseBalance',
    SELF_TRANSFER: 'selfTransfer'
};

const TRADE_ACCOUNT_STATUS = TradeAccountDb.getStatus();

const WE_CHAT_PAY_TRADE_TYPES = [
    'WE_CHAT_PAY_JSAPI',
    'WE_CHAT_PAY_APP',
    'WE_CHAT_PAY_NATIVE'
];

const ALI_PAY_TRADE_TYPES = [
    'ALI_PAY_APP',
    'ALI_PAY_UNION'
];

/**
 * 格式化生成的交易记录
 */
const parseRecord = function (record) {
    return {
        tradeRecordNo: record.tradeRecordNo,
        counterpartyNo: record.counterpartyNo,
        type: record.type,
        tradeType: record.tradeType,
        amount: record.totalAmount,
        field: record.field,
        orderType: record.orderType,
        orderId: record.orderId,
        system: record.system,
        tradePrincipal: record.tradePrincipal,
        afterAmount: record.afterAmount
    }
}

/**
 * 转账
 * @param par
 * @param options
 * @returns {Promise|Promise.<TResult>|*|{value}}
 */
const transfer = function (par, options) {
    let {
        fromTradeAccountNo,
        toTradeAccountNo,
        tradePwd,
        amount,
        type,
        fromField,
        toField,
        operateLogNo,
        orderType,
        orderId,
        remark,
        system,
        tradePrincipal
    } = par;
    let {
        transaction,
        lock
    } = options;
    let result = {};
    // 源账户转出
    return transferOut({
            amount: amount,
            tradeAccountNo: fromTradeAccountNo,
            field: fromField,
            tradePwd: tradePwd,
            type: type,
            counterpartyNo: toTradeAccountNo,
            operateLogNo: operateLogNo,
            orderType: orderType,
            orderId: orderId,
            remark: remark,
            system,
            tradePrincipal
        }, {
            transaction,
            lock
        })
        // 目标账户转入
        .then((data) => {
            // 转出记录
            result.outRecord = data;
            return transferIn({
                amount: amount,
                tradeAccountNo: toTradeAccountNo,
                field: toField,
                type: type,
                counterpartyNo: fromTradeAccountNo,
                operateLogNo: operateLogNo,
                orderType: orderType,
                orderId: orderId,
                remark: remark,
                system,
                tradePrincipal
            }, {
                transaction,
                lock
            })
        })
        .then((data) => {
            // 转入记录
            result.inRecord = data;
            return result;
        })
};

/**
 * 转出 当且仅当传交易密码时校验交易密码，由上层觉得是否需要交易密码，暂时如此解决
 * @param par
 * @param options
 * @returns {Promise.<TResult>}
 */
const transferOut = function (par, options) {
    let {
        transaction,
        lock
    } = options;
    let {
        amount,
        tradeAccountNo,
        field,
        tradePwd,
        type,
        counterpartyNo,
        operateLogNo,
        orderType,
        orderId,
        remark,
        system,
        tradePrincipal
    } = par;
    let tradeAccount;
    amount = parseFloat(amount);
    return TradeAccountDb.find({
            where: {
                tradeAccountNo: tradeAccountNo
            },
            transaction: transaction,
            lock
        })
        .then((data) => {
            tradeAccount = data;
            if (!tradeAccount) {
                throw (`${tradeAccountNo}没有对应的账户`);
            }
            if (tradeAccount.status !== TRADE_ACCOUNT_STATUS.ACTIVE) {
                throw (`${tradeAccountNo}账户当前状态异常`);
            }
            // FIXME 二期打开
            // if (tradePwd && !tradeAccount.tradePwd) {
            //     throw ('请先设置交易密码再操作！');
            // }
            if (tradePwd && tradeAccount.tradePwd) {
                return TradeAccountDb.tradePwdVerify(tradeAccount, tradePwd)
                    .then((isCorrect) => {
                        if (!isCorrect) {
                            return Promise.reject('交易密码错误！');
                        }
                    });
            }
        })
        .then(() => {
            return TradeRecord.create({
                amount: amount,
                field: field,
                tradeAccountId: tradeAccount.id,
                tradeAccountNo: tradeAccountNo,
                counterpartyNo: counterpartyNo,
                operateLogNo: operateLogNo,
                orderType: orderType,
                orderId: orderId,
                tradeType: type,
                type: TRADE_RECORD_TYPES.TRANSFER_OUT,
                remark: remark,
                system: system,
                tradePrincipal: tradePrincipal
            }, {
                transaction: transaction
            });
        })
        .then((record) => {
            switch (field) {
                case TRADE_ACCOUNT_FIELDS.BALANCE:
                    {
                        if (tradeAccount.balance < amount) {
                            throw ('余额不足，转出失败');
                        }
                        tradeAccount.balance -= amount;
                        break;
                    }
                case TRADE_ACCOUNT_FIELDS.DEPOSIT:
                    {
                        if (tradeAccount.deposit < amount) {
                            throw ('押金不足，转出失败');
                        }
                        tradeAccount.deposit -= amount;
                        break;
                    }
                default:
                    throw ('转出方式错误！');
            }
            let verifyCode = TradeAccountDb.calcVerifyCode(tradeAccount);
            return Db.query(`UPDATE trade_accounts SET ${field} = ${field} - ${amount} , ` +
                    `verifyCode = '${verifyCode}', ` +
                    `updatedAt = '${moment().format('YYYY-MM-DD HH:mm:ss')}' ` +
                    `WHERE id = ${tradeAccount.id};`, {
                        transaction: transaction
                    })
                .then(() => {
                    record.afterAmount = tradeAccount[field];
                    return record;
                })
        })
};

/**
 * 转入
 * @param par
 * @param options
 * @returns {Promise.<TResult>}
 */
const transferIn = function (par, options) {
    let {
        transaction,
        lock
    } = options;
    let {
        amount,
        tradeAccountNo,
        field,
        type,
        counterpartyNo,
        operateLogNo,
        orderType,
        orderId,
        outTradeRecordNo,
        remark,
        system,
        tradePrincipal
    } = par;
    let tradeAccount;
    amount = parseFloat(amount);
    return TradeAccountDb.find({
            where: {
                tradeAccountNo: tradeAccountNo
            },
            transaction: transaction,
            lock
        })
        .then((data) => {
            tradeAccount = data;
            if (!tradeAccount) {
                throw (`${tradeAccountNo}没有对应的账户`);
            }
            if (tradeAccount.status !== TRADE_ACCOUNT_STATUS.ACTIVE) {
                throw (`${tradeAccountNo}账户当前状态异常！`);
            }
        })
        .then(() => {
            return TradeRecord.create({
                amount: amount,
                field: field,
                tradeAccountId: tradeAccount.id,
                tradeAccountNo: tradeAccountNo,
                counterpartyNo: counterpartyNo,
                operateLogNo: operateLogNo,
                orderType: orderType,
                orderId: orderId,
                type: TRADE_RECORD_TYPES.TRANSFER_IN,
                tradeType: type,
                remark: remark,
                outTradeRecordNo: outTradeRecordNo,
                system,
                tradePrincipal
            }, {
                transaction: transaction
            });
        })
        .then((record) => {
            switch (field) {
                case TRADE_ACCOUNT_FIELDS.BALANCE:
                    {
                        tradeAccount.balance += amount;
                        break;
                    }
                case TRADE_ACCOUNT_FIELDS.DEPOSIT:
                    {
                        tradeAccount.deposit += amount;
                        break;
                    }
                default:
                    throw ('转出方式错误！');
            }
            let verifyCode = TradeAccountDb.calcVerifyCode(tradeAccount);
            return Db.query(`UPDATE trade_accounts SET ${field} = ${field} + ${amount} , ` +
                    `verifyCode = '${verifyCode}', ` +
                    `updatedAt = '${moment().format('YYYY-MM-DD HH:mm:ss')}' ` +
                    `WHERE id = ${tradeAccount.id};`, {
                        transaction: transaction
                    })
                .then(() => {
                    record.afterAmount = tradeAccount[field];
                    return record;
                })
        })
};

/**
 * 生成支付后增加对应余额，押金等方法
 * 生成付款记录，用以后续支付成功后修改余额或押金等
 */
const initPayCharge = function ({
    // 金额字段
    field,
    // 交易类型
    type
}) {
    return function (par, options) {
        let {
            tradeAccountNo,
            amount,
            operateLogNo,
            orderType,
            orderId,
            tradeType,
            remark,
            body,
            system,
            spbillCreateIp,
            noCredit,
            tradePrincipal,
            accountId
        } = par;
        let record = {};
        let transaction = options.transaction;
        let tradeAccount;
        if (!tradeType) {
            throw ('交易类型必填！');
        }
        /**
         * 查询账户
         */
        return TradeAccountDb.find({
                where: {
                    tradeAccountNo: tradeAccountNo
                },
                transaction: transaction
            })
            .then((data) => {
                tradeAccount = data;
                if (!tradeAccount) {
                    throw (`${tradeAccountNo}没有对应的账户`);
                }
                if (tradeAccount.status !== TRADE_ACCOUNT_STATUS.ACTIVE) {
                    throw (`${tradeAccountNo}账户当前状态异常`);
                }
                // 默认生成未发送数据
                return PaymentRecord.create({
                    tradeAccountNo: tradeAccountNo,
                    amount: amount,
                    type: type,
                    tradeType: tradeType,
                    field: field,
                    operateLogNo: operateLogNo,
                    orderType: orderType,
                    orderId: orderId,
                    remark: remark,
                    tradeAccountId: tradeAccount.id,
                    system: system,
                    tradePrincipal
                }, options)
            })
            // 判断支付方式
            .then((data) => {
                record = data;
                let param = {
                    fee: amount,
                    system: global.SYSTEM,
                    orderType: `${system}|${orderType}`,
                    orderId: record.id,
                    body: body,
                    noCredit: noCredit,
                    tradePrincipal: tradePrincipal,
                    accountId
                };
                if (_.includes(WE_CHAT_PAY_TRADE_TYPES, tradeType)) {
                    switch (tradeType) {
                        case 'WE_CHAT_PAY_JSAPI':
                            param.tradeType = 'JSAPI';
                            break;
                        case 'WE_CHAT_PAY_APP':
                            param.tradeType = 'APP';
                            break;
                        case 'WE_CHAT_PAY_NATIVE':
                            param.tradeType = 'NATIVE';
                            break;
                    }
                    param.spbillCreateIp = spbillCreateIp;
                    return TradeGateway.WeChatPay.Payment.create(param);
                } else if (_.includes(ALI_PAY_TRADE_TYPES, tradeType)) {
                    switch (tradeType) {
                        case 'ALI_PAY_APP':
                            param.tradeType = 'APP';
                            break;
                        case 'ALI_PAY_UNION':
                            param.tradeType = 'UNION';
                            break;
                    }
                    return TradeGateway.AliPay.Payment.create(param);
                }
                throw (`没有对应的支付渠道:${tradeType}`);
            })
            // 修改支付单据状态为支付中
            .then((data) => {
                return PaymentRecord.toPendding({
                        record: record,
                        outTradeRecordNo: data.tradeRecordNo
                    }, options)
                    .then(() => {
                        return data;
                    })
            })
    }
}

/**
 * 生成减少金额方法
 */
const initDecrease = function ({
    // 金额字段
    field,
    // 交易类型
    type,
    // 是否需要密码
    isPwd = false
}) {
    return function (par, options) {
        let {
            tradeAccountNo,
            amount,
            tradePwd,
            operateLogNo,
            orderType,
            orderId,
            remark,
            system,
            tradePrincipal
        } = par;
        let params = {
            amount: amount,
            tradeAccountNo: tradeAccountNo,
            type: type,
            field: field,
            operateLogNo: operateLogNo,
            orderType: orderType,
            orderId: orderId,
            remark: remark,
            system,
            tradePrincipal
        };
        if (isPwd) {
            params.tradePwd = tradePwd;
        }

        return TradeRecord.find({
            system,
            orderId,
            orderType,
            tradeType: type
        })
            .then((data)=> {
                if (data) {
                    throw ('此单据已经减款， 请勿重复减款')
                }
                return transferOut(params, {
                    transaction: options.transaction
                })
            })
            .then((data) => {
                return parseRecord(data);
            })
    }
}

module.exports = {
    parseRecord,
    transfer,
    transferOut,
    transferIn,
    initPayCharge,
    initDecrease,
    TRADE_ACCOUNT_FIELDS,
    TRADE_RECORD_TYPES,
    TRADE_ACCOUNT_STATUS,
    WE_CHAT_PAY_TRADE_TYPES,
    ALI_PAY_TRADE_TYPES,
    TRADE_TYPES,
}