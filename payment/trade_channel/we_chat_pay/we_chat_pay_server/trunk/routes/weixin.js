'use strict'

/**
 * @author WXP
 * @description 支付相关的路由
 */

const router = require('express').Router();
const service = require('../service');

/**
 * 直接将service方法包装为router方法
 * @param {*} fn 
 * @param {*} option 
 */
const servicePackage = function (fn, options) {
    options = options || {};
    let key =
        // 当为非GET方法时使用body
        options.method && ['GET', 'get'].indexOf(options.method) < 0 ?
        'body' : 'query';
    return function (req, res) {
        fn(req[key])
            .then((data) => {
                res.success(data);
            })
            .catch((error) => {
                res.error(error);
            })
    }
}

// 支付相关
// 统一下单
router.get('/create', servicePackage(service.Pay.create));
// 条码付
router.get('/scanPay', servicePackage(service.Pay.scanPay));
// 查询支付状态
router.get('/queryOrder', servicePackage(service.Pay.query));
// 关闭支付
router.get('/closeOrder', servicePackage(service.Pay.close));

// 退款相关
// 申请退款
router.get('/refund', servicePackage(service.Refund.refund));
// 查询退款结果
router.get('/refundQuery', servicePackage(service.Refund.query));

// 记录相关
// 查询相关的支付，退款记录
router.get('/record', servicePackage(service.Record.record));

// 账单相关
// 下载第三方的对账单
router.get('/bill/download', (req, res) => {
    service.Bill.download(req.query)
        .then((data) => {
            res.setHeader('Content-Type', 'text/plain');
            res.setHeader('Content-Disposition',
                'attachment; filename=' +
                req.query.billDate + '_' +
                req.query.billType + '_' +
                req.query.source + '.txt');
            return res.end(data);
        })
        .catch((error) => {
            res.error(error);
        })

});

// 通用方法
// 查询source与实际souce的映射
router.get('/sources', servicePackage(service.Comm.source));


module.exports = router;