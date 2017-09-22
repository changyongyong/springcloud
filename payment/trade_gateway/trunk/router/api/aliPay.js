'use strict';

const router = require('koa-router')();
const {
    AliPay
} = require('../../service');

router.post('/payment/create', (ctx) => {
    return AliPay.Payment.create(ctx.request.body)
        .then((data) => {
            return ctx.response.success(data);
        })
});

router.post('/payment/scanPay', (ctx) => {
    return AliPay.Payment.scanPay(ctx.request.body)
        .then((data) => {
            return ctx.response.success(data);
        })
});

module.exports = router;