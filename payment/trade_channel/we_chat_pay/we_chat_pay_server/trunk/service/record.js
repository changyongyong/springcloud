'use strict'

/**
 * @author WXP
 * @description 支付记录相关的业务
 */
const moment = require('moment');
const {
    WxTransactionLog,
    WxRefundLog
} = require('../models/wxdb');
const TRADE_CHANNEL = 'WE_CHAT_PAY';

/**
 * 查询指定时间段的付款，退款记录
 */
module.exports.record = function ({
    type,
    date
}) {
    let where = {};
    let model;
    let formatter;
    const startTime = moment(date).format('YYYY-MM-DD 00:00:00');
    const endTime = moment(date).add('1', 'd').format('YYYY-MM-DD 00:00:00');

    where.createdAt = {
        $gte: startTime,
        $lt: endTime
    };
    switch (type) {
        case 'payment':
            model = WxTransactionLog;
            formatter = paymentLogFormatter;
            break;
        case 'refund':
            model = WxRefundLog;
            formatter = refundLogFormatter;
            break;
        default:
            throw ('没有对应的类型');
    }
    return model.findAll({
            where: where
        })
        .then(function (recordList) {
            var results = [];
            var i;
            for (i = 0; i < recordList.length; i++) {
                results.push(formatter(recordList[i]));
            }
            return results;
        })

};

/**
 * 付款记录格式化
 * @param {*} log 
 */
function paymentLogFormatter(log) {
    var result = {
        tradeRecordNo: log.outTradeNo,
        source: log.source,
        fee: (log.totalFee / 100).toFixed(2),
        tradeChannel: TRADE_CHANNEL,
        status: 'PENDDING',
        type: 'payment',
        validateStatus: log.validateStatus,
        error: log.error,
        subMchId: log.subMchId
    }
    // 已付款状态为成功
    if (log.payStatus == 1) {
        result.status = 'SUCCESS'
    }
    // 已关闭状态为已失败
    if (log.closed == 1) {
        result.status = 'FAIL';
    }
    return result;
}

/**
 * 退款记录格式
 * @param {*} log 
 */
function refundLogFormatter(log) {
    var result = {
        tradeRecordNo: log.outRefundNo,
        source: log.source,
        // 退款返回退款金额
        fee: (log.refundFee / 100).toFixed(2),
        tradeChannel: TRADE_CHANNEL,
        status: log.status,
        type: 'refund',
        validateStatus: log.validateStatus,
        error: log.error,
        subMchId: log.subMchId
    }
    return result;
}