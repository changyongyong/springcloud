'use strict';

const hprose = require('hprose');
const logger = global.Logger('hp-rose');
const rpcConfig = global.DDCONFIG.rpc;
const {
    ddpay,
    tradeGateway
} = require('../service');
/**
 * 【创建server】
 * @param alias
 */
var createServer = function () {
    logger.info(`RPC监听：${rpcConfig.host}:${rpcConfig.port}`);
    var server = hprose.Server.create(`${rpcConfig.host}:${rpcConfig.port}`);
    //用来设置服务器是否是工作在 debug 模式下，在该模式下，当服务器端发生异常时，将会将详细的错误堆栈信息返回给客户端，否则，只返回错误信息。
    server.debug = false;
    //passContext 需在 callback前,坑人
    // service.passContext = true;
    //当该属性设置为 true 时，在进行序列化操作时，将忽略引用处理，加快序列化速度
    // service.simple = true;
    server.on('sendError', function (message) {
        //服务端错误日志
        logger.error('service error', message.stack);
    });
    process.on('SIGINT', function () {
        server.stop();
    });
    return server;
};

//创建server
const server = createServer('tradeGateway');

// 将方法扁平，并注册到hprose中，其中alias为a_b_c_d
const flat = function (obj, alias) {
    if (typeof obj == 'function') {
        return server.addFunction(obj, alias);
    }
    for (let key in obj) {
        if (!obj.hasOwnProperty(key)) {
            continue;
        }
        flat(obj[key], `${alias}_${key}`);
    }
}
flat(ddpay.services, 'Ddpay');
flat(tradeGateway.services, 'TradeGateway');


module.exports = server;