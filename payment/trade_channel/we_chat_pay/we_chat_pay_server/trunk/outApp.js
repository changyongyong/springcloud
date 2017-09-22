'use strict'

/**
 * @author wdq
 * @description 仅用于外网访问 
 */

const express = require('express');
const xmlParser = require('express-xml-bodyparser');
const os = require('os');
const app = express();
const Logger = global.Logger('access');
const outRoutes = require('./outRoutes');

function getClientAddress(req) {
    return (req.headers['x-forwarded-for'] || '').split(',')[0] ||
        req.connection.remoteAddress;
}

app.use(xmlParser({ trim: true, explicitArray: false }));

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
});

app.use('/weixin', outRoutes);

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