'use strict';

const log4js = require('log4js');
log4js.configure(require('../config/log4jConfig'));
module.exports.log4js = log4js;
module.exports.Logger = function (name) {
    var logger = log4js.getLogger(name);
    return logger;
};