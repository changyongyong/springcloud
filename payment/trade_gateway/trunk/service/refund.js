'use strict';

const _ = require('lodash');
const {
    Refund: WeChatRefund
} = require('./weChatPay');
const {
    Refund: AliRefund
} = require('./aliPay');
const {
    RefundRecord: RefundRecordDb
} = require('../models/tradeGatewayDb');
const {
    OutRefundResult: OutRefundResultPublisher
} = require('../mq/publisher');
const PaymentRecord = require('./paymentRecord');
const WE_CHAT_CHANNEL = 'WE_CHAT_PAY';
const WE_CHAT_CHANNEL_TYPES = [
    WE_CHAT_CHANNEL + '_JSAPI',
    WE_CHAT_CHANNEL + '_APP',
    WE_CHAT_CHANNEL + '_NATIVE',
    WE_CHAT_CHANNEL + '_SCAN_PAY'
];
const ALI_PAY_CHANNEL = 'ALI_PAY';
const ALI_PAY_CHANNEL_TYPES = [
    ALI_PAY_CHANNEL + '_APP',
    ALI_PAY_CHANNEL + '_UNION'
];
const STATUS = RefundRecordDb.getStatus();
let Refund = {};

/**
 *  查询支付记录，根据当时支付渠道进行退款
 */
Refund.refund = function (par, options) {
    let {
        originalOrderId,
        originalTradeType,
        originalSystem,
        tradeRecordNo,
    } = par;
    let where;
    if (tradeRecordNo) {
        where = {
            tradeRecordNo: tradeRecordNo
        };
    } else if (originalOrderId && originalTradeType && originalSystem) {
        where = {
            orderId: originalOrderId,
            tradeType: originalTradeType,
            system: originalSystem
        };
    } else {
        throw ('缺少退款原订单信息！');
    }
    return PaymentRecord.find({
            where: where
        })
        .then((record) => {
            if (!record) {
                throw ('没有对应的支付记录！');
            }
            options.record = record;
            if (_.includes(WE_CHAT_CHANNEL_TYPES, record.tradeChannel)) {
                return WeChatRefund.refund(par, options);
            } else if (ALI_PAY_CHANNEL_TYPES, record.tradeChannel) {
                return AliRefund.refund(par, options);
            }
        })
}

Refund.handle = function (par, options) {
    let {
        tradeRecordNo,
        status,
        // fee,
        message
    } = par;
    let {
        transaction
    } = options;
    let record;
    return RefundRecordDb.find({
            where: {
                tradeRecordNo: tradeRecordNo
            }
        })
        .then((record) => {
            if (!record) {
                throw (`${tradeRecordNo}没有对应的单据！`);
            }
            if (record.status == STATUS.PENDDING) {
                return record;
            }
            if (record.status != status) {
                throw (`${tradeRecordNo}的退款状态与消息状态不一致！退款状态为:${record.status}，消息状态为:${status}`);
            }
            throw (true);
        })
        .then((data) => {
            record = data;
            return record.update({
                    status: status,
                    // receiptFee: fee,
                    message: message
                }, {
                    transaction: transaction
                })
                .then((data) => {
                    if (status == STATUS.SUCCESS) {
                        return PaymentRecord.afterRefund({
                            tradeRecordNo: data.paymentRecordNo,
                            refundFee: data.totalFee
                        }, options);
                    }
                    return '';
                })
        })
        .then(() => {
            return OutRefundResultPublisher.sendMessage({
                tradeRecordNo: tradeRecordNo,
                system: record.system,
                orderId: record.orderId,
                orderType: record.orderType,
                source: record.source,
                tradeChannel: record.tradeChannel,
                // 状态不为成功时状态改为失败
                status: status == STATUS.SUCCESS ? status : STATUS.FAIL,
                type: 'refund',
                // fee: fee,
                message: message || ''
            });
        })
        .catch((error) => {
            if (error === true) {
                return '';
            }
            throw (error);
        })
}

module.exports = Refund;