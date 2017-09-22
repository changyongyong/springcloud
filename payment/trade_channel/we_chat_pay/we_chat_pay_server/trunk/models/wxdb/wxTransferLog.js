/**
 * Created by dianda on 2017/1/17.
 */
module.exports = function (sequelize, DataTypes) {
    var WxTransferLog = sequelize.define('WxTransferLog', {
        //公众账号ID
        mchAppid: DataTypes.STRING(32),
        //商户号
        mchId: DataTypes.STRING(32),
        //商户订单号
        partnerTradeNo: DataTypes.STRING(32),
        //微信订单号
        paymentNo : DataTypes.STRING(32),
        //微信支付成功时间
        paymentTime :  DataTypes.STRING(28),
        //用户openid
        openid: DataTypes.INTEGER,
        //退款金额
        checkName: DataTypes.INTEGER,
        //金额
        amount: DataTypes.INTEGER,
        //企业付款描述信息
        desc :DataTypes.STRING(255),
        //Ip地址
        spbillCreateIp :DataTypes.STRING(255),
        status:  DataTypes.STRING(64),
        source: DataTypes.STRING(64)
    }, {
        freezeTableName: true,
        tableName: 'wx_transfer_log'
    });
    return WxTransferLog;
};