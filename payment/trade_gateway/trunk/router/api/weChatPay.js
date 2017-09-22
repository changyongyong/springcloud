'use strict';

const router = require('koa-router')();
const {
    WeChatPay
} = require('../../service');

router.post('/payment/create', (ctx) => {
    return WeChatPay.Payment.create(ctx.request.body)
        .then((data) => {
            return ctx.response.success(data);
        })
});

router.post('/payment/scanPay', (ctx) => {
    return WeChatPay.Payment.scanPay(ctx.request.body)
        .then((data) => {
            return ctx.response.success(data);
        })
});

module.exports = router;