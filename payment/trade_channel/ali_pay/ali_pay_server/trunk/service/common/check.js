/**
 * Created by SEELE on 2017/6/28.
 */

const Promise = require('bluebird');
const moment = require('moment');
const request = require('request');

const AlipayConfig = global.AlipayConfig;

const logger = require('../../utils/logger').Logger('router-alipay');
const alib = require('../../utils/alib.js');
const publishers = require('../../mq/publisher');
const paymentResult = publishers.paymentResult;

const SCAN_CHECK_DELAY_TIME = 5000;
const SCAN_LOOP_MAX_TIMES = 4;

/**
 * 结果检查
 * @param log
 * @param times
 * @returns {Promise.<TResult>}
 */
const loopCheck = (log, times, options)=> {
    if (!times) {
        times = 0;
    }
    times++;
    let isContinue = false;
    return Promise.delay(SCAN_CHECK_DELAY_TIME)
        .then(()=> {
            return queryOrder({
                outTradeNo: log.outTradeNo,
                source: log.source
            }, options);
        })
        .then((data)=> {
            if (data.status === 'PENDDING' && times < SCAN_LOOP_MAX_TIMES) {
                return loopCheck(log, times, options);
            } else if (data.status !== 'PENDDING') {
                if (data.status === 'SUCCESS') {
                    log.payStatus = 1;
                    log.gmtPayment = data.gmtPayment;
                    log.buyerId = data.buyerId;
                    log.buyerLogonId = data.buyerLogonId;
                    log.tradeNo = data.tradeNo;
                    log.tradeStatus = data.tradeStatus;
                    // log.sellerId = data.sellerId;
                } else {
                    log.payStatus = -1;
                    log.closed = 1;
                }
                return log.save()
                    .then(()=> {
                        return paymentResult.sendMessage({
                            tradeRecordNo: log.outTradeNo,
                            status: log.payStatus === 1 && 'SUCCESS' || 'FAIL',
                            chunnel: 'WE_CHAT_PAY_CHANNEL'
                        })
                    })
            }
            isContinue = true;
            return reverseOrder(log);
        })
        .catch(()=> {
            if (times < SCAN_LOOP_MAX_TIMES) {
                return loopCheck(log, times, options);
            }
            isContinue = true;
            return reverseOrder(log);
        })
        .then(()=> {
            if (isContinue) {
                return loopCheck(log, SCAN_LOOP_MAX_TIMES, options);
            }
        })
};

/**
 * 查询支付订单
 * @param params
 * @returns {*}
 */
const queryOrder = (params, options)=> {

    let {
        source,
        outTradeNo,

    } = params;

    let {
        aliPay
    } = options;

    let {
        appId,
        secretKey
    } = aliPay;

    let app_id = appId;
    let method = 'alipay.trade.query';
    let charset = 'UTF-8';
    let sign_type = 'RSA';
    let timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
    let format = 'json';
    let version = '1.0';
    let biz_content = {
        out_trade_no: outTradeNo
    };
    //把请求参数打包成数组
    let sParaTemp = [];
    let sURL;
    if (!outTradeNo) {
        return Promise.reject({
            message: '缺少outTradeNo'
        })
    }


    sParaTemp.push(['app_id', app_id]);
    sParaTemp.push(['method', method]);
    sParaTemp.push(['charset', charset]);
    sParaTemp.push(['sign_type', sign_type]);
    sParaTemp.push(['timestamp', timestamp]);
    sParaTemp.push(['format', format]);
    sParaTemp.push(['version', version]);
    sParaTemp.push(['biz_content', JSON.stringify(biz_content)]);

    sURL = alib.getPath(AlipayConfig.ALIPAY_PATH, alib.buildRequestPara2(sParaTemp, source, secretKey));
    logger.info('sURL', AlipayConfig.APIHOST + sURL);

    return new Promise((resolve, reject)=> {
        request({
            url: AlipayConfig.APIHOST + sURL,
            method: 'GET',
            headers: {
                'content-type': 'application/json'
            }
        }, (error, response, body)=> {
            logger.info('查询支付结果-支付宝返回内容:\n', body);
            if (error) {
                return reject(error)
            }
            try {
                body = JSON.parse(body);
            } catch (error) {
                return reject({
                    message: error
                })
            }
            let checkResult = alib.checkRSA(body.alipay_trade_query_response, body.sign);
            let result = body.alipay_trade_query_response;
            let data;
            let resError;

            if (!checkResult) {
                return reject({ message: '支付宝结果校验失败！' });
            }

            switch (result.code) {
                case '40004':
                {
                    switch (result.sub_code) {
                        case 'ACQ.SYSTEM_ERROR':
                            resError = '支付宝繁忙，请重试';
                            break;
                        case 'ACQ.INVALID_PARAMETER':
                            resError = '参数错误';
                            break;
                        case 'ACQ.TRADE_NOT_EXIST':
                            data = {
                                status: 'FAIL',
                                message: '没有对应的交易'
                            };
                            break;
                    }
                    break;
                }
                //不同于支付，当查询被block时返回状态为处理中，后续重新查询
                case '20000':
                    resError = '支付宝繁忙，请重试';
                    break;
                case '10000':
                {
                    data = {
                        outTradeNo: outTradeNo,
                        tradeNo: result.trade_no,
                        buyerLogonId: result.buyer_logon_id,
                        totalAmount: result.total_amount,
                        receiptAmount: result.receipt_amount,
                        buyerPayAmount: result.buyer_pay_amount,
                        sendPayDate: result.send_pay_date,
                        buyerUserId: result.buyer_user_id,
                        gmtPayment: result.gmt_payment,
                        tradeStatus: result.trade_status
                    };
                    switch (result.trade_status) {
                        case 'WAIT_BUYER_PAY':
                            data.status = 'PENDDING';
                            break;
                        // 未付款交易结束或交易完成后全额退款
                        case 'TRADE_CLOSED':
                            data.status = 'CLOSED';
                            break;
                        case 'TRADE_SUCCESS':
                            data.status = 'SUCCESS';
                            break;
                        //  目前不存在交易结束，交易结束时不可退款
                        // case 'TRADE_FINISHED':
                        //     data.status
                        default:
                            resError = '支付状态异常！';
                            logger.error('查询订单状态异常！返回结果:' + JSON.stringify(result));
                    }
                    break;
                }
                default:
                    resError = '支付宝结果为：' + result.code + '-' + result.msg +
                        ' 二级消息为：' + result.sub_code + '-' + result.message;
                    logger.error('查询订单状态异常！返回结果:' + JSON.stringify(result));
                    break;
            }
            if (resError) {
                return reject({ message: resError })
            }
            return resolve(data);
        })
    })
};

/**
 * 撤销支付订单
 * @param log
 * @returns {*|bluebird}
 */
const reverseOrder = function (log, options) {

    let {
        aliPay
    } = options;

    let {
        appId,
        secretKey
    } = aliPay;


    let source = log.source;
    let app_id = appId;
    let method = 'alipay.trade.cancel';
    let charset = 'UTF-8';
    let sign_type = 'RSA';
    let timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
    let format = 'json';
    let version = '1.0';
    let outTradeNo = log.outTradeNo;
    let biz_content = {
        out_trade_no: outTradeNo
    };
    //把请求参数打包成数组
    let sParaTemp = [];
    let sURL;
    sParaTemp.push(['app_id', app_id]);
    sParaTemp.push(['method', method]);
    sParaTemp.push(['charset', charset]);
    sParaTemp.push(['sign_type', sign_type]);
    sParaTemp.push(['timestamp', timestamp]);
    sParaTemp.push(['format', format]);
    sParaTemp.push(['version', version]);
    sParaTemp.push(['biz_content', JSON.stringify(biz_content)]);

    sURL = alib.getPath(AlipayConfig.ALIPAY_PATH, alib.buildRequestPara2(sParaTemp, source, secretKey));

    logger.info('sURL', AlipayConfig.APIHOST + sURL);
    return new Promise(function (resolve) {
        request({
            url: AlipayConfig.APIHOST + sURL,
            method: 'GET',
            headers: {
                'content-type': 'application/json'
            }
        }, function (error, response, body) {
            logger.info(body);
            return resolve();
        })
    })
};

module.exports = {
    loopCheck: loopCheck,
    queryOrder: queryOrder
};