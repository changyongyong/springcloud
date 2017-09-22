/**
 * Created by wt on 2017/7/20.
 */
const router = require('koa-router')();
const {
    Account
} = require('../../service');

router.post('/way', (ctx) => {
    return Account.way(ctx.request.body)
        .then((data) => {
            return ctx.response.success(data);
        })
});

router.post('/send', (ctx)=> {
    return Account.send(ctx.request.body)
        .then((data) => {
            return ctx.response.success(data);
        })
});

router.post('/add', (ctx)=> {
    return Account.add(ctx.request.body)
        .then((data) => {
            return ctx.response.success(data);
        })
});

module.exports = router;