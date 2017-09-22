'use strict';

/**
 * 进销存明细处理方法
 * @author 吴秀璞
 * @since 2016/8/15
 */

var refundResult = require('../../lib/mq').queueSet.tradeRefundResult;
var Publisher = require('./publisher');
var publisher = new Publisher('refundResultQueue');
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