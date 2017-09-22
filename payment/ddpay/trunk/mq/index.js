'use strict';
const consumer = require('./consumer');

const start = function(){
    consumer.bindTradeResult();
    consumer.bindTransferResult()
}

module.exports = {
    start: start
}