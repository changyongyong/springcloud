/**
 * Created by frank-z on 2017/5/27.
 * 交易 对账 统计
 */

const DB = require('../models/tradeGatewayDb');

const Mapping = require('./mapping');
const moment = require('moment');
const sequelize = require('sequelize');


module.exports = {
    /**
     * 统计
     * @param params
     */
    paymentRecordStatistics: params => {
        let where = recordQuery(params);
        where.status = 'SUCCESS';
        return DB['PaymentRecord'].findAll({
            where: where,
            attributes: ['tradeChannel', 'source', 'validateStatus',
                sequelize.literal('count(*) AS count'),
                sequelize.literal('sum(totalFee) AS totalFee'),
                sequelize.literal('sum(abs(validateBalance)) AS validateBalance')
            ],
            group: ['tradeChannel', 'source', 'validateStatus'],
            raw: true,
            nest: true
        })
            .then(list => {
                return statisticDataFormat(list);
            })
            .then(data => {
                return data;
            })
            .catch(e => {
                throw e;
            })
    },
    refundRecordStatistics: params => {
        let where = refundQuery(params);
        where.status = 'SUCCESS';
        return DB['RefundRecord'].findAll({
            where: where,
            attributes: ['tradeChannel', 'source', 'validateStatus',
                sequelize.literal('count(*) AS count'),
                sequelize.literal('sum(totalFee) AS totalFee'),
                sequelize.literal('sum(abs(validateBalance)) AS validateBalance')
            ],
            group: ['tradeChannel', 'source', 'validateStatus'],
            raw: true,
            nest: true
        })
            .then(list => {
                return statisticDataFormat(list);
            })
            .then(data => {
                return data;
            })
            .catch(e => {
                throw e;
            })
    },
    transferRecordStatistics: params => {
        let where = transferQuery(params);
        where.status = ['SUCCESS','PENDDING'];
        return DB['TransferRecord'].findAll({
            where: where,
            attributes: ['tradeChannel', 'source', 'validateStatus',
                sequelize.literal('count(*) AS count'),
                sequelize.literal('sum(totalFee) AS totalFee'),
                sequelize.literal('sum(abs(validateBalance)) AS validateBalance')
            ],
            group: ['tradeChannel', 'source', 'validateStatus'],
            raw: true,
            nest: true
        })
            .then(list => {
                return statisticDataFormat(list);
            })
            .then(data => {
                return data;
            })
            .catch(e => {
                throw e;
            })
    }
};

const recordQuery = ({
                         startTime,
                         status,
                         endTime,
                         system,
                         source,
                         orderType,
                         mainTradeChannel,
                         validateStatus,
                         validateStatus2,
                         tradeRecordNo,
                         orderNo
                     }) => {
    let where = {};
    if (status) {
        where.status = status;
    }
    if (endTime) {
        endTime = moment(endTime).add(1, 'd').format('YYYY-MM-DD');
    }
    if (source) {
        where.source = Mapping.WEB_SOURCE_MAPPING[source][2];
        where.tradeChannel = Mapping.WEB_SOURCE_MAPPING[source][1]
    }
    if (startTime && endTime) {
        where.createdAt = {
            $and: [{
                $gte: startTime
            }, {
                $lt: endTime
            }]
        };
    }
    if (system) {
        if (system === 'other') {
            let arr = ['business_api_server', 'SHENYIBAO.QRCODE_BORDER',
                'SHENYIBAO.QRCODE_ACCOUNT', 'SHENYIBAO.QRCODE_DEPOSIT', 'SHENYIBAO.QRCODE_CORDER'];
            where.system = {
                $not: Mapping.SYSTEMS_ARR.concat(arr)
            }
        } else {
            if (system === 'business_server') {
                where.system = [system, 'business_api_server', 'SHENYIBAO.QRCODE_BORDER',
                    'SHENYIBAO.QRCODE_ACCOUNT', 'SHENYIBAO.QRCODE_DEPOSIT'];
            } else if (system === 'customer_api_server') {
                where.system = [system, 'SHENYIBAO.QRCODE_CORDER'];
            } else {
                where.system = system;
            }
        }
    }

    if (mainTradeChannel) {
        if (mainTradeChannel === 'other') {
            where.tradeChannel = {
                $not: Mapping.TRADE_CHANNEL_ARR
            }
        } else {
            where.tradeChannel = Mapping.MAIN_CHANNEL_SUB_CHANNEL[mainTradeChannel]
        }
    }

    if (validateStatus !== 'all' && validateStatus !== undefined && validateStatus !== null) { //是否核验
        if (validateStatus == '-99') {
            where.validateStatus = 0
        } else {
            where.validateStatus = {
                not: 0
            };
        }
    }
    //对账结果  todo.. 查询对账结果会忽略核验validateStatus的状态
    if (validateStatus2 !== 'all' && validateStatus2 !== undefined && validateStatus2 !== null) {
        if (validateStatus2 === '-all') {
            where.validateStatus = {
                $lt: 0
            };
        } else {
            where.validateStatus = validateStatus2;
        }
    }

    if (tradeRecordNo && tradeRecordNo != 0) {
        where.tradeRecordNo = tradeRecordNo;
    }
    if (orderNo && orderNo != 0) {
        where.orderId = orderNo;
    }

    if (orderType) {
        let tpl = Mapping.WEB_PAYMENT_ORDER_TYPE[orderType];
        if (tpl) {
            let arr = [];
            for (let i = 0; i < tpl.length; i++) {
                arr.push({system: tpl[i][0], orderType: tpl[i][1]})
            }
            where.$or = arr;
        }
    }

    return where;
};


const refundQuery = ({
                         startTime,
                         status,
                         endTime,
                         system,
                         source,
                         //orderType,
                         mainTradeChannel,
                         validateStatus,
                         validateStatus2,
                         tradeRecordNo,
                         orderNo
                     }) => {
    let where = {};
    if (status) {
        where.status = status;
    }
    if (endTime) {
        endTime = moment(endTime).add(1, 'd').format('YYYY-MM-DD');
    }
    if (source) {
        where.source = Mapping.WEB_SOURCE_MAPPING[source][2];
        where.tradeChannel = Mapping.WEB_SOURCE_MAPPING[source][1]
    }
    if (startTime && endTime) {
        where.createdAt = {
            $and: [{
                $gte: startTime
            }, {
                $lt: endTime
            }]
        };
    }
    if (system) {
        if (system === 'other') {
            where.system = {
                $not: Mapping.SYSTEMS_ARR.concat('business_api_server', 'SHENYIBAO.QRCODE_CORDER_REFUND')
            }
        } else {
            if (system === 'business_server') {
                where.system = [system, 'business_api_server'];
            } else if (system === 'customer_api_server') {
                where.system = [system, 'SHENYIBAO.QRCODE_CORDER_REFUND'];
            } else {
                where.system = system;
            }
        }
    }
    // if (orderType) {
    //     let [systemSplit, orderTypeSplit] = orderType.split(',');
    //     where.system = systemSplit;
    //     where.orderType = orderTypeSplit;
    // }
    // if (orderType) {
    //     if (orderType == 'other') {
    //         where.orderType = {
    //             $not: Mapping.PAYMENT_ORDER_TYPES_ARR
    //         }
    //     } else {
    //         where.orderType = orderType;
    //     }
    // }
    if (mainTradeChannel) {
        if (mainTradeChannel === 'other') {
            where.tradeChannel = {
                $not: Mapping.TRADE_CHANNEL_ARR
            }
        } else {
            where.tradeChannel = Mapping.MAIN_CHANNEL_SUB_CHANNEL[mainTradeChannel]
        }
    }
    if (validateStatus !== 'all' && validateStatus !== undefined && validateStatus !== null) { //是否核验
        if (validateStatus == '-99') {
            where.validateStatus = 0
        } else {
            where.validateStatus = {
                not: 0
            };
        }
    }

    //对账结果  todo.. 查询对账结果会忽略核验validateStatus的状态
    if (validateStatus2 !== 'all' && validateStatus2 !== undefined && validateStatus2 !== null) {
        if (validateStatus2 === '-all') {
            where.validateStatus = {
                $lt: 0
            };
        } else {
            where.validateStatus = validateStatus2;
        }
    }

    if (tradeRecordNo && tradeRecordNo != 0) {
        where.tradeRecordNo = tradeRecordNo;
    }
    if (orderNo && orderNo != 0) {
        where.orderId = orderNo;
    }
    return where;
};


const transferQuery = ({
                           startTime,
                           status,
                           endTime,
                           system,
                           source,
                           orderType,
                           //mainTradeChannel,
                           validateStatus,
                           validateStatus2,
                           tradeRecordNo
                       }) => {
    let where = {};
    if (status) {
        where.status = status;
    }
    if (endTime) {
        endTime = moment(endTime).add(1, 'd').format('YYYY-MM-DD');
    }
    if (source) {
        where.source = Mapping.WEB_SOURCE_MAPPING[source][2];
        where.tradeChannel = Mapping.WEB_SOURCE_MAPPING[source][1]
    }
    if (startTime && endTime) {
        where.createdAt = {
            $and: [{
                $gte: startTime
            }, {
                $lt: endTime
            }]
        };
    }
    if (system) {
        if (system === 'other') {
            where.system = {
                $not: Mapping.SYSTEMS_ARR.concat('business_api_server','SHENYIBAO.ACCOUNT','SHENYIBAO')
            }
        } else {
            if (system === 'business_server') {
                where.system = [system, 'business_api_server','SHENYIBAO.ACCOUNT','SHENYIBAO'];
            } else {
                where.system = system;
            }
        }
    }
    if (orderType) {
        if (orderType === 'other') {
            where.orderType = {
                $not: Mapping.PAYMENT_ORDER_TYPES_ARR
            }
        } else {
            where.orderType = orderType;
        }
    }
    // if (mainTradeChannel) {
    //     if (mainTradeChannel == 'other') {
    //         where.tradeChannel = {
    //             $not: Mapping.TRADE_CHANNEL_ARR
    //         }
    //     } else {
    //         where.tradeChannel = Mapping.MAIN_CHANNEL_SUB_CHANNEL[mainTradeChannel]
    //     }
    // }
    if (validateStatus !== 'all' && validateStatus !== undefined && validateStatus !== null) { //是否核验
        if (validateStatus == '-99') {
            where.validateStatus = 0
        } else {
            where.validateStatus = {
                not: 0
            };
        }
    }

    if (tradeRecordNo && tradeRecordNo != 0) {
        where.tradeRecordNo = tradeRecordNo;
    }

    //对账结果  todo.. 查询对账结果会忽略核验validateStatus的状态
    if (validateStatus2 !== 'all' && validateStatus2 !== undefined && validateStatus2 !== null) {
        if (validateStatus2 === '-all') {
            where.validateStatus = {
                $lt: 0
            };
        } else {
            where.validateStatus = validateStatus2;
        }
    }
    return where;
};


/**
 * 统计数据拼装
 * @param list
 */
const statisticDataFormat = list => {
    let tpl = {
        'ali': {
            'psapp': {
                tradeChannel: '支付宝',
                source: '支付宝-猪行侠',
                totalFee: 0.000,  //总金额
                validateFee: 0.000,  //已经对账金额
                invalidateFee: 0.000,  //未对账金额
                diffNum: 0.000,  //对账差异数量
                diffSum: 0.000  //对账差异金额
            },
            'dd528': {
                tradeChannel: '支付宝',
                source: '支付宝-商城',
                totalFee: 0.000,  //总金额
                validateFee: 0.000,  //已经对账金额
                invalidateFee: 0.000,  //未对账金额
                diffNum: 0.000,  //对账差异数量
                diffSum: 0.000  //对账差异金额
            },
            'ddapp': {
                tradeChannel: '支付宝',
                source: '支付宝-商城',
                totalFee: 0.000,  //总金额
                validateFee: 0.000,  //已经对账金额
                invalidateFee: 0.000,  //未对账金额
                diffNum: 0.000,  //对账差异数量
                diffSum: 0.000  //对账差异金额
            },
            'wxmp': {
                tradeChannel: '支付宝',
                source: '支付宝-小程序',
                totalFee: 0.000,  //总金额
                validateFee: 0.000,  //已经对账金额
                invalidateFee: 0.000,  //未对账金额
                diffNum: 0.000,  //对账差异数量
                diffSum: 0.000  //对账差异金额
            },
            'bsapp': {
                tradeChannel: '支付宝',
                source: '支付宝-生意宝',
                totalFee: 0.000,  //总金额
                validateFee: 0.000,  //已经对账金额
                invalidateFee: 0.000,  //未对账金额
                diffNum: 0.000,  //对账差异数量
                diffSum: 0.000  //对账差异金额
            },
            'others': {
                tradeChannel: '支付宝',
                source: '支付宝-其他',
                totalFee: 0.000,  //总金额
                validateFee: 0.000,  //已经对账金额
                invalidateFee: 0.000,  //未对账金额
                diffNum: 0.000,  //对账差异数量
                diffSum: 0.000  //对账差异金额
            }
        },
        'wx': {
            'psapp': {
                tradeChannel: '微信',
                source: '微信-猪行侠',
                totalFee: 0.000,  //总金额
                validateFee: 0.000,  //已经对账金额
                invalidateFee: 0.000,  //未对账金额
                diffNum: 0.000,  //对账差异数量
                diffSum: 0.000  //对账差异金额
            },
            'dd528': {
                tradeChannel: '微信',
                source: '微信-商城',
                totalFee: 0.000,  //总金额
                validateFee: 0.000,  //已经对账金额
                invalidateFee: 0.000,  //未对账金额
                diffNum: 0.000,  //对账差异数量
                diffSum: 0.000  //对账差异金额
            },
            'ddapp': {
                tradeChannel: '微信',
                source: '微信-商城',
                totalFee: 0.000,  //总金额
                validateFee: 0.000,  //已经对账金额
                invalidateFee: 0.000,  //未对账金额
                diffNum: 0.000,  //对账差异数量
                diffSum: 0.000  //对账差异金额
            },
            'wxmp': {
                tradeChannel: '微信',
                source: '微信-小程序',
                totalFee: 0.000,  //总金额
                validateFee: 0.000,  //已经对账金额
                invalidateFee: 0.000,  //未对账金额
                diffNum: 0.000,  //对账差异数量
                diffSum: 0.000  //对账差异金额
            },
            'bsapp': {
                tradeChannel: '微信',
                source: '微信-生意宝',
                totalFee: 0.000,  //总金额
                validateFee: 0.000,  //已经对账金额
                invalidateFee: 0.000,  //未对账金额
                diffNum: 0.000,  //对账差异数量
                diffSum: 0.000  //对账差异金额
            },
            'others': {
                tradeChannel: '微信',
                source: '微信-其他',
                totalFee: 0.000,  //总金额
                validateFee: 0.000,  //已经对账金额
                invalidateFee: 0.000,  //未对账金额
                diffNum: 0.000,  //对账差异数量
                diffSum: 0.000  //对账差异金额
            }
        }
    };
    for (let i = 0; i < list.length; i++) {
        let item = list[i];
        let tradeChannel = 'others';
        if (item.tradeChannel) {
            if (item.tradeChannel.toString().startsWith('ALI')) {
                tradeChannel = 'ali';
            } else if (item.tradeChannel.toString().startsWith('WE')) {
                tradeChannel = 'wx';
            } else {
                tradeChannel = 'others';
            }
        }
        let source = item.source || 'others';
        if (Mapping.DB_SOURCE_ARR.indexOf(source) === -1) {
            source = 'others';
        }
        tpl[tradeChannel][source].totalFee = decAdd(tpl[tradeChannel][source].totalFee, item.totalFee, 10).toFixed(3);
        if (!item.validateStatus) { //未对账
            tpl[tradeChannel][source].invalidateFee =
                decAdd(tpl[tradeChannel][source].invalidateFee, item.totalFee, 10).toFixed(3);
        } else { //已对账
            tpl[tradeChannel][source].validateFee =
                decAdd(tpl[tradeChannel][source].validateFee, item.totalFee, 10).toFixed(3);
            if (item.validateStatus < 0) { //对账失败
                tpl[tradeChannel][source].diffNum =
                    decAdd(tpl[tradeChannel][source].diffNum, item.count, 10).toFixed(0);
                tpl[tradeChannel][source].diffSum =
                    decAdd(tpl[tradeChannel][source].diffSum, item.validateBalance, 10).toFixed(3);
            }
        }
    }
    //剔除totalFee为0的item  及dd528和ddapp合并
    tpl = changeTpl(tpl);

    return tpl;
};

const decAdd = (a, b, precision) => {
    let x = Math.pow(10, precision || 3);
    return (Math.round(a * x) + Math.round(b * x)) / x;
};

const changeTpl = tpl => {
    let arr = [];

    //合并   将  dd528: '微信-商城' 并入   ddapp: '微信-商城',
    tpl.ali['ddapp'].totalFee = decAdd(tpl.ali['ddapp'].totalFee, tpl.ali['dd528'].totalFee).toFixed(3);
    tpl.ali['ddapp'].invalidateFee = decAdd(tpl.ali['ddapp'].invalidateFee, tpl.ali['dd528'].invalidateFee).toFixed(3);
    tpl.ali['ddapp'].validateFee = decAdd(tpl.ali['ddapp'].validateFee, tpl.ali['dd528'].validateFee).toFixed(3);
    tpl.ali['ddapp'].diffNum = decAdd(tpl.ali['ddapp'].diffNum, tpl.ali['dd528'].diffNum).toFixed(0);
    tpl.ali['ddapp'].diffSum = decAdd(tpl.ali['ddapp'].diffSum, tpl.ali['dd528'].diffSum).toFixed(3);
    delete tpl.ali['dd528'];

    tpl.wx['ddapp'].totalFee = decAdd(tpl.wx['ddapp'].totalFee, tpl.wx['dd528'].totalFee).toFixed(3);
    tpl.wx['ddapp'].invalidateFee = decAdd(tpl.wx['ddapp'].invalidateFee, tpl.wx['dd528'].invalidateFee).toFixed(3);
    tpl.wx['ddapp'].validateFee = decAdd(tpl.wx['ddapp'].validateFee, tpl.wx['dd528'].validateFee).toFixed(3);
    tpl.wx['ddapp'].diffNum = decAdd(tpl.wx['ddapp'].diffNum, tpl.wx['dd528'].diffNum).toFixed(0);
    tpl.wx['ddapp'].diffSum = decAdd(tpl.wx['ddapp'].diffSum, tpl.wx['dd528'].diffSum).toFixed(3);
    delete tpl.wx['dd528'];

    //剔除totalFee为0的item
    for (let i in tpl.ali) {
        if (tpl.ali[i].totalFee != 0) {
            arr.push(tpl.ali[i])
        }
    }
    for (let j in tpl.wx) {
        if (tpl.wx[j].totalFee != 0) {
            arr.push(tpl.wx[j])
        }
    }
    //return tpl;
    return arr;
};