'use strict';

/**
 * 交易记录
 * @author 吴秀璞
 * @since 2017/1/16
 */

const ddPayDb = require('../models/ddPayDb');
const {
    TradeRecord: TradeRecordDb
} = ddPayDb;
const moment = require('moment');
var json2csv = require('json2csv');
const ACCOUNT_FIELDS = {
    //余额
    balance: '余额',
    //押金
    deposit: '押金'
};
const fields = [{
        label: '交易流水号',
        value: 'tradeRecordNo',
        default: ''
    },
    {
        label: '类型',
        value: function (row) {
            switch (row.type) {
                case 1:
                    return '转入';
                case -1:
                    return '转出';
            }
        },
        default: ''
    },
    {
        label: '交易类型',
        value: 'tradeType',
        default: ''
    },
    {
        label: '总计金额',
        value: function (row) {
            return row.totalAmount.toFixed(2);
        },
        default: ''
    },
    {
        label: '实际金额',
        value: function (row) {
            return row.receiptAmount.toFixed(2);
        },
        default: ''
    },
    {
        label: '金额区域',
        value: function (row) {
            return ACCOUNT_FIELDS[row.field]
        },
        default: ''
    },
    {
        label: '支付账户编号',
        value: 'tradeAccountNo',
        default: ''
    },
    {
        label: '交易对方支付账户编号',
        value: 'counterpartyNo',
        default: ''
    },
    {
        label: '对应单据类型',
        value: 'orderType',
        default: ''
    },
    {
        label: '对应单据的编号',
        value: 'orderId',
        default: ''
    },
    {
        label: '备注',
        value: 'remark',
        default: ''
    },
    {
        label: '交易网关支付号',
        value: 'outTradeRecordNo',
        default: ''
    },
    {
        label: '发起系统',
        value: 'system',
        default: ''
    },
    {
        label: '交易主体',
        value: 'tradePrincipal',
        default: ''
    },
    {
        label: '入账时间',
        value: function (row) {
            return moment(row.createdAt).format('YYYY-MM-DD HH:mm:ss')
        },
        default: ''
    }
];

module.exports.download = function ({
    date,
    system,
    isBoom
}) {
    let startTime = moment(date).format('YYYY-MM-DD HH:mm:ss');
    let endTime = moment(date).add(1, 'd').format('YYYY-MM-DD HH:mm:ss');
    return TradeRecordDb.findAll({
            where: {
                createdAt: {
                    $gt: startTime,
                    $lt: endTime
                },
                system: system
            },
            raw: true
        })
        .then(function (data) {
            let options = { data: data, fields: fields };
            if (isBoom) {
                options.withBOM = true;
            }
            return json2csv(options);
        })
}