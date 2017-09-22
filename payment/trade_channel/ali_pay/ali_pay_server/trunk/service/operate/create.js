/**
 * Created by SEELE on 2017/6/29.
 */

const moment = require('moment');
const _ = require('lodash');
const Promise = require('bluebird');
const request = require('request');
const baseConfig = global.BASECONFIG;
const alib = require('../../utils/alib.js');
const {AliTransactionLog} = require('../../models/ctcdb');
const logger = require('../../utils/logger').Logger('router-alipay');
const loopCheck = require('../common/check').loopCheck;

const DEFAULT_TIME_OUT = 3 * 60;
const MAX_TIME_OUT = 15 * 24 * 60;
const MIN_TIME_OUT = 1;
const AlipayConfig = global.AlipayConfig;
const DISABLE_PAY_CHANNELS = 'credit_group,creditCard';
const NOTIFY_URL = baseConfig.NOTIFY_URL;
const SCAN_PAY_CLEARLY_ERROR = require('../common/error');

let CreatePay = {};
// 同意处理延迟时间
function dealTime(timeExpire) {
    let timeOut;
    if (timeExpire) {
        // timeExpire - now 的差异毫秒，将毫秒转换为分钟
        timeOut = Math.ceil(moment(timeExpire, 'YYYYMMDDHHmmss').diff() / 60000);
        if (_.isNaN(timeOut)) {
            timeOut = DEFAULT_TIME_OUT;
        }
        // 超时时间最小为 1分钟
        timeOut = timeOut <= 1 ? MIN_TIME_OUT : timeOut;
        // 超时时间最大为 21600分钟（15天）
        timeOut = timeOut > MAX_TIME_OUT ? MAX_TIME_OUT : timeOut;
    } else {
        timeOut = DEFAULT_TIME_OUT;
    }
    return timeOut;
}

/**
 * 创建预支付信息
 * @param par
 */
CreatePay.create = (par, options)=> {
    let {
        orderId,
        source,
        totalFee,
        subject,
        noCredit,
        timeExpire,
        sellerId,
        authToken
    } = par;

    let {
        aliPay
    } = options;

    let {
        appId,
        inputCharset,
        secretKey
    } = aliPay;

    let timeOut = dealTime(timeExpire);
    let app_id = appId;
    let charset = inputCharset;
    let method = 'alipay.trade.precreate';
    let sign_type = 'RSA';
    let timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
    let format = 'json';
    let version = '1.0';
    let biz_content = {
        out_trade_no: orderId,
        total_amount: totalFee,
        subject: subject,
        store_id: source,
        timeout_express: timeOut + 'm'
    };
    let sParaTemp = [];
    let sURL;
    let codeUrl;
    if (noCredit && noCredit === '1') {
        biz_content.disable_pay_channels = DISABLE_PAY_CHANNELS;
    }

    if (sellerId && sellerId !== 'null') {
        biz_content.seller_id = sellerId
    }
    timeExpire = moment().add(timeOut + 1, 'm').format('YYYY-MM-DD HH:mm:ss');
    if (authToken) {
        sParaTemp.push(['app_auth_token', authToken]);
    }
    sParaTemp.push(['app_id', app_id]);
    sParaTemp.push(['method', method]);
    sParaTemp.push(['charset', charset]);
    sParaTemp.push(['sign_type', sign_type]);
    sParaTemp.push(['timestamp', timestamp]);
    sParaTemp.push(['format', format]);
    sParaTemp.push(['version', version]);
    sParaTemp.push(['notify_url', NOTIFY_URL]);
    sParaTemp.push(['biz_content', JSON.stringify(biz_content)]);

    sURL = alib.getPath(AlipayConfig.ALIPAY_PATH, alib.buildRequestPara2(sParaTemp, source , secretKey));
    return AliTransactionLog.find({
        where: { outTradeNo: orderId, payStatus: '1', closed: '0' }
    })
        .then((transactionLog)=> {
            if (transactionLog) {
                return Promise.reject({
                    tag: 'error',
                    status: -1,
                    message: '订单已支付'
                })
            }
            return new Promise((resolve, reject)=> {
                request({
                    url: AlipayConfig.APIHOST + sURL,
                    method: 'GET',
                    headers: {
                        'charset': 'utf-8'
                    }
                }, (error, response, body)=> {
                    try {
                        body = JSON.parse(body);
                        let result = alib.checkRSA(body.alipay_trade_precreate_response, body.sign);
                        if (result) {
                            let resp = body.alipay_trade_precreate_response;
                            if (resp.code === '10000') {
                                codeUrl = resp.qr_code;
                                resolve()
                            } else {
                                reject({
                                    tag: 'error',
                                    status: -1,
                                    message: resp.sub_msg
                                })
                            }
                        } else {
                            reject({
                                tag: 'error',
                                status: -1,
                                message: '同步返回验签失败'
                            })
                        }
                    }
                    catch (e) {
                        reject({
                            tag: 'error',
                            status: -1,
                            error: e.message || '获取验签失败'
                        })
                    }
                })
            })
        })
        .then(()=> {
            return AliTransactionLog.create({
                appId: app_id,
                outTradeNo: orderId,
                tradeType: 'UNION',
                totalFee: totalFee,
                subject: subject,
                codeUrl: codeUrl,
                payStatus: '0',
                closed: '0',
                timeExpire: timeExpire,
                source: source,
                sellerId: sellerId
            })
        })
        .then(()=> {
            return {
                codeUrl: codeUrl,
                outTradeNo: orderId //非常重要，外部系统查询都需要使用这个单号
            }
        })
};

/**
 * app创建支付信息
 * @param par
 * @param options
 */
CreatePay.appCreate = (par, options)=> {
    let {
        orderId,
        source,
        totalFee,
        subject,
        noCredit,
        timeExpire
    } = par;

    let {
        aliPay
    } = options;

    let {
        appId,
        inputCharset,
        secretKey
    } = aliPay;

    let timeOut = dealTime(timeExpire);
    let app_id = appId;
    let charset = inputCharset;
    let method = 'alipay.trade.app.pay';
    let sign_type = 'RSA';
    let timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
    let format = 'json';
    let version = '1.0';
    let biz_content = {
        out_trade_no: orderId,
        total_amount: totalFee,
        subject: subject,
        store_id: source,
        timeout_express: timeOut + 'm',
        product_code: 'QUICK_MSECURITY_PAY',
        goods_type: '1'
    };
    let sParaTemp = [];
    let sURL;
    if (noCredit && noCredit === '1') {
        biz_content.disable_pay_channels = DISABLE_PAY_CHANNELS;
    }

    sParaTemp.push(['app_id', app_id]);
    sParaTemp.push(['method', method]);
    sParaTemp.push(['charset', charset]);
    sParaTemp.push(['sign_type', sign_type]);
    sParaTemp.push(['timestamp', timestamp]);
    sParaTemp.push(['format', format]);
    sParaTemp.push(['version', version]);
    sParaTemp.push(['notify_url', NOTIFY_URL]);
    sParaTemp.push(['biz_content', JSON.stringify(biz_content)]);
    sURL = alib.getEncodeURI(alib.buildRequestPara2(sParaTemp, source, secretKey));

    return AliTransactionLog.find({
        where: { outTradeNo: orderId, closed: '0' }
    })
        .then((transactionLog)=> {
            if (transactionLog) {
                return Promise.reject({
                    tag: 'error',
                    status: -1,
                    message: '交易已存在，未关闭'
                })
            }
            return AliTransactionLog.create({
                appId: app_id,
                outTradeNo: orderId,
                tradeType: 'APP',
                totalFee: totalFee,
                subject: subject,
                codeUrl: '',
                payStatus: '0',
                closed: '0',
                source: source
            })
        })
        .then(()=> {
            return {
                sURL: sURL, //app请求需要的加签名的
                outTradeNo: orderId //非常重要，外部系统查询都需要使用这个单号
            }
        })
};

/**
 * 扫码支付
 * @param par
 * @param options
 */
CreatePay.scan = (par, options)=> {
    let {
        orderId,
        source,
        totalFee,
        subject,
        noCredit,
        timeExpire,
        body,
        storeId,
        authCode,
        sellerId,
        authToken
    } = par;

    let {
        aliPay
    } = options;

    let {
        appId,
        inputCharset,
        secretKey
    } = aliPay;

    let timeOut = dealTime(timeExpire);
    let app_id = appId;
    let charset = inputCharset;
    let method = 'alipay.trade.pay';
    let sign_type = 'RSA';
    let timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
    let format = 'json';
    let version = '1.0';
    let biz_content = {
        out_trade_no: orderId,
        total_amount: totalFee,
        subject: subject,
        body: body,
        auth_code: authCode,
        store_id: storeId,
        timeout_express: timeOut + 'm',
        // 扫码支付
        scene: 'bar_code'
        // seller_id: '2088802002497921'
    };
    let sParaTemp = [];
    let sURL;
    let aliLog;
    let signRs;
    let resp;

    if (noCredit && noCredit === '1') {
        biz_content.disable_pay_channels = DISABLE_PAY_CHANNELS;
    }
    if (sellerId && sellerId !== 'null') {
        biz_content.seller_id = sellerId
    }
    if (authToken) {
        sParaTemp.push(['app_auth_token', authToken]);
    }
    timeExpire = moment().add(timeOut + 1, 'm').format('YYYY-MM-DD HH:mm:ss');

    sParaTemp.push(['app_id', app_id]);
    sParaTemp.push(['method', method]);
    sParaTemp.push(['charset', charset]);
    sParaTemp.push(['sign_type', sign_type]);
    sParaTemp.push(['timestamp', timestamp]);
    sParaTemp.push(['format', format]);
    sParaTemp.push(['version', version]);
    sParaTemp.push(['notify_url', NOTIFY_URL]);
    sParaTemp.push(['biz_content', JSON.stringify(biz_content)]);

    sURL = alib.getPath(AlipayConfig.ALIPAY_PATH, alib.buildRequestPara2(sParaTemp, source, secretKey));

    return AliTransactionLog.find({
        where: { outTradeNo: orderId, payStatus: '1', closed: '0' }
    })
        .then((transactionLog)=> {
            if (transactionLog) {
                return Promise.reject({
                    status: -1,
                    message: '订单已提交支付'
                })
            }
            // 因为不是预支付，会直接扣费，所以先创建支付单再申请支付
            return AliTransactionLog.create({
                appId: app_id,
                outTradeNo: orderId,
                tradeType: 'SCAN',
                totalFee: totalFee,
                subject: subject,
                body: body,
                payStatus: '0',
                closed: '0',
                timeExpire: timeExpire,
                storeId: storeId,
                source: source,
                sellerId: sellerId
            })
        })
        .then((data)=> {
            aliLog = data;
            return new Promise((resolve, reject)=> {
                request({
                    url: AlipayConfig.APIHOST + sURL,
                    method: 'GET',
                    headers: {
                        'charset': 'utf-8'
                    }
                }, (error, response, body)=> {
                    if (error) {
                        return reject({
                            status: -1,
                            message: '发起支付失败'
                        })
                    }
                    try {
                        body = JSON.parse(body);
                    }
                    catch (e) {
                        logger.error(error);
                        return reject({
                            status: -1,
                            message: '获取调用支付结果失败'
                        })
                    }
                    signRs = alib.checkRSA(body.alipay_trade_pay_response, body.sign);
                    if (!signRs) {
                        return reject({
                            status: -1,
                            message: '检查验签失败'
                        })
                    }
                    resp = body.alipay_trade_pay_response;
                    resolve()
                })
            })
        })
        .then(()=> {
            let message;
            let status;
            if (resp.code !== '10000') {
                status = -1;
                message = resp.msg;
                if (resp.code === '40004') {
                    if (!(resp.sub_code in SCAN_PAY_CLEARLY_ERROR)) {
                        loopCheck(aliLog, null, options);
                        return Promise.resolve({
                            outTradeNo: orderId,
                            status: 'PENDDING'
                        });
                    } else {
                        message = SCAN_PAY_CLEARLY_ERROR[resp.sub_code];
                    }
                }

                if (resp.code === '40004') {
                    if (!(resp.sub_code in SCAN_PAY_CLEARLY_ERROR)) {
                        loopCheck(aliLog, null, options);
                        return Promise.resolve({
                            outTradeNo: orderId,
                            status: 'PENDDING'
                        });
                    } else {
                        message = SCAN_PAY_CLEARLY_ERROR[resp.sub_code];
                    }
                }
                if (resp.code === '10003') {
                    loopCheck(aliLog, null, options);
                    return Promise.resolve({
                        outTradeNo: orderId,
                        status: 'PENDDING'
                    });
                }
                logger.error('支付失败' + JSON.stringify(body));
                aliLog.gmtPayment = resp.gmt_payment;
                aliLog.buyerId = resp.buyer_user_id;
                aliLog.buyerLogonId = resp.buyer_logon_id;
                aliLog.tradeNo = resp.trade_no;
                aliLog.tradeStatus = resp.trade_status;
                aliLog.payStatus = status;
                return aliLog.save()
                    .then(function () {
                        return Promise.reject({
                            status: -1,
                            message: message
                        });
                    })
                    .catch(function (err) {
                        logger.error('支付失败:' + JSON.stringify({
                                message: err.message,
                                stack: err.stack,
                                sql: err.sql
                            }));
                        return Promise.reject({
                            status: -1,
                            message: message
                        });
                    })

            } else {
                aliLog.gmtPayment = resp.gmt_payment;
                aliLog.buyerId = resp.buyer_user_id;
                aliLog.buyerLogonId = resp.buyer_logon_id;
                aliLog.tradeNo = resp.trade_no;
                aliLog.tradeStatus = resp.trade_status;
                aliLog.payStatus = 1;
                return aliLog.save()
                    .then(function () {
                        return Promise.resolve({
                            outTradeNo: orderId,
                            status: 'SUCCESS'
                        });
                    })
                    .catch(function (error) {
                        logger.error('支付失败:' + JSON.stringify({
                                message: error.message,
                                stack: error.stack,
                                sql: error.sql
                            }));
                        loopCheck(aliLog, null, options);
                        return Promise.resolve({
                            outTradeNo: orderId,
                            status: 'PENDDING'
                        });
                    })
            }
        })
};

module.exports = CreatePay;