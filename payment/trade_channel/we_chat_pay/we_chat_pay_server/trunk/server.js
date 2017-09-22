'use strict';

require('./config/loadConfig');

let logger = global.Logger('server');
let ddConfig = global.DD_CONFIG;
// 配置异常捕捉
process.on('uncaughtException', function (err) {
    logger.error(`
    全局未被捕捉的异常！
    message:${err && err.message}  
    stack:${JSON.stringify(err && err.stack)} 
    sql:${err.sql}`);
});

const app = require('./app');

// 启动http服务
app.listen(ddConfig.port);

logger.info(`${global.SYSTEM} is listening: ${ddConfig.port}`);


const outApp = require('./outApp');
outApp.listen(ddConfig.outPort);
logger.info(`${global.SYSTEM}_OUT is listening: ${ddConfig.outPort}`);