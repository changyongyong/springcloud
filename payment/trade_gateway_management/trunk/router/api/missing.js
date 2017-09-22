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
    Missing,
    Mapping
} = require('../../service');

router.get('/record', joiValidator({
    query: {
        limit: Joi.number().integer().min(1).max(100).required(),
        offset: Joi.number().min(0),
        startTime: Joi.date(),
        endTime: Joi.date(),
        status: Joi.valid(Mapping.STATUS_ARR),
        type:Joi.string(),
        //system: Joi.valid(Mapping.SYSTEMS_ARR, 'other'),
        source: Joi.valid(Mapping.WE_CHAT_SOURCE_ARR, 'alipay', 'other'),
        mainTradeChannel: Joi.valid(Mapping.MAIN_TRADE_CHANNEL_ARR, 'other'),
        //orderType: Joi.string(),
        tradeRecordNo: Joi.string(),
        _: Joi.any()
    }
}), (req, res) => {
    Missing.records(req.query)
        .then((data) => {
            return res.dtResponse(data.data, {
                count: data.count
            });
        })
});


module.exports = router;