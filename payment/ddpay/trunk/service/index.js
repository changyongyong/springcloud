'use strict';

/**
 * 对外暴露方法，提供简单的基座功能
 * @author 吴秀璞
 * @since 2017/1/16
 */

/* eslint-disable global-require */
const Joi = require('joi');
const OperateLog = require('./operateLog');
const { Db } = require('../models/ddPayDb');
const Trade = require('./trade');
const TradeAccount = require('./tradeAccount');
const Statistics = require('./statistics');
const Bill = require('./bill');
const { noRepeat } = require('../utils/utils');
const TRADE_ACCOUNT_TYPE_ARR = Object.keys(TradeAccount.TRADE_ACCOUNT_TYPES);
const TRADE_TYPES = [
    'WE_CHAT_PAY_JSAPI',
    'WE_CHAT_PAY_APP',
    'WE_CHAT_PAY_NATIVE',
    'ALI_PAY_APP',
    'ALI_PAY_UNION',
];

const joiValidator = (schema, options) => {
    options = options || {};
    //生成校验中间件
    return (par, options2, next) => {
        if (!schema) {
            return next();
        }
        return Joi.validate(par, schema, options, (err) => {
            if (err) {
                let details = err && err.details || [];
                let failures = [];
                for (let detail of details) {
                    failures.push(detail.message);
                }
                throw (JSON.stringify(failures));
            }
            return next(par, options2);
        });
    }
};

/**
 * 把方法用transaction包裹起来，从而简化代码
 * @param handler
 * @returns {Function}
 */
const surroundByTransaction = function (par, options, next) {
    let transaction;
    return Db.transaction()
        .then((t) => {
            transaction = t;
            options.transaction = t;
        })
        .then(() => {
            return next(par, options);
        })
        .then((result) => {
            return transaction.commit()
                .then(() => {
                    return result;
                });
        })
        .catch((error) => {
            //当错误为允许提交的错误时提交
            if (error && error.isCommit) {
                if (transaction) {
                    return transaction.commit()
                        .then(() => {
                            throw (error);
                        })
                }
                //  否则提交事务
            } else {
                if (transaction) {
                    return transaction.rollback()
                        .then(() => {
                            throw (error);
                        })
                }
            }
            throw (error);
        })
};

/**
 * 处理业务前记录操作日志
 * @param {string} funcName 用以区分方法
 * @param {function} handler 实际记录日志后回调方法
 */
const logOperateLog = function (funcName) {
    return function (par, options, next) {
        let log;
        return OperateLog.create({
                operate: funcName,
                params: JSON.stringify(par),
                orderType: par.orderType,
                orderId: par.orderId,
                sysytem: par.system,
                operator: par.operator,
                messageId: par.messageId,
                system: par.system,
                tradeAccountNo: par.tradeAccountNo
            })
            .then(function (data) {
                log = data;
                par.operateLogNo = log.operateLogNo;
                return next(par, options);
            })
            .then(function (result) {
                return OperateLog.success(log)
                    .then(() => {
                        return result;
                    })
            })
            .catch(function (error) {
                //记录错误
                return OperateLog.fail(log, error)
                    .then(() => {
                        throw (error);
                    })
            })
    }
}

/**
 * 注册，将方法弄成waterfall方式，目前不完善
 */
function regist() {
    let funcs = Array.from(arguments);
    if (funcs.length == 1) {
        return function (par, options) {
            options = options || {};
            return funcs[0](par, options, Promise.resolve)
        }
    } else {
        return function (par, options) {
            options = options || {};
            return funcs[0](par, options, regist.apply(this, funcs.slice(1)))
        }
    }
}

//防重尚未处理
const repeatCheck = function ({
    errorMessage,
    operate,
    ttl = 3
}) {
    return function (par, options, next) {
        let {
            orderId,
            orderType,
            system
        } = par;
        if (system && orderType && orderId) {
            return new Promise(function (resolve, reject) {
                noRepeat.isRepeat({
                    name: `ddpay.${operate}.${system}.${orderType}.${orderId}`,
                    ttl: ttl
                }, (error, ok) => {
                    if (ok) {
                        return next(par, options)
                            .then((data) => {
                                return resolve(data);
                            })
                            .catch((error) => {
                                return reject(error);
                            })
                    }
                    return reject(error || errorMessage || '请求过于频繁，请稍后重试！');
                })
            })
        } else {
            return next(par, options);
        }
    }
};

module.exports = {
    TradeAccount: {
        //创建账户
        create: regist(
            joiValidator({
                system: Joi.string(),
                userName: Joi.string().required(),
                orderId: Joi.any().required(),
                orderType: Joi.any().required(),
                phoneNum: Joi.string().required(),
                type: Joi.string().valid(TRADE_ACCOUNT_TYPE_ARR),
                identityCardNo: Joi.string(),
                tradePwd: Joi.string().min(6),
                accountId: Joi.string()
            }),
            repeatCheck({ operate: 'TradeAccount.create', ttl: 10 }),
            logOperateLog('TradeAccount.create'),
            surroundByTransaction,
            TradeAccount.create),
        //在当前支付账户的主账户下新增账户
        add: regist(
            joiValidator({
                system: Joi.string(),
                accountNo: Joi.string().required(),
                orderId: Joi.any(),
                orderType: Joi.any(),
                type: Joi.string().valid(TRADE_ACCOUNT_TYPE_ARR),
                tradePwd: Joi.string().min(6),
                accountId: Joi.string()
            }),
            repeatCheck({ operate: 'TradeAccount.add', ttl: 10 }),
            logOperateLog('TradeAccount.add'),
            surroundByTransaction,
            TradeAccount.add),
        //绑定第三方账户
        bindThirdPartAccount: regist(
            joiValidator({
                system: Joi.string(),
                accountNo: Joi.string().required(),
                userName: Joi.string().required(),
                tradeAccountNo: Joi.string().required(),
                accountType: Joi.string().valid('ALI_PAY', 'WE_CHAT_PAY').required(),
                accountId: Joi.string()
            }),
            repeatCheck({ operate: 'TradeAccount.bindThirdPartAccount', ttl: 10 }),
            logOperateLog('TradeAccount.bindThirdPartAccount'),
            surroundByTransaction,
            TradeAccount.bindThirdPartAccount
        ),
        //更新绑定的第三方账户
        updateThirdPartAccount: regist(
            joiValidator({
                system: Joi.string(),
                accountNo: Joi.string().required(),
                userName: Joi.string().required(),
                tradeAccountNo: Joi.string().required(),
                accountType: Joi.string().valid('ALI_PAY', 'WE_CHAT_PAY').required(),
                thirdPartAccountId: Joi.number().min(1).required(),
                accountId: Joi.string()
            }),
            repeatCheck({ operate: 'TradeAccount.updateThirdPartAccount', ttl: 10 }),
            logOperateLog('TradeAccount.updateThirdPartAccount'),
            surroundByTransaction,
            TradeAccount.updateThirdPartAccount),
        // 解绑第三方账户
        unbindThirdPartAccount: regist(
            joiValidator({
                system: Joi.string(),
                tradeAccountNo: Joi.string().required(),
                thirdPartAccountId: Joi.number().min(1).required(),
                accountId: Joi.string()
            }),
            repeatCheck({ operate: 'TradeAccount.unbindThirdPartAccount', ttl: 10 }),
            logOperateLog('TradeAccount.unbindThirdPartAccount'),
            surroundByTransaction,
            TradeAccount.unbindThirdPartAccount),
        // 查询已绑定的第三方账户 
        getThirdPartAccounts: regist(
            joiValidator({
                tradeAccountNo: Joi.string().required(),
                accountType: Joi.string().valid('ALI_PAY', 'WE_CHAT_PAY'),
                accountId: Joi.string()
            }),
            TradeAccount.getThirdPartAccounts
        ),
        setTradePwd: regist(
            joiValidator({
                tradeAccountNo: Joi.string().required(),
                tradePwd: Joi.string().min(6),
                newTradePwd: Joi.string().min(6).required(),
                accountId: Joi.string()
            }),
            repeatCheck({ operate: 'TradeAccount.setTradePwd', ttl: 10 }),
            logOperateLog('TradeAccount.setTradePwd'),
            TradeAccount.setTradePwd
        ),
        // 查询账户信息
        find: regist(
            joiValidator({
                tradeAccountNo: Joi.string().required(),
                accountId: Joi.string()
            }),
            TradeAccount.find),
        fix: regist(
            joiValidator({
                tradeAccountNo: Joi.string().required(),
                accountId: Joi.string()
            }),
            TradeAccount.fix),
        tradeRecord: regist(
            joiValidator({
                tradeAccountNo: Joi.string().required(),
                type: Joi.string(),
                order: Joi.array(),
                orderType: Joi.string(),
                limit: Joi.number().positive().max(20000).required(),
                offset: Joi.number().min(0),
                startTime: Joi.date(),
                endTime: Joi.date(),
                accountId: Joi.string()
            }),
            TradeAccount.tradeRecord),
    },
    Trade: {
        //增加余额
        chargeBalance: regist(
            joiValidator({
                system: Joi.string().required(),
                tradeAccountNo: Joi.string().required(),
                amount: Joi.number().positive().greater(0).less(1000000).required(),
                orderType: Joi.any().required(),
                orderId: Joi.any().required(),
                remark: Joi.string(),
                tradePrincipal: Joi.string().max(32).empty('').required(),
                accountId: Joi.string()
            }),
            repeatCheck({ operate: 'Trade.chargeBalance', ttl: 10 }),
            logOperateLog('Trade.chargeBalance'),
            surroundByTransaction,
            Trade.Balance.chargeBalance
        ),
        //余额转押金
        balanceToDeposit: regist(
            joiValidator({
                system: Joi.string().required(),
                tradeAccountNo: Joi.string().required(),
                amount: Joi.number().positive().greater(0).less(1000000).required(),
                orderType: Joi.any().required(),
                orderId: Joi.any().required(),
                remark: Joi.string(),
                tradePwd: Joi.string(),
                tradePrincipal: Joi.string().max(32).empty('').required(),
                accountId: Joi.string()
            }),
            repeatCheck({ operate: 'Trade.balanceToDeposit', ttl: 10 }),
            logOperateLog('Trade.balanceToDeposit'),
            surroundByTransaction,
            Trade.Balance.balanceToDeposit
        ),
        //押金转余额
        depositToBalance: regist(
            joiValidator({
                system: Joi.string().required(),
                tradeAccountNo: Joi.string().required(),
                amount: Joi.number().positive().greater(0).less(1000000).required(),
                orderType: Joi.any().required(),
                orderId: Joi.any().required(),
                remark: Joi.string(),
                tradePwd: Joi.string(),
                tradePrincipal: Joi.string().max(32).empty('').required(),
                accountId: Joi.string()
            }),
            repeatCheck({ operate: 'Trade.depositToBalance', ttl: 10 }),
            logOperateLog('Trade.depositToBalance'),
            surroundByTransaction,
            Trade.Deposit.depositToBalance
        ),
        //提现
        withdrawCash: regist(
            joiValidator({
                system: Joi.string().required(),
                tradeAccountNo: Joi.string().required(),
                amount: Joi.number().positive().min(1).less(1000000).required(),
                orderType: Joi.any().required(),
                orderId: Joi.any().required(),
                remark: Joi.string(),
                tradeType: Joi.string().valid('ALI_PAY').default('ALI_PAY'),
                thirdPartAccount: Joi.string().required(),
                realName: Joi.string().required(),
                tradePwd: Joi.string(),
                tradePrincipal: Joi.string().max(32).empty('').required(),
                tip: Joi.string(),
                accountId: Joi.string().required()
            }),
            // 提现比较凶险，出现过重复提现，所以限制为60s
            repeatCheck({ operate: 'Trade.withdrawCash', ttl: 10 }),
            logOperateLog('Trade.withdrawCash'),
            //分段式事物，所以不能用一个整的
            // surroundByTransaction,
            Trade.Balance.withdrawCash
        ),
        //撤销
        cancelWithdrawCash: regist(
            joiValidator({
                numberId: Joi.string().required(),
                remark: Joi.string(),
                accountId: Joi.string().required()
            }),
            repeatCheck({ operate: 'Trade.cancelWithdrawCash', ttl: 3 }),
            logOperateLog('Trade.cancelWithdrawCash'),
            surroundByTransaction,
            Trade.Balance.cancelWithdrawCash
        ),
        //重试
        repeatWithdrawCash: regist(
            joiValidator({
                numberId: Joi.string().required(),
                remark: Joi.string(),
                accountId: Joi.string().required()
            }),
            repeatCheck({ operate: 'Trade.repeatWithdrawCash', ttl: 3 }),
            logOperateLog('Trade.repeatWithdrawCash'),
            // surroundByTransaction,
            Trade.Balance.repeatWithdrawCash
        ),
        //支付押金
        chargeDeposit: regist(
            joiValidator({
                system: Joi.string().required(),
                tradeAccountNo: Joi.string().required(),
                amount: Joi.number().positive().greater(0).less(1000000).required(),
                orderType: Joi.any().required(),
                orderId: Joi.any().required(),
                remark: Joi.string(),
                tradeType: Joi.string().required().valid(TRADE_TYPES),
                body: Joi.string().required(),
                spbillCreateIp: Joi.string(),
                noCredit: Joi.any().valid([0, 1, '0', '1']),
                tradePrincipal: Joi.string().max(32).empty('').required(),
                accountId: Joi.string()
            }),
            repeatCheck({ operate: 'Trade.chargeDeposit', ttl: 5 }),
            logOperateLog('Trade.chargeDeposit'),
            surroundByTransaction,
            Trade.Deposit.chargeDeposit
        ),
        //支付押金
        payChargeBalance: regist(
            joiValidator({
                system: Joi.string().required(),
                tradeAccountNo: Joi.string().required(),
                amount: Joi.number().positive().greater(0).less(1000000).required(),
                orderType: Joi.any().required(),
                orderId: Joi.any().required(),
                remark: Joi.string(),
                tradeType: Joi.string().required().valid(TRADE_TYPES),
                body: Joi.string().required(),
                spbillCreateIp: Joi.string(),
                noCredit: Joi.any().valid([0, 1, '0', '1']),
                tradePrincipal: Joi.string().max(32).empty('').required(),
                accountId: Joi.string()
            }),
            repeatCheck({ operate: 'Trade.payChargeBalance', ttl: 5 }),
            logOperateLog('Trade.payChargeBalance'),
            surroundByTransaction,
            Trade.Balance.payChargeBalance
        ),
        //处理结果
        handle: regist(
            logOperateLog('Trade.handle'),
            surroundByTransaction,
            Trade.Handle.handle
        ),
        //减少余额
        decreaseBalance: regist(
            joiValidator({
                system: Joi.string(),
                tradeAccountNo: Joi.string().required(),
                amount: Joi.number().positive().less(1000000).required(),
                orderType: Joi.any().required(),
                orderId: Joi.any().required(),
                remark: Joi.string(),
                tradePwd: Joi.string(),
                tradePrincipal: Joi.string().max(32).empty('').required(),
                accountId: Joi.string()
            }),
            repeatCheck({ operate: 'Trade.decreaseBalance', ttl: 10 }),
            logOperateLog('Trade.decreaseBalance'),
            surroundByTransaction,
            Trade.Balance.decreaseBalance
        ),
        selfTransfer: regist(
            joiValidator({
                tradeAccountNo: Joi.string().required(),
                toTradeAccountNo: Joi.string().required(),
                // 最大转账2W
                amount: Joi.number().positive().less(2e5).required(),
                system: Joi.string().required(),
                orderType: Joi.any().required(),
                orderId: Joi.any().required(),
                remark: Joi.string(),
                tradePwd: Joi.string(),
                tradePrincipal: Joi.string().max(32).empty('').required(),
                accountId: Joi.string()
            }),
            repeatCheck({ operate: 'Trade.selfTransfer', ttl: 10 }),
            logOperateLog('Trade.selfTransfer'),
            surroundByTransaction,
            Trade.Balance.selfTransfer
        )
    },
    Statistics: {
        byType: regist(
            joiValidator({
                type: Joi.array().single(true).items(Joi.string()).unique(),
                tradeAccountNo: Joi.array().single(true).items(Joi.string()).unique(),
                accountId: Joi.string()
            }),
            Statistics.byType
        )
    },
    Bill: {
        download: regist(
            joiValidator({
                date: Joi.date().required(),
                system: Joi.string().required(),
                isBoom: Joi.valid(0, 1, '0', '1'),
                accountId: Joi.string()
            }),
            Bill.download
        )
    }
}