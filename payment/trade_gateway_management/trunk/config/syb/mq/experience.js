'use strict';

/** 支付内部使用mq */
const tradeMq = {
    host: '192.168.0.103',
    account: 'guest',
    password: 'guest'
};
module.exports = {
    queue: [{
        name: 'aliAuthMerchant',
        mq: tradeMq,
        options: {
            queueName: 'ali_auth_merchant',
            prefetchCount: 1
        }
    }]
};