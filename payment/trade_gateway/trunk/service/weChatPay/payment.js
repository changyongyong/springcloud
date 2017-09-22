'use strict';

const PaymentRecord = require('../paymentRecord');
const {
    WeChatPay
} = require('../../tradeChannel');
const CHANNEL = 'WE_CHAT_PAY';
const SCAN_PAY_TYPE = 'SCAN_PAY'

let Payment = {};

Payment.create = function (par, options) {
    let {
        fee,
        openId,
        orderType,
        orderId,
        system,
        tradeType,
        remark,
        body,
        spbillCreateIp,
        noCredit,
        tradePrincipal,
        timeExpire
    } = par;
    let {
        operateLogNo,
        merchant
    } = options;
    const {
        id: accountMerchantId,
        tradeMerchantNo,
        source,
        merchantConfigId
    } = merchant;
    let record;
    return PaymentRecord.create({
            fee,
            operateLogNo,
            orderType,
            orderId,
            tradeChannel: `${CHANNEL}_${tradeType}`,
            remark,
            system,
            source,
            body,
            spbillCreateIp,
            tradePrincipal,
            accountMerchantId,
            merchantConfigId,
            tradeMerchantNo
        }, options)
        .then((data) => {
            record = data;
            return WeChatPay.create({
                fee,
                // 使用交易流水号作为退款标识
                tradeRecordNo: record.tradeRecordNo,
                // orderType-orderId 类型加单号用以显示
                orderId,
                source,
                openId,
                orderType,
                tradeType,
                body,
                spbillCreateIp,
                noCredit,
                timeExpire,
                tradePrincipal,
                tradeMerchantNo
            }, options);
        })
        .then(data => {
            if (tradeType == 'APP') {
                return {
                    tradeRecordNo: record.tradeRecordNo,
                    appParams: data.appParams
                }
            } else if (tradeType == 'NATIVE') {
                return {
                    tradeRecordNo: record.tradeRecordNo,
                    codeUrl: data.codeUrl,
                    prepayId: data.prepayId
                }
            } else {
                data.tradeRecordNo = record.tradeRecordNo;
                return data;
            }
        })
};

/**
 * 扫码付
 */
Payment.scanPay = function (par, options) {
    let {
        fee,
        orderType,
        orderId,
        system,
        remark,
        body,
        spbillCreateIp,
        noCredit,
        timeExpire,
        tradePrincipal,
        authCode
    } = par;
    let {
        operateLogNo,
        merchant
    } = options;
    const {
        id: accountMerchantId,
        tradeMerchantNo,
        source,
        merchantConfigId
    } = merchant;
    let record;
    return PaymentRecord.create({
            fee,
            operateLogNo,
            orderType,
            orderId,
            tradeChannel: `${CHANNEL}_${SCAN_PAY_TYPE}`,
            remark,
            system,
            source,
            body,
            spbillCreateIp,
            tradePrincipal,
            subject: body,
            accountMerchantId,
            merchantConfigId,
            tradeMerchantNo
        }, options)
        .then((data) => {
            record = data;
            return WeChatPay.scanPay({
                fee,
                // 使用交易流水号作为退款标识
                tradeRecordNo: record.tradeRecordNo,
                // orderType-orderId 类型加单号用以显示
                orderId,
                source,
                orderType,
                body,
                spbillCreateIp,
                noCredit,
                timeExpire,
                authCode,
                tradePrincipal,
                subject: body,
                tradeMerchantNo
            }, options);
        })
        .then((data) => {
            let status = data.status;
            if (status != 'SUCCESS') {
                return {
                    status: data.status
                }
            }
            return record.update({
                    status: 'SUCCESS'
                }, {
                    transaction: options.transaction
                })
                .then(() => {
                    return {
                        status: data.status
                    }
                })
        })
        .then(data => {
            return {
                tradeRecordNo: record.tradeRecordNo,
                status: data.status
            }
        })
};

module.exports = Payment;