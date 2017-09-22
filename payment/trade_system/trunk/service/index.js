'use strict'

/**
 * @author WXP
 * @description 
 * 初始化对应的方法
 */
const { Account: AccountDb } = require('../models/tradeGatewayDb');
const _ = require('lodash');
const logger = global.Logger('service');
const PROCESS_ID = process.pid;
const md5 = require('md5');
const request = require('request-promise');
const crypto = require('crypto');
const {
    regist,
    objToUrl,
    encode
} = require('../utils/utils')

/** 计算出秘钥 */
const encrypt = (data) => {
    let hash = crypto.createHash('RSA-SHA512');
    hash.update(`${data.accountId}${data.id}${data.salt}`, 'utf8');
    return md5(hash.digest('hex')).toUpperCase();
}

/** 校验sign是否正确 */
const validateToken = function (par, options, next) {
    let now = new Date().getTime() / 1000;
    if (!par.accountId) {
        throw ('缺少accountId，无法进行后续操作！');
    }
    if (!par.onceStr) {
        throw ('需要onceStr！');
    }
    // 时间超时5分钟
    if (!par.timestamp || Math.abs(now - parseInt(par.timestamp)) > 300) {
        throw ('请求已过期！');
    }
    return AccountDb.find({
            where: {
                accountId: par.accountId
            },
            raw: true
        })
        .then((account) => {
            if (!account) {
                throw ('没有对应的账户！');
            }
            let param = _.cloneDeep(options.req);
            let sign = param.sign;
            delete param.sign;
            let token = encrypt(account);
            let str = Object.keys(param)
                .sort()
                .map(function (key) {
                    return key + '=' + encode(param[key]);
                })
                .join('&') + '&key=' + token;
            logger.info('待签名字符串:', str);
            logger.info('md5str:', md5(str))
            logger.info('sign', sign)
            if (md5(str) != sign) {
                throw ('验签失败！');
            }
        })
        .then(() => {
            return next(par, options, next);
        })
};

/**
 * 初始换参数
 * @param {*} serviceName 
 * @param {*} configs 
 */
const init = (serviceName, configs) => {
    let services = {};
    let routers = [];
    let keys = Object.keys(configs);
    for (let key of keys) {
        initEach(key, configs[key], {
            services,
            routers
        });
    }
    return {
        services,
        routers
    };
}

/**
 * 单个初始化
 * @param {*} key 
 * @param {*} config 
 * @param {*} param2 
 */
const initEach = (key, config, {
    routers,
    services
}) => {
    let funcPath = key.split('.');
    let funcName = funcPath.pop();
    let service = services;
    let router = _.cloneDeep(config);
    for (let path of funcPath) {
        if (!service[path]) {
            service[path] = {};
        }
        service = service[path];
    }
    let func;
    let funcs = [
        prepare(key)
    ];
    if (config.isSignCheck) {
        funcs.push(validateToken);
    }
    funcs.push(removePar);
    if (config.proxy === true) {
        funcs.push(proxyRequest(config));
    } else {

        funcs.push(initRequest(config));
    }
    func = regist.apply(this, funcs);
    if (config.isRPC !== false) {
        service[funcName] = (args) => {
            return func(args)
                .catch((error) => {
                    return Promise.reject(
                        typeof error === 'string' ? error : error && error.message || '系统错误'
                    );
                });
        }
    }
    if (config.proxy === true) {
        router.func = (req, res) => {
            let data;
            if (req.method == 'GET') {
                data = req.query;
            } else {
                data = req.body;
            }
            func(data)
                .then((data) => {
                    let header = data.header;
                    for (let key in header) {
                        if (!header.hasOwnProperty(key)) {
                            continue;
                        }
                        res.append(key, header[key]);
                    }
                    res.end(data.data);
                })
        }
    } else {
        router.func = (req, res) => {
            let data;
            if (req.method == 'GET') {
                data = req.query;
            } else {
                data = req.body;
            }
            func(data)
                .then((data) => {
                    res.success(data);
                })
                .catch((error) => {
                    // 网关之后的系统的错误
                    if (error && error.status) {
                        if (typeof error === 'string') {
                            return res.end(error);
                        } else {
                            return res.json(error);
                        }
                    } else {
                        // 自己系统的错误
                        return res.error(error);
                    }
                })
        };
    }
    routers.push(router);
};

/**
 * 根据配置生成请求方法
 * @param {*} config 
 */
const initRequest = function (config) {
    return function (query) {
        let uri = config.host + config.path;
        let data;
        if (config.method == 'GET') {
            uri += '?' + objToUrl(query);
        } else {
            data = query;
        }
        return request({
                uri: uri,
                method: config.method,
                json: true,
                body: data
            })
            .then((data) => {
                if (data.tag && data.tag == 'success') {
                    return data.data;
                } else {
                    throw (data);
                }
            });
    }
};

const proxyRequest = function (config) {
    return function (query) {
        let uri = config.host + config.path;
        let data;
        if (config.method == 'GET') {
            uri += '?' + objToUrl(query);
        } else {
            data = query;
        }
        return request({
                uri: uri,
                method: config.method,
                body: data,
                resolveWithFullResponse: true
            })
            .then((response) => {
                return {
                    data: response.body,
                    header: response.headers,
                    statusCode: response.statusCode
                }
            });
    }
}

/**
 * 执行前准备
 * 1.打印前后日志，执行时间
 * 2.将参数复制一份到options.req
 * 3.在options增加requestId
 * @param {string} operate 操作方法的名称
 */
const prepare = (operate) => {
    return function (par, options, next) {
        let requestId = `${PROCESS_ID}_${Date.now()}_${_.random(100,999)}`;
        let start = Date.now();
        par = par || {};
        options = options || {};
        options.requestId = requestId;
        // 保存原始请求，防止被重写
        options.req = _.cloneDeep(par);
        logger.info(`execute operate:${operate} requestId:${requestId} par:${JSON.stringify(par)}`)
        return Promise.resolve()
            .then(() => {
                return next(par, options)
            })
            .then((data) => {
                logger.info(`after-execute operate:${operate} ` +
                    `requestId:${requestId} status:SUCCESS use:${Date.now() - start}ms`);
                return data;
            })
            .catch((error) => {
                logger.info(`after-execute operate:${operate} requestId:${requestId} ` +
                    `status:ERROR use:${Date.now() - start}ms ` +
                    `error: ${typeof error === 'string' ? error : error.message}` +
                    `stack: ${error.stack || ''}`
                );
                if (error.stack) {
                    logger.error(requestId, error, error.stack);
                }
                throw (error);
            })
    }
};

/**
 * 删除多余的参数
 * @param {*} par 
 * @param {*} options 
 * @param {*} next 
 */
const removePar = function name(par, options, next) {
    delete par.sign;
    delete par.onceStr;
    delete par.timestamp;
    return next(par, options, next);
}

/* eslint-disable global-require */
module.exports = {
    ddpay: init('ddpay', require('./ddpayConfig')),
    tradeGateway: init('tradeGateway', require('./tradeGatewayConfig')),
}