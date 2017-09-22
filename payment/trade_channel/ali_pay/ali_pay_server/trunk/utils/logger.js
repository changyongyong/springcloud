let log4js = require('log4js');
let path = require('path');
let env = global.nodeEnv;
let log4jsConfig;
switch (env) {
    case 'development':
    {
        log4jsConfig = path.join(__dirname, '../config/log4j_configuration_development.json');
        break;
    }
    case 'test':
    {
        log4jsConfig = path.join(__dirname, '../config/log4j_configuration_test.json');
        break;
    }
    case 'production':
    {
        log4jsConfig = path.join(__dirname, '../config/log4j_configuration_production.json');
        break;
    }
    default :
        log4jsConfig = path.join(__dirname, '../config/log4j_configuration_development.json');
}
log4js.configure(log4jsConfig, {reloadSecs: 60});
module.exports.log4js = log4js;
module.exports.Logger = function (name) {
    let logger = log4js.getLogger(name);
    logger.setLevel('info');
    return logger;
};