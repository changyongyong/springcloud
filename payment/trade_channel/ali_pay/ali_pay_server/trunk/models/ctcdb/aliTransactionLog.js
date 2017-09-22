module.exports = function (sequelize, DataTypes) {
    var AliTransactionLog = sequelize.define('AliTransactionLog', {
        //支付宝分配给开发者的应用ID
        appId: DataTypes.STRING(32),
        //商户订单号
        outTradeNo: DataTypes.STRING(64),
        //交易类型
        tradeType: DataTypes.STRING(16),
        //总金额 保留2位小数
        totalFee: DataTypes.DECIMAL(9, 2),
        //商户业务号  即orderId
        outBizNo: DataTypes.STRING(64),
        //订单标题
        subject: DataTypes.STRING(256),
        //二维码链接
        codeUrl: DataTypes.STRING(1024),
        //支付宝交易号
        tradeNo: DataTypes.STRING(64),
        //支付完成时间
        gmtPayment: DataTypes.STRING(32),
        //交易结束时间
        gmtClose: DataTypes.STRING(32),
        //
        buyerId: DataTypes.STRING(16),
        //
        buyerLogonId: DataTypes.STRING(100),
        //
        sellerId: DataTypes.STRING(30),
        //
        sellerEmail: DataTypes.STRING(100),
        //现金支付金额
        buyerPayAmount: DataTypes.DECIMAL(9, 2),
        //交易状态 WAIT_BUYER_PAY \ TRADE_CLOSED \ TRADE_SUCCESS \ TRADE_FINISHED
        tradeStatus: DataTypes.STRING(32),
        //支付结果-- 1：已支付，其他：未支付
        payStatus: DataTypes.STRING(2),
        //关闭状态-- 1: 已关闭，其他：未关闭
        closed: DataTypes.STRING(2),
        //预计过期时间
        timeExpire: DataTypes.DATE(),
        //订单来源
        source: DataTypes.STRING(16),
        // 支付时间
        finishTime: DataTypes.DATE,
        // 校验状态
        validateStatus: DataTypes.INTEGER(2),
        // 对账状态：1:通过 -1：不通过 -2: 没有对应的支付记录
        error: DataTypes.STRING(500),
        // 校验时间
        validateTime: DataTypes.DATE
    }, {
        freezeTableName: true,
        tableName: 'ali_transaction_log'
    });
    return AliTransactionLog;
};