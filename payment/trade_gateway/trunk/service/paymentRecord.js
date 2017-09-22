'use strict';

/**
 * 交易记录
 * @author 吴秀璞
 * @since 2017/1/16
 */

const tradeGatewayDb = require('../models/tradeGatewayDb');
const {
    Sequence
} = require('../lib/rpc');
const {
    Db,
    PaymentRecord: PaymentRecordDb
} = tradeGatewayDb;
const SEQUENCE_NAME = 'tradeGatewayPaymentRecordNo';
const moment = require('moment');
const STATUS = PaymentRecordDb.getStatus();
let PaymentRecord = {};

PaymentRecord.STATUS = STATUS;

/**
 * 创建交易记录
 * @param par
 * @param options
 * @returns {Promise|Promise.<TResult>|*|{value}}
 */
PaymentRecord.create = function (par, options) {
    let {
        fee,
        tradeType,
        counterpartyNo,
        orderType,
        orderId,
        system,
        source,
        tradeChannel,
        remark,
        tradePrincipal,
        accountMerchantId,
        merchantConfigId,
        tradeMerchantNo
    } = par;
    let {
        operateLogNo,
        transaction
    } = options;
    return Sequence.sequence.get({
            name: SEQUENCE_NAME
        })
        .then((data) => {
            let no = data.data.toString();
            //使用6位交易号
            while (no.length < 6) {
                no = '0' + no;
            }
            no = global.orderStart + 'PAYMENT' + moment(data.date).format('YYYYMMDD') + no;
            return PaymentRecordDb.create({
                status: STATUS.PENDDING,
                tradeRecordNo: no,
                tradeType,
                totalFee: fee,
                receiptFee: fee,
                counterpartyNo,
                operateLogNo,
                tradeChannel,
                orderType,
                orderId,
                refundTimes: 0,
                refundableFee: fee,
                system,
                source,
                remark,
                tradePrincipal,
                accountMerchantId,
                merchantConfigId,
                tradeMerchantNo
            }, {
                transaction: transaction
            });
        });
};

/**
 * 支付失败
 */
PaymentRecord.fail = function (record, error) {
    return record.update({
        status: STATUS.FAIL,
        error: typeof error == 'string' ? error : JSON.stringify({
            message: error.message,
            stack: error.stack,
            sql: error.sql
        })
    });
};

PaymentRecord.find = function () {
    return PaymentRecordDb.find.apply(PaymentRecordDb, arguments);
};

PaymentRecord.afterRefund = function ({
    tradeRecordNo,
    refundFee
}, options) {
    return Db.query(
        'UPDATE payment_records SET refundTimes = refundTimes+1,' +
        `refundableFee=refundableFee-${refundFee} where tradeRecordNo='${tradeRecordNo}';`, {
            transaction: options.transaction
        }
    )
}

module.exports = PaymentRecord;