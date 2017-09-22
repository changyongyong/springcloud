'use strict';

/**
* @author wdq
* @description 用以外网访问的地址，与内网地址不同 
*/

const express = require('express');
const router = express.Router();
const ctc_db = require('../models/ctcdb');
const AliTransactionLog = ctc_db.AliTransactionLog;
const logger = require('../utils/logger').Logger('router-alipay');
const publishers = require('../mq/publisher');
const paymentResult = publishers.paymentResult;
const alib = require('../utils/alib.js');
const server = require('../service');


//异步通知回调 -- APP支付的 | 及时到账 | 当面扫码付
router.post('/notify', function (req, res) {
    //获取支付宝的通知返回参数，可参考技术文档中页面跳转同步通知参数列表(以下仅供参考)
    let params = req.body;
    let tradeNo = req.body.trade_no; //支付宝交易号
    let outTradeNo = req.body.out_trade_no; //获取订单号
    let totalFee = req.body.total_amount; //订单金额
    //var receiptAmount = req.body.receipt_amount;//实收金额
    let buyerPayAmount = req.body.buyer_pay_amount; //付款金额
    //var fundChannel = req.body.fundChannel;//支付方式
    let gmtPayment = req.body.gmt_payment; //交易付款时间
    let gmtClose = req.body.gmt_close; //交易结束时间
    let buyerId = req.body.buyer_id; //买家支付宝用户号
    let buyerLogonId = req.body.buyer_logon_id;
    // let sellerId = req.body.seller_id; //卖家支付宝用户号
    let sellerEmail = req.body.seller_email; //卖家支付宝账号
    let tradeStatus = req.body.trade_status; //交易状态
    //获取支付宝的通知返回参数，可参考技术文档中页面跳转同步通知参数列表(以上仅供参考)//
    let result = alib.verifySign(params);
    if (result) {
        //——请根据您的业务逻辑来编写程序（以下代码仅作参考）——
        if (tradeStatus === 'TRADE_FINISHED' || tradeStatus === 'TRADE_SUCCESS') { //TRADE_SUCCESS
            AliTransactionLog.findOne({ //未关闭，未支付
                where: { outTradeNo: outTradeNo, payStatus: '0', closed: '0', tradeType: {$ne: 'SCAN'} }
            }).then(function (transactionLog) {
                if (transactionLog) {
                    //更新交易支付状态
                    transactionLog.update({
                            buyerPayAmount: buyerPayAmount,
                            gmtPayment: gmtPayment,
                            gmtClose: gmtClose,
                            buyerId: buyerId,
                            buyerLogonId: buyerLogonId,
                            // sellerId: sellerId,  //自营的不记录sellerId
                            sellerEmail: sellerEmail,
                            cashFee: totalFee,
                            tradeStatus: tradeStatus,
                            tradeNo: tradeNo,
                            payStatus: '1'
                        })
                        .then(function () {
                            return paymentResult.sendMessage({
                                tradeRecordNo: transactionLog.outTradeNo,
                                status: 'SUCCESS',
                                chunnel: 'ALI_PAY_CHANNEL'
                            })
                        })
                        .catch(function (error) {
                            logger.error(error);
                        });
                }
            }).catch(function (error) {
                logger.error(error);
            })
        } else if (tradeStatus === 'TRADE_CLOSED') {
            AliTransactionLog.findOne({ //未关闭，未支付
                where: { outTradeNo: outTradeNo, payStatus: '0', closed: '0', tradeType: {$ne: 'SCAN'} }
            }).then(function (transactionLog) {
                if (transactionLog) {
                    //更新交易支付状态
                    transactionLog.update({
                            buyerPayAmount: buyerPayAmount,
                            gmtPayment: gmtPayment,
                            gmtClose: gmtClose,
                            buyerId: buyerId,
                            buyerLogonId: buyerLogonId,
                            // sellerId: sellerId,  //自营的不记录sellerId
                            sellerEmail: sellerEmail,
                            cashFee: totalFee,
                            tradeStatus: tradeStatus,
                            tradeNo: tradeNo,
                            //payStatus: '-1',
                            closed: '1'
                        })
                        .then(function () {
                            return paymentResult.sendMessage({
                                tradeRecordNo: transactionLog.outTradeNo,
                                status: 'FAIL',
                                chunnel: 'ALI_PAY_CHANNEL'
                            })
                        })
                        .catch(function (error) {
                            logger.error(error);
                        });
                }
            }).catch(function (error) {
                logger.error(error);
            })
        }
        logger.info('success');
        res.end('success');
    } else {
        logger.info('fail');
        res.end('fail');
    }
});

//  授权url回调
router.get('/thirdAuth', (req, res)=> {
    server.auth.third(req.query)
        .then(()=> {
            res.json({
                status: 1
            })
        })
        .catch((error)=> {
            logger.error(error);
            res.json({
                status: -1,
                message: '存储授权信息失败'
            })
        })
});

module.exports = router;