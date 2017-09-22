/**
 * Created by wt on 2017/7/11.
 */
const {AccountMerchant} = require('../models/tradeGatewayDb');

const Promise = require('bluebird');

module.exports = {
    handle: (data)=> {
        let {
            app_auth_token,
            user_id,
            accountId
        } = data.data;
        let ids = [];
        let i;
        //  固定支付宝的一种支付
        return AccountMerchant.findAll({
            where: {
                accountId: accountId,
                state: 1,
                isNotHistory: 1,
                tradeChannel: 'ALI_PAY',
                type: 2
                // tradeType: null
            },
            raw: true
        })
            .then((result)=> {
                if (!result || result.length === 0) {
                    return Promise.reject({
                        status: -1,
                        message: '查询失败'
                    })
                }
                for (i = 0;i < result.length; i++) {
                    ids.push(result[i].id)
                }
                return AccountMerchant.update({
                    tradeMerchantAuthNo: app_auth_token,
                    tradeMerchantNo: user_id
                },{
                    where: {
                        id: ids
                        //  app这种不支持授权模式
                        // tradeType: {$ne: 'ALI_PAY_APP'}
                    }
                })
            })
    }
};