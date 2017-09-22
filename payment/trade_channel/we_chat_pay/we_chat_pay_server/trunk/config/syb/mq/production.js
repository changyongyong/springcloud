'use strict';

/** 支付内部使用mq */
var tradeMq = {
    host: '192.168.0.230',
    account: 'wxuser_mq',
    password: 'W%XyPuAnAzY'
};

module.exports = {
    queue: [{
            // 交易付款结果，从渠道获取消息
            name: 'tradePaymentResult',
            mq: tradeMq,
            options: {
                queueName: 'syb.trade_gateway_payment_result',
                prefetchCount: 2
            }
        },
        {
            // 交易退款结果，从渠道获取 
            name: 'tradeRefundResult',
            mq: tradeMq,
            options: {
                queueName: 'trade_gateway_refund_result',
                prefetchCount: 2
            }
        },
        {
            // 交易转账结果，从渠道获取
            name: 'tradeTransferResult',
            mq: tradeMq,
            options: {
                queueName: 'trade_gateway_transfer_result',
                prefetchCount: 2
            }
        }
    ]
};