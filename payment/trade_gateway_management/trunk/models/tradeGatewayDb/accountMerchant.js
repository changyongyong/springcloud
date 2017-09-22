/**
 * Created by SEELE on 2017/7/4.
 */


//业务系统和商户关联表
module.exports = function (sequelize, DataTypes) {
    return sequelize.define('AccountMerchant', {
        //  自增Id
        id: {
            field: 'tam_id',
            type: DataTypes.INTEGER,
            comment: '自增Id',
            primaryKey: true
        },
        //  -1代表禁用， 1代表启用
        state: {
            field: 'tam_state',
            type: DataTypes.INTEGER,
            comment: '关系绑定状态'
        },
        //  0代表历史，1代表最新
        isNotHistory: {
            field: 'tam_is_not_history',
            type: DataTypes.INTEGER,
            comment: '关系绑定状态'
        },
        //  1代表自营，2代表商户
        type: {
            field: 'tam_type',
            type: DataTypes.INTEGER,
            comment: '类型'
        },
        tradeType: {
            field: 'tam_trade_type',
            type: DataTypes.STRING,
            comment: '支付方式'
        },
        //  ALI_PAY代表支付宝， WE_CHAT_PAY代表微信
        tradeChannel: {
            field: 'tam_trade_channel',
            type: DataTypes.STRING,
            comment: '支付渠道'
        },
        tradeMerchantNo: {
            field: 'tam_trade_merchant_no',
            type: DataTypes.STRING,
            comment: '商户号'
        },
        tradeMerchantName: {
            field: 'tam_trade_merchant_name',
            type: DataTypes.STRING,
            comment: '商户名称'
        },
        tradeMerchantAuthNo: {
            field: 'tam_trade_merchant_auth_no',
            type: DataTypes.STRING,
            comment: '商户授权号'
        },
        merchantConfigId: {
            field: 'tam_tm_id',
            type: DataTypes.INTEGER,
            comment: '支付渠道配置Id'
        },
        accountId: {
            field: 'tam_ta_id',
            type: DataTypes.INTEGER,
            comment: '账户的配置Id'
        }
        // //  创建时间
        // createdAt: {
        //     field: 'tam_created_at',
        //     type: DataTypes.DATE,
        //     comment: '创建时间'
        // },
        // //  修改时间
        // updatedAt: {
        //     field: 'tam_updated_at',
        //     type: DataTypes.DATE,
        //     comment: '修改时间'
        // }
    }, {
        freezeTableName: true,
        tableName: 'tg_account_merchant',
        createdAt: 'tam_created_at',
        updatedAt: 'tam_updated_at',
    });
};