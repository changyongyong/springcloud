'use strict'

/**
 * @author WXP
 * @description 提现申请表
 */


module.exports = function (sequelize, DataTypes) {
    const FrozenRecord = sequelize.define('FrozenRecord', {
        id: {
            field: 'fr_id',
            type: DataTypes.INTEGER,
            comment: '自增Id',
            primaryKey: true,
            autoIncrement: true
        },
        frozenRecordNo: {
            type: DataTypes.STRING(100),
            comment: '冻结流水号',
            field: 'fr_no'
        },
        tradeAccountNo: {
            type: DataTypes.STRING(100),
            comment: '交易账户编号',
            field: 'fr_trade_account_no'
        },
        amount: {
            type: DataTypes.DECIMAL(15, 2),
            comment: '已使用冻结金额',
            field: 'fr_amount'
        },
        limitAmount: {
            type: DataTypes.DECIMAL(15, 2),
            comment: '冻结金额上限',
            field: 'fr_limit_amount'
        },
        status: {
            type: DataTypes.STRING(100),
            comment: '状态',
            field: 'fr_status'
        },
        tradeType: {
            type: DataTypes.STRING(100),
            comment: '冻结业务类型',
            field: 'fr_trade_type'
        },
        numberId: {
            type: DataTypes.STRING(100),
            comment: '业务单据号',
            field: 'fr_number_id'
        }
    }, {
        freezeTableName: true,
        tableName: 'dp_frozen_record',
        classMethods: {
            associate: function (model) {
                FrozenRecord.belongsTo(model.TradeAccount, {
                    foreignKey: {
                        name: 'TradeAccountId',
                        field: 'fr_dp_ta_id'
                    }
                });
                FrozenRecord.hasMany(model.FrozenRecordLog, {
                    foreignKey: {
                        name: 'FrozenRecordId',
                        field: 'wa_dp_fr_id'
                    }
                });
            }
        },
        createdAt: 'fr_created_at',
        updatedAt: 'fr_updated_at'
    });
    return FrozenRecord;
};