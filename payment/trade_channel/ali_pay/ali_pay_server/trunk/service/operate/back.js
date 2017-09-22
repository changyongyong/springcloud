/**
 * Created by SEELE on 2017/6/29.
 */

const moment = require('moment');
const Promise = require('bluebird');
const request = require('request');
// const validator = require('validator');

const alib = require('../../utils/alib.js');
const logger = require('../../utils/logger').Logger('router-alipay');
const {AliTransactionLog, AliRefundLog, db} = require('../../models/ctcdb');

const AlipayConfig = global.AlipayConfig;

let backPay = {};

/**
 * 申请退款
 * @param par
 * @returns {*}
 */
backPay.refund = (par, options)=> {
    let {
        source,
        tradeNo,
        outTradeNo,
        outRefundNo,
        totalFee,
        refundFee,
        authToken
    } = par;

    let {
        aliPay
    } = options;

    let {
        appId,
        secretKey
    } = aliPay;

    let app_id = appId;
    let method = 'alipay.trade.refund';
    let charset = 'UTF-8';
    let sign_type = 'RSA';
    let timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
    let format = 'json';
    let version = '1.0';
    let biz_content = {
        out_trade_no: outTradeNo,
        trade_no: tradeNo,
        refund_amount: refundFee,
        out_request_no: outRefundNo
    };
    let sParaTemp = [];
    let sURL;
    let sellerId;
    if (parseFloat(refundFee) <= 0) {
        return Promise.reject({
            tag: 'error',
            status: -1,
            message: 'refundFee 格式不对'
        })
    }
    if (parseFloat(totalFee) <= 0) {
        return Promise.reject({
            tag: 'error',
            status: -1,
            message: 'totalFee 格式不对'
        })
    }
    if (parseFloat(refundFee) <= 0 || parseFloat(totalFee) <= 0 || parseFloat(refundFee) > parseFloat(totalFee)) {
        return Promise.reject({
            tag: 'error',
            status: -1,
            message: '退款金额大于总金额，无法退款'
        })
    }
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
    sParaTemp.push(['biz_content', JSON.stringify(biz_content)]);

    sURL = alib.getPath(AlipayConfig.ALIPAY_PATH, alib.buildRequestPara2(sParaTemp, source, secretKey));
    logger.info('sURL', AlipayConfig.APIHOST + sURL);

    return AliTransactionLog.find({
        where: { outTradeNo: outTradeNo, payStatus: '1', closed: '0' } // 未关闭，已支付完成
    })
        .then((transactionLog)=> {
            if (!transactionLog) {
                return Promise.reject({
                    tag: 'error',
                    status: -1,
                    message: '交易不存在，无法退款'
                })
            }
            let d = moment().add(-1, 'year').format('YYYY-MM-DD HH:mm:ss'); //TODO 不知道多少时间
            if (d >= transactionLog.gmtPayment) {
                return Promise.reject({
                    status: -1,
                    message: '交易已超过1年，无法退款'
                })
            }
            sellerId = transactionLog.sellerId;
            return AliRefundLog.findAll({
                where: { outTradeNo: outTradeNo}
            })
        })
        .then((refundLogs)=> {
            let checkResult;
            let result;
            if (refundLogs.length > 0) {
                if (refundLogs.length >= 2) {
                    return Promise.reject({
                        status: -1,
                        message: '退款次数限制，无法退款'
                    })
                } else if (refundLogs.length === 1){
                    let refundLog = refundLogs[0];
                    if ((parseFloat(refundFee) + parseFloat(refundLog.refundFee)) > parseFloat(totalFee)) {
                        return Promise.reject({
                            status: -1,
                            message: '多次退款金额大于总金额，无法退款'
                        })
                    }
                }
            }
            return new Promise((resolve, reject)=> {
                request({
                    url: AlipayConfig.APIHOST + sURL,
                    method: 'GET',
                    headers: {
                        'content-type': 'application/json'
                    }
                }, (error, response, body)=> {
                    if (error) {
                        return reject({
                            status: -1,
                            message: error
                        })
                    }
                    logger.info('支付宝返回内容:\n', body);
                    try {
                        body = JSON.parse(body);
                    }
                    catch (e) {
                        return reject({
                            status: -1,
                            message: e
                        })
                    }
                    checkResult = alib.checkRSA(body.alipay_trade_refund_response, body.sign);
                    if (!checkResult) {
                        return reject({
                            status: -1,
                            message: '验签不通过'
                        })
                    }
                    result = body.alipay_trade_refund_response;
                    if (result.code === '10000' && result.fund_change === 'Y') { //没有资金变化,不算一次退款
                        let tradeNo = result.trade_no; //支付宝交易号
                        let outTradeNo = result.out_trade_no; //	商户订单号
                        let buyerLogonId = result.buyer_logon_id; //用户的登录id
                        let fundChange = result.fund_change; //本次退款是否发生了资金变化
                        let refundFee = result.refund_fee; //退款总金额
                        let gmtRefundPay = result.gmt_refund_pay; //退款支付时间
                        resolve({
                            status: 'PENDDING',
                            tradeNo: tradeNo,
                            outTradeNo: outTradeNo,
                            outRefundNo: outRefundNo,
                            refundFee: refundFee,
                            totalFee: totalFee,
                            fundChange: fundChange,
                            gmtRefundPay: gmtRefundPay,
                            buyerLogonId: buyerLogonId,
                            source: source,
                            sellerId: sellerId
                        })
                    } else {
                        reject({
                            status: -1,
                            message: result
                        })
                    }
                })
            })
        })
        .then((data)=> {
            return AliRefundLog.create(data)
        })
        .then(()=> {
            return {
                outTradeNo: outTradeNo,
                outRefundNo: outRefundNo
            }
        })
};

/**
 * 关闭订单
 * @param par
 */
backPay.close = (par, options)=> {
    let {
        source,
        outTradeNo,
        tradeNo,
        operatorId
    } = par;

    let {
        aliPay
    } = options;

    let {
        appId,
        secretKey
    } = aliPay;

    let app_id = appId;
    let method = 'alipay.trade.close';
    let charset = 'UTF-8';
    let sign_type = 'RSA';
    let timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
    let format = 'json';
    let version = '1.0';
    let biz_content = {
        out_trade_no: outTradeNo,
        trade_no: tradeNo,
        operator_id: operatorId
    };
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
    return new Promise((resolve, reject)=> {
        request({
            url: AlipayConfig.APIHOST + sURL,
            method: 'GET',
            headers: {
                'content-type': 'application/json'
            }
        }, (error, response, body)=> {
            logger.info('支付宝返回内容:\n', body);
            if (error) {
                return reject({
                    status: -1,
                    message: '支付宝返回信息出错'
                })
            }
            try {
                body = JSON.parse(body)
            } catch (e) {
              return reject({
                  status: -1,
                  message: e
              })
            }
            let checkResult = alib.checkRSA(body.alipay_trade_close_response, body.sign);
            if (!checkResult) {
                return reject({
                    status: -1,
                    message: '获取验签信息失败'
                })
            }
            let result = body.alipay_trade_close_response;
            if (result.code === '10000') {
                let sql = 'update ali_transaction_log set ' +
                    'closed=\'1\' where outTradeNo=\'' + outTradeNo + '\' and closed = \'0\'';
                resolve(sql)
            } else {
                reject({
                    status: -1,
                    message: result
                })
            }
        })
    })
        .then((sql)=> {
            return db.query(sql, {nest: true})
        })
};

/**
 * 取消订单
 * @param par
 */
backPay.cancel = (par, options)=> {
    let {
        source,
        outTradeNo,
        tradeNo
    } = par;

    let {
        aliPay
    } = options;

    let {
        appId,
        secretKey
    } = aliPay;

    let app_id = appId;
    let method = 'alipay.trade.cancel';
    let charset = 'UTF-8';
    let sign_type = 'RSA';
    let timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
    let format = 'json';
    let version = '1.0';
    let biz_content = {
        out_trade_no: outTradeNo,
        trade_no: tradeNo
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
    return new Promise((resolve, reject)=> {
        request({
            url: AlipayConfig.APIHOST + sURL,
            method: 'GET',
            headers: {
                'content-type': 'application/json'
            }
        }, (error, response, body) => {
            if (error) {
                return reject({
                    status: -1,
                    message: '获取支付宝结果失败'
                })
            }
            try {
                body = JSON.parse(body)
            } catch (e) {
                return reject({
                    status: -1,
                    message: e
                })
            }
            let checkResult = alib.checkRSA(body.alipay_trade_cancel_response, body.sign);
            if (!checkResult) {
                return reject({
                    status: -1,
                    message: '解密验签失败'
                })
            }
            let result = body.alipay_trade_cancel_response;
            if (result.code === '10000') {
                return resolve({
                    tag: 'success',
                    status: 1,
                    message: '撤销订单成功'
                })
            } else {
                return reject({
                    tag: 'error',
                    status: -1,
                    message: result
                })
            }
        })
    })
};

module.exports = backPay;