/**
 * Created by wt on 2017/7/24.
 */

const util = require('util');
const {
    Trade
} = require('../../service');
const MessageHandler = require('./messageHandler');
const STATES = MessageHandler.states;

/**
 * 转账消息处理
 * @param message 接收到的消息
 * @constructor
 */
var Handler = function (message) {
    MessageHandler.call(this, message, 'TRANSFER_RESULT');
    this.messageData = message.data;
    this._start = new Date();
};

util.inherits(Handler, MessageHandler);

var handler = Handler.prototype;

handler.handle = function () {
    let that = this;
    let message = that.messageData;
    message.orderId = message.tradeRecordNo;
    message.orderType = 'gatewayTransferResult';
    message.system = global.SYSTEM;
    return this.saveMessage()
        .then(function () {
            return Trade.handle(message);
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