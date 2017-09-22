'use strict'

/**
 * @author WXP
 * @description 支付结果检查任务
 */

require('../config/loadConfig');

const {
    Db,
    WxRefundLog: RefundRecord
} = require('../models/weChatPayDb');
const {
    WeChatPay: Channel
} = require('../tradeChannel');
const {
    refundResult
} = require('../mq/publisher');
const moment = require('moment');
const logger = global.Logger('refundCheck');
// 查询从当前向前多少秒的订单
const OFF_SECOND = 30;

let task = {};

let STATUS = RefundRecord.getStatus();

task.execute = function () {
    let endTime = moment().add(OFF_SECOND, 's').toDate();
    return RefundRecord.findAll({
            where: {
                status: STATUS.PENDDING,
                createdAt: {
                    $lte: endTime
                }
            }
        })
        .then((records) => {
            return Promise.each(records, (record) => {
                return query(record);
            })
        })
        .then(() => {
            return ''
        })
}

const query = function (record) {
    let {
        outRefundNo,
        source,
        subMchId
    } = record;
    let transaction;
    return Db.transaction()
        .then((data) => {
            transaction = data;
            return Channel.refundQuery({
                    source,
                    outRefundNo,
                    subMchId
                })
                .then((data) => {
                    if (data.data && data.data.refundStatus) { //++++++++++++wdq+返回数据格式问题修改+++++++++++++
                        switch (data.data.refundStatus.refundStatus_0) {
                            case 'SUCCESS':
                                record.status = STATUS.SUCCESS;
                                break;
                                // 退款关闭
                            case 'REFUNDCLOSE':
                                record.status = STATUS.FAIL;
                                break;
                                // 退款处理中
                            case 'PROCESSING':
                                record.status = STATUS.PENDDING;
                                break;
                                // 退款异常，退款到银行发现用户的卡作废或者冻结了，导致原路退款银行卡失败，
                                // 可前往商户平台（pay.weixin.qq.com）-交易中心，手动处理此笔退款。$n为下标，从0开始编号。
                            case 'CHANGE':
                                record.status = STATUS.ERROR;
                                break;
                            default:
                                break;
                        }
                    } else {
                        record.status = STATUS.FAIL;
                    }
                    return record;
                })
                .catch((error) => {
                    if (error.errorCode == 'REFUNDNOTEXIST') {
                        return {
                            status: STATUS.FAIL,
                            outRefundNo: outRefundNo
                        }
                    }
                    throw (error);
                })
        })
        .then(() => {
            if (record.status == STATUS.PENDDING) {
                return;
            }
            return record.update({
                status: record.status
            }, {
                transaction: transaction
            })
        })
        .then(() => {
            if (record.status == STATUS.PENDDING) {
                return;
            }
            return refundResult.sendMessage({
                tradeRecordNo: outRefundNo,
                status: record.status,
                chunnel: 'WEI_CHAT_PAY_CHANNEL'
            }, {
                transaction: transaction
            })
        })
        .then(() => {
            return transaction.commit();
        })
        .catch((error) => {
            if (error === true) {
                return transaction.commit();
            }
            logger.error(`error: ${error} message:${JSON.stringify(error.message)} ` +
                `sql:${error.sql} data:${JSON.stringify(error.data)} stack:${error.stack}`);
            return transaction.rollback();
        })
        .then(() => {
            return '';
        })
}

task.attributes = {
    name: '支付结果检查',
    id: 'refundCheck',
    version: '1.0.0',
    createAt: '2017年2月16日15:22:39',
    lastModifyTime: '2017年2月16日15:22:39'
};

module.exports.task = task;