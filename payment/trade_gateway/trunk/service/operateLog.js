'use strict';

/**
 * 操作日志
 * @author 吴秀璞
 * @since 2017/1/16
 */

const tradeGatewayDb = require('../models/tradeGatewayDb');
const {
    //支付账户db
    OperateLog: OperateLogDb
} = tradeGatewayDb;
const SYSTEM = global.SYSTEM + '_' + process.pid;
const PROCESS_ID = process.id;
const _ = require('lodash');
let OperateLog = {};

OperateLog.TYPES = OperateLogDb.getTypes();

OperateLog.STATUS = OperateLogDb.getStatus();


/**
 * 创建日志
 * @param par
 * @returns {Promise|Promise.<TResult>|*|{value}}
 */
OperateLog.create = function (par, { requestId }) {
    return Promise.resolve()
        .then(() => {
            if (requestId) {
                par.operateLogNo = `${SYSTEM}_${requestId}`
            } else {
                par.operateLogNo = `${SYSTEM}_${PROCESS_ID}_${Date.now()}_${_.random(100,999)}`;
            }
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
    return log.update({
        status: OperateLog.STATUS.FAIL,
        error: typeof error == 'string' ? error : JSON.stringify({
            message: error.message,
            stack: error.stack,
            sql: error.sql
        })
    });
}

module.exports = OperateLog;