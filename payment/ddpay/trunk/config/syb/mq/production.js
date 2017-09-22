'use strict';

/** 支付内部使用mq */
const tradeMq = {
    host: '192.168.0.230',
    account: 'ddpayuser_mq',
    password: 'D%DyPmAnAzY'
};

module.exports = {
    exchange: [{
        // 充值结果
        name: 'rechargeResult',
        mq: tradeMq,
        options: {
            exchange: 'ddpay.rechargeResult'
        }
    },{
        // 转账结果
        name: 'transferResult',
        mq: tradeMq,
        options: {
            exchange: 'ddpay.transferResult'
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
    }, {
        name: 'gatewayTransferResult',
        mq: tradeMq,
        options: {
            queueName: 'dd_pay_transfer_result',
            prefetchCount: 2
        }
    }]
};