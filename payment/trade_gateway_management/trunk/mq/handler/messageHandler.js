'use strict';

const Promise = require('bluebird');
const {
    MqReceiveMessage: MqReceiveMessageDb
 } = require('../../models/tradeGatewayDb');
const STATES = MqReceiveMessageDb.getBaseStates();
let MessageHandler;

MessageHandler = function (message, type) {
    this.message = message;
    this.type = type;
    this.system = global.SYSTEM;
    this.__mqReceiveMessage;
};

MessageHandler.types = MqReceiveMessageDb.getBaseTypes();
MessageHandler.states = STATES;

MessageHandler.prototype.saveMessage = function () {
    let message = this.message,
        type = this.type,
        messageId = message.messageId,
        that = this;
    return MqReceiveMessageDb.create({
            content: JSON.stringify(message),
            messageId: messageId,
            state: STATES.unhandled,
            type: type
        })
        .then(function (data) {
            that.__mqReceiveMessage = data;
            return Promise.resolve();
        })
};

MessageHandler.prototype.messageHandled = function (data, options) {
    options = options || {};
    let transaction = options.transaction,
        that = this;
    switch (data.state) {
        case STATES.handled:
            that.__mqReceiveMessage.state = STATES.handled;
            break;
        case STATES.error:
            that.__mqReceiveMessage.state = STATES.error;
            // 防止超出范围 1 utf-8 汉字 = 1-3 字节
            that.__mqReceiveMessage.error = (JSON.stringify(data.error)).slice(0, 2000);
            break;
    }
    return that.__mqReceiveMessage.save({
            transaction: transaction
        })
        .then(function () {
            return Promise.resolve(that);
        })
}

module.exports = MessageHandler;