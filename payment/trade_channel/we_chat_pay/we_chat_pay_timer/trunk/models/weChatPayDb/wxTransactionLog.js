module.exports = function (sequelize, DataTypes) {
    var WxTransactionLog = sequelize.define('WxTransactionLog', {
        //公众账号ID
        appId: DataTypes.STRING(32),
        //商户号
        mchId: DataTypes.STRING(32),
        //订单来源
        source: DataTypes.STRING(16),
        //商户订单号
        outTradeNo: DataTypes.STRING(32),
        //交易类型
        tradeType: DataTypes.STRING(16),
        //总金额
        totalFee: DataTypes.INTEGER,
        //商品ID--存放orderID
        productId: DataTypes.STRING(32),
        //预支付交易会话标识
        prepayId: DataTypes.STRING(64),
        //二维码链接
        codeUrl: DataTypes.STRING(64),
        //微信支付订单号
        transactionId: DataTypes.STRING(32),
        //支付完成时间
        timeEnd: DataTypes.STRING(14),
        //现金支付金额
        cashFee: DataTypes.INTEGER,
        //付款银行
        bankType: DataTypes.STRING(16),
        //支付结果-- 1：已支付，其他：未支付
        payStatus: DataTypes.STRING(1),
        //关闭状态-- 1: 已关闭，其他：未关闭
        closed: DataTypes.STRING(1),
        // 付款时间
        finishTime: DataTypes.DATE,
        // 校验状态
        validateStatus: DataTypes.INTEGER(2),
        // 对账状态：1:通过 -1：不通过 -2: 没有对应的支付记录
        error: DataTypes.STRING(500),
        // 校验时间
        validateTime: DataTypes.DATE,
        //支付者的openId
        openId: DataTypes.STRING(128),
        // 子商户号
        subMchId: {
            type: DataTypes.INTEGER,
            field: 'sub_mch_id',
            comment: '微信子商户号'
        }
    }, {
        freezeTableName: true,
        tableName: 'wx_transaction_log'
    });
    return WxTransactionLog;
};