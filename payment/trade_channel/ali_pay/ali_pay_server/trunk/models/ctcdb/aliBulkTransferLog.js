/**
 * Created by dianda on 2017/1/17.
 */
module.exports = function (sequelize, DataTypes) {
    var AliBulkTransferLog = sequelize.define('AliBulkTransferLog', {
        //批次号
        batchNo: DataTypes.STRING(64),
        //退款请求明细
        detailData: DataTypes.STRING(2000),
        //条目数
        batchNum: DataTypes.STRING(8),
        //总金额
        batchFee: DataTypes.STRING(16),
        //支付日期
        payDate: DataTypes.STRING(16),
        //付款账号ID
        payUserId: DataTypes.STRING(64),
        //付款账号姓名
        payUserName: DataTypes.STRING(64),
        //付款账号
        payAccountNo: DataTypes.STRING(64),
        //转账成功的详细信息
        successDetails: DataTypes.STRING(2000),
        //转账失败的详细信息
        failDetails: DataTypes.STRING(2000),
        //处理状态
        status:DataTypes.STRING(1)
    }, {
        freezeTableName: true,
        tableName: 'ali_bulk_transfer_log'
    });
    return AliBulkTransferLog;
};