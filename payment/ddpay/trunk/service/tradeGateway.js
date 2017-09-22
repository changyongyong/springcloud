'use strict'

/**
 * @author WXP
 * @description 支付网关对应的配置
 */

const { configToFuncs } = require('../utils/utils');
const host = global.DDCONFIG.tradeGatewayHost;

let configs = {
    'WeChatPay.Payment.create': {
        path: '/api/weChatPay/payment/create',
        method: 'POST',
        isSignCheck: true
    },
    'WeChatPay.Payment.scanPay': {
        path: '/api/weChatPay/payment/scanPay',
        method: 'POST',
        isSignCheck: true
    },
    'AliPay.Payment.create': {
        path: '/api/aliPay/payment/create',
        method: 'POST',
        isSignCheck: true
    },
    'AliPay.Payment.scanPay': {
        path: '/api/aliPay/payment/scanPay',
        method: 'POST',
        isSignCheck: true
    },
    'Refund.refund': {
        path: '/api/refund/refund',
        method: 'POST',
        isSignCheck: true
    },
    'Transfer.transfer': {
        path: '/api/transfer/transfer',
        method: 'POST',
        isSignCheck: true
    }
};

/* eslint-disable  */
for (let key in configs) {
    configs[key].host = host;
}

let tradeGateway = configToFuncs(configs);

module.exports = tradeGateway;