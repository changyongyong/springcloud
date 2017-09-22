/**
 * Created by frank-z on 2017/4/6.
 */
'use strict';

const util = require('util');
const {
    BillValidate
} = require('../../service');
const MessageHandler = require('./messageHandler');
const STATES = MessageHandler.states;

/**
 * 与上游渠channel对账
 * @param message 接收到的消息
 * @constructor
 */
var Handler = function (message) {
    MessageHandler.call(this, message, 'trade_gateway_trade_channel_validate_result');
    this.messageData = message.data;
    this._start = new Date();
};

util.inherits(Handler, MessageHandler);

var handler = Handler.prototype;

handler.handle = function () {
    let that = this;
    let opts = that.messageData;
    return this.saveMessage()
        .then(function () {
            return BillValidate.listen(opts);
        })
        .then(function () {
            return that.messageHandled({
                state: STATES.handled
            })
        })
        .catch(function (error) {
            let message;
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
