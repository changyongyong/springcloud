'use strict'

/**
 * @author WXP
 * @description 冻结金额相关逻辑
 */

const _ = require('lodash');

const {
    TradeAccount: TradeAccountDb,
    FrozenRecord: FrozenRecordDb
} = require('../../models/ddPayDb');
const FrozenRecord = require('../frozenRecord');
const TradeRecord = require('../tradeRecord');
const {
    TRADE_ACCOUNT_STATUS,
    TRADE_ACCOUNT_FIELDS,
    TRADE_RECORD_TYPES,
    parseRecord
} = require('./comm');
const FROZEN_RECORD_STATUS = FrozenRecord.FROZEN_RECORD_STATUS;

/**
 *  冻结余额
 * 1.查询账户余额是否充足
 * 2.修改减少账户余额，增加账户冻结金额
 * 3.生成冻结记录，已用金额0，限制金额为总金额
 * 4.生成冻结记录对应的日志
 * @param {*} {
 *      tradeAccountNo: 交易账户号
 *      amount: 需要冻结的总金额
 *      numberId: 冻结业务发起方ID
 *      tradeType: 冻结业务类型
 *      remark
 * }
 * @param {*} 事务 
 * @return tradeRecord
 */
const freezeBalance = function ({
    tradeAccountNo,
    amount,
    numberId,
    tradeType,
    remark
}, {
    transaction,
    lock
}) {
    let tradeAccount;
    // 由于参数可能是字符串，所以处理下
    amount = parseFloat(amount);
    // 查询账户，判断其余额是否充足，如果充足增加冻结金额，减少余额
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
            if (tradeAccount.balance < amount) {
                throw (`${tradeAccountNo}账户金额不足`);
            }
            tradeAccount.balance -= amount;
            tradeAccount.amountFrozen += amount;
            tradeAccount.verifyCode = TradeAccountDb.calcVerifyCode(tradeAccount);
            return tradeAccount.save({
                transaction: transaction
            })
        })
        // 生成冻结单据和冻结操作日志
        .then(() => {
            let frozenRecord = FrozenRecordDb.build({
                tradeAccountNo,
                amount: 0,
                limitAmount: amount,
                status: FROZEN_RECORD_STATUS.PENDDING,
                tradeType,
                numberId,
                TradeAccountId: tradeAccount.id
            });
            // frozenRecord.isNew = true;
            return FrozenRecord.save({
                frozenRecord,
                remark
            }, {
                transaction
            })
        })

};

/**
 *  撤销冻结
 * 1.查询冻结记录状态
 *  1.1.当为PENDDING时可以解冻
 * 2.将全部金额（limitAmount-amount）归还至账户，增加账户余额，减少冻结金额
 * 3.修改冻结记录状态为已撤销
 * 4.生成冻结记录日志
 * @param {*} 撤销冻结所需参数
 * @param {*} 事务 
 * @return tradeRecord
 */
const dismissFrozenRecord = function ({
    frozenRecordId,
    numberId,
    remark
}, {
    transaction,
    lock
}) {
    let tradeAccount;
    let frozenRecord;
    //查询冻结记录状态
    return FrozenRecordDb.find({
            where: {
                id: frozenRecordId,
                numberId: numberId
            },
            transaction,
            lock
        })
        .then((data) => {
            frozenRecord = data;
            if (!data) {
                throw ('没有对应的冻结记录，无法撤销冻结！');
            }
            if (data.status !== FROZEN_RECORD_STATUS.PENDDING) {
                throw ('冻结单状态错误，无法撤销冻结！');
            }
            return TradeAccountDb.find({
                where: {
                    id: frozenRecord.TradeAccountId
                },
                transaction,
                lock
            })
        })
        // 将全部金额（limitAmount-amount）归还至账户，增加账户余额，减少冻结金额
        .then((data) => {
            tradeAccount = data;
            if (tradeAccount.status !== TRADE_ACCOUNT_STATUS.ACTIVE) {
                throw (`${tradeAccount.tradeAccountNo}账户当前状态异常，无法撤销冻结！`);
            }
            tradeAccount.balance += frozenRecord.limitAmount;
            tradeAccount.amountFrozen -= frozenRecord.limitAmount;
            tradeAccount.verifyCode = TradeAccountDb.calcVerifyCode(tradeAccount);
            return tradeAccount.save({
                transaction
            })
        })
        // 修改冻结记录状态为已撤销
        // 生成冻结记录日志
        .then(() => {
            let beforeData = _.clone(frozenRecord.dataValues);
            frozenRecord.amount = 0;
            frozenRecord.status = FROZEN_RECORD_STATUS.DISMISSED;
            return FrozenRecord.save({
                beforeData,
                frozenRecord,
                remark
            }, {
                transaction
            })
        })
};

/**
 *  完成冻结
 * 1.查询冻结记录状态
 *  1.1.当为PENDDING时可以完成冻结
 * 2.将剩余未使用的金额（limitAmount-amount）归还至账户，增加账户余额，减少冻结金额
 * 3.生成交易流水(tradeRecord)
 * 4.修改冻结记录状态为已完成
 * 5.生成冻结记录日志
 * @param {*} {
 *      frozenRecordId: '冻结记录单号',
 *      numberId: '业务单号，用以安全',
 *      amount: '已用金额，大部分情况下是全部已使用',
 *      remark: '备注'，
 *      system: '调用系统，trade_record所需参数',
 *      orderId: '调用方业务单号，trade_record所需参数',
 *      orderType: '调用方业务员单号，trade_record所需参数',
 *      operateLogNo: '操作日志编号，申请时单号，trade_record所需参数',
 *      tradePrincipal: '交易主体，申请时交易主体，trade_record所需参数'
 * }
 * @param {*} 事务 
 * @return tradeRecord
 */
const finishFrozenRecord = function ({
    frozenRecordId,
    numberId,
    amount,
    remark,
    system,
    orderId,
    orderType,
    operateLogNo,
    tradePrincipal
}, {
    transaction,
    lock
}) {
    let tradeAccount;
    let frozenRecord;
    let beforeData;
    let tradeRecord;
    // 由于参数可能是字符串，所以处理下
    amount = parseFloat(amount);
    // 查询冻结记录
    return FrozenRecordDb.find({
            where: {
                id: frozenRecordId,
                numberId: numberId
            },
            transaction,
            lock
        })
        .then((data) => {
            frozenRecord = data;

            if (!data) {
                throw ('没有对应的冻结记录，无法结束冻结！');
            }
            if (data.status !== FROZEN_RECORD_STATUS.PENDDING) {
                throw ('冻结单状态错误，无法结束冻结！');
            }
            if (amount > (frozenRecord.limitAmount - frozenRecord.amount)) {
                throw ('使用金额大于冻结金额，无法结束冻结！')
            }
            beforeData = _.clone(frozenRecord.dataValues);
            frozenRecord.amount = amount;
            frozenRecord.status = FROZEN_RECORD_STATUS.FINISHED;
            return TradeAccountDb.find({
                where: {
                    id: frozenRecord.TradeAccountId
                },
                transaction,
                lock
            })
        })
        // 将剩余未使用的金额（limitAmount-amount）归还至账户，增加账户余额，减少冻结金额
        .then((data) => {
            tradeAccount = data;
            if (tradeAccount.status !== TRADE_ACCOUNT_STATUS.ACTIVE) {
                throw (`${tradeAccount.tradeAccountNo}账户当前状态异常，无法撤销冻结！`);
            }
            tradeAccount.balance += frozenRecord.limitAmount - frozenRecord.amount;
            tradeAccount.amountFrozen -= frozenRecord.limitAmount;
            tradeAccount.verifyCode = TradeAccountDb.calcVerifyCode(tradeAccount);
            return tradeAccount.save({
                transaction
            })
        })
        // 生成交易流水
        .then(() => {
            return TradeRecord.create({
                amount: frozenRecord.limitAmount - frozenRecord.amount,
                field: TRADE_ACCOUNT_FIELDS.BALANCE,
                tradeAccountId: tradeAccount.id,
                tradeAccountNo: tradeAccount.tradeAccountNo,
                operateLogNo,
                orderType,
                orderId,
                tradeType: frozenRecord.tradeType,
                type: TRADE_RECORD_TYPES.TRANSFER_OUT,
                remark,
                system,
                tradePrincipal
            }, {
                transaction
            });
        })
        // 修改冻结记录状态为已完成
        // 生成冻结记录日志
        .then((log) => {
            tradeRecord = log;
            return FrozenRecord.save({
                beforeData,
                frozenRecord
            }, {
                transaction
            })
        })
        .then(() => {
            tradeRecord.afterAmount = tradeRecord.balance;
            return parseRecord(tradeRecord);
        })
};

module.exports = {
    freezeBalance,
    dismissFrozenRecord,
    finishFrozenRecord
}