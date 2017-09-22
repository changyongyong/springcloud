'use strict';

/**
 * 支付宝授权认证
 * @author 文坦
 * @since 2017/07/11
 */

var aliAuthMerchant = require('../../lib/mq').queueSet.aliAuthMerchant;
var Publisher = require('./publisher');
var publisher = new Publisher('aliAuthMerchant');
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
            return aliAuthMerchant.sendToQueue(
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