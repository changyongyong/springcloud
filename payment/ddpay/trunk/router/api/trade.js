'use strict';

const router = require('koa-router')();
const { Trade } = require('../../service');

/**
 * 提现转账
 */
router.post('/withdraw', function (ctx) {
    return Trade.withdrawCash(ctx.request.body)
        .then((data) => {
            return ctx.response.success(data);
        })
});

/**
 * 取消转账
 */
router.post('/cancelWithdraw', function (ctx) {
    return Trade.cancelWithdrawCash(ctx.request.body)
        .then((data) => {
            return ctx.response.success(data);
        })
});

/**
 * 重试转账
 */
router.post('/repeatWithdraw', function (ctx) {
    return Trade.repeatWithdrawCash(ctx.request.body)
        .then((data) => {
            return ctx.response.success(data);
        })
});


/**
 * 押金转余额
 */
router.post('/deposit/balance', function (ctx) {
    return Trade.depositToBalance(ctx.request.body)
        .then((data) => {
            return ctx.response.success(data);
        })
});

/**
 * 余额转押金
 */
router.post('/balance/deposit', function (ctx) {
    return Trade.balanceToDeposit(ctx.request.body)
        .then((data) => {
            return ctx.response.success(data);
        })
});

/**
 * 增加余额
 */
router.post('/balance/charge', function (ctx) {
    return Trade.chargeBalance(ctx.request.body)
        .then((data) => {
            return ctx.response.success(data);
        })
});

/**
 * 通过支付增加余额
 */
router.post('/balance/charge/pay', function (ctx) {
    return Trade.payChargeBalance(ctx.request.body)
        .then((data) => {
            return ctx.response.success(data);
        })
});

/**
 * 充值押金
 */
router.post('/deposit/charge', function (ctx) {
    return Trade.chargeDeposit(ctx.request.body)
        .then((data) => {
            return ctx.response.success(data);
        })
});

/**
 * 减少余额
 */
router.post('/balance/decrease', function (ctx) {
    return Trade.decreaseBalance(ctx.request.body)
        .then((data) => {
            return ctx.response.success(data);
        })
});

/**
 * 充值押金
 */
router.post('/selfTransfer', function (ctx) {
    return Trade.selfTransfer(ctx.request.body)
        .then((data) => {
            return ctx.response.success(data);
        })
});

module.exports = router;