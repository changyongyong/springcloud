'use strict'

/**
 * @author WXP
 * @description 支付网关对应的配置
 */

const host = global.tradeGatewayConfig.host;

let configs = {
    'WeChatPay.Payment.create': {
        path: '/api/weChatPay/payment/create',
        outPath: '/weChatPay/payment/create',
        method: 'POST',
        isSignCheck: true
    },
    'WeChatPay.Payment.scanPay': {
        path: '/api/weChatPay/payment/scanPay',
        outPath: '/weChatPay/payment/scanPay',
        method: 'POST',
        isSignCheck: true
    },
    'AliPay.Payment.create': {
        path: '/api/aliPay/payment/create',
        outPath: '/aliPay/payment/create',
        method: 'POST',
        isSignCheck: true
    },
    'AliPay.Payment.scanPay': {
        path: '/api/aliPay/payment/scanPay',
        outPath: '/aliPay/payment/scanPay',
        method: 'POST',
        isSignCheck: true
    },
    'Refund.refund': {
        path: '/api/refund/refund',
        outPath: '/refund/refund',
        method: 'POST',
        isSignCheck: true
    },
    'Way.way': {
        path: '/api/account/way',
        outPath: '/account/way',
        method: 'POST',
        isSignCheck: false
    }

    // 不允许外部调用提现接口
    // 'Transfer.transfer': {
    //     path: '/api/transfer/transfer',
    //     outPath: '/transfer/transfer',
    //     method: 'POST',
    //     isSignCheck: true
    // }
};

/* eslint-disable  */
for (let key in configs) {
    configs[key].host = host;
}

module.exports = configs;