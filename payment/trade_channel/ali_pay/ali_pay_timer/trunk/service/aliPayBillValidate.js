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
    AliTransactionLog: AliTransactionLogDb,
    AliRefundLog: AliRefundLogDb,
    AliTransferLog: AliTransferLogDb,
    AliPayBill: AliPayBillDb,
    // aliMerchantToken: aliMerchantTokenDb,
    Db
} = require('../models/aliPayDb');

const keyMapping = {
    '业务流水号': 'tradeNo',
    '商户订单号': 'outTradeNo',
    '业务类型': 'type',
    '商品名称': 'body',
    '发生时间': 'finishTime',
    '对方账号': 'buyerLogonId',
    '收入金额（+元）': 'inFee',
    '支出金额（-元）': 'outFee',
    // '支付宝红包（元）':'',
    // '集分宝（元）':'',
    // '支付宝优惠（元）':'',
    // '商家优惠（元）':'',
    // '券核销金额（元）':'',
    // '券名称':'',
    // '商家红包消费金额（元）':'',
    // '卡消费金额（元）':'',
    // '退款批次号/请求号':'',
    // '服务费（元）': 'commission',
    // '分润（元）':'',
    '备注': 'remark'
};

const BILL_TYPES = {
    payment: 'payment',
    refund: 'refund',
    transfer: 'transfer',
    other: 'other'
}

/** 获取各个列对应的含义 */
function getPositionMapping(arr) {
    let i = 0;
    let mapping = [];
    for (i; i < arr.length; i++) {
        let key = keyMapping[arr[i]];
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
function translate({
    filePath
}) {
    return new Promise(function (resolve) {
        // 当没有路径即没有下到对账单时标记返回空数组
        if (!filePath) {
            return resolve([]);
        }
        let positionMapping;
        let columnCount = 0;
        let row = 1;
        let rl = readline.createInterface({
            input: fs.createReadStream(filePath)
        });
        let results = [];
        rl.on('line', function (data) {
            // #开头数据忽略
            if (data.startsWith('#')) {
                return;
            }
            // 替换空白字符
            data = data.replace(/\s,/g, ',');
            data = data.replace(/\t/g, '');
            let arr = data.split(',');
            // 第一行为表头
            if (row == 1) {
                columnCount = arr.length;
                positionMapping = getPositionMapping(arr);
            } else if (arr.length !== columnCount) {
                return;
            } else {
                let result = setData(arr, positionMapping);
                switch (result.type) {
                    // 暂时不处理收费的内容
                    case '收费':
                        return;
                    case '退费':
                        return;
                    case '转账':
                        result.type = BILL_TYPES.transfer;
                        result.totalFee = 0 - parseFloat(result.outFee);
                        break;
                    case '在线支付':
                        result.type = BILL_TYPES.payment
                        result.totalFee = parseFloat(result.inFee);
                        break;
                    case '交易退款':
                        result.type = BILL_TYPES.refund;
                        result.totalFee = 0 - parseFloat(result.outFee);
                        break;
                    default:
                        result.remark += '|交易类型为：' + result.type;
                        result.type = BILL_TYPES.other;
                        result.totalFee = parseFloat(result.inFee) + parseFloat(result.outFee);
                        break;
                }
                results.push(result);
            }
            row++;
        });
        rl.on('close', function () {
            resolve(results);
        })
    })
}

/**
 * 将相同业务类型的相同outTradeNo的单据合并，主要是将金额相加
 * @param {*} arr 
 */
function mergeData(arr) {
    let result = {};
    result[BILL_TYPES.transfer] = [];
    result[BILL_TYPES.payment] = [];
    result[BILL_TYPES.refund] = [];
    result[BILL_TYPES.other] = [];
    for (let data of arr) {
        let trade = result[data.type];
        // 支付宝后台操作的数据没有
        let single = trade[data.outTradeNo || data.tradeNo];
        if (!single) {
            single = data;
            trade[data.outTradeNo] = single;
        } else {
            single.totalFee += data.totalFee;
        }
    }
    return {
        mergeData: result,
        orginal: arr
    }
}

/**
 * 从数据库读取数据
 * @param {*} model 
 * @param {*} data 
 */
function getFromDb({
    model,
    type,
    bills: data,
    source,
    sellerId
}) {
    let where;
    switch (type) {
        case BILL_TYPES.payment:
            {
                let outTradeNo = _.without(_.uniq(_.map(data, 'outTradeNo')), null);
                where = {
                    outTradeNo,
                    source,
                    sellerId
                }
                break;
            }
        case BILL_TYPES.refund:
            {
                let outTradeNo = _.without(_.uniq(_.map(data, 'outTradeNo')), null);
                where = {
                    outTradeNo,
                    source,
                    sellerId
                }
                break;
            }
        case BILL_TYPES.transfer:
            {
                let outBizNo = _.without(_.uniq(_.map(data, 'outTradeNo')), null);
                where = {
                    outBizNo,
                    source,
                    sellerId
                }
                break;
            }
        default:
            break;
    }
    return model.findAll({
        where: where
    })
}

/**
 * 生成checkEach方法，主要是用来比对source
 * @return {function}
 */
function checkInit(type) {
    switch (type) {
        case BILL_TYPES.payment:
            return paymentCheck
        case BILL_TYPES.refund:
            return refundCheck;
        case BILL_TYPES.transfer:
            return transferCheck;
        default:
            return function () {};
    }

}

function paymentCheck({ logs, billMap }) {
    for (let log of logs) {
        let bill = billMap.get(log.outTradeNo);
        log.error = [];
        if (!bill) {
            log.validateStatus = -1;
            log.error.push('没有对应的支付记录');
            continue;
        }
        bill.error = [];
        log.finishTime = bill.finishTime;
        if (bill.validateStatus) {
            bill.validateStatus = -1;
            bill.error.push('重复对账');
        } else {
            bill.validateStatus = 1;
            log.validateStatus = 1;
        }
        if (log.payStatus == 0) {
            log.validateStatus = -1;
            log.error.push('状态错误');
        }
        if (log.totalFee.toFixed(2) != bill.totalFee.toFixed(2)) {
            bill.validateStatus = -1;
            bill.error.push('金额不符');
        }
        if (log.tradeNo != bill.tradeNo) {
            log.validateStatus = -1;
            log.error.push('tradeNo不符');
        }
        if (log.bankType != bill.bankType) {
            log.bankType = bill.bankType;
        }
    }
}

function refundCheck({ logs, billMap }) {
    // 退款根据tradeNo进行筛选
    for (let log of logs) {
        let bill = billMap.get(log.outTradeNo);
        log.error = [];
        if (!bill) {
            log.validateStatus = -1;
            log.error.push('没有对应的退款记录');
            continue;
        }
        bill.error = [];
        log.finishTime = bill.finishTime;
        if (bill.validateStatus) {
            bill.validateStatus = -1;
            bill.error.push('重复对账');
        } else {
            bill.validateStatus = 1;
            log.validateStatus = 1;
        }
        if (log.totalFee.toFixed(2) != bill.totalFee.toFixed(2)) {
            bill.validateStatus = -1;
            bill.error.push('金额不符');
        }
        if (log.status != 'SUCCESS') {
            log.validateStatus = -1;
            log.error.push('状态错误');
        }
        if (log.bankType != bill.bankType) {
            log.bankType = bill.bankType;
        }
    }
}

function transferCheck({ logs, billMap }) {
    for (let log of logs) {
        let bill = billMap.get(log.outBizNo);
        log.error = [];
        if (!bill) {
            log.validateStatus = -1;
            log.error.push('没有对应的转账记录');
            continue;
        }
        bill.error = [];
        log.finishTime = bill.finishTime;
        if (bill.validateStatus) {
            bill.validateStatus = -1;
            bill.error.push('重复对账');
        } else {
            bill.validateStatus = 1;
            log.validateStatus = 1;
        }
        if (log.amount.toFixed(2) != Math.abs(bill.totalFee).toFixed(2)) {
            bill.validateStatus = -1;
            bill.error.push('金额不符');
            log.validateStatus = -1;
            log.error.push('金额不符');
        }
        if (log.aliOrderId != bill.tradeNo) {
            log.validateStatus = -1;
            log.error.push('tradeNo不符');
        }
        if (log.bankType != bill.bankType) {
            log.bankType = bill.bankType;
        }
    }
}

/**
 * 依次检查完付款记录的后续操作
 * @param {*} param0 
 */
function afterPaymentCheckEach({
    date,
    source,
    sellerId
}) {
    let startTime = moment(date).format('YYYY-MM-DD 00:00:00');
    let endTime = moment(date).add(1, 'd').format('YYYY-MM-DD 00:00:00');
    let sourceSql = `("${source.join('","')}")`;
    // 标记已经付款却没有被校验的单据校验状态为-1
    let paidSql = [
        `UPDATE ${AliTransactionLogDb.getTableName()} SET validateStatus=-2, error='没有对应的付款单' WHERE`,
        `createdAt >= "${startTime}"`,
        `AND createdAt < "${endTime}"`,
        'AND validateStatus=0 AND payStatus=1',
        `AND source IN ${sourceSql}`
    ];
    // 标记未付款且未被校验的单据校验状态为1
    let unpaidSql = [
        `UPDATE ${AliTransactionLogDb.getTableName()} SET validateStatus=1 WHERE`,
        `createdAt >= "${startTime}"`,
        `AND createdAt < "${endTime}"`,
        'AND validateStatus=0 AND payStatus <> 1',
        `AND source IN ${sourceSql}`
    ];
    if (sellerId) {
        paidSql.push(`AND sellerId=${sellerId}`);
        unpaidSql.push(`AND sellerId=${sellerId}`)
    } else {
        paidSql.push('AND sellerId is NULL');
        unpaidSql.push('AND sellerId is NULL')
    }

    paidSql = paidSql.join(' ');
    unpaidSql = unpaidSql.join(' ');

    return Db.query(paidSql)
        .then(() => {
            return Db.query(unpaidSql);
        });
}

function afterRefundCheckEach({
    date,
    source,
    sellerId
}) {
    let startTime = moment(date).format('YYYY-MM-DD 00:00:00');
    let endTime = moment(date).add(1, 'd').format('YYYY-MM-DD 00:00:00');
    let sourceSql = `("${source.join('","')}")`;
    // 标记已经退款成功却没有被校验的单据校验状态为-1
    let paidSql = [
        `UPDATE ${AliRefundLogDb.getTableName()} SET validateStatus=-2, error='没有对应的付款单' WHERE`,
        `createdAt >= "${startTime}"`,
        `AND createdAt < "${endTime}"`,
        'AND validateStatus=0 AND status = "SUCCESS"',
        `AND source IN ${sourceSql}`
    ];

    if (sellerId) {
        paidSql.push(`AND arl_seller_id=${sellerId}`);
    } else {
        paidSql.push('AND arl_seller_id is NULL');
    }
    paidSql = paidSql.join(' ');
    // 退款未成功的单据暂不处理
    // 标记未付款且未被校验的单据校验状态为1
    // let unpaidSql = [
    //     `UPDATE ${AliRefundLogDb.getTableName()} SET validateStatus=1 WHERE`,
    //     `createdAt >= "${startTime}"`,
    //     `AND createdAt < "${endTime}"`,
    //     'AND validateStatus=0 AND status != "SUCCESS"',
    //     `AND source IN ${sourceSql}`
    // ].join(' ');
    return Db.query(paidSql);
}

function afterTransferCheckEach({
    date,
    source,
    sellerId
}) {
    let startTime = moment(date).format('YYYY-MM-DD 00:00:00');
    let endTime = moment(date).add(1, 'd').format('YYYY-MM-DD 00:00:00');
    let sourceSql = `("${source.join('","')}")`;
    // 将所有没有转账对账的记录标记为不通过
    let paidSql = [
        `UPDATE ${AliTransferLogDb.getTableName()} SET validateStatus=-2, error='没有对应的付款单' WHERE`,
        `createdAt >= "${startTime}"`,
        `AND createdAt < "${endTime}"`,
        'AND validateStatus = 0 AND status = 0',
        `AND source IN ${sourceSql}`
    ];

    if (sellerId) {
        paidSql.push(`AND atl_seller_id=${sellerId}`);
    } else {
        paidSql.push('AND atl_seller_id is NULL');
    }
    paidSql = paidSql.join(' ');
    return Db.query(paidSql);
}

/**
 * 主方法
 * @param {*}
 */
const checkBill = function ({
    filePath,
    // 多支付宝账户
    source,
    date,
    sellerId
}) {
    return translate({
            filePath: filePath
        })
        .then((data) => {
            return mergeData(data);
        })
        .then((obj) => {
            let mergeData = obj.mergeData;
            /**
             * mergeData:{
             *      payment: [],
             *      refund: [],
             *      transfer: []
             * }
             */
            return Promise.each(_.toPairs(mergeData), ([key, bills]) => {
                    let billMap = new Map();
                    let logs = [];
                    bills = _.values(bills);
                    for (let bill of bills) {
                        bill.error = [];
                        billMap.set(bill.outTradeNo, bill);
                    }
                    let model;
                    switch (key) {
                        case BILL_TYPES.payment:
                            model = AliTransactionLogDb
                            break;
                        case BILL_TYPES.refund:
                            model = AliRefundLogDb
                            break;
                        case BILL_TYPES.transfer:
                            model = AliTransferLogDb
                            break;
                        default:
                            return;
                    }
                    // 查询对应的支付记录
                    return getFromDb({ model, type: key, bills, source, sellerId })
                        .then((data) => {
                            let now = new Date();
                            let checkFunc = checkInit(key);
                            logs = data;
                            checkFunc({ logs, billMap });
                            // 格式化检查结果
                            for (let log of logs) {
                                log.error = log.error.join(',');
                                log.validateTime = now;
                            }
                            return;
                        })
                        // 保存对账结果
                        .then(() => {
                            return Promise.each(logs, function (log) {
                                return log.save();
                            })
                        })
                        // 
                        .then(() => {
                            for (let bill of bills) {
                                if (!bill.validateStatus) {
                                    bill.validateStatus = -2;
                                    bill.error.push('没有对应的支付记录');
                                }
                                bill.error = bill.error.join(',').slice(0, 200);
                            }
                            // 记录从支付宝获取的数据
                            return AliPayBillDb.bulkCreate(bills);
                        })
                        // 将本日所有未对的交易记录标记为对账失败
                        .then(() => {
                            //  将不是数组的source 转换一下
                            source = Array.isArray(source) && source || [source];
                            switch (key) {
                                case BILL_TYPES.payment:
                                    return afterPaymentCheckEach({
                                        date,
                                        source,
                                        sellerId
                                    });
                                case BILL_TYPES.refund:
                                    return afterRefundCheckEach({
                                        date,
                                        source,
                                        sellerId
                                    });
                                case BILL_TYPES.transfer:
                                    return afterTransferCheckEach({
                                        date,
                                        source,
                                        sellerId
                                    });
                            }
                        })

                })
                .then(() => {
                    let bills = mergeData[BILL_TYPES.other];
                    if (!bills) {
                        return '';
                    }
                    bills = _.values(bills);
                    for (let bill of bills) {
                        bill.validateStatus = -2;
                        bill.error = '交易类型错误！';
                    }
                    // 记录未知类型的交易
                    return AliPayBillDb.bulkCreate(bills)
                        .then(() => {
                            return '';
                        })
                })
        })
}

module.exports = checkBill;