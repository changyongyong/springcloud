const express = require('express');
const bodyParser = require('body-parser');
const os = require('os');
const routes = require('./routes');
const app = express();
const Logger = global.Logger('access');
const middleware = require('./middleware');
const favicon = require('serve-favicon');
const path = require('path');
// const xmlParser = require('express-xml-bodyparser');
// app.use(xmlParser({ trim: true, explicitArray: false }));

app.use(favicon(path.join(__dirname, 'public/favicon.ico')));

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ limit: '1mb', extended: true }));

/**
 * 拦截请求，生成访问日志
 */
app.use(function (req, res, next) {
    req.headers['hostname'] = os.hostname();
    Logger.info(getClientAddress(req) + '  ' +
        req.method + '  ' +
        req.url + '  ' +
        req.headers.hostname + '  ' +
        JSON.stringify(req.params) + '  ' +
        JSON.stringify(req.query) + '  ' +
        JSON.stringify(req.body));

    next();

    function getClientAddress(req) {
        return (req.headers['x-forwarded-for'] || '').split(',')[0] ||
            req.connection.remoteAddress;
    }
});

app.use(middleware.res);

app.use('/', routes);
/**
 * catch 404 and forward to error handler
 */
/* eslint-disable no-unused-vars */
// next 
app.use(function (req, res, next) {
    /* eslint-enable no-unused-vars */
    Logger.error(req.originalUrl, '   404');
    let err = new Error('Not Found');
    err.status = 404;
    res.json({
        tag: 'error',
        error: 404
    })
});

module.exports = app;