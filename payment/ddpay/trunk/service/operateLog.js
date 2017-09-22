'use strict';

/**
 * 操作日志
 * @author 吴秀璞
 * @since 2017/1/16
 */

const ddPayDb = require('../models/ddPayDb');
//sequence取号服务
const {
    //支付账户db
    OperateLog: OperateLogDb
} = ddPayDb;
const ID_START = global.SYSTEM + '_' + process.pid;
const logger = global.Logger('opearate-log');

let OperateLog = {};

OperateLog.STATUS = OperateLogDb.getStatus();

/**
 * 创建日志
 * @param par
 * @returns {Promise|Promise.<TResult>|*|{value}}
 */
OperateLog.create = function (par) {
    return Promise.resolve()
        .then(() => {
            par.operateLogNo = `${ID_START}_${Date.now()}_${parseInt(Math.random() * 100)}`;
            par.status = OperateLog.STATUS.PENDING;
            return OperateLogDb.create(par)
        })
};

/**
 * 处理成功
 * @param log
 * @returns {Object|*|Promise.<Array.<affectedCount, affectedRows>>}
 */
OperateLog.success = function (log) {
    return log.update({
        status: OperateLog.STATUS.SUCCESS
    });
}

/**
 * 处理失败
 * @param log
 * @param error
 * @returns {Object|*|Promise.<Array.<affectedCount, affectedRows>>}
 */
OperateLog.fail = function (log, error) {
    let err = typeof error == 'string' ? error : JSON.stringify({
        message: error.message,
        stack: error.stack,
        sql: error.sql
    });
    if (!log) {
        logger.error(err);
        return Promise.resolve();
    }
    return log.update({
        status: OperateLog.STATUS.FAIL,
        error: err
    });
}

module.exports = OperateLog;