'use strict'

/**
 * @author WXP
 * @description 付款记录
 */

const router = require('express').Router();
const Joi = require('joi');
const joiValidator = require('../../utils/joiValidator');
const excelExport = require('excel-export');
const path = require('path');
const moment = require('moment');
const {
    Payment,
    Mapping,
    Statistics
} = require('../../service');

router.get('/record', joiValidator({
    query: {
        limit: Joi.number().integer().min(1).max(100).required(),
        offset: Joi.number().min(0),
        startTime: Joi.date(),
        endTime: Joi.date(),
        status: Joi.valid(Mapping.STATUS_ARR),
        validateStatus: Joi.any().valid(['all', '0', '99', '-99']),
        validateStatus2: Joi.any().valid(Mapping.WEB_VALIDATE_STATE),
        system: Joi.valid(Mapping.SYSTEMS_ARR, 'other'),
        source: Joi.valid(Mapping.WEB_SOURCE_MAPPING_ARR),
        mainTradeChannel: Joi.valid(Mapping.MAIN_TRADE_CHANNEL_ARR, 'other'),
        orderType: Joi.valid(Mapping.WEB_PAYMENT_ORDER_TYPE_ARR, 'other'),
        tradeRecordNo: Joi.string(),
        orderNo: Joi.string(),
        cityId: Joi.string(),
        _: Joi.any()
    }
}), (req, res) => {
    Payment.records(req.query)
        .then((data) => {
            return res.dtResponse(data.data, {
                count: data.count
            });
        })
});

router.get('/record/export', joiValidator({
    query: {
        startTime: Joi.date(),
        endTime: Joi.date(),
        status: Joi.valid(Mapping.STATUS_ARR),
        validateStatus: Joi.any().valid(['all', '0', '99', '-99']),
        validateStatus2: Joi.any().valid(Mapping.WEB_VALIDATE_STATE),
        system: Joi.valid(Mapping.SYSTEMS_ARR, 'other'),
        source: Joi.valid(Mapping.WEB_SOURCE_MAPPING_ARR),
        mainTradeChannel: Joi.valid(Mapping.MAIN_TRADE_CHANNEL_ARR, 'other'),
        orderType: Joi.valid(Mapping.WEB_PAYMENT_ORDER_TYPE_ARR, 'other'),
        tradeRecordNo: Joi.string(),
        orderNo: Joi.string(),
        cityId: Joi.string(),
        _: Joi.any()
    }
}), (req, res) => {
    req.query.limit = 20000;
    req.query.offset = 0;
    Payment.records(req.query)
        .then((data) => {
            if (data.count > 20000) {
                throw ('最大导出2W条记录');
            }
            let conf = {};
            let result = [];
            for (let record of data.data) {
                result.push([
                    record.tradeRecordNo,
                    record.createdAt,
                    record.statusStr,
                    record.mainTradeChannelStr,
                    record.tradeChannelStr,
                    record.accountFrom,
                    record.accountTo,
                    record.totalFee.toFixed(2),
                    record.refundStatusStr,
                    record.refundFee.toFixed(2),
                    record.refundableFee.toFixed(2),
                    record.orderTypeStr,
                    record.orderId,
                    record.systemStr || '',
                    record.remark || '',
                    record.message || '',
                    record.validateStatusName || '',
                    (record.validateBalance || 0).toFixed(2),
                    record.error || '',
                    record.validateTime || '',
                    record.cityName || '',
                    record.cityId || '',
                ])
            }
            conf.stylesXmlFile = path.join(__dirname, '../../config/excel/stock-export-styles.xml');
            conf.cols = [{
                caption: '交易号',
                type: 'string'
            },
                {
                    caption: '发起时间',
                    type: 'string'
                }, {
                    caption: '支付状态',
                    type: 'string'
                }, {
                    caption: '交易渠道',
                    type: 'string'
                }, {
                    caption: '交易渠道明',
                    type: 'string'
                }, {
                    caption: '交易账户',
                    type: 'string'
                }, {
                    caption: '业务账户',
                    type: 'string'
                },{
                    caption: '支付金额',
                    type: 'string'
                }, {
                    caption: '退款状态 ',
                    type: 'string'
                }, {
                    caption: '已退款金额',
                    type: 'string'
                }, {
                    caption: '可退款金额',
                    type: 'string'
                }, {
                    caption: '对应单据类型',
                    type: 'string'
                }, {
                    caption: '对应单据单号',
                    type: 'string'
                }, {
                    caption: '发起系统',
                    type: 'string'
                }, {
                    caption: '支付备注',
                    type: 'string'
                }, {
                    caption: '支付错误说明',
                    type: 'string'
                }, {
                    caption: '对账状态',
                    type: 'string'
                }, {
                    caption: '对账差额',
                    type: 'string'
                }, {
                    caption: '对账失败原因',
                    type: 'string'
                }, {
                    caption: '对账时间',
                    type: 'string'
                }, {
                    caption: '城市',
                    type: 'string'
                }, {
                    caption: '城市编号',
                    type: 'string'
                }
                // record.error,
                // record.validateStatus,
                // record.validateStatusName,
                // record.validateTime,
            ];
            conf.rows = result;
            var filename = '付款记录' + moment().format('YYYY-MM-DD-HH-mm-ss') + '.xlsx';
            var fileName = encodeURI(filename, 'UTF8');
            res.setHeader('Content-Type', 'application/vnd.openxmlformats');
            res.setHeader('Content-Disposition', 'attachment; filename=' + fileName);
            res.end(excelExport.execute(conf), 'binary');
        })
});

router.get('/record/statistic', joiValidator({
    query: {
        startTime: Joi.date(),
        endTime: Joi.date(),
        status: Joi.valid(Mapping.STATUS_ARR),
        validateStatus: Joi.any().valid(['all', '0', '99', '-99']),
        validateStatus2: Joi.any().valid(Mapping.WEB_VALIDATE_STATE),
        system: Joi.valid(Mapping.SYSTEMS_ARR, 'other'),
        source: Joi.valid(Mapping.WEB_SOURCE_MAPPING_ARR),
        mainTradeChannel: Joi.valid(Mapping.MAIN_TRADE_CHANNEL_ARR, 'other'),
        orderType: Joi.valid(Mapping.WEB_PAYMENT_ORDER_TYPE_ARR, 'other'),
        tradeRecordNo: Joi.string(),
        orderNo: Joi.string(),
        _: Joi.any()
    }
}), (req, res) => {
    Statistics.paymentRecordStatistics(req.query)
        .then(data => {
            res.success(data);
        })
});

module.exports = router;