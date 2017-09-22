'use strict';

/**
 * 转账结果处理
 * @author 文坦
 * @since 2017/7/28
 */

const {
    transferResult: exchange
} = require('../../lib/mq').exchangeSet;
const Publisher = require('./publisher');
const publisher = new Publisher('outTransferResultExchange');
const sendMessage = function (content, options) {
    let log;
    let message;
    options = options || {};
    return publisher.initMessage({
            data: content
        }, options)
        .then(data => {
            message = data;
            return publisher.saveMessage({
                message: message,
                routingKey: content.system || ''
            }, options)
        })
        .then((data) => {
            log = data;
            return exchange.publish(
                content.system,
                message
            )
        })
        .then(() => {
            return publisher.success(log, options);
        })
};


module.exports = {
    sendMessage: sendMessage
};