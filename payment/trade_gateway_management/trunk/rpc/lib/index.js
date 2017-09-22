/**
 * Created by wujj on 2016/7/25.
 */
var hprose = require('hprose');
var ENV = process.env.NODE_ENV || 'development';
var Logger = require('../../utils/logger').Logger('rpc');

/**
 * 【创建server】
 * @param alias
 */
var createServer = function (alias) {
    if (!alias) {
        throw '参数缺失！';
    }
    var URL = require('../../config/rpc_url.json')[ENV][alias];
    var server = hprose.Server.create(URL);
    //用来设置服务器是否是工作在 debug 模式下，在该模式下，当服务器端发生异常时，将会将详细的错误堆栈信息返回给客户端，否则，只返回错误信息。
    server.debug = true;
    //passContext 需在 callback前,坑人
    // service.passContext = true;
    //当该属性设置为 true 时，在进行序列化操作时，将忽略引用处理，加快序列化速度
    // service.simple = true;
    server.on('sendError', function(message) {
        //服务端错误日志
        Logger.error('service error',message.stack);
    });
    process.on('SIGINT', function() {
        server.stop();
    });
    return server;
};

/**
 * 【创建client】
 * @condition 当超过 20s 报错
 * @param alias
 * @param serviceArr
 */
var createClient = function (alias,serviceArr) {
    if (!alias) {
        throw '参数缺失！';
    }
    if (arguments.length != 2) {
        throw '参数个数出错！';
    }
    var URL = require('../../config/rpc_url.json')[ENV][alias];
    var client = hprose.Client.create(URL,serviceArr,{ timeout: 20000 });
    //开启debug
    client.debug = true;
    //使用logHandler
    client.use(logHandler);
    //客户端监听错误
    client.on('error', function(func, err) {
        //客户端错误日志 错误分服务端连接出错与调用出错
        Logger.error('client error',func,err);
    });
    return client;
};

/**
 * 【log处理】
 * @param name
 * @param args
 * @param context
 * @param next
 * @returns {*}
 */
var logHandler = function(name, args, context, next) {
    // console.log("before invoke:", name, args);
    Logger.info('before invoke:', name, args);
    var result = next(name, args, context);
    result.then(function(result) {
        // console.log("after invoke:", name, args, JSON.stringify(result));
        Logger.info('after invoke:', name, args, JSON.stringify(result));
    });
    return result;
};


module.exports = exports = {
    Hprose:hprose, //原生hprose
    createServer: createServer,
    createClient: createClient
};
