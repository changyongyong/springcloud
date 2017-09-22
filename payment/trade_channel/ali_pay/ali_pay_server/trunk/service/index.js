/**
 * Created by SEELE on 2017/6/28.
 */

const Promise = require('bluebird');
const Joi = require('joi');
const {payment, back, transfer, query, auth, account} = require('./operate');
const {AliMerchantToken, AliSourceList, Ctcdb} = require('../models/ctcdb');
const authServer = require('../utils/auth');

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
                return resolve()
            });
        })
            .then(()=> {
                return next(par, options2, next)
            })
    }
};

function findAuthToken(par, options, next) {
    if (par.sellerId && par.sellerId !== 'null' && par.sellerId !== 'undefined') {
        return AliMerchantToken.find({
            where: {
                merchantNo: par.sellerId
            },
            raw: true
        })
            .then((data)=> {
                if (!data) {
                    par.sellerId = null;
                    return next(par, options, next)
                }
                par.authToken = data.merchantAuthToken;
                par.source = data.merchantSource;
                return next(par, options, next)
            })
            .catch((error)=> {
                throw (error)
            })
    }
    return next(par, options, next)
}

function regist() {
    let funcs = Array.from(arguments);
    if (funcs.length === 1) {
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

/**
 * 查找支付的配置信息
 * @param par
 * @param options
 * @param next
 * @returns {Promise.<T>}
 */
function bindAliPay(par, options, next) {
    return AliSourceList.find({
        where: {
            source: par.source
        },
        raw: true
    })
        .then((data)=> {
            if (!data) {
                throw ('source对应账户缺失')
            }
            options.aliPay = data;
            return next(par, options, next)
        })
        .catch((error)=> {
            throw (error)
        })
}

const sourceInfo = function () {
    // return {
    //     'ddapp': {
    //         account: 'dd528'
    //     },
    //     'dd528': {
    //         account: 'dd528'
    //     },
    //     'psapp': {
    //         account: 'dd528'
    //     },
    //     'bsapp': {
    //         account: 'bsapp'
    //     }
    // };
    let sql = 'select ' +
        ' DISTINCT asl_source as source' +
        ' from' +
        ' ali_source_list where asl_is_bill = 1';
    return Ctcdb.query(sql, {nest: true})
        .then((data)=> {
            let i;
            let accountMap = {};
            for (i = 0; i < data.length; i++) {
                if (!accountMap[data[i].source]) {
                    accountMap[data[i].source] = {
                        account: data[i].source
                    }
                }
            }
            return accountMap
        })
        .catch((error)=> {
            throw (error)
        })
};


function decrypt(par, options, next) {
    let account = authServer.decrypt(par.secret);
    try {
        account = JSON.parse(account);
        par.source = account.source;
        par.accountId = account.id
    } catch (e) {
        throw ({
            status: -1,
            message: '解析授权信息失败'
        })
    }
    return next(par, options, next)
}


module.exports = {
    //  支付相关
    pay: {
        create: regist(joiValidator({
            source: Joi.string().required(),    //来源
            orderId: Joi.string().required(),   //订单编号
            totalFee: Joi.string().required(),  //金额
            subject: Joi.string().required(),   //订单主题
            noCredit: Joi.string(), //是否使用信用卡
            timeExpire: Joi.string(),    //过期时间
            sellerId: Joi.string().allow('')
        }),
            findAuthToken,
            bindAliPay,
            payment.create),
        scan: regist(joiValidator({
            body: Joi.string(),
            source: Joi.string().required(),    //来源
            orderId: Joi.string().required(),   //订单编号
            totalFee: Joi.string().required(),  //金额
            subject: Joi.string().required(),   //订单主题
            authCode: Joi.string().required(),   //支付授权码
            noCredit: Joi.string(), //是否使用信用卡
            timeExpire: Joi.string(),    //过期时间
            storeId: Joi.string(),
            outTradeNo: Joi.string(),
            sellerId: Joi.string().allow('')
        }),
            findAuthToken,
            bindAliPay,
            payment.scan),
        appPay: regist(joiValidator({
            source: Joi.string().required(),    //来源
            orderId: Joi.string().required(),   //订单编号
            totalFee: Joi.string().required(),  //金额
            subject: Joi.string().required(),   //订单主题
            noCredit: Joi.string(), //是否使用信用卡
            timeExpire: Joi.string(),    //过期时间
            sellerId: Joi.string().allow('')
        }),
            findAuthToken,
            bindAliPay,
            payment.appCreate)
    },
    //  查询相关
    query: {
        trx: regist(joiValidator({
            orderId: Joi.string().required(),
            source: Joi.string().required()
        }),
            query.queryTrx),
        order: regist(joiValidator({
            outTradeNo: Joi.string().required(),
            source: Joi.string().required()
        }),
            bindAliPay,
            query.queryOrder),
        refund: regist(joiValidator({
            source: Joi.string().required(),
            outTradeNo: Joi.string(),
            tradeNo: Joi.string(),
            outRefundNo: Joi.string().required(),
            sellerId: Joi.string().allow('')
        }),
            findAuthToken,
            bindAliPay,
            query.refund),
        transfer: regist(joiValidator({
            source: Joi.string().required(),
            aliOrderId: Joi.string(),
            outBizNo: Joi.string(),
            sellerId: Joi.string()
        }),
            findAuthToken,
            bindAliPay,
            query.transfer),
        bill: regist(joiValidator({
            source: Joi.string().required(),
            billDate: Joi.string().required(),
            billType: Joi.string().required(),
            sellerId: Joi.string().allow('')
        }),
            // findAuthToken,
            bindAliPay,
            query.bill),
        record: regist(joiValidator({
            type: Joi.string().valid(['payment', 'refund', 'transfer']).required(),
            date: Joi.string().required()
        }), query.record),
        auth: regist(joiValidator({
            source: Joi.string().required(),
            accountId: Joi.string().required()
        }),
            bindAliPay,
            auth.getAuthUrl),
        //todo 此处source不对
        source: sourceInfo
    },
    //  退款相关
    back: {
        refund: regist(joiValidator({
            source: Joi.string().required(),
            tradeNo: Joi.string(),
            outTradeNo: Joi.string().required(),
            totalFee: Joi.number().required(),
            refundFee: Joi.number().required(),
            outRefundNo: Joi.string().required(),
            sellerId: Joi.string().allow('')
        }),
            findAuthToken,
            bindAliPay,
            back.refund),
        close: regist(joiValidator({
            outTradeNo: Joi.string().required(),
            tradeNo: Joi.string(),
            operatorId: Joi.string(),
            source: Joi.string().required()
        }),
            bindAliPay,
            back.close),
        cancel: regist(joiValidator({
            source: Joi.string().required(),
            outTradeNo: Joi.string().required(),
            tradeNo: Joi.string()
        }),
            bindAliPay,
            back.cancel)
    },
    //  转账相关
    move: {
        transfer: regist(joiValidator({
            outBizNo: Joi.string().required(),
            payeeAccount: Joi.string().required(),
            amount: Joi.string().required(),
            payeeRealName: Joi.string().required(),
            source: Joi.string().required(),
            remark: Joi.string(),
            payerShowName: Joi.string(),
            sellerId: Joi.string().allow('')
        }),
            findAuthToken,
            bindAliPay,
            transfer.transfer)
    },
    //  授权相关
    auth: {
        third: regist(joiValidator({
            app_id: Joi.string().required(),
            app_auth_code: Joi.string().required(),
            secret: Joi.string().required(),
            source: Joi.string()
        }),
            decrypt,
            bindAliPay,
            auth.save)
    },
    //  基础账户相关
    account: {
        add: regist(joiValidator({
            accountSecretKey: Joi.string().required(),
            source: Joi.string().required(),
            name: Joi.string().required(),
            appId: Joi.string().required(),
            email: Joi.string().required()
        }), account.add)
    }
};