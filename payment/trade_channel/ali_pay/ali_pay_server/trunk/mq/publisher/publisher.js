var MqSendMessage = require('../../models/ctcdb').MqSendMessage;
var MESSAGE_ID_START = 'ALI_PAY_TUNNEL_';
var PROCESS_ID = process.pid;
var Promise = require('bluebird');
var Publisher = function (publisher) {
    this.publisher = publisher;
};
var logger = require('../../utils/logger').Logger('mq-publisher-publisher');

/**
 * 消息结构为：
 * {
 *      messageId,
 *      data: {
 *          业务所需内容
 *      }
 * }
 */
Publisher.prototype.initMessage = function (message) {
    // 系统开头+进程号+时间戳+2位随机数
    var no = MESSAGE_ID_START + '_' + PROCESS_ID + '_' + Date.now() + parseInt(Math.random() * 100);
    message.messageId = no;
    return Promise.resolve(message);
}

/**
 * 发送消息
 * 1、插入消息记录（插入失败回滚）
 * 2、发送消息
 * 3、发送成功删除，失败保留消息
 * @param message
 * @param options
 * @param callback
 */
Publisher.prototype.saveMessage = function (par, options) {
    var publisher = this.publisher;
    var transaction;
    var message = par.message;
    var sendOptions = par.options;
    transaction = options.transaction;
    //插入消息
    return MqSendMessage.create({
        content: JSON.stringify(message),
        type: publisher,
        options: sendOptions && JSON.stringify(sendOptions) || '',
        timestamp: Date.now()
    }, {
        transaction: transaction
    })
};

/**
 * 发送成功后删除消息，如果删除消息失败，事务不回滚
 */
Publisher.prototype.success = function (log, options) {
    return log.destroy({
            transaction: options && options.transaction
        })
        .catch(function (error) {
            logger.error(error, error.sql, error.stack);
            return '';
        })
}

module.exports = Publisher;