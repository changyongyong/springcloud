'use strict';

/**
 * 进销存明细处理方法
 * @author 吴秀璞
 * @since 2016/8/15
 */

var tradePaymentResult = require('../../lib/mq').queueSet.tradePaymentResult;
var Publisher = require('./publisher');
var publisher = new Publisher('paymentResultQueue');

var sendMessage = function (content, options) {
    var log;
    var message;
    options = options || {};
    return publisher.initMessage({
            data: content
        }, options)
        .then(function (data) {
            message = data;
            return publisher.saveMessage({
                message: message,
                routingKey: content.system
            }, options)
        })
        .then(function (data) {
            log = data;
            return tradePaymentResult.sendToQueue(
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