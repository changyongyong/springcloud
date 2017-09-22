const {
    TransferRecord: TransferRecordDb
} = require('../models/tradeGatewayDb');
const Mapping = require('./mapping');
const moment = require('moment');
const CityInfo = require('./cityInfo');

const formartArr = function (arr, formatter) {
    let result = [];
    for (let data of arr) {
        result.push(formatter(data));
    }
    return CityInfo.fullUpCityInfo(result);
};

const paymentRecordFormat = function (data) {
    let result = {
        tradeRecordNo: data.tradeRecordNo,
        status: data.status,
        statusStr: Mapping.TRANSFER_STATUS_TRANS[data.status] || '未知',
        mainTradeChannel: Mapping.distributeMainTradeChannel(data.tradeChannel),
        tradeChannel: data.tradeChannel,
        tradeChannelStr: Mapping.TRADE_CHANNEL_TRANS[data.tradeChannel] || data.tradeChannel,
        source: data.source,
        totalFee: data.totalFee,
        thirdPartAccount: data.thirdPartAccount,
        orderType: data.orderType,
        orderTypeStr: Mapping.TRANSFER_ORDER_TYPES_TRANS[data.orderType] || '其它',
        orderId: data.orderId,
        system: data.system,
        systemStr: Mapping.SYSTEMS_TO_STR[data.system] || data.system,
        tradePrincipal: data.tradePrincipal,
        createdAt: moment(data.createdAt).format('YYYY-MM-DD HH:mm:ss'),
        remark: data.remark || '',
        message: data.message || '',
        error: data.error,
        validateStatus: data.validateStatus,
        validateBalance: data.validateBalance || 0,
        validateTime: data.validateTime ? moment(data.validateTime).format('YYYY-MM-DD hh:mm:ss') : ''
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
    switch (result.validateStatus) {
        case 99:
            result.validateStatusName = '正常';
            break;
        case -99:
            result.validateStatusName = '金额不一致';
            break;
        case -98:
            result.validateStatusName = '状态不一致';
            break;
        case -97:
            result.validateStatusName = '记录丢失';
            break;
        case -1:
            result.validateStatusName = '上游状态异常';
            break;
        default:
            result.validateStatusName = '暂未对账';
    }
    return result;
};

module.exports.records = function (par) {
    let {
        startTime,
        status,
        endTime,
        system,
        source,
        orderType,
        // mainTradeChannel,
        validateStatus,
        validateStatus2,
        limit,
        offset,
        tradeRecordNo,
        cityId
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
    if (cityId) {
        where.tradePrincipal = cityId;
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
    limit = parseInt(limit);
    offset = parseInt(offset);
    // let where = {};
    return TransferRecordDb.findAndCountAll({
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