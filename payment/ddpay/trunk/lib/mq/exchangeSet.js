'use strict';
const Exchange = require('mq-simple').Exchange;
const mqConfig = global.MQCONFIG;
const {
    exchange: exchangeConfig
} = mqConfig;
let exchangeSets;

/**
 * 根据配置文件生成相应的队列实例
 * 配置文件内容：
 * {
 *      name: '队列名',
 *      mq: 'mq服务器配置',
 *      options: {
 *          exchangeName: '队列名称',
 *          prefetchCount: '消费时最大接受数量'
 *      }
 * }
 */
exchangeSets = (function (configs) {
    let exchangeSets = {};
    if (!Array.isArray(configs)) {
        configs = [configs];
    }
    for (let config of configs) {
        exchangeSets[config.name] = new Exchange(config.mq, config.options);
    }
    return exchangeSets;
})(exchangeConfig);

module.exports = exchangeSets;