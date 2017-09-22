'use strict'

/**
 * @author WXP
 * @description 初始化config
 */
const path = require('path');
const _ = require('lodash');
const env = process.env.NODE_ENV || 'development';
const mallConfig = require(path.join(__dirname, './mall/' + env + '.json'));
const sybConfig = require(path.join(__dirname, './syb/' + env + '.json'));

const mallMqConfig = require(path.join(__dirname, './mall/mq/' + env + '.js'));
const sybMqConfig = require(path.join(__dirname, './syb/mq/' + env + '.js'));

const mallTradeChannelConfig = require(path.join(__dirname, `/mall/tradeChannel/${env}`));
const sybTradeChannelConfig = require(path.join(__dirname, `/mall/tradeChannel/${env}`));

const TRADE_SYSTEM_FOR = process.env.TRADE_SYSTEM_FOR;
let ddConfig;
let mqConfig;
let tradeChannelConfig;
if (env === 'production' && !TRADE_SYSTEM_FOR) {
    throw ('缺少环境变量TRADE_SYSTEM_FOR')
}

switch (TRADE_SYSTEM_FOR) {
    case 'MALL':
        ddConfig = mallConfig;
        mqConfig = mallMqConfig;
        tradeChannelConfig = mallTradeChannelConfig;
        break;

    case 'SYB':
        ddConfig = sybConfig;
        mqConfig = sybMqConfig;
        tradeChannelConfig = sybTradeChannelConfig;
        break;
    default:
        // 非生产情况下测试与支付相同
        if (env !== 'production') {
            ddConfig = mallConfig;
            mqConfig = mallMqConfig;
            tradeChannelConfig = mallTradeChannelConfig;
        } else {
            throw ('错误的环境变量TRADE_SYSTEM_FOR');
        }
}
global.DD_CONFIG = ddConfig;
global.MQ_CONFIG = mqConfig;
global.TRADE_CHANNEL_CONFIG = tradeChannelConfig;
global.NODE_ENV = env;
global.Promise = require('bluebird');
global.SYSTEM = 'WECHAT_TRADE_CHANNEL';
global.Logger = require('../utils/logger').Logger;
global.Logger('config.loadConfig').info(`当前支付环境为：${TRADE_SYSTEM_FOR}`);