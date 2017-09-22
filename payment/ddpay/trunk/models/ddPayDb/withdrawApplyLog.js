'use strict'

/**
 * @author WXP
 * @description 提现申请表
 */


module.exports = function (sequelize, DataTypes) {
    const WithdrawApplyLog = sequelize.define('WithdrawApplyLog', {
        id: {
            field: 'wal_id',
            type: DataTypes.INTEGER,
            comment: '自增Id',
            primaryKey: true,
            autoIncrement: true
        },
        beforeStatus: {
            type: DataTypes.STRING(100),
            comment: '之前状态',
            field: 'wal_before_status'
        },
        afterStatus: {
            type: DataTypes.STRING(100),
            comment: '之后状态',
            field: 'wal_after_status'
        },
        message: {
            type: DataTypes.STRING(100),
            comment: '说明',
            field: 'wal_message'
        },
        WithdrawApplyId: {
            type: DataTypes.INTEGER,
            comment: 'WithdrawApplyId',
            field: 'wal_dp_wa_id'
        }
    }, {
        freezeTableName: true,
        tableName: 'dp_withdraw_apply_log',
        classMethods: {

        },
        createdAt: 'wal_created_at',
        updatedAt: 'wal_updated_at'
    });
    return WithdrawApplyLog;
};

