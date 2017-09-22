'use strict'

/**
 * @author WXP
 * @description 支付结果检查任务
 */


const {
    Db,
    AliRefundLog: RefundRecord
} = require('../models/aliPayDb');
const {
    AliPay: Channel
} = require('../tradeChannel');
const {
    refundResult
} = require('../mq/publisher');
const moment = require('moment');
const logger = global.Logger('refundCheck');
// 查询从当前向前多少秒的订单
const OFF_SECOND = 30;

let task = {};

let STATUS = RefundRecord.getStatus();

task.execute = function () {
    let endTime = moment().add(OFF_SECOND, 's').toDate();
    return RefundRecord.findAll({
            where: {
                status: STATUS.PENDDING,
                createdAt: {
                    $lte: endTime
                }
            }
        })
        .then((records) => {
            return Promise.each(records, (record) => {
                return query(record);
            })
        })
        .then(() => {
            return ''
        })
};

const query = function (record) {
    let {
        outRefundNo,
        outTradeNo,
        source,
        sellerId
    } = record;
    let transaction;
    return Db.transaction()
        .then((data) => {
            transaction = data;
            return Channel.refundQuery({
                    outRefundNo: outRefundNo,
                    outTradeNo: outTradeNo,
                    source: source,
                    sellerId: sellerId
                })
                .then((data) => {
                    if (data.outRefundNo) {
                        data.status = STATUS.SUCCESS;
                    } else {
                        data.status = STATUS.FAIL;
                        data.outRefundNo = outRefundNo;
                    }
                    return data;
                })
                .catch((error) => {
                    let data = error.data || {};
                    if (data.sub_code == 'ACQ.TRADE_NOT_EXIST') {
                        return {
                            status: STATUS.FAIL,
                            outRefundNo: outRefundNo
                        }
                    }
                    throw (error);
                })
        })
        .then((data) => {
            if (data.outRefundNo != outRefundNo) {
                logger.error(`${outRefundNo}查询退款结果失败，时间返回结果为${data.outRefundNo}`);
                throw (Error(`${outRefundNo}查询退款结果失败，时间返回结果为${data.outRefundNo}`));
            }
            return record.update({
                status: data.status
            }, {
                transaction: transaction
            })
        })
        .then(() => {
            return refundResult.sendMessage({
                tradeRecordNo: outRefundNo,
                status: record.status,
                chunnel: 'ALI_PAY_CHANNEL'
            }, {
                transaction: transaction
            })
        })
        .then(() => {
            return transaction.commit();
        })
        .catch((error) => {
            if (error === true) {
                return transaction.commit();
            }
            logger.error(`error: ${error} message:${JSON.stringify(error.message)} ` +
                `sql:${error.sql} data:${JSON.stringify(error.data)} stack:${error.stack}`);
            return transaction.rollback();
        })
        .then(() => {
            return '';
        })
};

task.attributes = {
    name: '支付结果检查',
    id: 'refundCheck',
    version: '1.0.0',
    createAt: '2017年2月16日15:22:39',
    lastModifyTime: '2017年2月16日15:22:39'
};

module.exports.task = task;