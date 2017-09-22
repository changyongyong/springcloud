'use strict'

/**
 * @author WXP
 * @description 增加res方法
 */

const Logger = global.Logger('res-error');
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
module.exports = (req, res, next) => {
    /**
     * 增加error方法，返回统一的error方法
     * @param message
     * @param status
     */
    res.error = function (error, status) {
        let message;
        if (error.code == 'VALIDATE_ERROR') {
            return res.validationFailed(error.message);
        }
        if (error) {
            if (typeof error == 'string') {
                message = error;
            } else if ('message' in error) {
                message = error.message;
                if (error instanceof Error) {
                    Logger.error('系统错误：' +
                        JSON.stringify({
                            message: error.message,
                            stack: error.stack
                        }));
                }
            }
        }
        message = message || '系统错误';
        res.json({
            tag: 'error',
            status: status === undefined ? DEFAULT_ERROR_STATUS : status,
            message: message,
            // 用以dataTable报错
            error: message
        });
    };
    /**
     * 增加success方法，直接返回统一的success结果
     * @param data
     * @param count
     * @param status
     * @returns {*}
     */
    res.success = function (data, count, status) {
        let result = {
            tag: 'success',
            status: status === undefined ? DEFAULT_SUCCESS_STAUS : status
        };
        if (count !== undefined) {
            if (typeof count === 'object') {
                for (let key in count) {
                    if (!count.hasOwnProperty(key)) {
                        continue;
                    }
                    result[key] = count[key];
                }
            } else {
                result.count = count;
            }
        }
        result.data = data;
        return res.json(result);
    };
    /**
     * 增加validateFail方法，直接返回统一的校验失败结果
     * @param data
     * @param status
     * @returns {*}
     */
    res.validationFailed = function (failures, status) {
        let result = {
            tag: 'error',
            status: status === undefined ? DEFAULT_VALIDATION_ERROR : status,
            message: '参数错误！',
            failures: failures,
            // 用以dataTable报错
            error: '参数错误！' + failures
        };
        return res.json(result);
    };

    next();
};