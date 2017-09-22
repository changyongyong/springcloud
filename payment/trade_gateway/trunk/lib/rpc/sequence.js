'use strict';

/**
 * 调用序列号生成服务服务
 * Created by wdd on 2016/8/4.
 */
const rpc = require('./lib');

const options = {
    sequence: ['get', 'getList']
};

module.exports = rpc.createClient('sequence', options);