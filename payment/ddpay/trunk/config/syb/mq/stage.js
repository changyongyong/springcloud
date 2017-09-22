'use strict';

/** 支付内部使用mq */
const tradeMq = {
    host: '192.168.0.103',
    account: 'guest',
    password: 'guest'
};

module.exports = {
    exchange: [{
        // 充值结果
        name: 'rechargeResult',
        mq: tradeMq,
        options: {
            exchange: 'ddpay.rechargeResult'
        }
    }],
    queue: [{
        // 交易付款结果，从渠道获取消息
        name: 'gatewayTradeResult',
        mq: tradeMq,
        options: {
            queueName: 'dd_pay_trade_result',
            prefetchCount: 2
        }
    }]
};