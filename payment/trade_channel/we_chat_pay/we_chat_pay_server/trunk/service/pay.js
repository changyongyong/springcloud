'use strict'

/**
 * @author WXP
 * @description 微信支付相关逻辑
 */

const moment = require('moment');
const logger = global.Logger('service-pay');
const xml2js = require('xml2js');
const { paymentResult } = require('../mq/publisher');
const { WxTransactionLog, db } = require('../models/wxdb');

// 最小过期时间为5分钟
const MIN_TIME_OUT = 5 * 60 * 1000;
// 最大过期时间为15天
const MAX_TIME_OUT = 15 * 24 * 60 * 60 * 1000;
// 默认过期时间为3小时
const DEFAULT_TIME_OUT = 3 * 60 * 60 * 1000;
// 扫码支付的默认过期延迟为 (SCAN_LOOP_MAX_TIMES+1)*SCAN_CHECK_DELAY_TIME/100 s
// 检查为4次，加一次取消后的检查
// 每次扫码付检查次数
const SCAN_LOOP_MAX_TIMES = 4;
// 每次扫码付检查间隔 ms
const SCAN_CHECK_DELAY_TIME = 5000;

const SPBILL_CREATED_IP = global.DD_CONFIG.SPBILL_CREATED_IP;
const NOTIFY_URL = global.DD_CONFIG.NOTIFY_URL;

const builder = new xml2js.Builder();
const NOTIFY_RESPONSE = builder.buildObject({ xml: { return_code: 'SUCCESS' } });

const SCAN_PAY_CLEARLY_ERROR = {
    // 注释的两种错误需要标记订单为支付中
    // SYSTEMERROR: '系统超时'
    // USERPAYING: '用户支付中，需要支付密码',
    PARAM_ERROR: '参数错误！请通知管理员',
    ORDERPAID: '订单已支付，确认是否重复支付',
    NOAUTH: '商户无权限！请通知管理员',
    AUTHCODEEXPIRE: '二维码已过期，请用户在微信上刷新后再试',
    NOTENOUGH: '用户余额不足',
    NOTSUPORTCARD: '不支持用户卡类型',
    ORDERCLOSED: '订单已关闭',
    ORDERREVERSED: '订单已撤销',
    BANKERROR: '银行系统异常',
    AUTH_CODE_ERROR: '授权码错误，请刷新重试',
    AUTH_CODE_INVALID: '授权码校验错误，请刷新重试',
    XML_FORMAT_ERROR: '格式错误，请通知管理员',
    REQUIRE_POST_METHOD: '使用POST方法！请通知管理员',
    SIGNERROR: '签名错误！请通知管理员',
    LACK_PARAMS: '缺少参数！请通知管理员',
    NOT_UTF8: '编码格式错误！请通知管理员',
    BUYER_MISMATCH: '支付账错误，不支持更换微信支付',
    APPID_NOT_EXIST: '参数错误！请通知管理员',
    OUT_TRADE_NO_USED: '订单号重复，请检查是否支付成功',
    APPID_MCHID_NOT_MATCH: '参数错误！请通知管理员'
};

/**
 * 撤销scanpay单据
 * @param {*} log 
 */
const reverseOrder = function (log, option) {
    let wxPay = option.wxPay;
    return new Promise(function (resolve) {
        let order = {
            out_trade_no: log.outTradeNo
        };
        wxPay.reverse(order, function (error, data) {
            if (error) {
                return resolve();
            }
            return resolve(data);
        });
    })
};

/**
 * 循环检查扫码付订单支付状态，如果超过指定次数撤销支付
 * @param {*} log 
 * @param {*} times 
 */
const loopCheckScanPayResult = function (log, {
    times,
    wxPay
}) {
    if (!times) {
        times = 0;
    }
    times++;
    let isContinue = false;
    return Promise.delay(SCAN_CHECK_DELAY_TIME)
        .then(function () {
            return queryOrder({
                outTradeNo: log.outTradeNo,
                source: log.source
            }, {
                wxPay
            })
        })
        .then(function (data) {
            if (data.status == 'PENDDING' && times < SCAN_LOOP_MAX_TIMES) {
                return loopCheckScanPayResult(log, {
                    times,
                    wxPay
                });
            } else if (data.status != 'PENDDING') {
                if (data.status == 'SUCCESS') {
                    log.payStatus = 1;
                    log.cashFee = data.cashFee;
                    log.bankType = data.bankType;
                    log.transactionId = data.transactionId;
                    log.timeEnd = data.timeEnd;
                } else {
                    log.payStatus = -1;
                    log.closed = 1;
                }
                return log.save()
                    .then(function () {
                        return paymentResult.sendMessage({
                            tradeRecordNo: log.outTradeNo,
                            status: log.payStatus == 1 && 'SUCCESS' || 'FAIL',
                            chunnel: 'WE_CHAT_PAY_CHANNEL'
                        })
                    })
            }
            isContinue = true;
            return reverseOrder(log, { wxPay });
        })
        .catch(function () {
            if (times < SCAN_LOOP_MAX_TIMES) {
                return loopCheckScanPayResult(log, { times, wxPay });
            }
            isContinue = true;
            return reverseOrder(log, { wxPay });
        })
        .then(function () {
            if (isContinue) {
                return loopCheckScanPayResult(log, { times: SCAN_LOOP_MAX_TIMES, wxPay });
            }
        })
};

/**
 * 计算付款过期时间
 * @param {*} timeExpire 
 */
const calcTimeExpire = function (timeExpire) {
    if (timeExpire) {
        timeExpire = moment(timeExpire, 'YYYYMMDDHHmmss');
        let diff = timeExpire.diff();
        // 差异时间小于5分钟时过期时间为5分钟
        if (diff < MIN_TIME_OUT) {
            timeExpire = moment().add(MIN_TIME_OUT, 'ms');
        } else if (diff > MAX_TIME_OUT) {
            timeExpire = moment().add(MAX_TIME_OUT, 'ms');
        }
    } else {
        timeExpire = moment().add(DEFAULT_TIME_OUT, 'ms');
    }
    return timeExpire;
};

/**
 * 查询订单方法
 * @param {*} params 
 */
const queryOrder = function ({ outTradeNo }, { wxPay }) {
    return wxPay
        .queryOrder({ out_trade_no: outTradeNo })
        .then((result) => {
            if (result.return_code != 'SUCCESS') {
                return Promise.reject({ message: result.return_msg });
            }
            if (result.result_code != 'SUCCESS') {
                if (result.err_code == 'ORDERNOTEXIST') {
                    return Promise.resolve({
                        status: 'FAIL',
                        message: '订单未提交！'
                    })
                } else {
                    return Promise.reject('微信系统错误！');
                }
            }
            let {
                //用户标识
                openid: openId,
                // 交易类型
                trade_type: tradeType,
                // 交易状态
                trade_state: tradeState,
                // 付款银行
                bank_type: bankType,
                //标价金额 --订单总金额，单位为分
                total_fee: totalFee,
                // 现金支付金额
                cash_fee: cashFee,
                // 微信支付订单号
                transaction_id: transactionId,
                // 商户订单号
                out_trade_no: outTradeNo,
                // 支付完成时间
                time_end: timeEnd,
                // 交易状态描述
                trade_state_desc: tradeStateDesc
            } = result;
            let data = {
                openId,
                tradeType,
                tradeState,
                bankType,
                totalFee,
                cashFee,
                transactionId,
                outTradeNo,
                timeEnd,
                tradeStateDesc
            };
            switch (tradeState) {
                case 'SUCCESS':
                    data.status = 'SUCCESS';
                    break;
                    // TODO 目前认为只有支付成功才可以退款，所有将其标记为成功
                case 'REFUND':
                    data.status = 'SUCCESS';
                    break;
                    // 用户取消支付关闭订单
                case 'NOTPAY':
                    data.status = 'FAIL';
                    break;
                    // 微信只有未支付的单据可以关闭 
                case 'CLOSED':
                    data.status = 'FAIL';
                    break;
                case 'REVOKED':
                    data.status = 'FAIL';
                    break;
                case 'USERPAYING':
                    data.status = 'PENDDING';
                    break;
                case 'PAYERROR':
                    data.status = 'FAIL';
                    break;
                default:
                    logger.error(outTradeNo + '支付状态异常：' + tradeState);
                    break;
            }
            return Promise.resolve(data);
        });
};

/**
 * 生成订单
 */
module.exports.create = function ({
    source,
    body,
    outTradeNo,
    orderId,
    fee,
    tradeType,
    noCredit,
    timeExpire,
    ip = SPBILL_CREATED_IP,
    openId,
    subMchId
}, {
    wxPay
}) {
    let appId;
    let nonceStr;
    let prepayId;
    let codeUrl;
    timeExpire = calcTimeExpire(timeExpire);
    //调用统一下单接口
    return WxTransactionLog.find({
            where: { outTradeNo: outTradeNo, closed: '0' }
        })
        // 生成预支付的参数
        .then(function (transactionLog) {
            if (transactionLog) {
                throw ('支付已创建，请勿重复支付');
            }
            let args = {
                body,
                out_trade_no: outTradeNo,
                total_fee: fee,
                spbill_create_ip: ip,
                notify_url: NOTIFY_URL,
                trade_type: tradeType,
                product_id: orderId,
                sub_mch_id: subMchId,
                attach: source,
                time_expire: moment(timeExpire).format('YYYYMMDDHHmmss')
            }
            if (openId) {
                args.openid = openId;
            }
            if (noCredit && noCredit == '1') {
                args.limit_pay = 'no_credit';
            }
            return wxPay.createUnifiedOrder(args);
        })
        // 对返回结果进行验签，同时判断是否创建成功
        // 如果创建成功写入数据库
        .then((data) => {
            if (data.return_code != 'SUCCESS' || data.result_code != 'SUCCESS') {
                let msg;
                if (data.return_code == 'FAIL') {
                    msg = data.return_msg;
                } else {
                    msg = `${data.err_code} : ${data.err_code_des}`
                }
                throw (msg);
            }
            let {
                mch_id: mchId
            } = data;
            appId = data.appid;
            nonceStr = data.nonce_str;
            codeUrl = data.code_url;
            prepayId = data.prepay_id;
            //生成交易记录
            return WxTransactionLog.create({
                appId,
                mchId,
                source,
                outTradeNo,
                fee,
                tradeType,
                totalFee: fee,
                productId: orderId,
                prepayId,
                codeUrl,
                payStatus: '0',
                closed: '0',
                timeExpire: moment(timeExpire).format('YYYY-MM-DD HH:mm:ss'),
                subMchId
            })
        })
        // 根据支付类型返回额外参数
        .then(() => {
            switch (tradeType) {
                // APP支付需要根据APPID等生成校验码
                case 'APP':
                    {
                        let data = wxPay.getAPPRequestParams({ nonceStr: nonceStr, prepayId: prepayId })
                        return {
                            appParams: data,
                            outTradeNo: outTradeNo //非常重要，外部系统查询都需要使用这个单号
                        }
                    }
                case 'NATIVE':
                    return {
                        nonceStr: nonceStr,
                        prepayId: prepayId,
                        codeUrl: codeUrl,
                        signType: 'MD5',
                        outTradeNo: outTradeNo //非常重要，外部系统查询都需要使用这个单号
                    }
                    // JSAPI同样需要对应的校验码，用以小程序和公众号支付
                case 'JSAPI':
                    {
                        let signStr = '';
                        let timeStamp = parseInt(Date.now() / 1000);
                        let data = {
                            appId: appId,
                            nonceStr,
                            timeStamp,
                            package: 'prepay_id=' + prepayId,
                            signType: 'MD5'
                        };
                        signStr = wxPay.sign(data);
                        return {
                            prepayId: prepayId,
                            mpParams: {
                                nonceStr: nonceStr,
                                package: data.package,
                                timeStamp: timeStamp,
                                signType: 'MD5',
                                signStr: signStr,
                                outTradeNo: outTradeNo //非常重要，外部系统查询都需要使用这个单号
                            }
                        }
                    }
            }
        })
};

/**
 * 条码支付
 */
module.exports.scanPay = function ({
    source,
    body,
    outTradeNo,
    orderId,
    fee,
    tradeType,
    noCredit,
    timeExpire,
    ip = SPBILL_CREATED_IP,
    authCode,
    deviceInfo,
    subMchId
}, {
    wxPay
}) {

    let {
        appid,
        mch_id: mchId
    } = wxPay.options;
    let log;
    timeExpire = calcTimeExpire(timeExpire);
    return WxTransactionLog.find({
            where: { outTradeNo: outTradeNo, closed: '0' }
        })
        .then(function (transactionLog) {
            if (transactionLog) {
                throw ('订单已提交支付！');
            } // 因为不是预支付，会直接扣费，所以先创建支付单再申请支付
            return WxTransactionLog.create({
                appId: appid,
                mchId: mchId,
                source: source,
                outTradeNo: outTradeNo,
                tradeType: 'SCAN',
                totalFee: fee,
                productId: orderId,
                payStatus: '0',
                closed: '0',
                timeExpire,
                deviceInfo,
                subMchId
            })
        })
        .then(function (data) {
            log = data;
            return wxPay.pay({
                limitPay: noCredit == '1' && 'no_credit' || '',
                source: source,
                outTradeNo: outTradeNo,
                tradeType: tradeType,
                totalFee: fee,
                ip: ip,
                payStatus: '0',
                closed: '0',
                authCode: authCode,
                body: body,
                subMchId,
                deviceInfo: deviceInfo
            })
        })
        .then((payResult) => {
            // 微信提交失败时返回支付失败，并标记为支付失败
            if (payResult.return_code != 'SUCCESS' || payResult.err_code in SCAN_PAY_CLEARLY_ERROR) {
                let message = payResult.return_msg;
                message = payResult.return_msg;
                if (payResult.err_code && payResult.err_code in SCAN_PAY_CLEARLY_ERROR) {
                    message = SCAN_PAY_CLEARLY_ERROR[payResult.err_code];
                }
                logger.error('支付失败，结果为' + JSON.stringify(payResult) + ' ' + message);
                return log.update({
                        payStatus: -1
                    })
                    .then(function () {
                        throw (message);
                    })
                    .catch(function (error) {
                        throw ((error.message && error.message || '') + ' ' + message);
                    })
            }
            // resultCode代表支付结果
            let payStatus = payResult.result_code == 'SUCCESS' ? 1 : 0;
            let {
                transaction_id: transactionId,
                cash_fee: cashFee,
                bank_type: bankType,
                time_end: timeEnd
            } = payResult;
            // 提交成功后记录支付结果信息
            return log.update({
                    payStatus: payStatus,
                    transactionId: transactionId,
                    cashFee: cashFee,
                    bankType: bankType,
                    timeEnd: timeEnd
                })
                .then(function () {
                    // 支付中循环检查支付的情况，获知支付情况后发送消息，同时同步返回支付中
                    if (payStatus == 0) {
                        loopCheckScanPayResult(log, {});
                    }
                    return ({
                        outTradeNo: outTradeNo,
                        status: payStatus == 1 ? 'SUCCESS' : 'PENDDING'
                    });
                })
                .catch(function (error) {
                    logger.error(error.message);
                    logger.error(error.stack);
                    logger.error(error.sql);
                    // 修改数据库失败也循环检查支付情况，获知支付情况后发送消息，同时同步返回支付中
                    loopCheckScanPayResult(log, {});
                    return {
                        outTradeNo: outTradeNo,
                        status: 'PENDDING'
                    }
                })
        })
};

/**
 * 查询支付订单
 */
module.exports.query = function ({ outTradeNo }, { wxPay }) {
    return queryOrder({ outTradeNo }, { wxPay });
};

/**
 * 关闭未支付的订单
 */
module.exports.close = function ({ outTradeNo }, { wxPay }) {
    return wxPay.closeOrder({ out_trade_no: outTradeNo })
        .then((result) => {
            if (result.return_code !== 'SUCCESS' || result.result_code !== 'SUCCESS') {
                if (result.return_code == 'FAIL') {
                    throw (result.return_msg);
                } else {
                    throw (`${result.err_code} : ${result.err_code_des}`);
                }
            }
            let resultMsg = result.result_msg;
            let sql = `update wx_transaction_log set closed='1' where outTradeNo='${outTradeNo}' and closed = '0'`;
            return db.query(sql)
                .then(function () {
                    return { message: resultMsg }
                })
        });
};

module.exports.notify = function ({
    msg
}, {
    wxPay
}) {
    if (!wxPay) {
        return Promise.resolve(NOTIFY_RESPONSE);
    }
    //验签结果
    let signCheck = wxPay.signCheck(msg, msg.sign);
    //logger.info('验签结果',signCheck);
    if (!signCheck) {
        throw ('sign check fail');
    }
    var returnCode = msg.return_code;
    var resultCode = msg.result_code;
    var transactionId = msg.transaction_id;
    var outTradeNo = msg.out_trade_no; //timestamp
    var timeEnd = msg.time_end;
    var cashFee = msg.cash_fee;
    var bankType = msg.bank_type;
    var openId = msg.openid;
    return WxTransactionLog.find({ //未关闭，未支付
            where: {
                outTradeNo: outTradeNo,
                payStatus: '0',
                closed: '0'
            }
        })
        .then(function (transactionLog) {
            if (!transactionLog) {
                throw NOTIFY_RESPONSE;
            }
            var closeStatus = returnCode == 'SUCCESS' && resultCode == 'SUCCESS' ? 0 : 1;
            var payStatus = returnCode == 'SUCCESS' && resultCode == 'SUCCESS' ? 1 : 0;
            //更新交易支付状态
            return transactionLog.update({
                transactionId: transactionId,
                timeEnd: timeEnd,
                cashFee: cashFee,
                bankType: bankType,
                payStatus: payStatus,
                closeStatus: closeStatus,
                openId: openId
            })
        })
        .then(function (data) {
            var payTime = timeEnd ? moment(timeEnd, 'YYYYMMDDHHmmss')
                .format('YYYY-MM-DD HH:mm:ss') : '';
            return paymentResult.sendMessage({
                tradeRecordNo: data.outTradeNo,
                cashFee: cashFee,
                payTime: payTime,
                status: data.payStatus === 1 && 'SUCCESS' || 'FAIL',
                chunnel: 'WE_CHAT_PAY_CHANNEL'
            })
        })
        .then(() => {
            return NOTIFY_RESPONSE;
        })
        .catch(function (error) {
            if (error !== NOTIFY_RESPONSE) {
                logger.error(error);
            }
            return NOTIFY_RESPONSE;
        })
}