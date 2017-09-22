
const path = require('path');
global.ENV = process.env.NODE_ENV || 'development';
global.TRADE_SYSTEM_FOR = process.env.TRADE_SYSTEM_FOR;


global.MALL_CONFIG = require(path.join(__dirname, './mall/' + global.ENV + '.json'));
global.SYB_CONFIG = require(path.join(__dirname, './syb/' + global.ENV + '.json'));

global.MALL_MQ_CONFIG = require(path.join(__dirname, './mall/mq/' + global.ENV + '.js'));
global.SYB_MQ_CONFIG = require(path.join(__dirname, './mall/mq/' + global.ENV + '.js'));

global.MALL_TRADE_CHANNEL = require(path.join(__dirname, './mall/tradeChannel'));
global.SYB_TRADE_CHANNEL = require(path.join(__dirname, './syb/tradeChannel'));


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
        if (global.ENV !== 'production') {
            global.DDCONFIG = global.MALL_CONFIG;
            global.MQCONFIG = global.MALL_MQ_CONFIG;
            global.CHANNELCONFIG = global.MALL_TRADE_CHANNEL;
        } else {
            throw ('错误的环境变量TRADE_SYSTEM_FOR');
        }
}

global.SYSTEM = 'ALI_PAY_TUNNEL_TIMMER';
global.Promise = require('bluebird');
global.Logger = require('../utils/logger').Logger;