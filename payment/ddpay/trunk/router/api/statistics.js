'use strict';

const router = require('koa-router')();
const { Statistics } = require('../../service');

/**
 * 提现转账
 */
router.get('/byType', function (ctx) {
    return Statistics.byType(ctx.request.query)
        .then((data) => {
            return ctx.response.success(data);
        })
});

router.post('/byType', function (ctx) {
    return Statistics.byType(ctx.request.body)
        .then((data) => {
            return ctx.response.success(data);
        })
});

module.exports = router;