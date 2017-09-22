/**
 * Created by wt on 2017/8/8.
 */
const path = require('path');
const packageConfig = require('../package.json');

global.NODE_ENV = process.env.NODE_ENV || 'development';
global.TRADE_SYSTEM_FOR = process.env.TRADE_SYSTEM_FOR;

const MALL_CONFIG = require(path.join(__dirname, './mall/' + global.NODE_ENV + '.json'));
const SYB_CONFIG = require(path.join(__dirname, './syb/' + global.NODE_ENV + '.json'));

const MALL_MQ_CONFIG = require(path.join(__dirname, './mall/mq/' + global.NODE_ENV + '.js'));
const SYB_MQ_CONFIG = require(path.join(__dirname, './syb/mq/' + global.NODE_ENV + '.js'));


if (global.NODE_ENV === 'production' && !global.TRADE_SYSTEM_FOR) {
    throw ('缺少环境变量TRADE_SYSTEM_FOR')
}

switch (global.TRADE_SYSTEM_FOR) {
    case 'MALL':
        global.DDCONFIG = MALL_CONFIG;
        global.MQCONFIG = MALL_MQ_CONFIG;
        break;

    case 'SYB':
        global.DDCONFIG = SYB_CONFIG;
        global.MQCONFIG = SYB_MQ_CONFIG;
        break;
    default:
        if (global.NODE_ENV !== 'production') {
            global.DDCONFIG = MALL_CONFIG;
            global.MQCONFIG = MALL_MQ_CONFIG;
        } else {
            throw ('错误的环境变量TRADE_SYSTEM_FOR');
        }
}

global.SYSTEM = 'TRADE_GATEWAY_MANAGEMENT';
global.VERSION = global.TRADE_SYSTEM_FOR + packageConfig.version;
global.APP_NAME = packageConfig.appName;
global.promise = require('bluebird');

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
