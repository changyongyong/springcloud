/**
 * Created by frank-z on 2017/4/7.
 */
const {
    MissingRecord: MissingRecord
} = require('../models/tradeGatewayDb');
const Mapping = require('./mapping');
const moment = require('moment');

const formartArr = function (arr, formatter) {
    let result = [];
    for (let data of arr) {
        result.push(formatter(data));
    }
    return result;
};

const paymentRecordFormat = function (data) {
    let result = {
        tradeRecordNo: data.tradeRecordNo,
        status: data.status,
        statusStr: Mapping.STATUS_TRANS[data.status],
        mainTradeChannel: Mapping.distributeMainTradeChannel(data.tradeChannel),
        tradeChannel: data.tradeChannel,
        tradeChannelStr: Mapping.TRADE_CHANNEL_TRANS[data.tradeChannel],
        source: data.source,
        fee: data.fee,
        type: data.type,
        // orderType: data.orderType,
        // orderTypeStr: Mapping.paymentOrderType(data) || '其它',
        // orderId: data.orderId,
        // system: data.system,
        // systemStr: Mapping.SYSTEMS_TRANS[data.system] || '其它',
        createdAt: moment(data.createdAt).format('YYYY-MM-DD HH:mm:ss') || '',
        message: data.message || '',
        remark: data.remark || '',
    };
    result.mainTradeChannelStr = Mapping.MAIN_TRADE_CHANNELS_TRANS[result.mainTradeChannel];
    switch (result.mainTradeChannel) {
        case Mapping.MAIN_TRADE_CHANNEL.WE_CHAT:
            result.sourceStr = Mapping.WE_CHAT_SOURCE_TRANS[result.source] || '其它';
            break;
        case Mapping.MAIN_TRADE_CHANNEL.ALI_PAY:
            result.sourceStr = '支付宝';
            break;
        default:
            result.sourceStr = '其它';
    }
    switch (result.type) {
        case 'payment':
            result.typeName = '付款';
            break;
        case 'refund':
            result.typeName = '退款';
            break;
        case 'transfer':
            result.typeName = '转账';
            break;
        default:
            result.sourceStr = '其它';
    }
    return result;
};

module.exports.records = function (par) {
    let {
        startTime,
        status,
        endTime,
        //system,
        source,
        //orderType,
        type,
        mainTradeChannel,
        //validateStatus,
        limit,
        offset,
        tradeRecordNo
    } = par;
    let where = {};
    let result = {};
    if (status) {
        where.status = status;
    }
    if (endTime) {
        endTime = moment(endTime).add(1, 'd').format('YYYY-MM-DD');
    }
    if (source) {
        if (source in Mapping.WE_CHAT_SOURCE) {
            if (source === Mapping.WE_CHAT_SOURCE.dd528) {
                where.source = [Mapping.WE_CHAT_SOURCE.dd528, Mapping.WE_CHAT_SOURCE.ddapp];
            } else {
                where.source = source;
            }
        } else if (source === 'alipay') {
            where.tradeChannel = Mapping.MAIN_CHANNEL_SUB_CHANNEL['ALI_PAY']
        }
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
    // if (system) {
    //     if (system == 'other') {
    //         where.system = {
    //             $not: Mapping.SYSTEMS_ARR
    //         }
    //     } else {
    //         where.system = system;
    //     }
    // }
    // if (orderType) {
    //     let [systemSplit, orderTypeSplit] = orderType.split('|');
    //     where.system = systemSplit;
    //     where.orderType = orderTypeSplit;
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
    if (type) {
        where.type = type;
    }
    if (tradeRecordNo && tradeRecordNo != 0) {
        where.tradeRecordNo = tradeRecordNo;
    }
    limit = parseInt(limit);
    offset = parseInt(offset);
    // let where = {};
    return MissingRecord.findAndCountAll({
        where: where,
        limit: limit,
        offset: offset,
        raw: true,
    })
        .then((data) => {
            result.count = data.count;
            return formartArr(data.rows, paymentRecordFormat);
        })
        .then((data) => {
            result.data = data;
            return result;
        })
};