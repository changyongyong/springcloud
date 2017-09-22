'use strict'

/**
 * @author WXP
 * @description 提现申请表
 */


module.exports = function (sequelize, DataTypes) {
    const FrozenRecordLog = sequelize.define('FrozenRecordLog', {
        id: {
            field: 'frl_id',
            type: DataTypes.INTEGER,
            comment: '自增Id',
            primaryKey: true,
            autoIncrement: true
        },
        beforeStatus: {
            type: DataTypes.STRING(100),
            comment: '之前状态',
            field: 'frl_before_status'
        },
        afterStatus: {
            type: DataTypes.STRING(100),
            comment: '之后状态',
            field: 'frl_after_status'
        },
        amount: {
            type: DataTypes.DECIMAL(15, 2),
            comment: '可用金额的变动金额',
            field: 'frl_amount'
        },
        limitAmount: {
            type: DataTypes.DECIMAL(15, 2),
            comment: '限制金额',
            field: 'frl_amount'
        },
        beforeAmount: {
            type: DataTypes.DECIMAL(15, 2),
            comment: '变动前已使用金额',
            field: 'frl_before_amount'
        },
        afterAmount: {
            type: DataTypes.DECIMAL(15, 2),
            comment: '变动后已使用金额',
            field: 'frl_after_amount'
        },
        remark: {
            type: DataTypes.STRING(100),
            comment: '备注',
            field: 'frl_remark'
        },
        FrozenRecordId: {
            type: DataTypes.INTEGER,
            comment: 'FrozenRecordId',
            field: 'frl_dp_fr_id'
        }
    }, {
        freezeTableName: true,
        tableName: 'dp_frozen_record_log',
        classMethods: {
            // associate: function (model) {
            //     FrozenRecordLog.belongsTo(model.FrozenRecord, {
            //         foreignKey: {
            //             name: 'FrozenRecordId',
            //             field: 'frl_dp_fr_id'
            //         }
            //     });
            // }
        },
        createdAt: 'frl_created_at',
        updatedAt: 'frl_updated_at'
    });
    return FrozenRecordLog;
};