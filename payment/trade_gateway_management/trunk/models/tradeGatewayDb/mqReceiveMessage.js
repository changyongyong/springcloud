/**
 * @since 2016年8月16日11:01:19
 * @author 吴秀璞
 * @description 用以存储收到的消息，消息处理后修改对应状态，定期删除（延迟2~3天），防止重复
 */
module.exports = function (sequelize, DataTypes) {
    var baseTypes = {
        //更新qoa
        qoa: 'qoa',
        updateInOutDetail: 'updateInOutDetail'
    };

    var baseStates = {
        //异常
        error: -99,
        //待处理
        unhandled: 0,
        //已处理
        handled: 99
    }
    var MqReceiveMessage = sequelize.define('MqReceiveMessage', {
        messageId: {
            type: DataTypes.STRING,
            comment: '消息Id'
        },
        state: {
            type: DataTypes.INTEGER,
            comment: '状态'
        },
        type: {
            type: DataTypes.STRING,
            comment: '消息类型'
        },
        content: {
            type: DataTypes.TEXT,
            comment: '消息内容'
        },
        error: {
            type: DataTypes.TEXT,
            comment: '错误信息'
        },
        timestamp: {
            type: DataTypes.STRING,
            comment: '发送时间戳'
        }
    }, {
        freezeTableName: true,
        tableName: 'mq_receive_messages',
        classMethods: {
            getBaseTypes: function () {
                return baseTypes;
            },
            getBaseStates: function () {
                return baseStates;
            }
        }
    });
    return MqReceiveMessage;
};