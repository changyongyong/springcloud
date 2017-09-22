'use strict';

/** 支付内部使用mq */
const tradeMq = {
    host: '192.168.0.230',
    account: 'gwuser_mq',
    password: 'g%ayTmWnAzY'
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