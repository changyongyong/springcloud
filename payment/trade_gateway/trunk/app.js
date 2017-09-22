'use strict';
/* global Logger */
/**
 * global
 * 项目启动地址
 * @author 吴秀璞
 * @since 2016/11/28
 */
const Koa = require('koa');
const app = new Koa();
const bodyParser = require('koa-bodyparser');
const co = require('co');
const path = require('path');
const middleware = require('./middleware');
const logger = Logger('access');
const router = require('./router');

app.use(require('koa-static')(path.join(__dirname, './public')));

//配置记录真实IP
app.proxy = true;
//请求body的格式化
app.use(bodyParser());

// 记录响应所需时间
app.use(co.wrap(function* (ctx, next) {
    let request = ctx.request;
    let response = ctx.response;
    //不需要登录 所有用户ID为null
    logger.info(`${request.ip}  null  ${request.method}  ${request.url}  ` +
        `${JSON.stringify(request.query)}  ${JSON.stringify(request.body)}`);
    let start = new Date();
    try {
        yield next();
    } catch (error) {
        response.error(error);
    }
    logger.info(`${request.ip}  ${request.method}  ${request.url}  ${response.status}  ${new Date() - start}ms`);
}));

app.use(middleware.res());
app.use(router.routes());

app.on('error', (err) => {
    logger.error(`未被catch的异常 message:${err && err.message}  stack:${JSON.stringify(err && err.stack)} sql:${err.sql}`);
});

module.exports = app;
