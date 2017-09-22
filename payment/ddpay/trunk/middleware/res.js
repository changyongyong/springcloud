'use strict';

const Logger = require('../utils/logger').Logger('res-error');
const co = require('co');
// 默认失败状态
const DEFAULT_ERROR_STATUS = -99;
// 默认成功状态
const DEFAULT_SUCCESS_STAUS = 1;
const DEFAULT_VALIDATION_ERROR = -10;

/**
 * res增加方法
 * @param req
 * @param res
 * @param next
 */
module.exports = function () {
    return co.wrap(function *(ctx, next) {
        let response = ctx.response;

        /**
         * 增加error方法，返回统一的error方法
         * @param message
         * @param status
         */
        response.error = (error, status) => {
            let message;
            if (typeof error == 'string') {
                message = error;
            } else if ('message' in error) {
                message = error.message;
                if (error instanceof Error) {
                    Logger.error('系统错误：' +
                        JSON.stringify(
                            {
                                message: error.message,
                                stack: error.stack
                            }
                        ));
                }
            }
            message = message || '系统错误';
            response.body = {
                tag: 'error',
                status: status === undefined ? DEFAULT_ERROR_STATUS : status,
                message: message
            };
        };
        /**
         * 增加success方法，直接返回统一的success结果
         * @param data
         * @param status
         * @returns {*}
         */
        response.success = (data, count, status) => {
            let result = {
                tag: 'success',
                status: status === undefined ? DEFAULT_SUCCESS_STAUS : status,
                data: data
            };
            if (count !== undefined) {
                result.count = count;
            }
            return response.body = result;
        };
        /**
         * 增加validateFail方法，直接返回统一的校验失败结果
         * @param data
         * @param status
         * @returns {*}
         */
        response.validationFailed = (failures, status) => {
            let result = {
                tag: 'error',
                status: status === undefined ? DEFAULT_VALIDATION_ERROR : status,
                message: '校验失败',
                failures: failures
            };
            return response.body = result;
        };
        yield next();
    });
}