'use strict'
/* eslint-disable global-require */
/**
 * @author WXP
 * @description 调用服务的主要入口
 */

const logger = global.Logger('service-index');
const PROCESS_ID = process.pid;
const _ = require('lodash');
const Joi = require('joi');
const TRADE_TYPE = ['APP', 'JSAPI', 'NATIVE'];
const BILL_TYPE = ['ALL', 'SUCCESS', 'REFUND'];
const RECORD_TYPE = ['payment', 'refund'];
const wxPaySet = require('./wxPaySet');
const SOURCE = [...wxPaySet.keys()];
const {
    regist,
    joiValidator
} = require('../utils/util');

const Pay = require('./pay');
const Refund = require('./refund');
const Bill = require('./bill');
const Record = require('./record');
const Comm = require('./comm');

/**
 * 请求过来时绑定上所需的source
 * @param {*} par 
 * @param {*} options 
 * @param {*} next 
 */
const bindWxPay = function (par, options, next) {
    if (options.wxPay) {
        return next(par, options);
    }
    if (par.source) {
        options.wxPay = wxPaySet.get(par.source);
    }
    return next(par, options);
}

const prepare = function (operate) {
    return function (par, options, next) {
        let requestId = `${PROCESS_ID}_${Date.now()}_${_.random(100,200)}`;
        let start = Date.now();
        options.requestId = requestId;
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
                logger.info(`operate:${operate} requestId:${requestId} ` +
                    `status:ERROR use:${Date.now() - start}ms ` +
                    `error: ${typeof error === 'string' ? error : error.message}`);
                throw (error);
            })
    }
}


module.exports = {
    WxPaySet: require('./wxPaySet'),
    Pay: {
        create: regist(
            prepare('Pay.create'),
            joiValidator({
                source: Joi.any().valid(SOURCE).required(),
                body: Joi.string().max(128).required(),
                outTradeNo: Joi.string().max(32).required(),
                orderId: Joi.string().max(32).required(),
                fee: Joi.number().integer().min(1).max(1e8).required(),
                tradeType: Joi.any().valid(TRADE_TYPE).required(),
                noCredit: Joi.any().allow('1', '0', 1, 0),
                timeExpire: Joi.date(),
                ip: Joi.string().ip(),
                deviceInfo: Joi.string(),
                openId: Joi.any(),
                subMchId: Joi.string()
            }),
            bindWxPay,
            Pay.create
        ),
        scanPay: regist(
            prepare('Pay.scanPay'),
            joiValidator({
                source: Joi.any().valid(SOURCE).required(),
                body: Joi.string().max(128).required(),
                outTradeNo: Joi.string().max(32).required(),
                orderId: Joi.string().max(32).required(),
                fee: Joi.number().integer().min(1).max(1e8).required(),
                noCredit: Joi.any().allow('1', '0', 1, 0),
                timeExpire: Joi.date(),
                ip: Joi.string().ip(),
                authCode: Joi.string(),
                deviceInfo: Joi.string(),
                subMchId: Joi.string()
            }),
            bindWxPay,
            Pay.scanPay
        ),
        query: regist(
            prepare('Pay.query'),
            joiValidator({
                source: Joi.any().valid(SOURCE).required(),
                outTradeNo: Joi.string().max(32).required(),
                subMchId: Joi.string()
            }),
            bindWxPay,
            Pay.query
        ),
        close: regist(
            prepare('Pay.close'),
            joiValidator({
                source: Joi.any().valid(SOURCE).required(),
                outTradeNo: Joi.string().max(32).required(),
                subMchId: Joi.string()
            }),
            bindWxPay,
            Pay.close
        ),
        notify: regist(
            prepare('Pay.notify'),
            bindWxPay,
            Pay.notify
        )
    },
    Refund: {
        refund: regist(
            prepare('Refund.refund'),
            joiValidator({
                source: Joi.any().valid(SOURCE).required(),
                totalFee: Joi.number().integer().min(1).max(1e8).required(),
                refundFee: Joi.number().integer().min(1).max(1e8).required(),
                outRefundNo: Joi.string().max(32).required(),
                outTradeNo: Joi.string().max(32).required(),
                subMchId: Joi.string()
            }),
            bindWxPay,
            Refund.refund
        ),
        query: regist(
            prepare('Refund.query'),
            joiValidator({
                outRefundNo: Joi.string().max(32).required(),
                source: Joi.any().valid(SOURCE).required(),
                subMchId: Joi.string()
            }),
            bindWxPay,
            Refund.query
        )
    },
    Bill: {
        download: regist(
            prepare('Bill.download'),
            joiValidator({
                billType: Joi.valid(BILL_TYPE),
                billDate: Joi.date(),
                source: Joi.any().valid(SOURCE).required(),
                subMchId: Joi.string()
            }),
            bindWxPay,
            Bill.download
        )
    },
    Record: {
        record: regist(
            prepare('Record.record'),
            joiValidator({
                type: Joi.valid(RECORD_TYPE),
                date: Joi.date()
            }),
            Record.record
        )
    },
    Comm: {
        source: Comm.sources
    }
}