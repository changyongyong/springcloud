'use strict';

const router = require('koa-router')();
const { TradeAccount } = require('../../service');

/**
 * 查询账户信息
 */
router.get('/', function (ctx) {
    return TradeAccount.find(ctx.request.query)
        .then(function (data) {
            return ctx.response.success(data);
        })
});

/**
 * 创建账号
 */
router.post('/create', function (ctx) {
    return TradeAccount.create(ctx.request.body)
        .then(function (data) {
            return ctx.response.success(data);
        })
});

/**
 * 增加账号绑定
 */
router.post('/add', function (ctx) {
    return TradeAccount.add(ctx.request.body)
        .then(function (data) {
            return ctx.response.success(data);
        })
});

/**
 * 修复账号禁用等问题
 */
router.post('/fix', function (ctx) {
    return TradeAccount.fix(ctx.request.body)
        .then(function (data) {
            return ctx.response.success(data);
        })
});


/**
 * 修复账号禁用等问题
 */
router.post('/tradePwd', function (ctx) {
    return TradeAccount.setTradePwd(ctx.request.body)
        .then(function (data) {
            return ctx.response.success(data);
        })
});

router.get('/thirdPartAccount', function (ctx) {
    return TradeAccount.getThirdPartAccounts(ctx.request.query)
        .then(function (data) {
            return ctx.response.success(data);
        })
});

router.post('/thirdPartAccount/bind', function (ctx) {
    return TradeAccount.bindThirdPartAccount(ctx.request.body)
        .then(function (data) {
            return ctx.response.success(data);
        })
});

router.post('/thirdPartAccount/update', function (ctx) {
    return TradeAccount.updateThirdPartAccount(ctx.request.body)
        .then(function (data) {
            return ctx.response.success(data);
        })
});

router.post('/thirdPartAccount/unbind', function (ctx) {
    return TradeAccount.unbindThirdPartAccount(ctx.request.body)
        .then(function (data) {
            return ctx.response.success(data);
        })
});

router.get('/tradeRecord', function (ctx) {
    if (ctx.request.query.order) {
        ctx.request.query.order = JSON.parse(ctx.request.query.order);
    }
    return TradeAccount.tradeRecord(ctx.request.query)
        .then(function (data) {
            return ctx.response.success(data);
        })
});

module.exports = router;