'use strict';
const consumer = require('./consumer');

const start = function(){
    consumer.bindPaymentResult();
    consumer.bindRefundResult();
    consumer.bindTransferResult();
    consumer.bindValidateResult();
}

module.exports = {
    start: start
}
