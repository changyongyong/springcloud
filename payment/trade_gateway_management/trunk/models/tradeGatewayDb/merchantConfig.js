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
        //  1代表非服务商，2代表服务商
        type: {
            field: 'tc_type',
            type: DataTypes.INTEGER,
            comment: '类型'
        }
    }, {
        freezeTableName: true,
        tableName: 'tg_merchant_config',
        createdAt: 'tc_created_at',
        updatedAt: 'tc_updated_at',
    });
};