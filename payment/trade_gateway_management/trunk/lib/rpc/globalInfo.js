'use strict';

/**
 * 获取城市基本信息
 * Created by wdd on 2016/8/4.
 */
const rpc = require('./lib');

const options = {
    city: ['getEnabledCities']
};

module.exports = rpc.createClient('globalInfo', options);