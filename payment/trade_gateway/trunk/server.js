'use strict';
/* global ddConfig Logger */

// 加载配置文件
require('./config/loadConfig');

let logger = Logger('server');
const DDCONFIG = global.DDCONFIG;

// 配置异常捕捉
process.on('uncaughtException', function (err) {
    logger.error(`全局未被捕捉的异常！message:${err && err.message}  stack:${JSON.stringify(err && err.stack)} sql:${err.sql}`);
});

// 启动mq监听
require('./mq').start();

// 启动http服务
require('./app').listen(DDCONFIG.port);
logger.info(`${global.SYSTEM} start listening ${DDCONFIG.port}`);
logger.info(`TRADE_SYSTEM_FOR for ${global.TRADE_SYSTEM_FOR}`);