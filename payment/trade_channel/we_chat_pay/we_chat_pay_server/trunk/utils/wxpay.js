const util = require('./util');
const md5 = require('md5');
const _ = require('lodash');
const logger = global.Logger('utils-wxpay');
const WE_CHAT_URL = 'https://api.mch.weixin.qq.com/';
const requestUtil = util.requestPackage(WE_CHAT_URL);

// appid和mch_id用以微信参数加密，不要更改为小驼峰！

exports = module.exports = WXPay;

function WXPay() {

    if (!(this instanceof WXPay)) {
        return new WXPay(arguments[0]);
    }
    this.options = arguments[0];
    this.wxpayId = { appid: this.options.appid, mch_id: this.options.mch_id };
}

WXPay.mix = function () {
    switch (arguments.length) {
        case 1:
            {
                let obj = arguments[0];
                for (let key in obj) {
                    if (WXPay.prototype.hasOwnProperty(key)) {
                        throw new Error('Prototype method exist. method: ' + key);
                    }
                    WXPay.prototype[key] = obj[key];
                }
                return;
            }
        case 2:
            {
                let key = arguments[0].toString();
                let fn = arguments[1];
                if (WXPay.prototype.hasOwnProperty(key)) {
                    throw new Error('Prototype method exist. method: ' + key);
                }
                WXPay.prototype[key] = fn;
                return;
            }
    }
};


WXPay.mix('option', function (option) {
    this.options = _.assign(this.options, option);
});

//签名
WXPay.mix('sign', function (param) {
    // 待签名字段按照字母序排序
    let str = Object.keys(param)
        .filter(function (key) {
            return param[key] !== undefined &&
                param[key] !== '' &&
                !_.includes(['pfx', 'partnerKey', 'sign', 'key', 'source'], key);
        })
        .sort()
        .map(function (key) {
            return key + '=' + param[key];
        })
        .join('&') + '&key=' + this.options.partnerKey;
    logger.info('待加密字符串：', str);
    return md5(str).toUpperCase();
});

//验证签名
WXPay.mix('signCheck', function (param, sign) {
    return this.sign(param) == sign;
});

//统一下单接口
WXPay.mix('createUnifiedOrder', function (opts) {
    opts.nonce_str = opts.nonceStr || util.generateNonceString();
    util.mix(opts, this.wxpayId);
    opts.sign = this.sign(opts);
    return requestUtil({
            uri: 'pay/unifiedorder',
            method: 'POST',
            body: util.buildXML(opts),
            agentOptions: {
                pfx: this.options.pfx,
                passphrase: this.options.mch_id
            }
        })
        .then((data) => {
            return util.parseXML(data);
        })
        .then((data) => {
            return this.afterSignCheck(data);
        })
});

//APP支付
WXPay.mix('getAPPRequestParams', function (body) {
    let reqParam = {
        appid: this.options.appid,
        partnerid: this.options.mch_id,
        timestamp: Math.floor(Date.now() / 1000) + '',
        noncestr: body.nonceStr,
        prepayid: body.prepayId,
        package: 'Sign=WXPay'
    };
    reqParam.sign = this.sign(reqParam);
    logger.log('生成APP请求参数', reqParam);
    return reqParam;
});

//公众号，小程序支付
WXPay.mix('getBrandWCPayRequestParams', function (order) {
    order.trade_type = 'JSAPI';
    var _this = this;
    return this.createUnifiedOrder(order)
        .then((data) => {
            let reqparam = {
                appid: _this.options.appid,
                timeStamp: Math.floor(Date.now() / 1000) + '',
                nonceStr: data.nonce_str,
                package: 'prepay_id=' + data.prepay_id,
                signType: 'MD5'
            };
            reqparam.paySign = _this.sign(reqparam);
            return reqparam
        })
});

//微信扫码支付
WXPay.mix('createMerchantPrepayUrl', function (param) {

    param.time_stamp = param.time_stamp || Math.floor(Date.now() / 1000);
    param.nonce_str = param.nonce_str || util.generateNonceString();
    util.mix(param, this.wxpayId);
    param.sign = this.sign(param);
    var query = Object
        .keys(param)
        .filter(function (key) {
            return !_.includes(['sign', 'mch_id', 'product_id', 'appid', 'time_stamp', 'nonce_str', 'source'], key);
        })
        .map(function (key) {
            return key + '=' + encodeURIComponent(param[key]);
        })
        .join('&');

    return 'weixin://wxpay/bizpayurl?' + query;
});

//查询订单
WXPay.mix('queryOrder', function (query) {

    if (!(query.transaction_id || query.out_trade_no)) {
        return Promise.reject({ return_code: 'FAIL', return_msg: '缺少参数' });
    }
    query.nonce_str = query.nonce_str || util.generateNonceString();
    util.mix(query, this.wxpayId);
    query.sign = this.sign(query);

    return requestUtil({
            uri: 'pay/orderquery',
            method: 'POST',
            body: util.buildXML({ xml: query })
        })
        .then((data) => {
            return util.parseXML(data);
        })
        .then((data) => {
            return this.afterSignCheck(data);
        })
});

//关闭订单
WXPay.mix('closeOrder', function (order) {
    if (!order.out_trade_no) {
        return Promise.reject({ return_code: 'FAIL', return_msg: '缺少参数' });
    }
    order.nonce_str = order.nonce_str || util.generateNonceString();
    util.mix(order, this.wxpayId);
    order.sign = this.sign(order);
    return requestUtil({
            uri: 'pay/closeorder',
            method: 'POST',
            body: util.buildXML({ xml: order })
        })
        .then((data) => {
            return util.parseXML(data);
        })
        .then((data) => {
            return this.afterSignCheck(data);
        })
});

//申请退款 +++ wu
WXPay.mix('refund', function (order) {

    if (!order.out_trade_no) {
        return Promise.reject({ return_code: 'FAIL', return_msg: '缺少参数out_trade_no' });
    }
    if (!order.out_refund_no) {
        return Promise.reject({ return_code: 'FAIL', return_msg: '缺少参数out_refund_no' });
    }
    if (!order.total_fee) {
        return Promise.reject({ return_code: 'FAIL', return_msg: '缺少参数total_fee' });
    }
    if (!order.refund_fee) {
        return Promise.reject({ return_code: 'FAIL', return_msg: '缺少参数refund_fee' });
    }
    if (!order.op_user_id) {
        return Promise.reject({ return_code: 'FAIL', return_msg: '缺少参数op_user_id' });
    }
    order.nonce_str = order.nonce_str || util.generateNonceString();
    util.mix(order, this.wxpayId);
    order.sign = this.sign(order);
    return requestUtil({
            uri: 'secapi/pay/refund',
            method: 'POST',
            body: util.buildXML({ xml: order }),
            agentOptions: {
                pfx: this.options.pfx,
                passphrase: this.options.mch_id
            }
        }).then((data) => {
            return util.parseXML(data);
        })
        .then((data) => {
            return this.afterSignCheck(data);
        })
});

//查询退款 +++ wu
WXPay.mix('refundQuery', function (order) {

    if (!(order.out_trade_no || order.transaction_id || order.out_refund_no || order.refund_id)) {
        return Promise.reject({ return_code: 'FAIL', return_msg: '缺少参数' });
    }

    order.nonce_str = order.nonce_str || util.generateNonceString();
    util.mix(order, this.wxpayId);
    order.sign = this.sign(order);

    return requestUtil({
            uri: 'pay/refundquery',
            method: 'POST',
            body: util.buildXML({ xml: order })
        })
        .then((data) => {
            return util.parseXML(data);
        })
        .then((data) => {
            return this.afterSignCheck(data);
        })
});

//下载对账单 +++ wu
WXPay.mix('bill', function (order) {

    if (!order.bill_date) {
        return Promise.reject({ return_code: 'FAIL', return_msg: '缺少参数bill_date' });
    }
    if (!order.bill_type) {
        return Promise.reject({ return_code: 'FAIL', return_msg: '缺少参数bill_type' });
    }

    order.nonce_str = order.nonce_str || util.generateNonceString();
    util.mix(order, this.wxpayId);
    order.sign = this.sign(order);

    return requestUtil({
            uri: 'pay/downloadbill',
            method: 'POST',
            body: util.buildXML({ xml: order })
        })
        .then((data) => {
            if (data.indexOf('<xml>') >= 0) {
                return util.parseXML(data);
            } else {
                return { bill: data };
            }
        })
});

/**
 * 扫码付，条码付
 */
WXPay.mix('pay', function (opts) {

    var payPm = {
        appid: this.options.appid,
        auth_code: opts.authCode,
        body: opts.body,
        mch_id: this.options.mch_id,
        nonce_str: util.generateNonceString(),
        out_trade_no: opts.outTradeNo,
        spbill_create_ip: opts.ip,
        total_fee: opts.totalFee,
        device_info: opts.deviceInfo || 'DEFAULT',
        limit_pay: opts.limitPay,
        sub_mch_id: opts.subMchId
    };
    payPm.sign = this.sign(payPm);
    return requestUtil({
            uri: 'pay/micropay',
            method: 'POST',
            body: util.buildXML(payPm),
            agentOptions: {
                pfx: this.options.pfx,
                passphrase: this.options.mch_id
            }
        })
        .then((data) => {
            return util.parseXML(data);
        })
        .then((data) => {
            return this.afterSignCheck(data);
        })
});

WXPay.mix('reverse', function (order) {
    if (!order.out_trade_no) {
        return Promise.reject({ return_code: 'FAIL', return_msg: '缺少参数out_trade_no' });
    }
    order.nonce_str = order.nonce_str || util.generateNonceString();
    util.mix(order, this.wxpayId);
    order.sign = this.sign(order);

    return requestUtil({
            uri: 'secapi/pay/reverse',
            method: 'POST',
            body: util.buildXML({ xml: order }),
            agentOptions: {
                pfx: this.options.pfx,
                passphrase: this.options.mch_id
            }
        })
        .then((data) => {
            return util.parseXML(data);
        })
        .then((data) => {
            return this.afterSignCheck(data);
        })
});

WXPay.mix('afterSignCheck', function (data) {
    logger.info('返回结果：', JSON.stringify(data));
    if (!data.sign) {
        return data;
    }
    let signCheck = this.signCheck(data, data.sign);
    //logger.info('验签结果',signCheck);
    if (!signCheck) {
        return Promise.reject({
            message: '验签没通过！'
        })
    }
    return data;
});