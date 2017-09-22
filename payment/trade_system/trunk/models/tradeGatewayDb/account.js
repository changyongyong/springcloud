/**
 * Created by SEELE on 2017/7/4.
 */

const crypto = require('crypto');

//业务系统支付秘钥表
module.exports = function (sequelize, DataTypes) {
    return sequelize.define('Account', {
        //  自增Id
        id: {
            field: 'ta_id',
            type: DataTypes.INTEGER,
            comment: '自增Id',
            primaryKey: true
        },
        //  uuid给业务方的Id
        accountId: {
            field: 'ta_account_id',
            type: DataTypes.STRING,
            comment: '业务唯一标识符'
        },
        name: {
            field: 'ta_name',
            type: DataTypes.STRING,
            comment: '业务名称'
        },
        salt: {
            field: 'ta_salt',
            type: DataTypes.STRING,
            comment: '加密盐'
        },
        outId: {
            field: 'ta_out_id',
            type: DataTypes.STRING,
            comment: '业务系统的Id'
        },
        outType: {
            field: 'ta_out_type',
            type: DataTypes.STRING,
            comment: '业务类型'
        },
        outSystem: {
            field: 'ta_out_system',
            type: DataTypes.STRING,
            comment: '业务系统名称'
        },
        //  创建时间
        createdAt: {
            field: 'ta_created_at',
            type: DataTypes.DATE,
            comment: '创建时间'
        },
        //  修改时间
        updatedAt: {
            field: 'ta_updated_at',
            type: DataTypes.DATE,
            comment: '修改时间'
        }
    }, {
        freezeTableName: true,
        tableName: 'tg_account',
        hooks: {
            beforeCreate: (data)=> {
                let hash = crypto.createHash('RSA-SHA512');
                //根据账户编号，时间戳，随机数生成一个非对称的盐
                hash.update(`${data.accountId}${data.id}${Date.now()}${Math.random()}`, 'utf8');
                data.ta_salt = hash.digest('BASE64');
                // data.verifyCode = verifyCode(data);
                return;
            }
        }
    });
};