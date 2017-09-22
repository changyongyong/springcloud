 
const xml2js = require('xml2js');
const _ = require('lodash');
const request = require('request-promise');
const logger = global.Logger('utils-util');
const Joi = require('joi');

/**
 * 包装下请求默认包含host
 */
exports.requestPackage = function (host) {
    return function (args) {
        args.uri = host + args.uri;
        logger.info(`requeset： method: ${args.method || 'GET'} ` +
            `url: ${args.uri}, data：${JSON.stringify(args.body || '')}`);
        return request(args);
    }
};

exports.buildXML = function (json) {
    var builder = new xml2js.Builder();
    return builder.buildObject(json);
};

// XML TO JSON
exports.parseXML = function (xml) {
    var parser = new xml2js.Parser({ trim: true, explicitArray: false, explicitRoot: false });
    return new Promise((resolve, reject) => {
        parser.parseString(xml, (error, data) => {
            if (error) {
                return reject(error);
            } else {
                return resolve(data);
            }
        });
    })

};

exports.pipe = function (stream) {
    return new Promise((resolve, reject) => {
        var buffers = [];
        stream.on('data', function (trunk) {
            buffers.push(trunk);
        });
        stream.on('end', function () {
            return resolve(Buffer.concat(buffers));
        });
        stream.once('error', reject);
    })

};

exports.mix = function () {
    let root = arguments[0];
    if (arguments.length == 1) { return root; }
    for (let i = 1; i < arguments.length; i++) {
        root = _.assign(root, arguments[i]);
    }
    return root;
};

// 生成随机字符串
exports.generateNonceString = function (length) {
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var maxPos = chars.length;
    var noceStr = '';
    for (var i = 0; i < (length || 32); i++) {
        noceStr += chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return noceStr;
};

/**
 * 主服务中的注册中间件
 */
exports.regist = function () {
    let funcs = Array.from(arguments);
    if (funcs.length == 1) {
        return function (par, options) {
            options = options || {};
            return funcs[0](par, options, Promise.resolve)
        }
    } else {
        return function (par, options) {
            options = options || {};
            return funcs[0](par, options, exports.regist.apply(this, funcs.slice(1)))
        }
    }
}

/**
 * 校验中间件，使用promise
 */
exports.joiValidator = (schema, options) => {
    options = options || {};
    //生成校验中间件
    return (par, options2, next) => {
        if (!schema) {
            return next();
        }
        return new Promise((resolve) => {
                Joi.validate(par, schema, options, (err) => {
                    if (err) {
                        let details = err && err.details || [];
                        let failures = [];
                        for (let detail of details) {
                            failures.push(detail.message);
                        }
                        throw (JSON.stringify(failures));
                    }
                    resolve();
                });
            })
            .then(() => {
                return next(par, options2);
            })
    }
};
