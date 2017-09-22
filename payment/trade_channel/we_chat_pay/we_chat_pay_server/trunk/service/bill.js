'use strict'

/**
 * @author WXP
 * @description 微信账单相关
 */

module.exports.download = function ({
    billDate,
    billType
}, {
    wxPay
}) {

    var query = {
        bill_date: billDate,
        bill_type: billType
    };

    return wxPay
        .bill(query)
        .then((result) => {
            //logger.info(result);
            if (result.return_code == 'FAIL') { //失败响应
                throw (`${result.err_code} : ${result.err_code_des}`);
            }
            return result.bill;
        });
};