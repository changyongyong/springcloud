'use strict';

const PaymentRecord = require('../paymentRecord');
const {
    AliPay
} = require('../../tradeChannel');
const CHANNEL = 'ALI_PAY';
const SCAN_PAY_TYPE = 'SCAN_PAY'

let Payment = {};

Payment.create = function (par, options) {
    let {
        fee,
        orderType,
        orderId,
        system,
        tradeType,
        remark,
        body,
        // 禁止使用信用卡
        noCredit,
        // 过期时间，最小1分钟
        timeExpire,
        // 标题
        subject,
        // 交易主体，用以区分不同的业务
        tradePrincipal
    } = par;
    let {
        operateLogNo,
        merchant
    } = options;
    const {
        id: accountMerchantId,
        source,
        tradeMerchantNo,
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
            tradePrincipal,
            system,
            accountMerchantId,
            source,
            merchantConfigId,
            tradeMerchantNo
        }, options)
        .then((data) => {
            let args = {
                fee,
                body,
                orderId: data.tradeRecordNo,
                noCredit,
                timeExpire,
                subject,
                tradePrincipal,
                tradeMerchantNo,
                source
            }
            record = data;
            switch (tradeType) {
                case 'APP':
                    return AliPay.appCreate(args)
                        .then((data) => {
                            return {
                                codeUrl: data.sURL
                            }
                        });
                case 'UNION':
                    return AliPay.create(args)
                        .then((data) => {
                            return {
                                codeUrl: data.codeUrl
                            }
                        });

            }
        })
        .then((data) => {
            data.tradeRecordNo = record.tradeRecordNo;
            return data;
        })
};

Payment.scanPay = function (par, options) {
    let {
        fee,
        orderType,
        orderId,
        system,
        remark,
        body,
        // 是否禁止使用信用卡 1 禁止，2 不禁止
        noCredit,
        // 过期时间，最小1分钟
        timeExpire,
        // 标题
        subject,
        // 交易主体，用以区分不同的业务
        tradePrincipal,
        // 校验码
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
            tradePrincipal,
            system,
            source,
            accountMerchantId,
            merchantConfigId,
            tradeMerchantNo
        }, options)
        .then((data) => {
            let args = {
                fee,
                body,
                orderId: data.tradeRecordNo,
                noCredit,
                timeExpire,
                subject,
                tradePrincipal,
                authCode,
                source,
                tradeMerchantNo
            }
            record = data;
            return AliPay.scanPay(args);
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
        .then((data) => {
            data.tradeRecordNo = record.tradeRecordNo;
            return data;
        })
};

module.exports = Payment;