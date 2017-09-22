'use strict'

/**
 * @author WXP
 * @description 付款单检查
 */

const Promise = require('bluebird');
const readline = require('readline');
const fs = require('fs');
const _ = require('lodash');
const moment = require('moment');
const {
    WxTransactionLog: WxTransactionLogDb,
    WeChatPayBill: WeChatPayBillDb,
    WxRefundLog: WxRefundLogDb,
    Db
} = require('../models/weChatPayDb');
const TRADE_TYPE = {
    payment: 'payment',
    refund: 'refund'
}

const LIMIT = 1000;
const paymentKeyMapping = {
    '交易时间': 'finishTime',
    '公众账号ID': 'appId',
    '商户号': 'mchId',
    '子商户号': 'subMchId',
    '设备号': 'deviceInfo',
    '微信订单号': 'transactionId',
    '商户订单号': 'outTradeNo',
    '用户标识': 'userInfo',
    '交易类型': 'payType',
    '交易状态': 'status',
    '付款银行': 'bankType',
    '货币种类': 'cashFeeType',
    '总金额': 'totalFee',
    '企业红包金额': 'couponFee',
    '商品名称': 'body',
    '商户数据包': 'attach',
    '手续费': 'commission',
    '费率': 'commissionRate'
};
const refundKeyMapping = {
    '退款成功时间': 'finishTime',
    '公众账号ID': 'appId',
    '商户号': 'mchId',
    '子商户号': 'subMchId',
    '设备号': 'deviceInfo',
    '微信退款单号': 'transactionId',
    '商户退款单号': 'outTradeNo',
    '用户标识': 'userInfo',
    '退款类型': 'refundType',
    '退款状态': 'status',
    '付款银行': 'bankType',
    '货币种类': 'cashFeeType',
    '退款金额': 'totalFee',
    '企业红包退款金额': 'couponFee',
    '商品名称': 'body',
    '商户数据包': 'attach',
    '手续费': 'commission',
    '费率': 'commissionRate'
};


/** 获取各个列对应的含义 */
function getPositionMapping(mappingConfig, arr) {
    let mapping = [];
    for (let i = 0; i < arr.length; i++) {
        let key = mappingConfig[arr[i]];
        if (key) {
            mapping[i] = key;
        }
    }
    return mapping;
}

/**
 * 根据组织各个列的数据
 * @param {*} arr 
 * @param {*} mapping 
 */
function setData(arr, mapping) {
    let obj = {};
    let positions = Object.keys(mapping);
    for (let position of positions) {
        obj[mapping[position]] = arr[position] || '';
    }
    return obj;
}

/**
 * 将文本数据转换为对象
 * @param {*} param0 
 */
function translate({ type, filePath }) {
    let mappingConfig;
    switch (type) {
        case TRADE_TYPE.payment:
            mappingConfig = paymentKeyMapping;
            break;
        case TRADE_TYPE.refund:
            mappingConfig = refundKeyMapping;
            break;
    }
    return new Promise(function (resolve) {
        let positionMapping;
        let columnCount = 0;
        let row = 1;
        let rl = readline.createInterface({
            input: fs.createReadStream(filePath)
        });
        let results = [];
        rl.on('line', function (data) {
            if (row === 1) {
                // 微信(也可能是windows原因)返回数据的开头是utf8-bom 需要去掉bom头数据
                data = data.replace(/^\uFEFF/, '');
            }
            // 去除所有的`符号
            data = data.replace(/`/g, '');
            let arr = data.split(',');
            if (row == 1) {
                columnCount = arr.length;
                positionMapping = getPositionMapping(mappingConfig, arr);
            } else if (arr.length !== columnCount) {
                return;
            } else {
                results.push(setData(arr, positionMapping));
            }
            row++;
        });
        rl.on('close', function () {
            resolve(results);
        })
    })
}

//切割数值， 返回[[1-1000],[1000-2000].....]
function sliceToLimit(arr, limit) {
    let result = [];
    let length = arr.length;
    let index = 0;
    while (index < length) {
        result.push(arr.slice(index, index + limit));
        index += limit;
    }
    return result;
}

//TODO 优化逻辑
function getFromDb(model, {
    bills: data,
    source,
    type
}) {
    let where;
    let outTradeNo = _.without(_.uniq(_.map(data, 'outTradeNo')), null);
    switch (type) {
        case TRADE_TYPE.payment:
            where = {
                outTradeNo,
                source
            }
            break;
        case TRADE_TYPE.refund:
            where = {
                outRefundNo: outTradeNo,
                source
            }
            break;
        default:
            return;
    }
    return model.findAll({
        where: where
    })
}

//本地数据记录和对账请求的匹配逻辑
//对账是幂等行为
//对账内容：时间，金额，流水号，状态，支付方式，支付人
function checkInit(type) {
    switch (type) {
        case TRADE_TYPE.payment:
            return paymentCheck;
        case TRADE_TYPE.refund:
            return refundCheck;
        default:
            break;
    }
}

function paymentCheck(logs, billMap) {
    for (let log of logs) {
        let bill = billMap.get(log.outTradeNo);
        log.error = [];
        log.validateStatus = 0; //初始化状态=》0
        if (!bill) {
            log.validateStatus = -2;
            log.error.push('没有对应的支付记录');
            continue;
        }
        bill.error = [];
        if (log.payStatus == 0) {
            log.validateStatus = -1;
            log.error.push('本地支付状态错误');
        }
        if ((log.totalFee / 100).toFixed(2) != parseFloat(bill.totalFee).toFixed(2)) {
            log.validateStatus = -1;
            log.error.push(`金额不符,支付记录金额为${bill.totalFee}`);
        }
        if (log.transactionId != bill.transactionId) {
            log.validateStatus = -1;
            log.error.push(`transactionId不符，支付记录transactionId为${bill.transactionId}`);
        }
        if (log.bankType != bill.bankType) {
            log.validateStatus = -1;
            log.error.push('bankType不符');
        }
        //全部通过了才设置成功状态
        if (log.validateStatus == 0) {
            bill.validateStatus = 1;
            log.validateStatus = 1;
            log.finishTime = bill.finishTime;
        } else {
            bill.validateStatus = -1; //失败
        }
    }
}

function refundCheck(logs, billMap) {
    for (let log of logs) {
        let bill = billMap.get(log.outRefundNo);
        log.error = [];
        log.validateStatus = 0; //初始化状态=》0
        if (!bill) {
            log.validateStatus = -2;
            log.error.push('没有对应的支付记录');
            continue;
        }
        bill.error = [];
        if (log.status != 'SUCCESS') {
            log.validateStatus = -1;
            log.error.push('本地支付状态错误');
        }
        if ((log.refundFee / 100).toFixed(2) != parseFloat(bill.totalFee).toFixed(2)) {
            log.validateStatus = -1;
            log.error.push(`金额不符,支付记录金额为${bill.totalFee}`);
        }
        if (log.refundId != bill.transactionId) {
            log.validateStatus = -1;
            log.error.push(`transactionId不符，支付记录transactionId为${bill.transactionId}`);
        }
        //全部通过了才设置成功状态
        if (log.validateStatus == 0) {
            bill.validateStatus = 1;
            log.validateStatus = 1;
            log.finishTime = bill.finishTime;
        } else {
            bill.validateStatus = -1; //失败
        }
    }
}


/**
 * 依次检查完付款记录的后续操作
 * @param {*} param0 
 */
function afterPaymentCheckEach({
    date,
    source
}) {
    let startTime = moment(date).format('YYYY-MM-DD 00:00:00');
    let endTime = moment(date).add(1, 'd').format('YYYY-MM-DD 00:00:00');
    let sourceSql = `("${source.join('","')}")`;
    // 标记已经付款却没有被校验的单据校验状态为-2
    let paidSql = [
        `UPDATE ${WxTransactionLogDb.getTableName()} SET validateStatus=-2, error='没有对应的付款单' WHERE`,
        `createdAt >= "${startTime}"`,
        `AND createdAt < "${endTime}"`,
        'AND validateStatus=0 AND payStatus=1',
        `AND source IN ${sourceSql}`
    ].join(' ');
    // 标记未付款且未被校验的单据校验状态为1
    let unpaidSql = [
        `UPDATE ${WxTransactionLogDb.getTableName()} SET validateStatus=1 WHERE`,
        `createdAt >= "${startTime}"`,
        `AND createdAt < "${endTime}"`,
        'AND validateStatus=0 AND payStatus <> 1',
        `AND source IN ${sourceSql}`
    ].join(' ');
    return Db.query(paidSql)
        .then(() => {
            return Db.query(unpaidSql);
        });
}

/**
 * 退款检查完成后操作
 * @param {*} param0 
 */
function afterRefundCheckEach({
    date,
    source
}) {
    let startTime = moment(date).format('YYYY-MM-DD 00:00:00');
    let endTime = moment(date).add(1, 'd').format('YYYY-MM-DD 00:00:00');
    let sourceSql = `("${source.join('","')}")`;
    // 标记已经退款成功却没有被校验的单据校验状态为-2
    let sql = [
        `UPDATE ${WxRefundLogDb.getTableName()} SET validateStatus=-2, error='没有对应的退款单' WHERE`,
        `createdAt >= "${startTime}"`,
        `AND createdAt < "${endTime}"`,
        'AND validateStatus=0 AND status = "SUCCESS"',
        `AND source IN ${sourceSql}`
    ].join(' ');
    // 退款未成功的单据暂不处理
    // 标记未付款且未被校验的单据校验状态为1
    // let unpaidSql = [
    //     `UPDATE ${AliRefundLogDb.getTableName()} SET validateStatus=1 WHERE`,
    //     `createdAt >= "${startTime}"`,
    //     `AND createdAt < "${endTime}"`,
    //     'AND validateStatus=0 AND status != "SUCCESS"',
    //     `AND source IN ${sourceSql}`
    // ].join(' ');
    return Db.query(sql);
}

//对账主流程,包含支付和退款
//translate会抽取对账内容
//
const checkBill = function ({ filePath, source, type, date }) {
    let model;
    switch (type) {
        case TRADE_TYPE.payment:
            model = WxTransactionLogDb;
            break;
        case TRADE_TYPE.refund:
            model = WxRefundLogDb;
            break;
    }
    return translate({
            type: type,
            filePath: filePath
        })
        .then((data) => {
            return sliceToLimit(data, LIMIT);
        })
        .then((arr) => {
            //bills ===> 最大1000的数值，账单数据
            return Promise.each(arr, (bills) => {
                let billMap = new Map();
                let logs = [];
                //billMap ==> {{outTradeNo-1:bill-1},{outTradeNo-2:bill-2}};
                for (let bill of bills) {
                    bill.error = [];
                    billMap.set(bill.outTradeNo, bill);
                }
                // 根据对账单的outTradeNo查询对应的本地支付记录
                return getFromDb(model, {
                        bills,
                        source,
                        type
                    })
                    .then((data) => {
                        let now = new Date();
                        //匹配逻辑------- bill下载的账单数据，log本地数据记录
                        let check = checkInit(type);
                        logs = data;
                        check(logs, billMap);
                        // 格式化检查结果
                        for (let log of logs) {
                            log.error = log.error.join(',');
                            log.validateTime = now;
                        }
                        return;
                    })
                    .then(() => {
                        // 记录检查失败单据
                        return Promise.each(logs, function (log) {
                            // 只保留100长度的错误信息
                            log.error = log.error.slice(0, 100);
                            return log.save();
                        })
                    })
                    .then(() => {
                        for (let bill of bills) {
                            if (!bill.validateStatus) {
                                bill.validateStatus = -2; //
                                bill.error.push('没有对应的支付记录');
                            }
                            bill.error = bill.error.join(',').slice(0, 100);
                        }
                        // 记录从微信获取的数据
                        return WeChatPayBillDb.bulkCreate(bills);
                    });
            })
        })
        .then(() => {
            switch (type) {
                case TRADE_TYPE.payment:
                    return afterPaymentCheckEach({
                        date,
                        source
                    });
                case TRADE_TYPE.refund:
                    return afterRefundCheckEach({
                        date,
                        source
                    });
                default:
                    return;

            }
        })
}

module.exports = checkBill;