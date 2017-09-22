'use strict';

/**
 * 临时使用，用以等待支付完成后进行后续操作的临时表
 */
const _ = require('lodash');

const STATUS = {
    UNSEND: 'UNSEND',
    PENDDING: 'PENDDING',
    SUCCESS: 'SUCCESS',
    FAIL: 'FAIL'
};

module.exports = function (sequelize, DataTypes) {
    var PaymentRecord = sequelize.define('PaymentRecord', {
        type: {
            type: DataTypes.STRING(100),
            comment: '类型'
        },
        status: {
            type: DataTypes.STRING(100),
            comment: '状态'
        },
        tradeType: {
            type: DataTypes.STRING(100),
            comment: '交易类型'
        },
        amount: {
            type: DataTypes.DECIMAL(15, 5),
            comment: '金额'
        },
        field: {
            type: DataTypes.STRING(100),
            comment: '金额区域'
        },
        operateLogNo: {
            type: DataTypes.STRING(100),
            comment: '操作流水号'
        },
        tradeAccountNo: {
            type: DataTypes.STRING(100),
            comment: '支付账户编号'
        },
        orderType: {
            type: DataTypes.STRING(400),
            comment: '对应单据的编号'
        },
        orderId: {
            type: DataTypes.STRING(200),
            comment: '对应单据的编号'
        },
        remark: {
            type: DataTypes.STRING(400),
            comment: '备注'
        },
        // 交易网关支付号
        outTradeRecordNo: {
            type: DataTypes.STRING(200),
            comment: '交易网关支付号'
        },
        system: {
            type: DataTypes.STRING(50),
            comment: '发起系统'
        },
        tradePrincipal: {
            type: DataTypes.STRING(128),
            comment: '交易主体'
        }
    }, {
        freezeTableName: true,
        tableName: 'payment_records',
        classMethods: {
            associate: function (model) {
                PaymentRecord.belongsTo(model.TradeAccount, { foreignKey: 'TradeAccountId' });
            },
            getStatus: function () {
                return _.clone(STATUS);
            }
        }
    });
    return PaymentRecord;
};