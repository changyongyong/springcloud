'use strict';

const CHANNELCONFIG = global.CHANNELCONFIG;
const {
    WeChatPay: WeChatPayConfig
} = CHANNELCONFIG;
const { requestPackage, objToUrl } = require('./util');
const HOST = WeChatPayConfig.host;
const requestUtil = requestPackage(HOST);
const toInt = function (fee) {
    let n = parseFloat(fee) * 100;
    return n.toFixed(0);
};

let WeChatPay = {};

/**
 * 微信付款
 */
WeChatPay.create = function (args) {
    let {
        fee,
        orderId,
        tradeRecordNo: outTradeNo,
        tradeType,
        source,
        body,
        openId,
        spbillCreateIp: ip,
        noCredit = 0,
        timeExpire = '',
        tradePrincipal: deviceInfo,
        tradeMerchantNo: subMchId
    } = args;
    let showOrderId = encodeURIComponent(orderId);
    fee = toInt(fee);
    return requestUtil({
            uri: '/weixin/create?' + objToUrl({
                fee,
                tradeType,
                outTradeNo,
                orderId: showOrderId,
                body: body || showOrderId,
                ip,
                source,
                noCredit,
                timeExpire,
                deviceInfo,
                openId,
                subMchId
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
WeChatPay.scanPay = function (args) {
    let {
        fee,
        orderId,
        tradeRecordNo: outTradeNo,
        source,
        body,
        ip: ip,
        noCredit = 0,
        timeExpire = '',
        tradePrincipal: deviceInfo,
        authCode,
        tradeMerchantNo: subMchId
    } = args;
    let showOrderId = encodeURIComponent(orderId);
    fee = toInt(fee);
    return requestUtil({
            uri: '/weixin/scanPay?' + objToUrl({
                fee,
                outTradeNo,
                orderId: showOrderId,
                body: body || showOrderId,
                ip,
                source,
                noCredit,
                timeExpire,
                deviceInfo,
                authCode,
                subMchId
            }),
            method: 'GET',
            json: true
        })
        .then((data) => {
            return data.data;
        })
};

/**
 * 退款接口
 */
WeChatPay.refund = function (args) {
    let {
        tradeRecordNo: outTradeNo,
        outRefundNo,
        refundFee,
        source,
        totalFee,
        tradeMerchantNo: subMchId
    } = args;
    refundFee = toInt(refundFee);
    totalFee = toInt(totalFee);
    return requestUtil({
            uri: '/weixin/refund?' + objToUrl({
                outRefundNo,
                outTradeNo,
                totalFee,
                refundFee,
                source,
                subMchId
            }),
            method: 'GET',
            json: true
        })
        .then((data) => {
            return data.data;
        })
};

/**
 * 上游WeChat 核验账单查询
 * @param opts
 * @returns {Promise.<T>|*|{value}}
 */
WeChatPay.downBill = function (opts) {
    let {
        type,
        date,
        //source
    } = opts;
    // if (typeof source === 'string') {
    //     source = [source];
    // }
    return requestUtil({
            uri: `/weixin/record?type=${type}&date=${date}`, //+ '&source=' + source.join('&source=')
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
            if (data) {
                let {
                    sub_message,
                    sub_code
                } = data;
                throw ({
                    message: sub_message,
                    code: sub_code
                });
            } else {
                throw error;
            }
        })
};


module.exports = WeChatPay;