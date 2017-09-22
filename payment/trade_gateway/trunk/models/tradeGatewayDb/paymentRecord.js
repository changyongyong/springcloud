'use strict';

/**
 * 付款记录
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
    var PaymentRecord = sequelize.define('PaymentRecord', {
        tradeRecordNo: {
            type: DataTypes.STRING(200),
            comment: '交易流水号'
        },
        status: {
            type: DataTypes.STRING(200),
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
        thirdPartName: {
            type: DataTypes.STRING,
            comment: '店达第三方账户'
        },
        counterpartyThirdPartName: {
            type: DataTypes.STRING,
            comment: '交易对方第三方账户'
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
        refundTimes: {
            type: DataTypes.INTEGER,
            comment: '退款成功次数'
        },
        refundableFee: {
            type: DataTypes.DECIMAL(15, 2),
            comment: '可退款金额'
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
        },
        validateBalance: {
            type: DataTypes.DECIMAL(15, 2),
            comment: '对账差额（网关的金额 - 渠道的金额）'
        },
        accountMerchantId: {
            type: DataTypes.INTEGER,
            comment: '对应AccountMerchant的Id',
            field: 'tpr_ta_id'
        },
        merchantConfigId: {
            type: DataTypes.INTEGER,
            comment: '对应merchantConfig的Id',
            field: 'tpr_tm_id'
        },
        tradeMerchantNo: {
            type: DataTypes.STRING,
            comment: '对应子商户商户号',
            field: 'tpr_trade_merchant_no'
        }
    }, {
        freezeTableName: true,
        tableName: 'payment_records',
        classMethods: {
            getStatus: function () {
                return _.clone(STATUS);
            }
        }
    });
    return PaymentRecord;
};