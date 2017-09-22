'use strict';

/**
 * 对外暴露方法，提供简单的基座功能
 * @author 吴秀璞
 * @since 2017/1/16
 */

/* eslint-disable global-require */

const OperateLog = require('./operateLog');
// const {
//     Db
// } = require('../models/tradeGatewayDb');
const WeChatPay = require('./weChatPay');
const Refund = require('./refund');
const Payment = require('./payment');
const AliPay = require('./aliPay');
const Transfer = require('./transfer');
const BillValidate = require('./billValidate');
const Account = require('./account');
const PayTest = require('./payTest');
const Util = require('../tradeChannel/util');
const Joi = require('joi');
const WE_CHAT_PAY_TRADE_TYPE = ['APP', 'JSAPI', 'NATIVE'];
const ALI_PAY_TRADE_TYPE = ['APP', 'UNION'];
// const WE_CHAT_PAY_SOURCE = ['ddapp', 'dd528', 'psapp', 'bsapp', 'wxmp'];
// const ALI_PAY_SOURCE = ['ddapp', 'dd528', 'psapp', 'bsapp'];
const PROCESS_ID = process.pid;
const _ = require('lodash');
const logger = global.Logger('service-index');

/**
 * 执行前准备
 * 1.打印前后日志，执行时间
 * 2.将参数复制一份到options.req
 * 3.在options增加requestId
 * @param {string} operate 操作方法的名称
 */
const prepare = (operate) => {
    return function (par, options, next) {
        let requestId = `${PROCESS_ID}_${Date.now()}_${_.random(100,999)}`;
        let start = Date.now();
        options.requestId = requestId;
        // 保存原始请求，防止被重写
        options.req = _.cloneDeep(par);
        logger.info(`execute operate:${operate} requestId:${requestId} par:${JSON.stringify(par)}`)
        return Promise.resolve()
            .then(() => {
                return next(par, options)
            })
            .then((data) => {
                logger.info(`after-execute operate:${operate} ` +
                    `requestId:${requestId} status:SUCCESS use:${Date.now() - start}ms`);
                return data;
            })
            .catch((error) => {
                logger.info(`after-execute operate:${operate} requestId:${requestId} ` +
                    `status:ERROR use:${Date.now() - start}ms ` +
                    `error: ${typeof error === 'string' ? error : error.message}`);
                throw (error);
            })
    }
};

const joiValidator = (schema, options) => {
    options = options || {};
    //生成校验中间件
    return (par, options2, next) => {
        if (!schema) {
            return next();
        }
        return new Promise((resolve) => {
                Joi.validate(par, schema, options, (err) => {
                    if (err) {
                        let details = err && err.details || [];
                        let failures = [];
                        for (let detail of details) {
                            failures.push(detail.message);
                        }
                        throw (JSON.stringify(failures));
                    }
                    resolve();
                });
            })
            .then(() => {
                return next(par, options2);
            })
    };
};

// 由于事务逻辑导致如果超时等问题会丢失单据，所有取消事务 
// /**
//  * 把方法用transaction包裹起来，从而简化代码
//  * @param handler
//  * @returns {Function}
//  */
// const surroundByTransaction = function (par, options, next) {
//     let transaction;
//     return Db.transaction()
//         .then((t) => {
//             transaction = t;
//             options.transaction = t;
//         })
//         .then(() => {
//             return next(par, options);
//         })
//         .then((result) => {
//             return transaction.commit()
//                 .then(() => {
//                     return result;
//                 });
//         })
//         .catch((error) => {
//             //当错误为允许提交的错误时提交
//             if (error && error.isCommit) {
//                 if (transaction) {
//                     return transaction.commit()
//                         .then(() => {
//                             throw (error);
//                         })
//                 }
//                 //  否则提交事务
//             } else {
//                 if (transaction) {
//                     return transaction.rollback()
//                         .then(() => {
//                             throw (error);
//                         })
//                 }
//             }
//             throw (error);
//         })
// };

/**
 * 处理业务前记录操作日志
 * @param {string} funcName 用以区分方法
 * @param {function} handler 实际记录日志后回调方法
 */
const logOperateLog = function (funcName) {
    return function (par, options, next) {
        let log;
        // 只记录2000个字，防止数据过多
        let parStr = JSON.stringify(par).slice(0, 2000);
        return OperateLog.create({
                operate: funcName,
                params: parStr,
                orderType: par.orderType,
                orderId: par.orderId,
                operator: par.operator,
                messageId: par.messageId
            }, options)
            .then(function (data) {
                log = data;
                options.operateLogNo = log.operateLogNo;
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
};

const setAccount = function (par, options, next) {
    return Account.find({
            where: {
                accountId: par.accountId
            }
        })
        .then((data) => {
            if (!data) {
                throw ('没有对应的账户！');
            }
            options.account = data;
            return next(par, options, next);
        })
};

const setMerchant = function ({
    tradeChannel,
    tradeType
}) {
    return function (par, options, next) {
        let query = {
            tradeChannel: tradeChannel,
            tradeType: null
        };
        if (tradeType) {
            query.tradeType = tradeType;
        } else if (tradeChannel == 'WE_CHAT_PAY') {
            query.tradeType = 'WE_CHAT_PAY_' + par.tradeType;
        }
        if (tradeChannel === 'ALI_PAY') {
            if (par.tradeType === 'APP') {
                query.tradeType = tradeChannel + '_' +  par.tradeType;
            }
        }
        query.accountId = options.account.id;
        return Account.findMerchant(query)
            .then((data) => {
                if (!data) {
                    throw ('没有对应的支付商户！');
                }
                if (data.state === -1) {
                    throw ('此商户此渠道已被禁用！');
                }
                data.source = data.merchantConfig.source;
                options.merchant = data;
                return next(par, options, next);
            })
    };
}


/**
 * 注册方法，用以将方法注册为调用连
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

//增加防重处理
const repeatCheck = function (exp) {

    return function (par, options, next) {
        let {
            orderType,
            orderId
        } = par;
        return Util.setValue({
            key: orderType + orderId,
            value: 'OK',
            exp: exp
        })
            .then(()=> {
                return next(par, options, next)
            })
    }
};

//TODO 更改为类似express或者koa的中间件形式，以方便处理
module.exports = {
    WeChatPay: {
        Payment: {
            create: regist(
                prepare('WechatPay.Payment.create'),
                joiValidator({
                    fee: Joi.number().positive().greater(0).required(),
                    orderId: Joi.any().required(),
                    orderType: Joi.any().required(),
                    system: Joi.string().required(),
                    remark: Joi.string(),
                    openId: Joi.string(),
                    tradeType: Joi.string().valid(WE_CHAT_PAY_TRADE_TYPE).required(),
                    body: Joi.string().required(),
                    spbillCreateIp: Joi.string().required(),
                    noCredit: Joi.any().valid([0, 1, '0', '1']).default(0),
                    timeExpire: Joi.date().min('now'),
                    tradePrincipal: Joi.string().max(32).required(),
                    accountId: Joi.string().required()
                }),
                logOperateLog('WechatPay.Payment.create'),
                setAccount,
                setMerchant({
                    tradeChannel: 'WE_CHAT_PAY'
                }),
                // surroundByTransaction,
                WeChatPay.Payment.create
            ),
            scanPay: regist(
                prepare('WechatPay.Payment.scanPay'),
                joiValidator({
                    fee: Joi.number().positive().greater(0).required(),
                    orderId: Joi.any().required(),
                    orderType: Joi.any().required(),
                    system: Joi.string().required(),
                    remark: Joi.string(),
                    // tradeType: Joi.string().valid(WE_CHAT_PAY_TRADE_TYPE).required(),
                    body: Joi.string().required(),
                    spbillCreateIp: Joi.string().required(),
                    noCredit: Joi.any().valid([0, 1, '0', '1']).default(0),
                    authCode: Joi.string().required(),
                    timeExpire: Joi.date().min('now'),
                    tradePrincipal: Joi.string().max(32).required(),
                    accountId: Joi.string().required()
                }),
                logOperateLog('WechatPay.Payment.scanPay'),
                setAccount,
                setMerchant({
                    tradeChannel: 'WE_CHAT_PAY',
                    tradeType: 'WE_CHAT_PAY_SCAN_PAY'
                }),
                // surroundByTransaction,
                WeChatPay.Payment.scanPay
            )
        }
    },
    AliPay: {
        Payment: {
            create: regist(
                prepare('AliPay.Payment.create'),
                joiValidator({
                    fee: Joi.number().positive().greater(0).required(),
                    orderId: Joi.any().required(),
                    orderType: Joi.any().required(),
                    system: Joi.string().required(),
                    remark: Joi.string(),
                    tradeType: Joi.string().valid(ALI_PAY_TRADE_TYPE).required(),
                    body: Joi.string().required(),
                    subject: Joi.string(),
                    noCredit: Joi.any().valid([0, 1, '0', '1']).default(0),
                    timeExpire: Joi.date().min('now'),
                    tradePrincipal: Joi.string().max(32).empty('').required(),
                    accountId: Joi.string().required()
                }),
                logOperateLog('AliPay.Payment.create'),
                setAccount,
                setMerchant({
                    tradeChannel: 'ALI_PAY'
                }),
                // surroundByTransaction,
                AliPay.Payment.create
            ),
            scanPay: regist(
                prepare('AliPay.Payment.scanPay'),
                joiValidator({
                    fee: Joi.number().positive().greater(0).required(),
                    orderId: Joi.any().required(),
                    orderType: Joi.any().required(),
                    system: Joi.string().required(),
                    remark: Joi.string(),
                    // tradeType: Joi.string().valid(ALI_PAY_TRADE_TYPE).required(),
                    body: Joi.string().required(),
                    subject: Joi.string(),
                    noCredit: Joi.any().valid([0, 1, '0', '1']).default(0),
                    authCode: Joi.string().required(),
                    timeExpire: Joi.date().min('now'),
                    tradePrincipal: Joi.string().max(32).required(),
                    accountId: Joi.string().required()
                }),
                logOperateLog('AliPay.Payment.scanPay'),
                setAccount,
                setMerchant({
                    tradeChannel: 'ALI_PAY'
                }),
                // surroundByTransaction,
                AliPay.Payment.scanPay
            )
        }
    },
    Refund: {
        refund: regist(
            prepare('Refund.refund'),
            joiValidator({
                orderId: Joi.any().required(),
                orderType: Joi.any().required(),
                system: Joi.string().required(),
                remark: Joi.string(),
                originalOrderId: Joi.any(),
                originalTradeType: Joi.any(),
                originalSystem: Joi.string(),
                orginalOrderId: Joi.any(),
                orginalTradeType: Joi.any(),
                orginalSystem: Joi.string(),
                tradeRecordNo: Joi.string().required(),
                refundFee: Joi.number().positive().greater(0).required(),
                totalFee: Joi.number().positive().greater(0).required(),
                accountId: Joi.string().required()
            }),
            logOperateLog('Refund.refund'),
            // surroundByTransaction,
            Refund.refund
        ),
        handle: regist(
            prepare('Refund.handle'),
            logOperateLog('Refund.handle'),
            // surroundByTransaction,
            Refund.handle
        )
    },
    Transfer: {
        transfer: regist(
            prepare('Transfer.transfer'),
            joiValidator({
                orderId: Joi.any().required(),
                orderType: Joi.any().required(),
                system: Joi.string().required(),
                remark: Joi.string(),
                fee: Joi.number().positive().greater(0).required(),
                thirdPartAccount: Joi.string(),
                realName: Joi.string(),
                tradeType: Joi.string().valid('ALI_PAY').required(),
                tradePrincipal: Joi.string().max(32).required(),
                accountId: Joi.string().required()
            }),
            //  设置缓存失效的时间
            repeatCheck(10),
            logOperateLog('Transfer.transfer'),
            setAccount,
            // 目前只有支付宝转账
            setMerchant({
                tradeChannel: 'ALI_PAY',
                tradeType: 'ALI_PAY_TRANSFER'
            }),
            // surroundByTransaction,
            Transfer.transfer
        ),
        handle: regist(
            prepare('Transfer.handle'),
            logOperateLog('Transfer.handle'),
            // surroundByTransaction,
            Transfer.handle
        )
    },
    Payment: {
        handle: regist(
            prepare('Payment.handle'),
            logOperateLog('Payment.handle'),
            // surroundByTransaction,
            Payment.handle
        )
    },
    BillValidate: {
        listen: regist(
            prepare('BillValidate.listen'),
            logOperateLog('BillValidate.listen'),
            BillValidate.listen
        )
    },
    PayTest: {
        aliPay: regist(
            prepare('aliPay.test'),
            joiValidator({
                fee: Joi.number().positive().greater(0).required(),
                orderId: Joi.any().required(),
                orderType: Joi.any().required(),
                system: Joi.string().required(),
                remark: Joi.string(),
                tradeType: Joi.string().required(),
                body: Joi.string().required(),
                subject: Joi.string(),
                source: Joi.string().required(),
                noCredit: Joi.any().valid([0, 1, '0', '1']).default(0),
                timeExpire: Joi.date().min('now'),
                spbillCreateIp: Joi.string().empty(''),
                tradePrincipal: Joi.string().max(32).empty('').required(),
                sellerId: Joi.string().empty(''),
                merchantConfigId: Joi.string()
            }),
            logOperateLog('aliPay.test'),
            // surroundByTransaction,
            PayTest.transform,
            AliPay.Payment.create
        ),
        wxPay: regist(
            prepare('wxPay.test'),
            joiValidator({
                fee: Joi.number().positive().greater(0).required(),
                orderId: Joi.any().required(),
                orderType: Joi.any().required(),
                system: Joi.string().required(),
                remark: Joi.string(),
                openId: Joi.string(),
                tradeType: Joi.string().required(),
                body: Joi.string().required(),
                spbillCreateIp: Joi.string().required(),
                source: Joi.string().required(),
                noCredit: Joi.any().valid([0, 1, '0', '1']).default(0),
                timeExpire: Joi.date().min('now'),
                tradePrincipal: Joi.string().max(32).required(),
                sellerId: Joi.string().empty(''),
                merchantConfigId: Joi.string(),
                subject: Joi.string()
            }),
            logOperateLog('wxPay.test'),
            // surroundByTransaction,
            PayTest.transform,
            WeChatPay.Payment.create
        ),
        wxScanPay: regist(
            prepare('wxPay.scan.test'),
            joiValidator({
                fee: Joi.number().positive().greater(0).required(),
                orderId: Joi.any().required(),
                orderType: Joi.any().required(),
                system: Joi.string().required(),
                remark: Joi.string(),
                openId: Joi.string(),
                tradeType: Joi.string().required(),
                body: Joi.string().required(),
                spbillCreateIp: Joi.string().required(),
                source: Joi.string().required(),
                noCredit: Joi.any().valid([0, 1, '0', '1']).default(0),
                timeExpire: Joi.date().min('now'),
                tradePrincipal: Joi.string().max(32).required(),
                sellerId: Joi.string().empty(''),
                merchantConfigId: Joi.string(),
                subject: Joi.string(),
                authCode: Joi.string()
            }),
            logOperateLog('wxPay.scan.test'),
            // surroundByTransaction,
            PayTest.transform,
            WeChatPay.Payment.scanPay
        ),
        aliTransfer: regist(
            prepare('Transfer.transfer.test'),
            joiValidator({
                orderId: Joi.any().required(),
                orderType: Joi.any().required(),
                system: Joi.string().required(),
                remark: Joi.string(),
                fee: Joi.number().positive().greater(0).required(),
                source: Joi.string().required(),
                thirdPartAccount: Joi.string(),
                realName: Joi.string(),
                tradeType: Joi.string().valid('ALI_PAY').required(),
                tradePrincipal: Joi.string().max(32).required(),
                merchantConfigId: Joi.string(),
                sellerId: Joi.string().empty('')
            }),
            repeatCheck(10),
            logOperateLog('aliTransfer.test'),
            // surroundByTransaction,
            PayTest.transform,
            Transfer.transfer
        )
    },
    Account: {
        way: regist(
            prepare('Account.way'),
            joiValidator({
            accountId: Joi.required()
        }),
            Account.findMerchantWay
        ),
        send: regist(
            prepare('Account.send'),
            Account.sendContentToMq
        ),
        add: regist(
            prepare('Account.add'),
            joiValidator({
                accountSecretKey: Joi.string().required(),
                accountChannel: Joi.number().required(),
                name: Joi.string().required(),
                source: Joi.string().required(),
                appId: Joi.string().required(),
                email: Joi.string().required()
            }),
            Account.addAccount
        )
    }
};