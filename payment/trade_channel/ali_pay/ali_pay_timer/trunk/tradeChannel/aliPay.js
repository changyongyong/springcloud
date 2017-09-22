'use strict'

/**
 * @author WXP
 * @description 用以通过支付宝进行转账
 */


const CHANNELCONFIG = global.CHANNELCONFIG;

const {
    AliPay: AliPayConfig
} = CHANNELCONFIG;
const channelUtil = require('./util');
const HOST = AliPayConfig.host;
const requestUtil = channelUtil.requestPackage(HOST);

let AliPay = {};

/**
 * 支付宝退款
 */
AliPay.refundQuery = function (args) {
    let {
        outRefundNo,
        outTradeNo,
        source,
        sellerId    //  添加商户号的查询
    } = args;
    return requestUtil({
            uri: '/alipay/refundQuery?' + `outRefundNo=${outRefundNo}` +
                `&outTradeNo=${outTradeNo}&source=${source}&sellerId=${sellerId}`,
            method: 'GET',
            json: true
        })
        .then((data) => {
            return data.data;
        })
};

AliPay.transferQuery = function (args) {
    let {
        outBizNo,
        aliOrderId,
        source,
        sellerId    //  添加商户号的查询
    } = args;
    return requestUtil({
        uri: '/alipay/transferQuery?' + `aliOrderId=${aliOrderId}` +
        `&outBizNo=${outBizNo}&source=${source}&sellerId=${sellerId}`,
        method: 'GET',
        json: true
    })
        .then((data) => {
            return data.data;
        })
};

/**
 * 获取支付宝的source
 */
AliPay.sources = function () {
    return requestUtil({
            uri: '/alipay/sources',
            method: 'GET',
            json: true
        })
        .then((data) => {
            return data.data;
        })
};

/**
 * 支付宝账单
 */
AliPay.bill = function (args) {
    let {
        date,
        type: billType,
        source,
        sellerId
    } = args;
    let url = `/alipay/bill?billDate=${date}&billType=${billType}&source=${source}`;

    if (sellerId && sellerId !== 'null') {
        url += `&sellerId=${sellerId}`
    }

    return requestUtil({
            uri: url,
            method: 'GET',
            json: true
        })
        .then((data) => {
            return data.data;
        })
};

module.exports = AliPay;