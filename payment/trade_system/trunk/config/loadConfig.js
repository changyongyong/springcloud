'use strict';

/**
 * @author WXP
 * @description 初始化config
 */
// const path = require('path');

global.NODE_ENV = process.env.NODE_ENV || 'development';
global.TRADE_SYSTEM_FOR = process.env.TRADE_SYSTEM_FOR;
const path = require('path');

const pathForm = function (myPath) {
    return path.join(path.join(__dirname, myPath))
};

global.MALL_CONFIG = require(pathForm('./mall/' + global.NODE_ENV + '.json'));
global.SYB_CONFIG = require(pathForm('./syb/' + global.NODE_ENV + '.json'));



switch (global.TRADE_SYSTEM_FOR) {
    case 'MALL':
        global.DDCONFIG = global.MALL_CONFIG;
        break;

    case 'SYB':
        global.DDCONFIG = global.SYB_CONFIG;
        break;
    default:
        if (global.NODE_ENV !== 'production') {
            global.DDCONFIG = global.MALL_CONFIG;
        } else {
            throw ('错误的环境变量TRADE_SYSTEM_FOR');
        }
}

global.Promise = require('bluebird');

global.Logger = require('../utils/logger').Logger;

global.SYSTEM = 'TRADE_SYSTEM';

global.tradeGatewayConfig = global.DDCONFIG.tradeGatewayConfig;

global.ddpayConfig = global.DDCONFIG.ddpayConfig;