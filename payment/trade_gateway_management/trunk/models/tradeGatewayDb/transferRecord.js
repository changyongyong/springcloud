'use strict';

/**
 * 转账记录
 */
const _ = require('lodash');

const STATUS = {
    // 处理中
    PENDDING: 'PENDDING',
    // 成功
    SUCCESS: 'SUCCESS',
    // 已关闭，未成功
    CLOSED: 'CLOSED',
    // 超时未成功
    TIME_OUT: 'TIME_OUT',
    // 失败
    FAIL: 'FAIL',
    // 用户信息错误导致转账失败
    USER_INFO_ERROR: 'USER_INFO_ERROR'
};

module.exports = function (sequelize, DataTypes) {
    var TransferRecord = sequelize.define('TransferRecord', {
        tradeRecordNo: {
            type: DataTypes.STRING(200),
            comment: '交易流水号'
        },
        status: {
            type: DataTypes.STRING(100),
            comment: '状态'
        },
        tradeType: {
            type: DataTypes.STRING(100),
            comment: '交易类型'
        },
        tradeChannel: {
            type: DataTypes.STRING(100),
            comment: '交易渠道'
        },
        source: {
            type: DataTypes.STRING(100),
            comment: 'APP源'
        },
        totalFee: {
            type: DataTypes.DECIMAL(15, 2),
            comment: '总计金额'
        },
        thirdPartAccount: {
            type: DataTypes.STRING,
            comment: '收款方第三方账户'
        },
        receiptFee: {
            type: DataTypes.DECIMAL(15, 2),
            comment: '实际金额'
        },
        operateLogNo: {
            type: DataTypes.STRING(100),
            comment: '操作流水号'
        },
        orderType: {
            type: DataTypes.STRING(400),
            comment: '对应单据的类型'
        },
        orderId: {
            type: DataTypes.STRING(200),
            comment: '对应单据的编号'
        },
        system: {
            type: DataTypes.STRING(200),
            comment: '请求来源系统'
        },
        remark: {
            type: DataTypes.STRING(400),
            comment: '备注'
        },
        message: {
            type: DataTypes.STRING(1000),
            comment: '处理结果'
        },
        tradePrincipal: {
            type: DataTypes.STRING(100),
            comment: '交易主体'
        },
        payTime: {
            type: DataTypes.DATE(),
            comment: '付款时间'
        },
        validateStatus: {
            type: DataTypes.INTEGER,
            comment: '校验状态'
        },
        error: {
            type: DataTypes.STRING(100),
            comment: '错误信息'
        },
        validateTime: {
            type: DataTypes.DATE(),
            comment: '校验时间'
        }
    }, {
        freezeTableName: true,
        tableName: 'transfer_records',
        classMethods: {
            getStatus: function() {
                return _.clone(STATUS);
            }
        }
    });
    return TransferRecord;
};