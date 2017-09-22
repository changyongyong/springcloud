'use strict';

/**
 * 账户相关
 * @author 吴秀璞
 * @since 2017/1/16
 */
const _ = require('lodash');
const {
    //主账户
    ThirdPartAccount: ThirdPartAccountDb,
} = require('../models/ddPayDb');
const THIRD_PART_ACCOUNT_TYPES = ThirdPartAccountDb.getAccountTypes();
const THIRD_PART_ACCOUNT_TYPES_INVERT = _.invert(THIRD_PART_ACCOUNT_TYPES);

// 格式化第三方账户返回结果
const format = function (data) {
    return data && {
        id: data.id,
        userName: data.userName,
        accountNo: data.accountNo,
        accountType: THIRD_PART_ACCOUNT_TYPES_INVERT[data.accountType],
        // 出于安全不再返回Account，而且这个也没有什么用
        // accountId: data.AccountId
    } || null;
}

let ThirdPartAccount = {};

ThirdPartAccount.THIRD_PART_ACCOUNT_TYPES = THIRD_PART_ACCOUNT_TYPES;

/**
 * 创建用户
 * @param par
 * {
 *      phoneNum,
 *      identityCardNo,
 *      nickname,
 *      userName
 * }
 * @param options
 */
ThirdPartAccount.create = function (par, options) {
    let {
        accountNo,
        userName,
        accountType,
        accountId
    } = par, {
        transaction
    } = options;
    accountType = THIRD_PART_ACCOUNT_TYPES[accountType];
    // 防重
    return ThirdPartAccountDb.count({
            where: {
                accountNo: accountNo,
                accountType: accountType,
                AccountId: accountId
            }
        })
        .then((data) => {
            if (data !== 0) {
                throw ('此账户已存在，不能重复创建！');
            }
            // 创建第三方账户
            return ThirdPartAccountDb.create({
                    userName: userName,
                    accountNo: accountNo,
                    accountType: accountType,
                    AccountId: accountId
                }, {
                    transaction: transaction
                })
                .then((data) => {
                    return format(data);
                })
        })

};

/**
 * 查找第三方账户
 * @returns {*}
 */
ThirdPartAccount.find = function ({ accountId, accountType }) {
    let where = {
        AccountId: accountId
    };
    if (accountType) {
        where.accountType = THIRD_PART_ACCOUNT_TYPES[accountType];
    }
    return ThirdPartAccountDb.find({
            where: where,
            attributes: ['userName', 'accountType', 'accountNo', 'AccountId']
        })
        .then((data) => {
            return format(data);
        });
};

/**
 * 查找第三方账户
 * @returns {*}
 */
ThirdPartAccount.findAll = function ({ accountId, accountType }) {
    let where = {
        AccountId: accountId
    };
    if (accountType) {
        where.accountType = THIRD_PART_ACCOUNT_TYPES[accountType];
    }
    return ThirdPartAccountDb.findAll({
            where: where,
            attributes: ['id', 'userName', 'accountType', 'accountNo', 'AccountId']
        })
        .then(dataArr => {
            let results = [];
            for (let data of dataArr) {
                results.push(format(data));
            }
            return results;
        })
};

/**
 * 更新第三方账户
 */
ThirdPartAccount.update = function ({
    accountId,
    thirdPartAccountId,
    accountType,
    accountNo,
    userName
}, options) {
    let account;
    return ThirdPartAccountDb.find({
            where: {
                id: thirdPartAccountId,
                AccountId: accountId
            }
        })
        .then((data) => {
            let where = {}
            account = data;
            if (!account) {
                throw ('没有此账户信息！');
            }
            if (account.accountNo != accountNo) {
                where.accountNo = accountNo;
                account.accountNo = accountNo;
            }
            if (account.accountType != accountType) {
                where.accountType = accountType;
                account.accountType = accountType;
            }
            if (Object.keys(where).length != 0) {
                where.id = {
                    $ne: thirdPartAccountId
                };
                where.AccountId = accountId;
            } else {
                return ;
            }
            // 防重
            return ThirdPartAccountDb.count({
                    where: where
                })
                .then((data) => {
                    if (data) {
                        throw ('此账户已存在，不能进行修改！');
                    }
                    return;
                })
        })
        .then(() => {
            if (account.userName != userName) {
                account.userName = userName;
            }
            if (!account.changed()) {
                return;
            }
            return account.save(options);
        })
        .then(() => {
            return format(account);
        })
};


/**
 * 创建用户
 * @param par
 * {
 *      phoneNum,
 *      identityCardNo,
 *      nickname,
 *      userName
 * }
 * @param options
 */
ThirdPartAccount.delete = function ({
    accountId,
    thirdPartAccountId
}, options) {
    return ThirdPartAccountDb.find({
            where: {
                id: thirdPartAccountId,
                AccountId: accountId
            }
        })
        .then((account) => {
            if (!account) {
                throw ('没有此账户信息！');
            }
            return account.destroy(options);
        })
        .then(() => {
            return '';
        })
};

module.exports = ThirdPartAccount;