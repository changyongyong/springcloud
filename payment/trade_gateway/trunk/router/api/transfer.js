'use strict'

/**
* @author WXP
* @description  转账内容
*/

const router = require('koa-router')();
const {
    Transfer
 } = require('../../service');

router.post('/transfer', function (ctx) {
    return Transfer.transfer(ctx.request.body)
        .then((data) => {
            return ctx.response.success(data);
        })
});

module.exports = router;