'use strict';
/* global Logger */

const { queueSet } = require('../lib/mq');
const logger = Logger('received-message');
const handler = require('./handler');

/**
 * 
 * @param {*} queue 
 * @param {*} Hanlder 
 */
const initBind = function (queue, Hanlder) {
    return function bind() {
        queue.consume((data, message) => {
            logger.log('收到消息：', JSON.stringify(data));
            if (!message) {
                return;
            }
            if (!data || JSON.stringify(data) == '{}') {
                return queue.ack(message);
            }
            var handler = new Hanlder(data);
            handler.handle()
                .then(function () {
                    queue.ack(message);
                });
        })
    }
}

module.exports.bindPaymentResult = initBind(queueSet['tradePaymentResult'], handler.PaymentResultHandler);

module.exports.bindRefundResult = initBind(queueSet['tradeRefundResult'], handler.RefundResultHandler);

module.exports.bindTransferResult = initBind(queueSet['tradeTransferResult'], handler.TransferResultHandler);

module.exports.bindValidateResult = initBind(queueSet['tradeChannelValidateResult'], handler.BillValidateHandler);