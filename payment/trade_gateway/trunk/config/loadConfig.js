// const config = require('getconfig');
// global.ddConfig = config;
global.NODE_ENV = process.env.NODE_ENV || 'development';
global.TRADE_SYSTEM_FOR = process.env.TRADE_SYSTEM_FOR;
const path = require('path');

const pathForm = function (myPath) {
    return path.join(path.join(__dirname, myPath))
};

global.MALL_CONFIG = require(pathForm('./mall/' + global.NODE_ENV + '.json'));
global.SYB_CONFIG = require(pathForm('./syb/' + global.NODE_ENV + '.json'));

global.MALL_MQ_CONFIG = require(pathForm('./mall/mq/' + global.NODE_ENV + '.js'));
global.SYB_MQ_CONFIG = require(pathForm('./syb/mq/' + global.NODE_ENV + '.js'));

global.MALL_TRADE_CHANNEL = require(pathForm('./mall/tradeChannel/' + global.NODE_ENV + '.js'));
global.SYB_TRADE_CHANNEL = require(pathForm('./syb/tradeChannel/' + global.NODE_ENV + '.js'));


switch (global.TRADE_SYSTEM_FOR) {
    case 'MALL':
        global.DDCONFIG = global.MALL_CONFIG;
        global.MQCONFIG = global.MALL_MQ_CONFIG;
        global.CHANNELCONFIG = global.MALL_TRADE_CHANNEL;
        break;

    case 'SYB':
        global.DDCONFIG = global.SYB_CONFIG;
        global.MQCONFIG = global.SYB_MQ_CONFIG;
        global.CHANNELCONFIG = global.SYB_TRADE_CHANNEL;
        break;
    default:
        if (global.NODE_ENV !== 'production') {
            global.DDCONFIG = global.MALL_CONFIG;
            global.MQCONFIG = global.MALL_MQ_CONFIG;
            global.CHANNELCONFIG = global.MALL_TRADE_CHANNEL;
        } else {
            throw ('错误的环境变量TRADE_SYSTEM_FOR');
        }
}


global.Promise = require('bluebird');
global.Logger = require('../utils/logger').Logger;
global.SYSTEM = 'TRADE_GATEWAY';
switch (global.NODE_ENV) {
    case 'production':
        global.orderStart = '';
        break;
    case 'dev':
        global.orderStart = 'dev_';
        break;
    case 'development':
        global.orderStart = 'dev_';
        break;
    case 'test':
        global.orderStart = 'test_';
        break;
    case 'experience':
        global.orderStart = 'exp_';
        break;
    default:
        global.orderStart = global.NODE_ENV.slice(0, 3);
        break;
}