'use strict';

/**
 * 账户相关
 * @author 吴秀璞
 * @since 2017/1/16
 */

const {
    //主账户
    Account:AccountDb,
} = require('../models/ddPayDb');
const {Sequence} = require('../lib/rpc');
const ACCOUNT_SEQUENCE_NAME = 'ddPayAccountNo';
const ACCOUNT_STATUS = AccountDb.getStatus();

let Account = {};

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
Account.create = function (par, options) {
    let {
            phoneNum,
            identityCardNo,
            nickname,
            userName
        } = par,
        {
            transaction
        } = options;
        // 取号然后创建账户
    return Sequence.sequence.get({
        name: ACCOUNT_SEQUENCE_NAME
    })
        .then((data) => {
            let no = data.data.toString();
            while (no.length < 6) {
                no = '0' + no;
            }
            return AccountDb.create({
                accountNo: `ZH${no}`,
                phoneNum: phoneNum,
                identityCardNo: identityCardNo,
                nickname: nickname,
                userName: userName,
                status: ACCOUNT_STATUS.ACTIVE
            }, {
                transaction: transaction
            });
        })
};

/**
 * 查找或者创建用户
 * @param par
 * @param options
 * @returns {Promise|Promise.<TResult>|*|{value}}
 */
Account.findOrCreate = function (par, options) {
    let {phoneNum, identityCardNo} = par;
    return Account.find({
        where: {
            $and: [
                {
                    phoneNum: phoneNum
                },
                {
                    identityCardNo: identityCardNo
                }
            ],
            status: {
                $ne: ACCOUNT_STATUS.DELETED
            }
        }
    })
        .then((account) => {
            if (account) {
                return account;
            }
            return Account.create(par, options);
        })
};

/**
 * 查找用户
 * @returns {*}
 */
Account.find = function () {
    return AccountDb.find.apply(AccountDb, arguments);
};

module.exports = Account;