'use strict'

/**
 * @author WXP
 * @description 押金相关内容
 */


const {
    parseRecord,
    transfer,
    initPayCharge,
    TRADE_ACCOUNT_FIELDS,
    TRADE_TYPES,
} = require('./comm');

/**
 * 把押金转到余额
 * @type {Function}
 */
const depositToBalance = function (par, options) {
    let {
        tradeAccountNo,
        tradePwd,
        amount,
        operateLogNo,
        orderType,
        orderId,
        remark,
        system,
        tradePrincipal
    } = par;
    let transaction = options.transaction;
    // 转账


    return transfer({
            fromTradeAccountNo: tradeAccountNo,
            toTradeAccountNo: tradeAccountNo,
            tradePwd: tradePwd,
            amount: amount,
            type: TRADE_TYPES.DEPOSIT_TO_BALANCE,
            fromField: TRADE_ACCOUNT_FIELDS.DEPOSIT,
            toField: TRADE_ACCOUNT_FIELDS.BALANCE,
            operateLogNo: operateLogNo,
            orderType: orderType,
            orderId: orderId,
            remark: remark,
            system,
            tradePrincipal
        }, {
            transaction: transaction,
            lock: transaction.LOCK.UPDATE
        })
        .then((data) => {
            return parseRecord(data.inRecord);
        })
};



/**
 * 充值押金
 * 需要先去网关支付，等支付成功回调增加交易账户的押金
 * @type {Function}
 */
const chargeDeposit = initPayCharge({
    type: TRADE_TYPES.CHARGE_DEPOSIT,
    field: TRADE_ACCOUNT_FIELDS.DEPOSIT
});

module.exports = {
    depositToBalance,
    chargeDeposit
}