'use strict';

const PaymentRecord = require('./paymentRecord');
const {
    PaymentRecord: PaymentRecordDb
} = require('../models/tradeGatewayDb');
const {
    OutPaymentResult: OutPaymentResultPublisher
} = require('../mq/publisher');
let Payment = {};
let STATUS = PaymentRecord.STATUS;

/**
 * 付款结果的处理
 */
Payment.handle = function (par, options) {
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
    return PaymentRecordDb.find({
            where: {
                tradeRecordNo: tradeRecordNo
            }
        })
        .then((record) => {
            if (!record) {
                throw (`${tradeRecordNo}没有对应的付款单！`);
            }
            if (record.status == STATUS.PENDDING) {
                return record;
            }
            if (record.status != status) {
                throw (`${tradeRecordNo}的付款状态与消息状态不一致！付款状态为:${record.status}，消息状态为:${status}`);
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
            });
        })
        .then(() => {
            return OutPaymentResultPublisher.sendMessage({
                tradeRecordNo: tradeRecordNo,
                system: record.system,
                orderId: record.orderId,
                orderType: record.orderType,
                source: record.source,
                tradeChannel: record.tradeChannel,
                // 状态不为成功时状态改为失败
                status: status == STATUS.SUCCESS ? status : STATUS.FAIL,
                type: 'payment',
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

module.exports = Payment;