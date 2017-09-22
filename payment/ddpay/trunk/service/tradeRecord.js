'use strict';

/**
 * 交易记录
 * @author 吴秀璞
 * @since 2017/1/16
 */

const ddPayDb = require('../models/ddPayDb');
const { Sequence } = require('../lib/rpc');
const {
    TradeRecord: TradeRecordDb
} = ddPayDb;
const TRADE_ACCOUNT_SEQUENCE_NAME = 'ddPayTradeRecordNo';
const moment = require('moment');
const FIELD_STRS = {
    //余额
    balance: '余额',
    //押金
    deposit: '押金'
};
let TradeRecord = {};

const formatRecords = function (records) {
    if (!records) {
        return [];
    }
    if (!Array.isArray(records)) {
        records = [records];
    }
    let results = [];
    for (let record of records) {
        results.push(formatEach(record));
    }
    return results;
}

const formatEach = function (record) {
    let result = {
        tradeRecordNo: record.tradeRecordNo,
        type: record.type,
        tradeType: record.tradeType,
        amount: record.totalAmount,
        field: record.field,
        fieldStr: FIELD_STRS[record.field],
        orderType: record.orderType,
        orderId: record.orderId,
        outTradeRecordNo: record.outTradeRecordNo,
        createdAt: moment(record.createdAt).format('YYYY-MM-DD HH:mm:ss'),
        updatedAt: moment(record.updatedAt).format('YYYY-MM-DD HH:mm:ss'),
        system: record.system,
        tradePrincipal: record.tradePrincipal
    };
    return result;
}

/**
 * 创建交易记录
 * @param par
 * @param options
 * @returns {Promise|Promise.<TResult>|*|{value}}
 */
TradeRecord.create = function (par, options) {
    let {
        amount,
        type,
        tradeType,
        field,
        tradeAccountId,
        tradeAccountNo,
        counterpartyNo,
        operateLogNo,
        orderType,
        orderId,
        outTradeRecordNo,
        remark,
        system,
        tradePrincipal
    } = par, {
        transaction
    } = options;
    return Sequence.sequence.get({
            name: TRADE_ACCOUNT_SEQUENCE_NAME
        })
        .then((data) => {
            let no = data.data.toString();
            //使用6位交易号
            while (no.length < 6) {
                no = '0' + no;
            }
            no = moment(data.date).format('YYYYMMDD') + no;
            return TradeRecordDb.create({
                tradeRecordNo: no,
                type: type,
                tradeType: tradeType,
                totalAmount: amount,
                receiptAmount: amount,
                field: field,
                TradeAccountId: tradeAccountId,
                tradeAccountNo: tradeAccountNo,
                counterpartyNo: counterpartyNo,
                operateLogNo: operateLogNo,
                orderType: orderType,
                orderId: orderId,
                remark: remark,
                outTradeRecordNo: outTradeRecordNo,
                system,
                tradePrincipal
            }, {
                transaction: transaction
            });
        })
};


TradeRecord.findAll = function ({
    tradeAccountId,
    type,
    order,
    orderType,
    orderId,
    limit,
    startTime,
    endTime,
    offset
}) {
    var where = {
        TradeAccountId: tradeAccountId
    };
    if (orderType) {
        where.orderType = orderType;
    }
    if (orderId) {
        where.orderId = orderId;
    }
    if (type) {
        where.type = type;
    }
    if (startTime && endTime) {
        where.createdAt = {
            $between: [startTime, endTime]
        }
    }
    if (order) {
        order = [order];
    }
    if (limit) {
        limit = parseInt(limit);
    }
    if (offset) {
        offset = parseInt(offset);
    }
    return TradeRecordDb.findAndCountAll({
            where: where,
            limit: limit,
            offset: offset,
            order: order
        })
        .then((data) => {
            return {
                count: data.count,
                data: formatRecords(data.rows)
            }
        })
};

TradeRecord.find = (par)=> {
    let {
        system,
        tradeType,
        orderType,
        orderId
    } = par;

    let where = {};

    if (system) {
        where.system = system
    }

    if (tradeType) {
        where.tradeType = tradeType
    }

    if (orderType) {
        where.orderType = orderType
    }

    if (orderId) {
        where.orderId = orderId
    }

    return TradeRecordDb.find({
        where: where
    })
};

module.exports = TradeRecord;