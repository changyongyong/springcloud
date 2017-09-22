/**
 * Created by SEELE on 2017/6/30.
 */

const moment = require('moment');
const Promise = require('bluebird');
const sequelize = require('sequelize');
const request = require('request');

const AlipayConfig = global.AlipayConfig;

const {AliTransferLog, Ctcdb} = require('../../models/ctcdb');
const logger = require('../../utils/logger').Logger('router-alipay');
const alib = require('../../utils/alib.js');

const MAX_TRANS_COUNT = 999;
const MAX_TRANS_AMOUNT = 20000;

let transferPay = {};

//  转账
transferPay.transfer = (par, options)=> {
    let {
        source,
        outBizNo,
        payeeAccount,
        amount,
        payerShowName,
        payeeRealName,
        remark,
        sellerId,
        authToken
    } = par;

    let {
        aliPay
    } = options;

    let {
        appId,
        secretKey,
        sellerEmail: seller_email
    } = aliPay;

    if (parseFloat(amount) < 1) {
        return Promise.reject({
            status: -1,
            message: 'amount 格式不对, 必须大于1.00元'
        })
    }

    let app_id = appId;
    let method = 'alipay.fund.trans.toaccount.transfer';
    let charset = 'UTF-8';
    let sign_type = 'RSA';
    let timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
    let format = 'json';
    let version = '1.0';
    let biz_content = {
        out_biz_no: outBizNo,
        payee_type: 'ALIPAY_LOGONID',
        payee_account: payeeAccount,
        amount: amount,
        payer_show_name: payerShowName,
        payee_real_name: payeeRealName,
        remark: outBizNo + '|' + (remark || '')
    };
    //把请求参数打包成数组
    let sParaTemp = [];
    let sURL;
    let log;
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

    return AliTransferLog.findOne({
        where: { outBizNo: outBizNo }
    })
        .then((transferLog)=> {
            if (transferLog) {
                return Promise.reject({
                    status: -1,
                    message: '转账批次已存在'
                })
            }
            return AliTransferLog.findAll({
                where: {
                    payeeRealName: payeeRealName,
                    payeeAccount: payeeAccount,
                    createdAt: {
                        between: [moment().format('YYYY-MM-DD'), moment().add(1, 'd').format('YYYY-MM-DD')]
                    },
                    aliOrderId: { not: null },
                    payDate: { not: null }
                },
                attributes: [
                    [sequelize.fn('count', sequelize.col('id')), 't_count'],
                    [sequelize.fn('sum', sequelize.col('amount')), 't_amount']
                ],
                raw: true
                // 当日转账次数和总金额
            })
        })
        .then((result)=> {
            let t_count = result[0].t_count;
            let t_amount = result[0].t_amount || 0;
            if (t_count >= MAX_TRANS_COUNT) {
                return Promise.reject({
                    status: -1,
                    message: {
                        sub_code: 'DAILY_TRANSFER_TIMES_LIMIT',
                        sub_message: '单日转账最大次数限制：' + MAX_TRANS_COUNT
                    }
                })
            }
            if ((t_amount + parseFloat(amount)) > MAX_TRANS_AMOUNT) {
                return Promise.reject({
                    status: -1,
                    message: {
                        sub_code: 'DAILY_TRANSFER_FEE_LIMIT',
                        sub_message: '单日转账金额限制：' + MAX_TRANS_COUNT
                    }
                })
            }
            return AliTransferLog.create({
                outBizNo: outBizNo,
                payAccount: seller_email,
                payeeType: 'ALIPAY_LOGONID',
                payeeAccount: payeeAccount,
                amount: amount,
                source: source,
                payerShowName: payerShowName,
                payeeRealName: payeeRealName,
                remark: remark,
                sellerId: sellerId
            })
        })
        .then((data)=> {
            let checkResult;
            let result;
            log = data;
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
                            message: '向支付宝发起申请失败'
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
                    checkResult = alib.checkRSA(body.alipay_fund_trans_toaccount_transfer_response, body.sign);
                    if (!checkResult) {
                        return reject({
                            status: -1,
                            message: '解密验签失败'
                        })
                    }
                    result = body.alipay_fund_trans_toaccount_transfer_response;
                    resolve(result)
                })
            })
        })
        .then((result)=> {
            let sql;
            if (result.code === '10000') {
                let orderId = result.order_id;
                let payDate = result.pay_date;
                sql = 'update ali_transfer_log set aliOrderId="' +
                    orderId + '",payDate="' + payDate + '" where id=' + log.id;
                return Ctcdb.query(sql)
                    .then(()=> {
                        return {
                            outBizNo: outBizNo,
                            payDate: payDate,
                            amount: amount,
                            aliOrderId: orderId,
                            payeeAccount: payeeAccount,
                            payeeRealName: payeeRealName
                        }
                    })
                    .catch(function (error) {
                        return Promise.reject({
                            status: -1,
                            message: error
                        })
                    });
            } else {
                // 当转账失败时标记为转账失败
                sql = 'update ali_transfer_log set status=-1 where id=' + log.id;
                return Ctcdb.query(sql)
                    .catch(function (error) {
                        logger.error('标记转账失败失败' + JSON.stringify({
                                message: error.message,
                                stack: error.stack
                            }));
                    })
                    .then(function () {
                        return Promise.reject({
                            status: -1,
                            message: result
                        })
                    })
            }
        })
};

module.exports = transferPay;