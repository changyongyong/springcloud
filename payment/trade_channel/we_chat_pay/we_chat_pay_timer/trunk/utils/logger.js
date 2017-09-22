'use strict';

const log4js = require('log4js');
log4js.configure(require('../config/log4jConfig'), {reloadSecs: 60});
module.exports.log4js = log4js;
module.exports.Logger = function (name) {
    var logger = log4js.getLogger(name);
    logger.setLevel('info');
    return logger;
};