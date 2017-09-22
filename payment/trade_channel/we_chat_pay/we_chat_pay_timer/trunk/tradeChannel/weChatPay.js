'use strict'

/**
 * @author WXP
 * @description 用以通过支付宝进行转账
 */


const {
    WeChatPay: WeChatConfig
} = global.TRADE_CHANNEL_CONFIG;
const {
    requestPackage,
    objToUrl
} = require('./util');
const HOST = WeChatConfig.host;
const requestUtil = requestPackage(HOST);
const request = require('request');
const fs = require('fs');
const moment = require('moment');

let Pay = {};

/**
 * 查询退款情况
 */
Pay.refundQuery = function (args) {
    let {
        source,
        outRefundNo,
        subMchId
    } = args;
    return requestUtil({
        uri: '/weixin/refundQuery?' + objToUrl({
            source,
            outRefundNo,
            subMchId
        }),
        method: 'GET',
        json: true
    })
};

/**
 * 查询当前微信所有的source，用以对账
 */
Pay.sources = function name() {
    return requestUtil({
            uri: '/weixin/sources',
            method: 'get',
            json: true
        })
        .then((data) => {
            return data.data;
        })
}

/**
 * 查询账单并保存到指定文件
 */
Pay.bill = function name(par) {
    let {
        source,
        date: billDate,
        type: billType,
        filePath
    } = par;
    let writeStream = fs.createWriteStream(filePath);
    billDate = moment(billDate).format('YYYYMMDD');
    return new Promise(function (resolve, reject) {
        let req = request({
                uri: `${HOST}/weixin/bill/download?${objToUrl({
                    source,
                    billDate,
                    billType
                })}`,
                method: 'get'
            })
            .pipe(writeStream);
        req.on('close', function () {
            return resolve();
        });
        req.on('error', function (error) {
            return reject(error);
        })
    })

};

module.exports = Pay;