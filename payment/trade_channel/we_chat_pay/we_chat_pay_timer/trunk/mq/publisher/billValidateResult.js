'use strict'

/**
 * @author WXP
 * @description 发送对账结果
 */


const mq = require('../../lib/mq').queueSet.billValidateResult;
const Publisher = require('./publisher');
const publisher = new Publisher('billValidateResult');
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
            return mq.sendToQueue(
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