'use strict'

/**
 * @author WXP
 * @description 冻结记录相关逻辑
 */
const {
    FrozenRecordLog: FrozenRecordLogDb
} = require('../models/ddPayDb');
const moment = require('moment');
const { Sequence } = require('../lib/rpc');
const TRADE_ACCOUNT_SEQUENCE_NAME = 'ddPayFrozenRecordNo';
const FROZEN_RECORD_STATUS = {
    // 处理中
    PENDDING: 'PENDDING',
    // 完成
    FINISHED: 'FINISHED',
    // 撤销
    DISMISSED: 'DISMISSED'
};


/**
 * 保存冻结记录
 * @param {*} {
 *      beforeData: 修改前数据，新建记录无此数据，本来是用sequelize.previous，但是多次修改sequelize.previous数据错误
 *      frozenRecord: 修改后的冻结记录，创建冻结记录时用Model.bild()，
 *      remark: '备注，方便处理'
 * } 
 * @param {*} param1 
 */
const save = function ({
    beforeData,
    frozenRecord,
    remark
}, {
    transaction
}) {
    let log;
    // 1.比对数据记录流水
    if (frozenRecord.isNewRecord) {
        log = {
            // TradeAccountId: frozenRecord.id,
            afterStatus: FROZEN_RECORD_STATUS.PENDDING,
            amount: 0,
            limitAmount: frozenRecord.limitAmount,
            beforeAmount: 0,
            afterAmount: 0,
            remark: remark
        }
    } else {
        log = {
            beforeStatus: beforeData.status,
            afterStatus: frozenRecord.status,
            amount: frozenRecord.amount - beforeData.amount,
            limitAmount: frozenRecord.amount,
            beforeAmount: beforeData.amount,
            afterAmount: frozenRecord.afterAmount,
            remark: remark
        }
    }
    return Promise.resolve()
        .then(() => {
            // 2.新记录补充冻结流水号
            if (!frozenRecord.isNew) {
                return;
            }
            return Sequence.sequence.get({
                    name: TRADE_ACCOUNT_SEQUENCE_NAME
                })
                .then((data) => {
                    let no = data.data.toString();
                    //使用6位交易号 FROZEN20170727000001
                    while (no.length < 6) {
                        no = '0' + no;
                    }
                    no = 'FROZEN' + moment(data.date).format('YYYYMMDD') + no;
                    frozenRecord.frozenRecordNo = no;
                    return;
                })
        })
        .then(() => {
            // 3.保存冻结流水的修改
            return frozenRecord.save({
                transaction: transaction
            })
        })
        .then((data) => {
            // 4.保存日志
            log.FrozenRecordId = data.id;
            return FrozenRecordLogDb.create(log, {
                transaction
            })
        })
        .then(() => {
            return frozenRecord;
        })
}

module.exports = {
    FROZEN_RECORD_STATUS,
    save
};