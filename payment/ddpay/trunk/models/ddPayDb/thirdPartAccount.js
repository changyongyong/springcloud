'use strict';

/**
 *  第三方账户
 */

const _ = require('lodash');

const THIRD_PART_ACCOUNT_TYPES = {
    WE_CHAT_PAY: 'WE_CHAT_PAY',
    ALI_PAY: 'ALI_PAY'
}

module.exports = function (sequelize, DataTypes) {
    var ThirdPartAccount = sequelize.define('ThirdPartAccount', {
        userName: {
            type: DataTypes.STRING(200),
            comment: '第三方账户用户名'
        },
        accountType: {
            type: DataTypes.STRING(200),
            comment: '第三方账户类型'
        },
        accountNo: {
            type: DataTypes.STRING(200),
            comment: '第三方账户类型账号'
        },
        verifyCode: {
            type: DataTypes.STRING(200),
            comment: '校验码'
        }
    }, {
        freezeTableName: true,
        tableName: 'third_part_accounts',
        classMethods: {
            associate: function (model) {
                ThirdPartAccount.belongsTo(model.Account, {
                    foreignKey: 'AccountId'
                });
            },
            getAccountTypes: function () {
                return _.clone(THIRD_PART_ACCOUNT_TYPES);
            } 
        }
    });
    return ThirdPartAccount;
};