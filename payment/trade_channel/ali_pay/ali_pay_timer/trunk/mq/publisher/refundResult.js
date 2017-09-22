'use strict';

/**
 * 进销存明细处理方法
 * @author 吴秀璞
 * @since 2016/8/15
 */

const refundResult = require('../../lib/mq').queueSet.tradeRefundResult;
const Publisher = require('./publisher');
const publisher = new Publisher('refundResultQueue');
const sendMessage = function (content, options) {
    let log;
    let message;
    options = options || {};
    return publisher.initMessage({
            data: content
        }, options)
        .then(function (data) {
            message = data;
            return publisher.saveMessage({
                message: message
            }, options)
        })
        .then(function (data) {
            log = data;
            return refundResult.sendToQueue(
                message
            )
        })
        .then(function () {
            return publisher.success(log, options);
        })
};


module.exports = {
    sendMessage: sendMessage
};