'use strict'

/**
* @author wt
* @description 支付宝授权回调结果处理
*/

const util = require('util');
const {
    Auth
} = require('../../service');
const MessageHandler = require('./messageHandler');
const STATES = MessageHandler.states;

/**
 * 进销存明细处理
 * @param message 接收到的消息
 * @constructor
 */
var Handler = function (message) {
    MessageHandler.call(this, message, 'ALI_AUTH_MERCHANT');
    this.messageData = message.data;
    this._start = new Date();
};

util.inherits(Handler, MessageHandler);

var handler = Handler.prototype;

handler.handle = function () {
    let that = this;
    let message = that.messageData;
    return this.saveMessage()
        .then(function () {
            return Auth.handle(message);
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