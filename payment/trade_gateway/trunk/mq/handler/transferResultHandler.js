'use strict';


const util = require('util');
const {
    Transfer
} = require('../../service');
const MessageHandler = require('./messageHandler');
const STATES = MessageHandler.states;

var Handler = function (message) {
    MessageHandler.call(this, message, 'TRADE_TRANSFER_RESULT');
    this.messageData = message.data;
    this._start = new Date();
};

util.inherits(Handler, MessageHandler);

var handler = Handler.prototype;

handler.handle = function () {
    let that = this;
    let message = that.messageData;
    message.orderId = message.tradeRecordNo;
    message.orderType = 'TransferResultHandle';
    message.system = global.SYSTEM;
    return this.saveMessage()
        .then(function () {
            return Transfer.handle(message);
        })
        .then(function () {
            return that.messageHandled({
                state: STATES.handled
            })
        })
        .catch(function (error) {
            var message;
            if (typeof error == 'string') {
                message = error;
            } else {
                message = JSON.stringify({
                    message: error.message,
                    stack: error.stack
                });
            }
            return that.messageHandled({
                state: STATES.error,
                error: message
            })
        })
};

module.exports = Handler;