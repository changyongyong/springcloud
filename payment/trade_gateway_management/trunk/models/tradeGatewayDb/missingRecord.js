/**
 * Created by frank-z on 2017/4/6.
 */

//丢失记录表
module.exports = function (sequelize, DataTypes) {
    var MissingRecord = sequelize.define('MissingRecord', {
        id: {
            field: 'ms_id',
            type: DataTypes.INTEGER,
            comment: '自增主键',
            primaryKey: true
        },
        type: {    //'payment'  'refund'  'transfer'
            field: 'ms_type',
            type: DataTypes.STRING(200),
            comment: '交易类型'
        },
        tradeRecordNo: {
            field: 'ms_trade_record_no',
            type: DataTypes.STRING(200),
            comment: '交易流水号'
        },
        status: {
            field: 'ms_status',
            type: DataTypes.STRING(200),
            comment: '状态'
        },
        tradeChannel: {
            field: 'ms_trade_channel',
            type: DataTypes.STRING(100),
            comment: '交易渠道'
        },
        source: {
            field: 'ms_source',
            type: DataTypes.STRING(100),
            comment: 'APP源'
        },
        fee: {
            field: 'ms_fee',
            type: DataTypes.DECIMAL(15, 2),
            comment: '金额'
        },
        message: {
            field: 'ms_message',
            type: DataTypes.STRING(100),
            comment: '消息'
        },
        operateState: {  //99 -99  0
            field: 'ms_operate_state',
            type: DataTypes.INTEGER,
            comment: '操作状态'
        },
        remark: {
            field: 'ms_remark',
            type: DataTypes.STRING(100),
            comment: '备注'
        }
    }, {
        freezeTableName: true,
        tableName: 'missing_records'
    });
    return MissingRecord;
};