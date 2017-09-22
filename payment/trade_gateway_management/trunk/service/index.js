'use strict'
/* eslint-disable global-require */

/**
 * @author WXP
 * @description 
 */
module.exports = {
    Payment: require('./payment'),
    Refund: require('./refund'),
    Transfer: require('./transfer'),
    Missing: require('./missing'),
    Mapping: require('./mapping'),
    Statistics:require('./statistics'),
    Auth: require('./auth')
};