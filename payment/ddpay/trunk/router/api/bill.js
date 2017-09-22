'use strict';

const router = require('koa-router')();
const { Bill } = require('../../service');
const moment = require('moment');
/**
 * 提现转账
 */
router.get('/download', function (ctx) {
    let query = ctx.request.query;
    return Bill.download(query)
        .then((data) => {
            ctx.response.set('content-type', 'application/octet-stream');
            ctx.response.attachment(
                `${moment(query.date).format('YYYY-MM-DD')}_${query.system}_${parseInt(Date.now() / 1000)}.csv`
            );
            return ctx.response.body = data;
        })
});

module.exports = router;