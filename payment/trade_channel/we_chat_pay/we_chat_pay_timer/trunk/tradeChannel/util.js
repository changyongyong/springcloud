'use strict';

const requestUtil = require('../utils/request');

let utils = {};
let _ = require('lodash');

module.exports = utils;

/**
 * 简单封装为promise
 */
utils.request = requestUtil.request;

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