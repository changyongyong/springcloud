'use strict';
/* global ddConfig Logger */

require('./config/loadConfig');

let logger = Logger('server');

// 配置异常捕捉
process.on('uncaughtException', function (err) {
    logger.error(`全局未被捕捉的异常！message:${err && err.message}  stack:${JSON.stringify(err && err.stack)} sql:${err.sql}`);
});

const mq = require('./mq');
const app = require('./app');

// 启动mq监听
mq.start();

// 启动http服务
app.listen(global.DDCONFIG.port);
logger.info(`${global.SYSTEM} start, listening ${global.DDCONFIG.port}`);
logger.info(`TRADE_SYSTEM_FOR for ${global.TRADE_SYSTEM_FOR}`);