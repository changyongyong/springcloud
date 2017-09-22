/**
 * Created by SEELE on 2017/8/8.
 */

const path = require('path');
global.NODE_ENV = process.env.NODE_ENV || 'development';
global.TRADE_SYSTEM_FOR = process.env.TRADE_SYSTEM_FOR;

const MALLCONFIG = require(path.join(__dirname, './mall/config.json'));
const SYBCONFIG = require(path.join(__dirname, './syb/config.json'));

const MALL_MQ_CONFIG = require(path.join(__dirname, './mall/mq/' + global.NODE_ENV + '.js'));
const SYB_MQ_CONFIG = require(path.join(__dirname, './syb/mq/' + global.NODE_ENV + '.js'));

switch (global.TRADE_SYSTEM_FOR) {
    case 'MALL':
        global.BASECONFIG = MALLCONFIG[global.NODE_ENV];
        global.MQCONFIG = MALL_MQ_CONFIG;
        break;

    case 'SYB':
        global.BASECONFIG = SYBCONFIG[global.NODE_ENV];
        global.MQCONFIG = SYB_MQ_CONFIG;
        break;
    default:
        if (global.NODE_ENV !== 'production') {
            global.MQCONFIG = MALL_MQ_CONFIG;
            global.BASECONFIG = MALLCONFIG[global.NODE_ENV];
        } else {
            throw ('错误的环境变量TRADE_SYSTEM_FOR');
        }
}

global.AlipayConfig = (function () {
    return {
        APIHOST: 'https://openapi.alipay.com/',
        ALIPAY_PATH: 'gateway.do?',
    }
})(global.NODE_ENV);


