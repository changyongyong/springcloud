'use strict'

/**
 * @author WXP
 * @description 退款相关
 */


const moment = require('moment');
const { WxTransactionLog, WxRefundLog } = require('../models/wxdb');
const STATUS_PENDDING = 'PENDDING';

/**
 * 发起退款
 */
module.exports.refund = function ({
    // 付款订单号
    outTradeNo,
    // 退款单号
    outRefundNo,
    totalFee,
    refundFee,
    subMchId,
    source
}, { wxPay }) {
    let opUserId = wxPay.options.mch_id;
    let transaction;
    return WxTransactionLog.findOne({
            where: {
                outTradeNo: outTradeNo,
                payStatus: '1',
                closed: '0'
            } // 未关闭，已支付完成
        })
        .then(function (data) {
            transaction = data;
            if (!transaction) {
                throw ('没有对应的付款单！');
            }
            if (moment().diff(transaction.timeEnd, 'month') > 12) {
                throw ('订单超过一年，无法退款');
            }
            return WxRefundLog.findAll({
                    where: { outTradeNo: outTradeNo }
                })
                .then((refundLogs) => {
                    // 当没有记录时返回
                    if (!refundLogs.length) {
                        return;
                    }
                    //退款不能超过2次
                    if (refundLogs.length >= 2) {
                        throw ('退款次数限制，无法退款');
                    }
                    // 仅有一次退款时判断是否超量退款
                    let refundLog = refundLogs[0];
                    console.log(refundFee)
                    console.log(refundLog.refundFee)
                    console.log(totalFee)
                    if ((parseInt(refundFee) + parseInt(refundLog.refundFee)) > parseInt(totalFee)) {
                        throw ('多次退款金额大于总金额，无法退款');
                    }
                })
        })
        // 调用退款接口
        .then(function () {
            let query = {
                out_trade_no: outTradeNo,
                out_refund_no: outRefundNo,
                total_fee: totalFee,
                refund_fee: refundFee,
                op_user_id: opUserId,
                sub_mch_id: subMchId
            };
            return wxPay.refund(query)
                .then((result) => {
                    if (result.return_code == 'SUCCESS' && result.result_code == 'SUCCESS') {
                        return result;
                    }
                    if (result.return_code == 'FAIL') {
                        throw (result.return_msg);
                    } else {
                        throw (`${result.err_code} : ${result.err_code_des}`);
                    }
                })
        })
        // 退款成功后生成对应的退款记录
        .then((result) => {
            let {
                appid: appId,
                mch_id: mchId,
                transaction_id: transactionId,
                out_trade_no: outTradeNo,
                out_refund_no: outRefundNo,
                refund_id: refundId,
                refund_fee: refundFee,
                total_fee: totalFee,
                cash_fee: cashFee,
                sub_mch_id: subMchId
            } = result;
            //生成退款记录
            return WxRefundLog.create({
                    appId,
                    mchId,
                    transactionId,
                    outTradeNo,
                    outRefundNo,
                    refundId,
                    refundFee,
                    totalFee,
                    cashFee,
                    source,
                    subMchId,
                    status: STATUS_PENDDING
                })
                .then(function () {
                    return {
                        refundId,
                        outTradeNo,
                        outRefundNo
                    }
                })
        });
};

/**
 * 退款查询
 */
module.exports.query = function ({
    outRefundNo,
    subMchId
}, { wxPay }) {
    let query = {
        out_refund_no: outRefundNo,
        sub_mch_id: subMchId
    };
    return wxPay.refundQuery(query)
        .then((result) => {
            if (result.return_code !== 'SUCCESS' || result.result_code !== 'SUCCESS') {
                if (result.return_code == 'FAIL') {
                    throw (result.return_msg);
                } else {
                    throw (`${result.err_code} : ${result.err_code_des}`);
                }
            }
            let appid = result.appid;
            let mchid = result.mch_id;
            let transactionId = result.transaction_id;
            let outTradeNo = result.out_trade_no;
            let outRefundNo = {};
            let refundId = {};
            let refundFee = {};
            let refundStatus = {};
            let refundRecvAccout = {};
            let totalFee = result.total_fee;
            let cashFee = result.cash_fee;
            let refundCount = result.refund_count;
            for (let i = 0; i < refundCount; i++) {
                outRefundNo['outRefundNo_' + i] = result['out_refund_no_' + i];
                refundId['refundId_' + i] = result['refund_id_' + i];
                refundFee['refundFee_' + i] = result['refund_fee_' + i];
                refundStatus['refundStatus_' + i] = result['refund_status_' + i];
                refundRecvAccout['refundRecvAccout_' + i] = result['refund_recv_accout_' + i];
            }
            return {
                appId: appid,
                mchId: mchid,
                transactionId: transactionId,
                outTradeNo: outTradeNo,
                totalFee: totalFee,
                cashFee: cashFee,
                refundCount: refundCount,
                outRefundNo: outRefundNo,
                refundId: refundId,
                refundFee: refundFee,
                refundStatus: refundStatus,
                refundRecvAccout: refundRecvAccout
            }
        });
}