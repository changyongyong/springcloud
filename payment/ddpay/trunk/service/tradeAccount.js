'use strict';

/**
 * 账户相关
 * @author 吴秀璞
 * @since 2017/1/16
 */
const _ = require('lodash');
const Account = require('./account');
const ThirdPartAccount = require('./thirdPartAccount');
const TradeRecord = require('./tradeRecord');
const {
    //支付账户db
    TradeAccount: TradeAccountDb,
} = require('../models/ddPayDb');
const {
    Sequence
} = require('../lib/rpc');
const TRADE_ACCOUNT_SEQUENCE_NAME = 'ddPayTradeAccountNo';
const TRADE_ACCOUNT_TYPES = TradeAccountDb.getTypes();
const TRADE_ACCOUNT_STATUS = TradeAccountDb.getStatus();
const THIRD_PART_ACCOUNT_TYPES = ThirdPartAccount.THIRD_PART_ACCOUNT_TYPES;
const THIRD_PART_ACCOUNT_TYPES_ARR = Object.keys(THIRD_PART_ACCOUNT_TYPES);
let TradeAccount = {};

TradeAccount.TRADE_ACCOUNT_TYPES = TRADE_ACCOUNT_TYPES;
/**
 * 创建支付账户，并关联到对应的账户
 * @param par
 * @param options
 * @returns {Promise.<TResult>}
 */
TradeAccount.create = function (par, options) {
    let {
        userName,
        identityCardNo,
        phoneNum,
        tradePwd,
        type = TRADE_ACCOUNT_TYPES.COURIER
    } = par, {
        account
    } = options,
    transaction = options.transaction;
    return Promise.resolve()
        .then(() => {
            // 当存在account时是绑定到此account
            if (account) {
                return account;
            }
            return Account.findOrCreate({
                userName: userName,
                nickname: userName,
                identityCardNo: identityCardNo,
                phoneNum: phoneNum,
            }, options)
        })
        .then(data => {
            account = data;
            return TradeAccountDb.count({
                    where: {
                        AccountId: account.id,
                        status: TRADE_ACCOUNT_STATUS.ACTIVE,
                        type: type
                    }
                })
                .then(data => {
                    if (data >= 1) {
                        return Promise.reject('账户已存在，不允许重复开户');
                    }
                })
        })
        .then(() => {
            let {
                id: accountId,
                accountNo: accountNo
            } = account;
            return Sequence.sequence.get({
                    name: TRADE_ACCOUNT_SEQUENCE_NAME
                })
                .then((data) => {
                    let no = data.data;
                    while (no.length < 6) {
                        no = '0' + no;
                    }
                    return TradeAccountDb.create({
                        tradeAccountNo: `TZH${no}`,
                        AccountId: accountId,
                        accountNo: accountNo,
                        status: TRADE_ACCOUNT_STATUS.ACTIVE,
                        type: type
                    }, {
                        transaction: transaction
                    });
                })
        })
        // 如果有交易密码则计算加密密码
        .then(data => {
            if (!tradePwd) {
                return data;
            }
            return TradeAccountDb.tradePwdCalc(data, tradePwd)
                .then(pwd => {
                    data.tradePwd = pwd;
                    return data.save();
                })
        })
        .then((data) => {
            return format(data);
        });
};

TradeAccount.add = function (par, options) {
    let { accountNo, type, tradePwd } = par;
    return TradeAccountDb.find({
            where: {
                tradeAccountNo: accountNo
            }
        })
        .then((data) => {
            if (!data) {
                return Promise.reject('没有对应的账户！');
            }
            return Account.find({
                where: {
                    id: data.AccountId
                }
            })
        })
        .then((data) => {
            if (!data) {
                return Promise.reject('没有对应的主账户！');
            }
            options.account = data;
            return TradeAccount.create({
                type: type,
                tradePwd: tradePwd
            }, options)
        })
}

const format = function (data) {
    if (!data) {
        return {};
    }
    return {
        tradeAccountNo: data.tradeAccountNo,
        status: data.status,
        type: data.type,
        balance: data.balance,
        amountFrozen: data.amountFrozen,
        deposit: data.deposit,
        creditLimit: data.creditLimit,
        accountNo: data.accountNo
    }
};

/**
 * 查询交易账户信息
 */
TradeAccount.find = function (par) {
    return TradeAccountDb.find({
            where: {
                tradeAccountNo: par.tradeAccountNo
            }
        })
        .then(data => {
            return format(data);
        })
}

/**
 *  修复数据
 *  FIXME 生产不能使用
 */
TradeAccount.fix = function (par) {
    return TradeAccountDb.find({
            where: {
                tradeAccountNo: par.tradeAccountNo
            },
            isNotVerify: true
        })
        .then((data) => {
            data.verifyCode = TradeAccountDb.calcVerifyCode(data);
            return data.save();
        })
        .then(data => {
            return format(data);
        })
}

/**
 * 设置交易密码，当没有交易密码时新增，有交易密码时需校验
 */
TradeAccount.setTradePwd = function (par) {
    let {
        tradePwd,
        newTradePwd,
        tradeAccountNo
    } = par;
    let tradeAccount;
    return TradeAccountDb.find({
            where: {
                tradeAccountNo: tradeAccountNo
            }
        })
        .then(data => {
            tradeAccount = data;
            if (tradeAccount.tradePwd) {
                return TradeAccountDb.tradePwdVerify(tradeAccount, tradePwd)
                    .then((isCorrect) => {
                        if (!isCorrect) {
                            return Promise.reject('交易密码错误！');
                        }
                    });
            }
        })
        .then(() => {
            return TradeAccountDb.tradePwdCalc(tradeAccount, newTradePwd);
        })
        .then(data => {
            tradeAccount.tradePwd = data;
            return tradeAccount.save();
        })
        .then(data => {
            return format(data);
        })
};

/**
 * 绑定第三方账户
 */
TradeAccount.bindThirdPartAccount = function (par, options) {
    let {
        accountNo,
        userName,
        accountType,
        tradeAccountNo
    } = par;
    if (!_.includes(THIRD_PART_ACCOUNT_TYPES_ARR, accountType)) {
        throw (Error('账户类型不被支持！'));
    }
    return TradeAccountDb.find({
            where: {
                tradeAccountNo: tradeAccountNo
            }
        })
        .then((tradeAccount) => {
            if (!tradeAccount) {
                throw (Error('没有此账户！'));
            }
            return ThirdPartAccount.create({
                accountNo: accountNo,
                userName: userName,
                accountType: THIRD_PART_ACCOUNT_TYPES[accountType],
                accountId: tradeAccount.AccountId
            }, options)
        })
};

/**
 * 查找已绑定的第三方账户
 */
TradeAccount.getThirdPartAccounts = function (par) {
    let {
        accountType,
        tradeAccountNo
    } = par;
    if (accountType && !_.includes(THIRD_PART_ACCOUNT_TYPES_ARR, accountType)) {
        throw (Error('账户类型不被支持！'));
    }
    if (!tradeAccountNo) {
        throw (Error('缺少账户编号！'));
    }
    return TradeAccountDb.find({
            where: {
                tradeAccountNo: tradeAccountNo
            }
        })
        .then((tradeAccount) => {
            if (!tradeAccount) {
                throw (Error('没有此账户！'));
            }
            return ThirdPartAccount.findAll({
                accountId: tradeAccount.AccountId
            })
        })
}

/**
 * 查找已绑定的第三方账户
 */
TradeAccount.updateThirdPartAccount = function (par, options) {
    let {
        tradeAccountNo,
        thirdPartAccountId,
        accountType,
        accountNo,
        userName
    } = par;
    if (accountType && !_.includes(THIRD_PART_ACCOUNT_TYPES_ARR, accountType)) {
        throw (Error('账户类型不被支持！'));
    }
    return TradeAccountDb.find({
            where: {
                tradeAccountNo: tradeAccountNo
            }
        })
        .then((tradeAccount) => {
            if (!tradeAccount) {
                throw (Error('没有此账户！'));
            }
            return ThirdPartAccount.update({
                accountId: tradeAccount.AccountId,
                thirdPartAccountId: thirdPartAccountId,
                accountType: accountType,
                accountNo: accountNo,
                userName: userName
            }, options)
        })
}

/**
 * 解绑第三方账户
 */
TradeAccount.unbindThirdPartAccount = function (par, options) {
    let {
        tradeAccountNo,
        thirdPartAccountId
    } = par;
    return TradeAccountDb.find({
            where: {
                tradeAccountNo: tradeAccountNo
            }
        })
        .then((tradeAccount) => {
            if (!tradeAccount) {
                throw (Error('没有此账户！'));
            }
            return ThirdPartAccount.delete({
                accountId: tradeAccount.AccountId,
                thirdPartAccountId: thirdPartAccountId
            }, options)
        })
}

/**
 * 查询交易记录
 */
TradeAccount.tradeRecord = function (par, options) {
    let {
        tradeAccountNo,
    } = par;
    return TradeAccountDb.find({
            where: {
                tradeAccountNo: tradeAccountNo
            }
        })
        .then((tradeAccount) => {
            if (!tradeAccount) {
                throw (Error('没有此账户！'));
            }
            par.tradeAccountId = tradeAccount.id;
            return TradeRecord.findAll(par, options);
        })
};

module.exports = TradeAccount;