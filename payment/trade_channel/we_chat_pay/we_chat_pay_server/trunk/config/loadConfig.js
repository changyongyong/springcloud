'use strict'

/**
 * @author WXP
 * @description 初始化config
 */
const path = require('path');
const env = process.env.NODE_ENV || 'development';
const mallConfig = require(path.join(__dirname, './mall/' + env + '.json'));
const sybConfig = require(path.join(__dirname, './syb/' + env + '.json'));

const mallMqConfig = require(path.join(__dirname, './mall/mq/' + env + '.js'));
const sybMqConfig = require(path.join(__dirname, './syb/mq/' + env + '.js'));
const TRADE_SYSTEM_FOR = process.env.TRADE_SYSTEM_FOR;

if (env === 'production' && !TRADE_SYSTEM_FOR) {
    throw ('缺少环境变量TRADE_SYSTEM_FOR')
}

switch (TRADE_SYSTEM_FOR) {
    case 'MALL':
        global.DD_CONFIG = mallConfig;
        global.MQ_CONFIG = mallMqConfig;
        break;

    case 'SYB':
        global.DD_CONFIG = sybConfig;
        global.MQ_CONFIG = sybMqConfig;
        break;
    default:
        if (env !== 'production') {
            global.MQ_CONFIG = mallMqConfig;
            global.DD_CONFIG = mallConfig;
        } else {
            throw ('错误的环境变量TRADE_SYSTEM_FOR');
        }
}
global.NODE_ENV = env;
global.SYSTEM = 'WECHAT_TRADE_CHANNEL';

global.Promise = require('bluebird');
global.Logger = require('../utils/logger').Logger;

global.Logger('config.loadConfig').info(`当前支付环境为：${TRADE_SYSTEM_FOR}`);