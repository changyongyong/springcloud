/**
 * Created by dianda on 2017/1/17.
 */
let STATUS = {
    PENDDING: '0',
    SUCCESS: '1',
    FAIL: '-1'
};
module.exports = function (sequelize, DataTypes) {
    let AliTransferLog = sequelize.define('AliTransferLog', {
        //商户转账唯一订单号
        outBizNo: DataTypes.STRING(64),
        //付款账号
        payAccount: DataTypes.STRING(32),
        //收款方账户类型
        payeeType: DataTypes.STRING(20),
        //收款方账户
        payeeAccount: DataTypes.STRING(64),
        //转账金额
        amount: DataTypes.DECIMAL(9, 2),
        //付款方显示姓名
        payerShowName: DataTypes.STRING(64),
        //收款方真实姓名
        payeeRealName: DataTypes.STRING(64),
        //支付宝转账单据号
        aliOrderId: DataTypes.STRING(64),
        //支付时间
        payDate: DataTypes.STRING(20),
        //转账备注
        remark: DataTypes.STRING(200),
        //订单来源
        source: DataTypes.STRING(16),
        // 状态
        status: DataTypes.STRING(64),
        // 转账时间
        finishTime: DataTypes.DATE,
        // 校验状态
        validateStatus: DataTypes.INTEGER(2),
        // 对账状态：1:通过 -1：不通过 -2: 没有对应的支付记录
        error: DataTypes.STRING(500),
        // 校验时间
        validateTime: DataTypes.DATE,
        //  支付商户号
        sellerId: {
            field: 'atl_seller_id',
            type: DataTypes.STRING,
            comment: '支付商户号'
        }
    }, {
        freezeTableName: true,
        tableName: 'ali_transfer_log',
        classMethods: {
            getStatus: function () {
                return STATUS;
            }
        }
    });
    return AliTransferLog;
};