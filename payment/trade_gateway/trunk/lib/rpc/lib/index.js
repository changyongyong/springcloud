'use strict';

/* global ddConfig */

const hprose = require('hprose');
const URLS = require('../../../config/rpcUrl');
const Logger = global.Logger('hp-rose');
/**
 * 【创建client】
 * @condition 当超过 20s 报错
 * @param alias
 * @param serviceArr
 */
var createClient = function (alias, serviceArr) {
    if (!alias) {
        throw '参数缺失！';
    }
    if (arguments.length != 2) {
        throw '参数个数出错！';
    }
    var URL = URLS[alias];
    var client = hprose.Client.create(URL, serviceArr, {timeout: 20000});
    //开启debug
    client.debug = false;
    //使用logHandler
    client.use(logHandler);
    //客户端监听错误
    client.on('error', function (func, err) {
        //客户端错误日志 错误分服务端连接出错与调用出错
        Logger.error('client error', func, err);
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
var logHandler = function (name, args, context, next) {
    return next(name, args, context);
};


module.exports = {
    Hprose: hprose, //原生hprose
    createClient: createClient
};
