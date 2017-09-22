'use strict';
require('./config/loadConfig');

let logger = global.Logger('server');
// 配置异常捕捉
process.on('uncaughtException', function (err) {
    logger.error(`
    全局未被捕捉的异常！
    message:${err && err.message}  
    stack:${JSON.stringify(err && err.stack)} 
    sql:${err.sql}`
    );
});

const app = require('./app');

// 启动http服务
app.listen(global.DDCONFIG.port);

logger.info(`HTTP ${global.SYSTEM} is listening: ${global.DDCONFIG.port}`);
logger.info(`TRADE_SYSTEM_FOR for ${global.TRADE_SYSTEM_FOR}`);
// 启动RPC服务
require('./rpc').start();

// const outApp = require('./outApp');
// outApp.listen(ddConfig.outPort);
// logger.info(`${global.SYSTEM}-out is listening: ${ddConfig.outPort}`);

