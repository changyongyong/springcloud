'use strict';
/* global ddConfig Logger */

require('./config/loadConfig');

global.Logger = require('./utils/logger').Logger;

const Logger = global.Logger;

let logger = Logger('server');

// 配置异常捕捉
process.on('uncaughtException', function (err) {
    logger.error(`全局未被捕捉的异常！message:${err && err.message}  stack:${JSON.stringify(err && err.stack)} sql:${err.sql}`);
});

const app = require('./app');

// 启动http服务
app.listen(global.DDCONFIG.port);

// 启动mq监听
require('./mq').start();

logger.info(`http listen: ${global.DDCONFIG.port}`);

logger.info(`TRADE_SYSTEM_FOR for ${global.TRADE_SYSTEM_FOR}`);