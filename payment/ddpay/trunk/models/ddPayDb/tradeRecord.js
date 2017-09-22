'use strict';

const _ = require('lodash');

const TYPES = {
    TRANSFER_IN: 1,
    TRANSFER_OUT: -1
};


module.exports = function (sequelize, DataTypes) {
    var TradeRecord = sequelize.define('TradeRecord', {
        tradeRecordNo: {
            type: DataTypes.BIGINT(20),
            comment: '交易流水号'
        },
        type: {
            type: DataTypes.INTEGER,
            comment: '类型'
        },
        tradeType: {
            type: DataTypes.STRING(100),
            comment: '交易类型'
        },
        totalAmount: {
            type: DataTypes.DECIMAL(15, 5),
            comment: '总计金额'
        },
        receiptAmount: {
            type: DataTypes.DECIMAL(15, 5),
            comment: '实际金额'
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
        counterpartyNo: {
            type: DataTypes.STRING(100),
            comment: '交易对方支付账户编号'
        },
        orderType: {
            type: DataTypes.STRING(400),
            comment: '对应单据类型'
        },
        orderId: {
            type: DataTypes.STRING(200),
            comment: '对应单据的编号'
        },
        remark: {
            type: DataTypes.STRING(400),
            comment: '备注'
        },
        outTradeRecordNo: {
            type: DataTypes.STRING(200),
            comment: '交易网关支付号'
        },
        system: {
            type: DataTypes.STRING(128),
            comment: '发起系统'
        },
        tradePrincipal: {
            type: DataTypes.STRING(128),
            comment: '交易主体'
        }
    }, {
        freezeTableName: true,
        tableName: 'trade_records',
        classMethods: {
            associate: function (model) {
                TradeRecord.belongsTo(model.TradeAccount, { foreignKey: 'TradeAccountId' });
            },
            getTypes: function () {
                return _.clone(TYPES);
            }
        }
    });
    return TradeRecord;
};