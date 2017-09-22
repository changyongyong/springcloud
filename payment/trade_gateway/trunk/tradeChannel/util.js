'use strict';

const request = require('request');
const logger = global.Logger('tradeChannel-request');
const _ = require('lodash');
const redis = require('redis');
const DD_CONFIG = global.DDCONFIG;
const Promise = require('bluebird');
const client = redis.createClient({
    port: DD_CONFIG.redis.port,
    host: DD_CONFIG.redis.host,
    db: DD_CONFIG.redis.db
});

let utils = {};

module.exports = utils;

/**
 * 简单封装为promise
 */
utils.request = function (args) {
    logger.info('uri:' + args.uri, 'data：' + JSON.stringify(args.data || ''));
    return new Promise(function (resolve, reject) {
        request(args, (error, status, result) => {
            if (error) {
                return reject(error);
            }
            if (result.tag != 'success') {
                let message = result.message;
                if (typeof message !== 'string') {
                    message = JSON.stringify(message);
                }
                return reject({
                    message: `请求失败，状态:${result.status}，原因:${message}`,
                    data: result.data,
                    orignalMessage: result.message
                });
            }
            resolve(result);
        })
    })
};

/**
 * 包装下请求默认包含host
 */
utils.requestPackage = function (host) {
    return function (args) {
        args.uri = host + args.uri;
        return utils.request(args);
    }
};

/**
 * 将对象转换为query对象，比如{a:1,b:2,c:'?',d:undefined}转换为
 * a=1&b=2&c=%3F
 * @param {*} obj 
 */
utils.objToUrl = function (obj) {
    let arr = _.toPairs(obj);
    let arr2 = [];
    for (let data of arr) {
        if (_.includes([undefined, '', null], data[1])) {
            continue;
        }
        data[1] = encodeURIComponent(data[1]);
        arr2.push(data.join('='));
    }
    return arr2.join('&');
}

utils.setValue = function (options) {
    return new Promise(function (resolve, reject) {
        client.set([options.key, options.value, 'NX', 'EX', options.exp], function(error, reply) {
            if (error || !reply) {
                // Logger.error('添加缓存失败', error.stack || error);
                reject('请求过快，请稍后再试')
            }
            //  设置返回OK, 失败或者已经有了 返回null
            return resolve(reply)
        });
    })
        .catch((error)=> {
            throw (error)
        })
};
