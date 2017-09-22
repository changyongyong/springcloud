/**
 * Created by wt on 2017/7/13.
 */
module.exports = function (sequelize, DataTypes) {
    var AliMerchantToken = sequelize.define('AliMerchantToken', {
        id: {
            field: 'amt_id',
            type: DataTypes.INTEGER,
            comment: '自增Id',
            primaryKey: true
        },
        merchantNo: {
            field: 'amt_merchant_no',
            type: DataTypes.STRING,
            comment: '商户号'
        },
        merchantAuthToken: {
            field: 'amt_merchant_auth_token',
            type: DataTypes.STRING,
            comment: '商户Token'
        },
        merchantSource: {
            field: 'amt_merchant_source',
            type: DataTypes.STRING,
            comment: '服务商source'
        },
        merchantAuthStartTime: {
            field: 'amt_merchant_auth_start_time',
            type: DataTypes.DATE,
            comment: '商户认证开始时间'
        },
        merchantAuthEndTime: {
            field: 'amt_merchant_auth_end_time',
            type: DataTypes.DATE,
            comment: '商户认证失效时间'
        }
    }, {
        freezeTableName: true,
        tableName: 'at_merchant_token',
        createdAt: 'amt_created_at',
        updatedAt: 'amt_updated_at',
    });
    return AliMerchantToken;
};