'use strict';

/**
 * 调用序列号生成服务服务
 * Created by wdd on 2016/8/4.
 */
const rpc = require('./lib');

const options = {
    WeChatPay: {
        Payment: ['create']
    },
    AliPay: {
        Payment: ['create']
    },
    Refund: ['refund'],
    // 转账
    Transfer: ['transfer']
};

module.exports = rpc.createClient('tradeGateway', options);