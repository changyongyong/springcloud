'use strict';

/**
 * 进销存明细处理方法
 * @author 吴秀璞
 * @since 2016/8/15
 */

var tradeTransferResult = require('../../lib/mq').queueSet.tradeTransferResult;
var Publisher = require('./publisher');
var publisher = new Publisher('transferResultQueue');
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
            return tradeTransferResult.sendToQueue(
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