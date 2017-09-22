'use strict';

const PaymentRecord = require('../paymentRecord');
const {
    WeChatPay
} = require('../../tradeChannel');
const RefundRecord = require('../refundRecord');
const CHANNEL = 'WE_CHAT_PAY';
const CHANNEL_TYPES = [
    CHANNEL + '_JSAPI',
    CHANNEL + '_APP',
    CHANNEL + '_NATIVE'
];
const PAYMENT_RECORD_STATUS = PaymentRecord.STATUS;

let Refund = {};

Refund.refund = function (par, options) {
    let {
        tradeRecordNo,
        refundFee,
        totalFee,
        orderType,
        orderId,
        system,
        remark
    } = par;
    let {
        operateLogNo,
        record
    } = options;
    let { tradePrincipal } = record;
    let refundRecord;
    return Promise.resolve()
        .then(() => {
            if (record) {
                return record;
            }
            return PaymentRecord.find({
                    where: {
                        tradeRecordNo: tradeRecordNo,
                        tradeChannel: CHANNEL_TYPES
                    }
                })
                .then((data) => {
                    record = data;
                    return;
                })
        })
        .then((data) => {
            if (!data) {
                throw (`退款失败，未找到此交易：${tradeRecordNo}`);
            }
            if (data.status !== PAYMENT_RECORD_STATUS.SUCCESS) {
                throw ('对应付款单尚未支付或支付未到账，无法退款！');
            }
            return RefundRecord.create({
                fee: refundFee,
                operateLogNo,
                orderType,
                orderId,
                tradeChannel: record.tradeChannel,
                system,
                source: record.source,
                paymentRecordNo: record.tradeRecordNo,
                remark,
                tradePrincipal,
                account: record.account,
                merchantConfigId: record.merchantConfigId,
                tradeMerchantNo: record.tradeMerchantNo
            }, options)
        })
        .then((data) => {
            refundRecord = data;
            return WeChatPay.refund({
                source: record.source,
                tradeRecordNo: record.tradeRecordNo,
                outRefundNo: refundRecord.tradeRecordNo,
                refundFee,
                totalFee,
                tradeMerchantNo: record.tradeMerchantNo
            });
        })
        .then(() => {
            return {
                tradeRecordNo: record.tradeRecordNo,
                outRefundNo: refundRecord.tradeRecordNo
            }
        })
        .catch((error) => {
            if (error == true) {
                return;
            }
            throw (error);
        })
};

module.exports = Refund;