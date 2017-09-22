/**
 * Created by dianda on 2017/1/17.
 */
module.exports = function (sequelize, DataTypes) {
    let AliPayBill = sequelize.define('AliPayBill', {
        //支付宝交易号
        tradeNo: DataTypes.STRING(64),
        outTradeNo: DataTypes.STRING(64),
        //商户订单号
        type: DataTypes.STRING(64),
        //商户退款单号
        body: DataTypes.STRING(400),
        finishTime: DataTypes.DATE(),
        //用户的登录id
        buyerLogonId: DataTypes.STRING(100),
        inFee: DataTypes.DECIMAL(15, 2),
        outFee: DataTypes.DECIMAL(15, 2),
        totalFee: DataTypes.DECIMAL(15, 2),
        remark: DataTypes.STRING(400),
        validateStatus: DataTypes.INTEGER(2),
        error: DataTypes.STRING(600)
    }, {
        freezeTableName: true,
        tableName: 'ali_pay_bills'
    });
    return AliPayBill;
};