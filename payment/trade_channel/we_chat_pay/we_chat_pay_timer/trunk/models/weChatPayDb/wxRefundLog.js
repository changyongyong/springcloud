/**
 * Created by dianda on 2017/1/17.
 */

let STATUS = {
    PENDDING: 'PENDDING',
    SUCCESS: 'SUCCESS',
    FAIL: 'FAIL',
    ERROR: 'ERROR'
};

module.exports = function (sequelize, DataTypes) {
    var WxRefundLog = sequelize.define('WxRefundLog', {
        //公众账号ID
        appId: DataTypes.STRING(32),
        //商户号
        mchId: DataTypes.STRING(32),
        //商户订单号
        outTradeNo: DataTypes.STRING(32),
        //商户退款单号
        outRefundNo: DataTypes.STRING(32),
        //微信退款单号
        refundId: DataTypes.STRING(28),
        //总金额
        totalFee: DataTypes.INTEGER,
        //退款金额
        refundFee: DataTypes.INTEGER,
        //现金支付金额
        cashFee: DataTypes.INTEGER,
        //微信订单号
        transactionId: DataTypes.STRING(28),
        status: DataTypes.STRING(64),
        // 付款时间
        finishTime: DataTypes.DATE,
        // 校验状态
        validateStatus: DataTypes.INTEGER(2),
        // 对账状态：1:通过 -1：不通过 -2: 没有对应的支付记录
        error: DataTypes.STRING(500),
        //订单来源
        source: DataTypes.STRING(16),
        // 校验时间
        validateTime: DataTypes.DATE,
        // 子商户号
        subMchId: {
            type: DataTypes.INTEGER,
            field: 'sub_mch_id',
            comment: '微信子商户号'
        }
    }, {
        freezeTableName: true,
        tableName: 'wx_refund_log',
        classMethods: {
            getStatus: function () {
                return STATUS;
            }
        }
    });
    return WxRefundLog;
};