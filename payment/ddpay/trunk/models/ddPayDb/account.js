'use strict';

//TODO 此处将使用salt和PBKDF2对密码进行加密。目前先不做
const _ = require('lodash');
const STATUS = {
    ACTIVE: 99,
    PENDING: 0,
    DEACTIVATE: -1,
    DELETED: -99
}

module.exports = function (sequelize, DataTypes) {
    var Account = sequelize.define('Account', {
        //队列名
        status: {
            type: DataTypes.INTEGER,
            comment: '状态'
        },
        accountNo: {
            type: DataTypes.STRING(100),
            comment: '账户编号'
        },
        nickname: {
            type: DataTypes.STRING(100),
            comment: '昵称'
        },
        userName: {
            type: DataTypes.STRING(100),
            comment: '昵称'
        },
        phoneNum: {
            type: DataTypes.STRING(100),
            comment: '手机号'
        },
        identityCardNo: {
            type: DataTypes.CHAR(50),
            comment: '身份证号'
        },
        //密码，MD5+盐+对称加密
        pwd: {
            type: DataTypes.STRING(2000),
            comment: '昵称'
        },
        //校验码，用以校验防止数据错误，通过以上其它列计算而出
        verifyCode: {
            type: DataTypes.STRING(200),
            comment: '验证码'
        },
        salt: {
            type: DataTypes.STRING(100),
            comment: '辅助加密'
        },
        remark: {
            type: DataTypes.STRING,
            comment: '备注'
        }
    }, {
        freezeTableName: true,
        tableName: 'accounts',
        classMethods: {
            associate: function (model) {
                Account.hasMany(model.TradeAccount, {foreignKey: 'AccountId'});
            },
            getStatus: function () {
                return _.clone(STATUS);
            }
        }
    });
    return Account;
};