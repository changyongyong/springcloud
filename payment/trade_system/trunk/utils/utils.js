'use strict'

/**
 * @author WXP
 * @description 工具方法
 */

const _ = require('lodash');

module.exports.objToUrl = (obj) => {
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

/**
 * 注册方法，用以将方法注册为调用连
 */
module.exports.regist = function () {
    let funcs = Array.from(arguments);
    if (funcs.length == 1) {
        return function (par, options) {
            options = options || {};
            return funcs[0](par, options, Promise.resolve)
        }
    } else {
        return function (par, options) {
            options = options || {};
            return funcs[0](par, options, module.exports.regist.apply(this, funcs.slice(1)))
        }
    }
}

/**
 * URI encode方法，把所有符号都进行转换
 */
module.exports.encode = function (str) {
    return encodeURIComponent(str).replace(/[/.!'()*~_-]/g, x => `%${x.charCodeAt(0).toString(16).toUpperCase()}`);
}