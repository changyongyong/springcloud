/**
 * Created by SEELE on 2017/7/14.
 */

const router = require('koa-router')();
const {
    PayTest
} = require('../../service');

router.post('/aliPay', (ctx) => {
    return PayTest.aliPay(ctx.request.body)
        .then((data) => {
            return ctx.response.success(data);
        })
});


router.post('/aliTransfer', (ctx) => {
    return PayTest.aliTransfer(ctx.request.body)
        .then((data) => {
            return ctx.response.success(data);
        })
});


router.post('/wxPay', (ctx) => {
    return PayTest.wxPay(ctx.request.body)
        .then((data) => {
            return ctx.response.success(data);
        })
});


router.post('/wxScanPay', (ctx) => {
    return PayTest.wxScanPay(ctx.request.body)
        .then((data) => {
            return ctx.response.success(data);
        })
});


module.exports = router;