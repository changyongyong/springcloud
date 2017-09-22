'use strict';

/**
 * 进销存明细处理方法
 * @author 吴秀璞
 * @since 2016/8/15
 */

const {
    outTransferResult: outTransferResultExchange
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
            return outTransferResultExchange.publish(
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