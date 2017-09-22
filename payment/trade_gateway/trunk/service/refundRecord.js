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
    RefundRecord: RefundRecordDb
} = tradeGatewayDb;
const SEQUENCE_NAME = 'tradeGatewayRefundRecordNo';
const moment = require('moment');
const STATUS = RefundRecordDb.getStatus();
let RefundRecord = {};

/**
 * 创建交易记录
 * @param par
 * @param options
 * @returns {Promise|Promise.<TResult>|*|{value}}
 */
RefundRecord.create = function (par, options) {
    let {
        fee,
        counterpartyNo,
        orderType,
        orderId,
        tradeChannel,
        system,
        source,
        paymentRecordNo,
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
            no = global.orderStart + 'REFUND' + moment(data.date).format('YYYYMMDD') + no;
            return RefundRecordDb.create({
                status: STATUS.PENDDING,
                tradeRecordNo: no,
                totalFee: fee,
                counterpartyNo,
                operateLogNo,
                tradeChannel,
                orderType,
                orderId,
                paymentRecordNo,
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

module.exports = RefundRecord;