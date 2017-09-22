'use strict';

const request = require('request');

let utils = {};

module.exports = utils;

/**
 * 简单封装为promise
 */
utils.request = function (args) {
    return new Promise(function (resolve, reject) {
        request(args, (error, status, result) => {
            if (error) {
                return reject(error);
            }
            if (result.tag != 'success') {
                return reject({
                    message: `请求失败，状态:${result.status}，原因:${result.message && result.message.msg || result.message}`,
                    data: result.message,
                    errorCode: result.errorCode
                });
            }
            resolve(result);
        })
    })
};