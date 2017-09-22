'use strict'
/* eslint-disable no-sync */
/**
 * @author WXP
 * @description 初始化source和wxPay集
 */

const path = require('path');
const fs = require('fs');
const WXPay = require('../utils/wxpay');
const {
    dd528,
    psapp,
    bsapp,
    wxmp,
    ddfws
} = require('../config/wxConfig.json');
const wxPaySet = new Map();

const readFile = function (fileName) {
    return fs.readFileSync(path.join(__dirname, '../config/cert', fileName));
}

// appid和mch_id用以微信参数加密，不要更改为小驼峰！
const initWxPay = function (source, config) {
    return new WXPay({
        source: source,
        appid: config.appId,
        mch_id: config.mchId,
        partnerKey: config.partnerKey,
        pfx: readFile(config.cert)
    })
}

wxPaySet.set('dd528', initWxPay('dd528', dd528));
// 店达APP与dd528相同
wxPaySet.set('ddapp', wxPaySet.get('dd528'));
wxPaySet.set('psapp', initWxPay('psapp', psapp));
wxPaySet.set('bsapp', initWxPay('bsapp', bsapp));
wxPaySet.set('wxmp', initWxPay('wxmp', wxmp));
wxPaySet.set('ddfws', initWxPay('ddfws', ddfws));

module.exports = wxPaySet;