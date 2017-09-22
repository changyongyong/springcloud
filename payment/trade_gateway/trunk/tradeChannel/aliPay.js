'use strict'

/**
 * @author WXP
 * @description 用以通过支付宝进行转账
 */

const CHANNELCONFIG = global.CHANNELCONFIG;
const {
    AliPay: AliPayConfig
} = CHANNELCONFIG;
const { requestPackage, objToUrl } = require('./util');
const HOST = AliPayConfig.host;
const requestUtil = requestPackage(HOST);
const formatNum = function (num) {
    return parseFloat(num).toFixed(2);
};

let AliPay = {};

/**
 * 微信付款
 */
AliPay.appCreate = function (args) {
    let {
        fee: totalFee,
        orderId,
        body,
        subject,
        noCredit,
        timeExpire = '',
        // tradePrincipal: storeId,
        source,
        tradeMerchantNo: sellerId
    } = args;
    if (!subject) {
        subject = body;
    }
    totalFee = formatNum(totalFee);
    return requestUtil({
            uri: '/alipay/app/precreate?' + objToUrl({
                totalFee,
                subject,
                orderId,
                noCredit,
                timeExpire,
                // storeId,
                source,
                sellerId
            }),
            method: 'GET',
            json: true
        })
        .then((data) => {
            return data.data;
        })
};

/**
 * 微信付款
 */
AliPay.create = function (args) {
    let {
        fee: totalFee,
        orderId,
        body,
        subject,
        noCredit,
        timeExpire = '',
        // tradePrincipal: storeId,
        source,
        tradeMerchantNo: sellerId
    } = args;
    if (!subject) {
        subject = body;
    }
    totalFee = formatNum(totalFee);
    return requestUtil({
            uri: '/alipay/create?' + objToUrl({
                totalFee,
                subject,
                orderId,
                noCredit,
                timeExpire,
                // storeId,
                source,
                sellerId
            }),
            method: 'GET',
            json: true
        })
        .then((data) => {
            return data.data;
        })
};

/**
 * 微信付款
 */
AliPay.scanPay = function (args) {
    let {
        fee: totalFee,
        orderId,
        body,
        subject,
        noCredit,
        timeExpire = '',
        authCode,
        tradePrincipal: storeId,
        source
    } = args;
    if (!subject) {
        subject = body;
    }
    totalFee = formatNum(totalFee);
    return requestUtil({
            uri: '/alipay/scanPay?' + objToUrl({
                totalFee,
                subject,
                orderId,
                body,
                noCredit,
                authCode,
                storeId,
                source,
                timeExpire
            }),
            method: 'GET',
            json: true
        })
        .then((data) => {
            return data.data;
        })
};

AliPay.refund = function (args) {
    let {
        outTradeNo,
        outRefundNo,
        refundFee,
        totalFee,
        source,
        tradeMerchantNo: sellerId
    } = args;
    refundFee = formatNum(refundFee);
    totalFee = formatNum(totalFee);
    return requestUtil({
            uri: '/alipay/refund?' + objToUrl({
                outRefundNo,
                outTradeNo,
                refundFee,
                totalFee,
                source,
                sellerId
            }),
            method: 'GET',
            json: true
        })
        .then((data) => {
            return data.data;
        })
};

AliPay.transfer = function (par) {
    let {
        fee: amount,
        tradeRecordNo: outBizNo,
        thirdPartAccount: payeeAccount,
        realName: payeeRealName,
        remark: remark,
        source,
        tradeMerchantNo: sellerId
    } = par;
    return requestUtil({
            uri: '/alipay/transfer?' + objToUrl({
                amount,
                outBizNo,
                payeeAccount,
                payeeRealName,
                remark,
                source,
                sellerId
            }),
            method: 'GET',
            json: true
        })
        .then((data) => {
            return data.data;
        })
        .catch((error) => {
            let data = error.orignalMessage;
            if (typeof data == 'string') {
                throw (error);
            }
            let {
                sub_message,
                sub_code
            } = data;
            throw ({
                message: sub_message,
                code: sub_code
            });
        })
};

/**
 * 上游ali 核验账单查询
 * @param opts
 * @returns {Promise.<T>|*|{value}}
 */
AliPay.downBill = function (opts) {
    let {
        type,
        date,
        //source
    } = opts;
    // if (typeof source === 'string') {
    //     source = [source];
    // }
    return requestUtil({
            uri: `/alipay/${type}/record?date=${date}`, //+ '&source=' + source.join('&source=')
            method: 'GET',
            json: true
        })
        .then((data) => {
            return data.data;
        })
        .catch((error) => {
            let data = error.orignalMessage;
            if (typeof data == 'string') {
                throw (error);
            }
            let {
                sub_message,
                sub_code
            } = data;
            throw ({
                message: sub_message,
                code: sub_code
            });
        })
};

/**
 * 增加基础的账户信息
 * @param opts
 */
AliPay.addAccount = (opts)=> {
    let {
        accountSecretKey,
        source,
        name,
        appId,
        email
    } = opts;
    return requestUtil({
        uri: '/alipay/addAccount', //+ '&source=' + source.join('&source=')
        method: 'POST',
        json: {
            accountSecretKey: accountSecretKey,
            source: source,
            name: name,
            appId: appId,
            email: email
        }
    })
        .catch(() => {
            throw ({
                message: '调用支付渠道创建账户出错'
            })
        })
};


module.exports = AliPay;