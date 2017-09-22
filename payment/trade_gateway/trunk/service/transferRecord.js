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
    TransferRecord: TransferRecordDb
} = tradeGatewayDb;
const SEQUENCE_NAME = 'tradeGatewayTransferRecordNo';
const STATUS = TransferRecordDb.getStatus();
const moment = require('moment');
let TransferRecord = {};
TransferRecord.STATUS = STATUS;
/**
 * 创建交易记录
 * @param par
 * @param options
 * @returns {Promise|Promise.<TResult>|*|{value}}
 */
TransferRecord.create = function (par, options) {
    let {
        fee,
        counterpartyNo,
        orderType,
        orderId,
        system,
        source,
        tradeType: tradeChannel,
        thirdPartAccount,
        remark,
        tradePrincipal
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
            no = global.orderStart + 'TRANSFER' + moment(data.date).format('YYYYMMDD') + no;
            return TransferRecordDb.create({
                status: STATUS.PENDDING,
                tradeRecordNo: no,
                totalFee: fee,
                receiptFee: fee,
                counterpartyNo: counterpartyNo,
                operateLogNo: operateLogNo,
                tradeChannel: tradeChannel,
                thirdPartAccount: thirdPartAccount,
                orderType: orderType,
                orderId: orderId,
                system: system,
                source: source,
                remark: remark,
                tradePrincipal: tradePrincipal
            }, {
                transaction: transaction
            });
        })
};

module.exports = TransferRecord;