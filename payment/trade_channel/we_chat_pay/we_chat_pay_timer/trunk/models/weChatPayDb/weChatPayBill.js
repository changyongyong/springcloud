'use strict'

/**
 * @author WXP
 * @description 微信支付账单信息
 */


module.exports = function (sequelize, DataTypes) {
    var WxRefundLog = sequelize.define('WeChatPayBill', {
        //公众账号ID
        appId: DataTypes.STRING(32),
        //商户号
        mchId: DataTypes.STRING(32),
        // 付款时间
        payTime: DataTypes.DATE(),
        //子商户号
        subMchId: DataTypes.STRING(32),
        //交易设备信息
        deviceInfo: DataTypes.STRING(32),
        //微信交易号
        transactionId: DataTypes.STRING(64),
        //支付网关支付号
        outTradeNo: DataTypes.STRING(64),
        //用户信息
        userInfo: DataTypes.STRING(64),
        //支付类型
        payType: DataTypes.STRING(28),
        refundType: DataTypes.STRING(28),
        //银行
        bankType: DataTypes.STRING(28),
        // 限制支付方式
        cashFeeType: DataTypes.STRING(28),
        // 金额总计
        totalFee: DataTypes.DECIMAL(15, 2),
        //优惠金额
        couponFee: DataTypes.DECIMAL(15, 2),
        // 商品信息描述
        body: DataTypes.STRING(500),
        // 附加信息
        attach: DataTypes.STRING(1024),
        // 手续费
        commission: DataTypes.STRING(28),
        // 手续费率
        commissionRate: DataTypes.STRING(28),
        // 支付状态
        status: DataTypes.STRING(64),
        // 对账状态：1:通过 -1：不通过 -2: 没有对应的支付记录
        validateStatus: DataTypes.INTEGER(2),
        // 错误信息
        error: DataTypes.STRING(500)
    }, {
        freezeTableName: true,
        tableName: 'we_chat_pay_bills'
    });
    return WxRefundLog;
};