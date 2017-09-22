/**
 * Created by frank-z on 2017/4/6.
 */
'use strict';

const Promise = require('bluebird');
const moment = require('moment');
const aliHandle = require('../tradeChannel/aliPay');
const weHandle = require('../tradeChannel/weChatPay');
const ddDB = require('../models/tradeGatewayDb');
const PaymentRecord = ddDB.PaymentRecord;
const RefundRecord = ddDB.RefundRecord;
const TransferRecord = ddDB.TransferRecord;
const MissingRecord = ddDB.MissingRecord;

const UseModel = {
    'payment': PaymentRecord,
    'refund': RefundRecord,
    'transfer': TransferRecord
};
const SYSTEM_ALLOWED = ['delivery_app', 'test', 'api_server','order_service']; //支付系统来源类型
const QUERY_TYPE_ALLOWED = ['payment', 'refund', 'transfer']; //账单查询类型
const CHANNEL_TYPE_ALLOWED = ['WE_CHAT_PAY', 'ALI_PAY']; //渠道类型

const MAIN_CHANNEL_SUB_CHANNEL = { // 渠道mq传来的类型  与本系统数据库类型的映射
    WE_CHAT_PAY: ['WE_CHAT_PAY_APP', 'WE_CHAT_PAY_NATIVE', 'WE_CHAT_PAY_JSAPI', 'WE_CHAT_PAY_SCAN_PAY'],
    ALI_PAY: ['ALI_PAY_APP', 'ALI_PAY_UNION', 'ALI_PAY_SCAN_PAY']
};


let BillValidate = {};

/*
 订单有效核验
 */
// "tradeRecordNo": "PAYMENT201704061002565",
//     "source": "psapp",
//     "tradeChannel": "WE_CHAT_PAY",
//     "status": "SUCCESS",
//     "fee": "100.00",
//     "type": "payment",
//     "message": ""
const billCheck = (record, {
    type,
    source,
    tradeChannel,
    status,
    fee,
    validateStatus, //上游状态
    error
}) => {
    let obj = {
        errMsg: null,
        code: 99
    };

    //
    if (validateStatus && validateStatus == -1) {
        obj.errMsg = '上游核验状态为失败 ' + error || '';
        obj.code = '-1';
        return obj;
    }

    if (tradeChannel.startsWith('WE') && record.source != source) {
        obj.errMsg = `source类型不匹配，上游类型为${source} `;
        obj.code = '-98';
        return obj;
    }
    if (record.tradeChannel && !record.tradeChannel.toString().startsWith(tradeChannel)) {
        obj.errMsg = `tradeChannel类型不匹配，上游类型为${tradeChannel} `;
        obj.code = '-98';
        return obj;
    }
    if (type === 'transfer') {
        if (status === 'SUCCESS' && ['SUCCESS', 'PENDDING'].indexOf(record.status) === -1) {
            obj.errMsg = `交易状态不匹配，渠道状态为${status} `;
            obj.code = '-98';
            return obj;
        } else if (status === 'FAIL' && ['SUCCESS', 'PENDDING'].indexOf(record.status) !== -1) {
            obj.errMsg = `交易状态不匹配，渠道状态为${status} `;
            obj.code = '-98';
            return obj;
        }
    } else {
        if (record.status != status) {
            obj.errMsg = `交易状态不匹配，渠道状态为${status} `;
            obj.code = '-98';
            return obj;
        }
    }

    if ((record.totalFee || 0).toFixed(2) != fee) {
        obj.errMsg = `交易金额不正确，渠道金额为${fee} `;
        obj.code = '-99';
        return obj;
    }
    return obj;
};

/**
 * 记录对账核验处理
 * @param arrMsg
 * @returns {*}
 */
BillValidate.handle = (arrMsg) => {
    if (Object.prototype.toString.call(arrMsg) != '[object Array]') {
        return Promise.reject('arrMsg参数必须为数组');
    }

    //遍历数组
    return Promise.each(arrMsg, message => {
        let errObj;
        const type = message.type; //'payment'  'refund'  'transfer'
        const tradeRecordNo = message.tradeRecordNo;
        //查己方数据
        return UseModel[type].find({
            where: {
                tradeRecordNo: tradeRecordNo
            }
        })
            .then(record => {
                if (!record) { //未找到记录
                    errObj = `tradeRecordNo为 ${tradeRecordNo} 的记录未找到 `;
                    return MissingRecord.find({
                        where: {
                            tradeRecordNo: tradeRecordNo
                        }
                    })
                    //upsert
                        .then(data => {
                            if (data) {
                                return data.update({
                                    type: type,
                                    tradeRecordNo: tradeRecordNo,
                                    source: message.source,
                                    tradeChannel: message.tradeChannel,
                                    status: message.status,
                                    fee: message.fee,
                                    message: message.message,
                                    operateState: 0,
                                    remark: JSON.stringify(message)
                                })
                            }
                            return MissingRecord.create({
                                type: type,
                                tradeRecordNo: tradeRecordNo,
                                source: message.source,
                                tradeChannel: message.tradeChannel,
                                status: message.status,
                                fee: message.fee,
                                message: message.message,
                                operateState: 0,
                                remark: JSON.stringify(message)
                            })

                        })
                } else {
                    //数据校验
                    errObj = billCheck(record, message);
                    //更新
                    return record.update({
                        validateStatus: errObj.code,
                        validateTime: Date.now(),
                        //网关的金额 - 渠道的金额
                        validateBalance: errObj.errMsg ? (record.totalFee * 1000 - message.fee * 1000) / 1000 : 0,
                        error: errObj.errMsg || null
                    });
                }
            })
    })
        .catch(e => {
            throw e;
        })
};

/**
 *  上游发起对账通知 监听函数
 * @param opts
 */
BillValidate.listen = opts => {
    // console.log(opts);
    opts.type = opts.type.toLowerCase();
    let {type, date, tradeChannel} = opts; //source,
    return Promise.resolve('ok')
        .then(() => {
            if (tradeChannel === 'ALI_PAY') {
                return aliHandle.downBill(opts);
            } else if (tradeChannel === 'WE_CHAT_PAY') {
                return weHandle.downBill(opts)
            } else {
                throw 'tradeChannel is not found';
            }
        })
        .then(data => {
            //单个对账
            return BillValidate.handle(data);
        })
        .then(() => {
            //将本系统 所有未核验过的 记录全置为失败（上游记录丢失的情况 -97）
            return UseModel[type].update({
                validateStatus: -97,
                validateTime: Date.now(),
                error: '系统自动核验产生的错误' || null
            }, {
                where: {
                    //source: source,
                    tradeChannel: MAIN_CHANNEL_SUB_CHANNEL[tradeChannel],
                    createdAt: {
                        $gte: date + ' 00:00:00',
                        $lte: date + ' 23:59:59'
                    },
                    validateStatus: 0
                }
            })
        })
        .catch(e => {
            throw e;
        })
};


/**
 *  【【核验】】账单查询
 * @param system 系统来源
 * @param date  日期fmt
 * @param type  异动类型
 * @param channel  渠道类型  WE_CHAT_PAY , ALI_PAY
 * @param intervene  是否为人工干预  默认0   【0,1】
 * @returns {Promise.<*>}
 */
BillValidate.list = ({
                         system, // 'delivery_app'
                         date, // '2017-04-24'
                         type, //'payment'  'refund'  'transfer'
                         channel,
                         intervene
                     }) => {
    //时间检查
    let yesterday = moment().add(-1, 'd').format('YYYY-MM-DD HH:mm:ss');
    if (date + ' 01:00:00' > yesterday) {
        return Promise.reject('核验中,请于账单日期的第二天1点后查询');
    }

    //系统可靠性检查
    if (SYSTEM_ALLOWED.indexOf(system) === -1) {
        return Promise.reject('系统类型错误');
    }

    //查询类型检查
    if (QUERY_TYPE_ALLOWED.indexOf(type) === -1) {
        return Promise.reject('查询类型错误');
    }

    //channel可靠性检查
    if (!channel) {
        return Promise.reject('channel丢失');
    }
    if (typeof channel === 'string') {
        if (CHANNEL_TYPE_ALLOWED.indexOf(channel) === -1) {
            return Promise.reject('channel类型错误');
        }
        channel = MAIN_CHANNEL_SUB_CHANNEL[channel];
    } else if (Object.prototype.toString.apply(channel) === '[object Array]') {
        let arr = [];
        channel.forEach(ele => {
            arr.join(MAIN_CHANNEL_SUB_CHANNEL[ele])
        });
        channel = arr;
    }

    intervene = intervene || 0;

    return Promise.resolve('ok')
        .then(() => {
            //非人工干预 需检查是否核验完毕
            if (intervene == 0) {
                return UseModel[type].count({
                    where: {
                        system: system,
                        tradeChannel: channel,
                        createdAt: {
                            $gt: date + ' 00:00:00',
                            $lt: date + ' 23:59:59'
                        },
                        validateStatus: 0
                    }
                })
            } else {
                return 0;
            }
        })
        .then(count => {
            if (count && count > 0) {
                return Promise.reject('选择日期订单还未与上游核验完毕');
            }
            let attributes = ['id', 'status', 'tradeRecordNo', 'tradeChannel', 'totalFee', 'orderType'];
            attributes.push('system', 'source', 'payTime', 'validateStatus', 'error', 'tradePrincipal');
            return UseModel[type].findAll({
                where: {
                    system: system,
                    tradeChannel: channel,
                    createdAt: {
                        $gte: date + ' 00:00:00',
                        $lte: date + ' 23:59:59'
                    },
                    validateStatus: {
                        $not: 0
                    }
                },
                attributes: attributes,
                raw: true
            })
        })
        .catch(e => {
            return Promise.reject(`系统繁忙,失败原因是：${e}`);
        })
};


module.exports = BillValidate;