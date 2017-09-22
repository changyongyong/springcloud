'use strict';

/**
 * 充值结果处理
 * @author 吴秀璞
 * @since 2016/8/15
 */

const {
    rechargeResult: exchange
} = require('../../lib/mq').exchangeSet;
const Publisher = require('./publisher');
const publisher = new Publisher('outTradeResultExchange');
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