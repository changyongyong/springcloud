/**
 * Created by dianda on 2017/1/17.
 */
module.exports = function (sequelize, DataTypes) {
    var AliRefundLog = sequelize.define('AliRefundLog', {
        //支付宝交易号
        tradeNo :DataTypes.STRING(64),
        //商户订单号
        outTradeNo: DataTypes.STRING(64),
        //商户退款单号
        outRefundNo : DataTypes.STRING(64),
        //总金额 -- 可退总金额
        totalFee: DataTypes.DECIMAL(9,2),
        //本次退款是否发生了资金变化
        fundChange:DataTypes.STRING(1),
        //退款金额
        refundFee: DataTypes.DECIMAL(9,2),
        //退款支付时间
        gmtRefundPay:DataTypes.STRING(64),
        status:DataTypes.STRING(64),
        //用户的登录id
        buyerLogonId:DataTypes.STRING(100),
        // 来源
        source: DataTypes.STRING(16),
        // 退款时间
        finishTime: DataTypes.DATE,
        // 校验状态
        validateStatus: DataTypes.INTEGER(2),
        // 对账状态：1:通过 -1：不通过 -2: 没有对应的支付记录
        error: DataTypes.STRING(500),
        // 校验时间
        validateTime: DataTypes.DATE,
        //  支付商户号
        sellerId: {
            field: 'arl_seller_id',
            type: DataTypes.STRING,
            comment: '支付商户号'
        }
    }, {
        freezeTableName: true,
        tableName: 'ali_refund_log'
    });
    return AliRefundLog;
};