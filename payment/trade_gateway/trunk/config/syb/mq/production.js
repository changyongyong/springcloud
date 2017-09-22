'use strict';

/** 支付内部使用mq */
const tradeMq = {
    host: '192.168.0.230',
    account: 'gwuser_mq',
    password: 'g%ayTmWnAzY'
};

/** 支付与外部系统对接使用的mq */
const outMq = tradeMq;

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
        },
        {
            // 交易转账结果，从渠道获取
            name: 'tradeChannelValidateResult',
            mq: tradeMq,
            options: {
                queueName: 'trade_gateway_trade_channel_validate_result',
                prefetchCount: 2
            }
        }
    ],
    exchange: [{
        //对其它系统发送交易结果
        name: 'outPaymentResult',
        mq: outMq,
        options: {
            exchange: 'tradeGateway.paymentResult'
        }
    }, {
        //对其它系统发送退款结果
        name: 'outRefundResult',
        mq: outMq,
        options: {
            exchange: 'tradeGateway.refundResult'
        }
    }, {
        //对其它系统发送转账结果
        name: 'outTransferResult',
        mq: outMq,
        options: {
            exchange: 'tradeGateway.transferResult',
        }
    },{
        //对其它系统发送账户变更结果
        name: 'outAccountResult',
        mq: outMq,
        options: {
            exchange: 'tradeGateway.accountResult',
        }
    }]
};