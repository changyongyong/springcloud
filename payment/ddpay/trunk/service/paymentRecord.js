'use strict';

/**
 * 交易记录
 * @author 吴秀璞
 * @since 2017/1/16
 */

const ddPayDb = require('../models/ddPayDb');
const {
    PaymentRecord: PaymentRecordDb
} = ddPayDb;
const STATUS = PaymentRecordDb.getStatus();
let PaymentRecord = {};

/**
 * 创建交易记录
 * @param par
 * @param options
 * @returns {Promise|Promise.<TResult>|*|{value}}
 */
PaymentRecord.create = function (par, options) {
    let {
        amount,
        type,
        tradeType,
        field,
        tradeAccountId,
        tradeAccountNo,
        counterpartyNo,
        operateLogNo,
        orderType,
        orderId,
        outTradeRecordNo,
        system,
        remark,
        tradePrincipal
    } = par, {
        transaction
    } = options;
    return PaymentRecordDb.create({
        type: type,
        tradeType: tradeType,
        amount: amount,
        status: STATUS.UNSEND,
        field: field,
        system: system,
        TradeAccountId: tradeAccountId,
        tradeAccountNo: tradeAccountNo,
        counterpartyNo: counterpartyNo,
        operateLogNo: operateLogNo,
        orderType: orderType,
        orderId: orderId,
        remark: remark,
        outTradeRecordNo: outTradeRecordNo,
        tradePrincipal
    }, {
        transaction: transaction
    });
};

/**
 * 已经提交支付
 */
PaymentRecord.toPendding = function (par, options) {
    let {
        record,
        outTradeRecordNo
    } = par;
    record.status = STATUS.PENDDING;
    record.outTradeRecordNo = outTradeRecordNo;
    return record.save({
        transaction: options.transaction
    });
}

/**
 * 支付成功
 */
PaymentRecord.toSuccess = function (par, options) {
    let {
        record
    } = par;
    return record.update({
        status: STATUS.SUCCESS
    }, options);
}

/**
 * 支付失败
 */
PaymentRecord.toFail = function (par, options) {
    let {
        record
    } = par;
    return record.update({
        status: STATUS.FAIL
    }, options);
}

module.exports = PaymentRecord;