const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const routes = require('./routes/index');
const xmlParser = require('express-xml-bodyparser');
const flash = require('connect-flash');
const app = express();
const os = require('os');
const Logger = require('./utils/logger').Logger('access');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('view cache', false);
app.use(flash());
app.use(xmlParser({ trim: true, explicitArray: false }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ limit: '1mb', extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

function getClientAddress(req) {
    return (req.headers['x-forwarded-for'] || '').split(',')[0] || req.connection.remoteAddress;
}
/**
 * 拦截请求，生成访问日志
 */
app.use((req, res, next)=> {
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

app.use('/', routes);

/**
 * catch 404 and forward to error handler
 */
app.use((req, res)=> {
    Logger.error(req.originalUrl, '   404');
    let err = new Error('Not Found');
    err.status = 404;
    res.json({
        tag: 'error',
        error: 404
    })
});

module.exports.app = app;