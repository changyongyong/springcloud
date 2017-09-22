/**
 * Created by SEELE on 2017/6/30.
 */
const Promise = require('bluebird');
const moment = require('moment');
const request = require('request');

const {AliTransactionLog, AliRefundLog, AliTransferLog} = require('../../models/ctcdb');

const commonService = require('../common/check');
const alib = require('../../utils/alib.js');
const logger = require('../../utils/logger').Logger('router-alipay');
const TRADE_CHANNEL = 'ALI_PAY';

const AlipayConfig = global.AlipayConfig;

let queryPay = {};

/**
 * 从本地查询交易记录 --- 本地交易记录会出现：1个订单出现多个交易记录，只有一个交易记录未关闭，其他应该都已经关闭
 * @param par
 */
queryPay.queryTrx = (par)=> {
    let {
        orderId
    } = par;

    //未关闭的所有交易 --  paystatus为1的是支付成功的
    return AliTransactionLog.find({
        where: { outTradeNo: orderId, closed: '0' }
    }).then(function (transactionLog) {
        if (!transactionLog) {
            return Promise.reject({
                status: -1,
                message: '没有打开的交易信息'
            })
        }
        return Promise.resolve(transactionLog)
    })
};

/**
 *
 * @param par
 */
queryPay.queryOrder = (par, options)=> {

    return commonService.queryOrder(par, options)
};

/**
 * 退款查询
 * @param par
 */
queryPay.refund = (par, options) => {
    let {
        source,
        outTradeNo,
        tradeNo,
        outRefundNo,
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
    let method = 'alipay.trade.fastpay.refund.query';
    let charset = 'UTF-8';
    let sign_type = 'RSA';
    let timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
    let format = 'json';
    let version = '1.0';
    let biz_content = {
        out_trade_no: outTradeNo,
        trade_no: tradeNo,
        out_request_no: outRefundNo
    };
    let sParaTemp = [];
    let sURL;
    if (authToken) {
        sParaTemp.push(['app_auth_token', authToken])
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
        },(error, response, body)=> {
            if (error) {
                return reject({
                    status: -1,
                    message: '获取支付宝退款信息失败'
                })
            }
            try {
                body = JSON.parse(body);
            } catch (e) {
                return reject({
                    status: -1,
                    message: e
                })
            }
            let checkResult = alib.checkRSA(body.alipay_trade_fastpay_refund_query_response, body.sign);
            if (!checkResult) {
                return reject({
                    status: -1,
                    message: '获取验签信息失败'
                })
            }
            let result = body.alipay_trade_fastpay_refund_query_response;
            if (result.code === '10000') {
                let tradeNo = result.trade_no; //	支付宝交易号
                let outTradeNo = result.out_trade_no; //商户订单号
                let outRefundNo = result.out_request_no; //本笔退款对应的退款请求号
                let totalAmount = result.total_amount; //该笔退款所对应的交易的订单金额
                let refundAmount = result.refund_amount; //本次退款请求，对应的退款金额
                let fundChange = result.fund_change;
                return resolve({
                    tradeNo: tradeNo,
                    outTradeNo: outTradeNo,
                    outRefundNo: outRefundNo,
                    totalAmount: totalAmount,
                    refundAmount: refundAmount,
                    fundChange: fundChange
                })
            } else {
                return reject({
                    status: -1,
                    message: result
                })
            }
        })
    })
};

/**
 * 转账查询
 * @param par
 */
queryPay.transfer = (par, options)=> {
    let {
        source,
        outBizNo,
        aliOrderId,
        sellerId,
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
    let method = 'alipay.fund.trans.order.query';
    let charset = 'UTF-8';
    let sign_type = 'RSA';
    let timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
    let format = 'json';
    let version = '1.0';
    let biz_content = {
        out_biz_no: outBizNo,
        order_id: aliOrderId
    };
    let sParaTemp = [];
    let sURL;
    if (sellerId) {
        biz_content.seller_id = sellerId
    }
    if (authToken) {
        sParaTemp.push(['app_auth_token', authToken])
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
        }, function (error, response, body) {
            if (error) {
                return reject({
                    status: -1,
                    message: '获取支付宝转账信息失败'
                })
            }
            try {
                body = JSON.parse(body);
            } catch (e) {
                return reject({
                    status: -1,
                    message: e
                })
            }
            let checkResult = alib.checkRSA(body.alipay_fund_trans_order_query_response, body.sign);
            if (!checkResult) {
                return reject({
                    status: -1,
                    message: '获取验签信息失败'
                })
            }
            let result = body.alipay_fund_trans_order_query_response;
            if (result.code === '10000') {
                let orderId = result.order_id;
                let status = result.status;
                let payDate = result.pay_date;
                let failReason = result.fail_reason;
                let errorCode = result.error_code;
                return resolve({
                    outBizNo: outBizNo,
                    aliOrderId: orderId,
                    status: status,
                    payDate: payDate,
                    //orderFee: orderFee,
                    //arrivalTimeEnd: arrivalTimeEnd,
                    failReason: failReason,
                    errorCode: errorCode
                })
            } else {
                return reject({
                    status: -1,
                    message: result
                })
            }
        })
    })
};

/**
 * 账单查询
 * @param par
 */
queryPay.bill = (par, options)=> {
    let {
        source,
        billDate,
        billType,
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
    let method = 'alipay.data.dataservice.bill.downloadurl.query';
    let charset = 'utf-8';
    let sign_type = 'RSA';
    let timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
    let format = 'json';
    let version = '1.0';
    let biz_content = {
        bill_type: billType,
        bill_date: billDate
    };
    //把请求参数打包成数组
    let sParaTemp = [];
    let sURL;

    if (authToken) {
        sParaTemp.push(['app_auth_token', authToken])
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
            if (error) {
                return reject({
                    status: -1,
                    message: '获取支付宝账单信息失败'
                })
            }
            try {
                body = JSON.parse(body);
            } catch (e) {
                return reject({
                    status: -1,
                    message: e
                })
            }
            let checkResult = alib.checkRSA(body.alipay_data_dataservice_bill_downloadurl_query_response, body.sign);
            if (!checkResult) {
                return reject({
                    status: -1,
                    message: '获取验签信息失败'
                })
            }
            let result = body.alipay_data_dataservice_bill_downloadurl_query_response;
            if (result.code === '10000') {
                let billDownloadUrl = result.bill_download_url;
                return resolve({
                    billDownloadUrl: billDownloadUrl
                })
            } else {
                return reject({
                    status: -1,
                    message: result
                })
            }
        })
    })
};

/**
 * 查询对账记录
 * @param par
 */
queryPay.record = (par)=> {
    let {
        date,
        type
    } = par;
    let where = {
        $and: []
    };
    let model;
    let formatter;
    let startTime = moment(date).format('YYYY-MM-DD HH:mm:ss');
    let endTime = moment(date).add('1', 'd').format('YYYY-MM-DD HH:mm:ss');
    where.$and.push({
        createdAt: {
            $gte: startTime,
            $lt: endTime
        }
    });

    switch (type) {
        case 'payment':
            model = AliTransactionLog;
            formatter = paymentLogFormatter;
            break;
        case 'refund':
            model = AliRefundLog;
            formatter = refundLogFormatter;
            break;
        case 'transfer':
            model = AliTransferLog;
            formatter = transferLogFormatter;
            break;
        default:
            return Promise.reject({
                status: -1,
                message: '没有对应的类型'
            });
    }

    return model.findAll({
        where: where
    })
        .then(function (recordList) {
            let results = [];
            let i;
            for (i = 0; i < recordList.length; i++) {
                results.push(formatter(recordList[i]));
            }
            return Promise.resolve(results);
        })
};


/**
 * 付款记录格式化
 * @param {*} log
 */
function paymentLogFormatter(log) {
    let result = {
        tradeRecordNo: log.outTradeNo,
        source: log.source,
        fee: log.totalFee.toFixed(2),
        tradeChannel: TRADE_CHANNEL,
        status: 'PENDDING',
        type: 'payment',
        validateStatus: log.validateStatus,
        error: log.error
    };
    // 已付款状态为成功
    if (log.payStatus == 1) {
        result.status = 'SUCCESS'
    }
    // 已关闭状态为已失败
    if (log.closed == 1) {
        result.status = 'FAIL';
    }
    return result;
}

/**
 * 退款记录格式
 * @param {*} log
 */
function refundLogFormatter(log) {
    return {
        tradeRecordNo: log.outRefundNo,
        source: log.source,
        // 退款返回退款金额
        fee: log.refundFee.toFixed(2),
        tradeChannel: TRADE_CHANNEL,
        status: log.status,
        type: 'refund',
        validateStatus: log.validateStatus,
        error: log.error
    };
}

/**
 * 转账记录格式化
 * @param {*} log
 */
function transferLogFormatter(log) {
    return {
        tradeRecordNo: log.outBizNo,
        source: log.source,
        fee: log.amount.toFixed(2),
        tradeChannel: TRADE_CHANNEL,
        //状态为-1时为转账失败
        status: log.status == -1 ? 'FAIL' : 'SUCCESS',
        type: 'transfer',
        validateStatus: log.validateStatus,
        error: log.error
    };
}

module.exports = queryPay;