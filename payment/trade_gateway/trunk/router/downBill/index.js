'use strict';

const router = require('koa-router')();
const validateService = require('../../service/billValidate');

router.get('/alipay/:type/record', (ctx) => {
    let type = ctx.params.type;
    let queryData = ctx.query;
    queryData.type = type;
    queryData.channel = 'ALI_PAY';
    return validateService.list(queryData)
        .then((data) => {
            return ctx.response.success(data);
        })
        .catch(e => {
            return ctx.response.error(e);
        })
});

// {
//     "id": 2458,
//     "status": "PENDDING",
//     "tradeRecordNo": "test_PAYMENT201706141051075",
//     "tradeChannel": "WE_CHAT_PAY_NATIVE",
//     "totalFee": 1,
//     "system": "delivery_app",
//     "source": "psapp",
//     "payTime": null,
//     "validateStatus": 99,
//     "error": null
// },
router.get('/weixin/:type/record', (ctx) => {
    let type = ctx.params.type;
    let queryData = ctx.query;
    queryData.type = type;
    queryData.channel = 'WE_CHAT_PAY';
    return validateService.list(queryData)
        .then((data) => {
            return ctx.response.success(data);
        })
        .catch(e => {
            return ctx.response.error(e);
        })
});

module.exports = router;