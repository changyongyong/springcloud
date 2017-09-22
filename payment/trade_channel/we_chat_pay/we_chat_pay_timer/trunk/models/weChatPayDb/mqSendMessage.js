/**
 * @since 2016年7月22日14:01:09
 * @author 吴秀璞
 * @description 用以存储发送的消息，消息发送成功后删除对应消息
 */

module.exports = function (sequelize, DataTypes) {
    var MqSendMessage = sequelize.define('MqSendMessage', {
        type: {
            type: DataTypes.STRING,
            comment: '消息类型'
        },
        content: {
            type: DataTypes.TEXT,
            comment: '消息内容'
        },
        options: {
            type: DataTypes.TEXT,
            comment: '消息参数'
        },
        //qoa的最小生产日期
        timestamp: {
            type: DataTypes.STRING,
            comment: '发送时间戳'
        }
    }, {
        freezeTableName: true,
        tableName: 'mq_send_messages'
    });
    return MqSendMessage;
};