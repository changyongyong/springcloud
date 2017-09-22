'use strict';
const Queue = require('mq-simple').Queue;
const mqConfig = global.MQCONFIG;
const {
    queue: queueConfig
} = mqConfig;
let queueSets;

/**
 * 根据配置文件生成相应的队列实例
 * 配置文件内容：
 * {
 *      name: '队列名',
 *      mq: 'mq服务器配置',
 *      options: {
 *          queueName: '队列名称',
 *          prefetchCount: '消费时最大接受数量'
 *      }
 * }
 */
queueSets = (function (configs) {
    let queueSets = {};
    if (!Array.isArray(configs)) {
        configs = [configs];
    }
    for (let config of configs) {
        queueSets[config.name] = new Queue(config.mq, config.options);
    }
    return queueSets;
})(queueConfig);

module.exports = queueSets;