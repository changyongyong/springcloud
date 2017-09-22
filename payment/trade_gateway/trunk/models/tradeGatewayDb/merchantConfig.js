/**
 * Created by SEELE on 2017/7/4.
 */

//主商户配置表
module.exports = function (sequelize, DataTypes) {
    return sequelize.define('MerchantConfig', {
        //  自增Id
        id: {
            field: 'tc_id',
            type: DataTypes.INTEGER,
            comment: '自增Id',
            primaryKey: true
        },
        source: {
            field: 'tc_source',
            type: DataTypes.STRING,
            comment: 'source类型'
        },
        name: {
            field: 'tc_name',
            type: DataTypes.STRING,
            comment: '服务商名称'
        },
        //  1代表支付宝， 2代表微信
        tradeChannel: {
            field: 'tc_trade_channel',
            type: DataTypes.INTEGER,
            comment: '支付渠道'
        },
        //  1代表自营，2代表商户
        type: {
            field: 'tc_type',
            type: DataTypes.INTEGER,
            comment: '类型'
        },
        //  创建时间
        createdAt: {
            field: 'tc_created_at',
            type: DataTypes.DATE,
            comment: '创建时间'
        },
        //  修改时间
        updatedAt: {
            field: 'tc_updated_at',
            type: DataTypes.DATE,
            comment: '修改时间'
        }
    }, {
        freezeTableName: true,
        tableName: 'tg_merchant_config'
    });
};