'use strict'

/**
 * @author WXP
 * @description 转账内容
 */

const {
    Transfer: AliPayTransfer
} = require('./aliPay');

const {
    TransferRecord: TransferRecordDb
} = require('../models/tradeGatewayDb');

const STATUS = TransferRecordDb.getStatus();

const {
    OutTransferResult: OutTransferResultPublisher
} = require('../mq/publisher');

module.exports.transfer = function (par, options) {
    let {
        tradeType
    } = par;
    if (tradeType == 'ALI_PAY') {
        return AliPayTransfer.transfer(par, options)
    }
};

module.exports.handle = function(par, options) {

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
    return TransferRecordDb.find({
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
            record.status = status;
            record.message = message;
            //
            // return record.save({
            //     transaction: transaction
            // })
            return TransferRecordDb.update({
                    status: status,
                //     // receiptFee: fee,
                    message: message
            }, {
                where: {
                    id: record.id
                },
                transaction: transaction
            })

            // return record.update({
            //     status: status,
            //     // receiptFee: fee,
            //     message: message
            // }, {
            //     transaction: transaction
            // })
        })
        .then(() => {
            return OutTransferResultPublisher.sendMessage({
                tradeRecordNo: tradeRecordNo,
                system: record.system,
                orderId: record.orderId,
                orderType: record.orderType,
                source: record.source,
                tradeChannel: record.tradeChannel,
                // 状态不为成功时状态改为失败
                status: status == STATUS.SUCCESS ? status : STATUS.FAIL,
                type: 'transfer',
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
};