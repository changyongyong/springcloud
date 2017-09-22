'use strict'

/**
 * global
 * 网站启动
 * @author WXP
 * @since 2016/11/28
 */
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const bodyParser = require('body-parser');
const routes = require('./router');
const Logger = global.Logger('access');
const log4js = require('./utils/logger').log4js;
const middleWare = require('./middleware');
const ejs = require('ejs');
const app = express();
const session = require('express-session');
const redisStore = require('connect-redis')(session);
const cookieParser = require('cookie-parser');
const redisConfig = global.DDCONFIG.redis;
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', ejs.renderFile);
// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(session({
    store: new redisStore({
        host: redisConfig.host,
        port: redisConfig.port,
        db: redisConfig.db
    }),
    secret: redisConfig.secret,
    key: redisConfig.key,
    resave: false,
    saveUninitialized: false
}));
app.use(function (req, res, next) {
    //记录IP，访问人，请求地址，请求方式，请求参数（params：路由参数 query：get参数 body：post等参数）
    Logger.info(req.ip + '  ' +
        (req.session.trade_gateway_management_user && req.session.trade_gateway_management_user.id || 'null') +
        '  ' + req.method + '  ' + req.url + '  ' + JSON.stringify(req.params) + '  ' +
        JSON.stringify(req.query) + '  ' + JSON.stringify(req.body));
    next();
});
app.use(log4js.connectLogger(Logger, {
    level: 'INFO',
    //       访问IP           请求方式        路由      处理状态        响应花费时间
    format: ':remote-addr  :method  :url  :status  :response-time' + 'ms'
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// 增加自定义的中间件
app.use(middleWare.res);

app.use(function (req, res, next) {
    if (req.url == '/user/login') {
        return next();
    }
    if (!req.session.trade_gateway_management_user) {
        res.redirect('/user/login');
    } else {
        next();
    }
});
app.use('/', routes);

// catch 404 and forward to error handler
app.use((req, res, next) => {
    Logger.error(req.method, req.originalUrl, '404');
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

//由于只有四个参数时被当做error handler 所以此处必须有四个参数。由于为终止代码，所以next未被使用
/* eslint-disable no-unused-vars */
// 统一的异常处理
app.use((err, req, res, next) => {
    /* eslint-enable no-unused-vars */
    if (err) {
        Logger.error({
            method: req.method,
            url: req.originalUrl,
            message: err.message,
            stack: err.stack
        });
    }
    if (!err.status) {
        err.status = 500;
    }
    res.statusCode = err.status;
    //仅限开发时使用
    if (app.get('env') === 'development') {
        res.json({
            tag: 'error',
            status: err.status,
            message: err.message,
            stack: err.stack
        });
    } else {
        res.json({
            tag: 'error',
            status: err.status,
            message: err.message
        });
    }
});


module.exports = app;