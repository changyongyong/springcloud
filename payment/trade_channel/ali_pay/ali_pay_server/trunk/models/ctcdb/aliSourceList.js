/**
 * Created by wt on 2017/7/13.
 */
module.exports = function (sequelize, DataTypes) {
    var AliSourceList = sequelize.define('AliSourceList', {
        id: {
            field: 'asl_id',
            type: DataTypes.INTEGER,
            comment: '自增Id',
            primaryKey: true
        },
        source: {
            field: 'asl_source',
            type: DataTypes.STRING,
            comment: '服务商source'
        },
        secretKey: {
            field: 'asl_secret_key',
            type: DataTypes.STRING,
            comment: '秘钥'
        },
        name: {
            field: 'asl_name',
            type: DataTypes.STRING,
            comment: '服务商名称'
        },
        appId: {
            field: 'asl_app_id',
            type: DataTypes.STRING,
            comment: 'appId'
        },
        inputCharset: {
            field: 'asl_input_charset',
            type: DataTypes.STRING,
            comment: '字符编码'
        },
        sellerEmail: {
            field: 'asl_seller_email',
            type: DataTypes.STRING,
            comment: '邮箱'
        },
        signType: {
            field: 'asl_sign_type',
            type: DataTypes.STRING,
            comment: '加密方式'
        },
        //  1代表对账，0或者null 代表不对
        isBill: {
            field: 'asl_is_bill',
            type: DataTypes.INTEGER,
            comment: '是否对账'
        }
    }, {
        freezeTableName: true,
        tableName: 'ali_source_list',
        createdAt: 'asl_created_at',
        updatedAt: 'asl_updated_at',
    });
    return AliSourceList;
};