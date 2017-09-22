/**
 * Created by wt on 2017/8/3.
 */

const ENV = process.env.NODE_ENV || 'development';
const path = require('path');

const MALLCONFIG = require(path.join(__dirname, './mall/' + ENV + '.json'));
const SYBCONFIG = require(path.join(__dirname, './syb/' + ENV + '.json'));
const MALL_MQ_CONFIG = require(path.join(__dirname, './mall/mq/' + ENV + '.js'));
const SYB_MQ_CONFIG = require(path.join(__dirname, './syb/mq/' + ENV + '.js'));

const TRADE_SYSTEM_FOR = process.env.TRADE_SYSTEM_FOR;

if (ENV === 'production' && !TRADE_SYSTEM_FOR) {
    throw ('缺少环境变量TRADE_SYSTEM_FOR')
}

switch (TRADE_SYSTEM_FOR) {
    case 'MALL':
        global.DDCONFIG = MALLCONFIG;
        global.MQCONFIG = MALL_MQ_CONFIG;
        break;

    case 'SYB':
        global.DDCONFIG = SYBCONFIG;
        global.MQCONFIG = SYB_MQ_CONFIG;
        break;
    default:
        if (ENV !== 'production') {
            global.MQCONFIG = MALL_MQ_CONFIG;
            global.DDCONFIG = MALLCONFIG;
        } else {
            throw ('错误的环境变量TRADE_SYSTEM_FOR');
        }
}

global.TRADE_SYSTEM_FOR = TRADE_SYSTEM_FOR;
global.SYSTEM = 'DD_PAY';
global.Promise = require('bluebird');
global.Logger = require('../utils/logger').Logger;