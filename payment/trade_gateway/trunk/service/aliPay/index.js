'use strict';

/**
 * 支付宝相关内容
 */
/* eslint-disable global-require */
module.exports = {
    Payment: require('./payment'),
    Refund: require('./refund'),
    Transfer: require('./transfer')
}