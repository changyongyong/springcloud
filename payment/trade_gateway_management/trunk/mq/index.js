'use strict';
const consumer = require('./consumer');

const start = function(){
    consumer.AliAuthMerchant()
}

module.exports = {
    start: start
}
