'use strict';

const _ = require('lodash');

const STATUS = {
    SUCCESS: 99,
    PENDING: 0,
    FAIL: -99
};

const TYPES = {

};

module.exports = function (sequelize, DataTypes) {
    var OperateLog = sequelize.define('OperateLog', {
        //操作方法名
        operate: {
            type: DataTypes.STRING,
            comment: '请求方法'
        },
        //参数
        params: {
            type: DataTypes.TEXT,
            comment: 'JSONStrigfy后的请求参数'
        },
        //单据Id
        orderId: {
            type: DataTypes.STRING(200),
            comment: '操作对应单据Id'
        },
        //单据类型
        orderType: {
            type: DataTypes.STRING(400),
            comment: '操作对应单据类型'
        },
        //处理状态
        status: {
            type: DataTypes.INTEGER,
            comment: '处理状态'
        },
        //请求人
        operator: {
            type: DataTypes.STRING(100),
            comment: '操作人'
        },
        //操作日志编号
        operateLogNo: {
            type: DataTypes.STRING(100),
            comment: '操作日志编号'
        },
        //消息编号
        messageId: {
            type: DataTypes.STRING(100),
            comment: '对应消息ID，防止重复'
        },
        //错误信息
        error: {
            type: DataTypes.TEXT,
            comment: '错误信息'
        },
        system: {
            type: DataTypes.STRING(200),
            comment: '请求来源系统'
        }
    }, {
        freezeTableName: true,
        tableName: 'operate_logs',
        indexes: [{
            //消息编号，用以防重，同一消息同一操作只允许一次
            name: 'messageId',
            type: 'UNIQUE',
            fields: ['messageId', 'operate']
        }, {
            name: 'operate_orderId',
            fields: ['operate', 'orderId']
        }],
        classMethods: {
            getStatus: function () {
                return _.clone(STATUS);
            },
            getTypes: function () {
                return _.clone(TYPES);
            }
        }
    });
    return OperateLog;
};