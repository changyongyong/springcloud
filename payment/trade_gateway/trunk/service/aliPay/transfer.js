'use strict'

/**
 * @author WXP
 * @description 支付宝转账
 */

const TransferRecord = require('../transferRecord');
const {
    AliPay
} = require('../../tradeChannel');
const logger = global.Logger('service-alipay-transfer');
const STATUS = TransferRecord.STATUS;
const USER_INFO_ERROR = {
    INVALID_PARAMETER: '参数错误转账失败，请通知客服人员',
    PAYEE_NOT_EXIST: '支付宝用户不存在',
    PAYEE_USER_INFO_ERROR: '支付宝用户姓名与账户不一致',
    PAYEE_ACC_OCUPIED: '支付宝账户下绑定了多个账户，无法完成转账，请更换账户',
    PERMIT_NON_BANK_LIMIT_PAYEE: '支付宝账户信息不完善，或未开立余额账户，无法收款，详情请咨询支付宝',
    DAILY_TRANSFER_TIMES_LIMIT: '单日最多提现三次！',
    DAILY_TRANSFER_FEE_LIMIT: '单日最多提现2万！'
};

let Transfer = {};

Transfer.transfer = function (par, options) {
    let record;
    let {
        fee,
        thirdPartAccount,
        realName,
        remark,
        tradePrincipal
    } = par;
    let {
        operateLogNo,
        merchant
    } = options;
    const {
        source,
        merchantConfigId,
        tradeMerchantNo
    } = merchant;
    par.source = source;
    par.operateLogNo = operateLogNo;
    par.merchantConfigId = merchantConfigId;
    return TransferRecord.create(par, options)
        .then((data) => {
            record = data;
            return AliPay.transfer({
                fee,
                tradeRecordNo: record.tradeRecordNo,
                thirdPartAccount,
                operateLogNo,
                realName,
                remark,
                tradePrincipal,
                source,
                tradeMerchantNo
            })
        })
        .then(() => {
            return {
                tradeRecordNo: record.tradeRecordNo
            };
        })
        .catch((error) => {
            let {
                message,
                code
            } = error;
            let result;
            result = {
                code: code,
                tradeRecordNo: record.tradeRecordNo
            };
            if (code in USER_INFO_ERROR) {
                record.status = STATUS.USER_INFO_ERROR;
                result.message = USER_INFO_ERROR[code] || message;
                result.userInfoError = result.message;
            } else {
                record.status = STATUS.FAIL;
                // 当为非用户操作导致失败时记录信息用以手动转账
                record.message = JSON.stringify({
                    thirdPartAccount: thirdPartAccount,
                    realName: realName,
                    code: code,
                    message: message
                });
            }
            return record.save(options)
                .then(() => {
                    return result
                })
                .catch((error) => {
                    logger.error('SAVE FAIL' + error.message + ' sql:' + error.sql);
                    return result
                })
        })
};

module.exports = Transfer;