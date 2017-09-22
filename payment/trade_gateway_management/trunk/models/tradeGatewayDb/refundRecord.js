'use strict';

/**
 * 退款记录
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
    FAIL: 'FAIL'
};

module.exports = function (sequelize, DataTypes) {
    var RefundRecord = sequelize.define('RefundRecord', {
        status: {
            type: DataTypes.STRING(200),
            comment: '交易状态'
        },
        tradeRecordNo: {
            type: DataTypes.STRING(200),
            comment: '交易流水号'
        },
        tradeChannel: {
            type: DataTypes.STRING(100),
            comment: '交易渠道'
        },
        totalFee: {
            type: DataTypes.DECIMAL(15, 2),
            comment: '总计金额'
        },
        thirdPartName: {
            type: DataTypes.STRING,
            comment: '店达第三方账户'
        },
        counterpartyThirdPartName: {
            type: DataTypes.STRING,
            comment: '交易对方第三方账户'
        },
        operateLogNo: {
            type: DataTypes.STRING(100),
            comment: '操作流水号'
        },
        source: {
            type: DataTypes.STRING(100),
            comment: 'APP源'
        },
        orderType: {
            type: DataTypes.STRING(400),
            comment: '对应单据的类型'
        },
        orderId: {
            type: DataTypes.STRING(200),
            comment: '对应单据的编号'
        },
        paymentRecordNo: {
            type: DataTypes.STRING(200),
            comment: '支付交易流水号'
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
        tableName: 'refund_records',
        classMethods: {
            getStatus: function () {
                return _.clone(STATUS);
            }
        }
    });
    return RefundRecord;
};