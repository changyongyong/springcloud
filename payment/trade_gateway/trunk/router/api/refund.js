'use strict';

const router = require('koa-router')();
const {
    Refund
 } = require('../../service');

router.post('/refund', (ctx) => {
   return Refund.refund(ctx.request.body)
    .then((data) => {
        return ctx.response.success(data);
    })
})

module.exports = router;