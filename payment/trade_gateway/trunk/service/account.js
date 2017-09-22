'use strict'

/**
 * @author WXP
 * @description 支付账户相关内容
 */

const {
    Account: AccountDb,
    AccountMerchant: AccountMerchantDb,
    MerchantConfig: MerchantConfigDb
} = require('../models/tradeGatewayDb');

const {
    OutAccountResult: OutAccountResultPublisher
} = require('../mq/publisher');

const {
    AliPay
} = require('../tradeChannel');

const _ = require('lodash');


module.exports.find = function () {
    return AccountDb.find.apply(AccountDb, arguments);
};

module.exports.findAll = function () {
    return AccountDb.findAll.apply(AccountDb, arguments);
};

/**
 * 查询对应的支付商户
 */
module.exports.findMerchant = ({
    accountId,
    tradeChannel,
    tradeType
}) => {
    let merchant;
    return AccountMerchantDb.find({
            where: {
                accountId,
                tradeChannel,
                tradeType,
                isNotHistory: 1
            },
            raw: true
        })
        .then((data) => {
            if (!data) {
                throw ('没有对应的商户，无法进行后续操作！');
            }
            merchant = data;
            return MerchantConfigDb.find({
                where: {
                    id: merchant.merchantConfigId
                },
                raw: true
            })
        })
        .then((data) => {
            merchant.merchantConfig = data;
            return merchant;
        })
};

module.exports.addAccount = (par) => {
    return AliPay.addAccount(par)
};

module.exports.merchantFind = function () {
    return AccountMerchantDb.find.apply(AccountMerchantDb, arguments);
};

module.exports.findMerchantWay = (par) => {
    let {
        accountId
    } = par;
    try {
        if (typeof accountId === 'string') {
            accountId = JSON.parse(accountId)
        }
    } catch (e) {
        throw (e)
    }

    let ids = [];
    let accountIdGroup;
    let map = {};
    let arrays = [];

    return AccountDb.findAll({
            where: {
                accountId
            }
        })
        .then((result) => {
            if (result.length !== accountId.length) {
                throw ('商户缺失')
            }
            for (let i = 0; i < result.length; i++) {
                ids.push(result[i].id);
                if (!map[result[i].id]) {
                    map[result[i].id] = {
                        accountId: result[i].accountId
                    }
                }
            }
        })
        .then(() => {
            return AccountMerchantDb.findAll({
                where: {
                    accountId: ids,
                    isNotHistory: 1
                },
                raw: true
            })
        })
        .then((data) => {
            accountIdGroup = _.groupBy(data, (par) => {
                return par.accountId
            });
            let i;
            for (i in accountIdGroup) {
                if (!accountIdGroup.hasOwnProperty(i)) {
                    continue;
                }
                let jsonObj = {};
                let results = accountIdGroup[i];
                for (let result of results) {
                    if (result.tradeChannel === 'ALI_PAY' && !result.tradeType && result.state === 1) {
                        jsonObj['ALI_PAY'] = true
                    }
                    if (result.state === 1) {
                        jsonObj[result.tradeType] = true;
                    }
                }
                map[i].payWay = {
                    ALI: {
                        ALI_PAY_APP: jsonObj['ALI_PAY_APP'] || false,
                        ALI_PAY_UNION: jsonObj['ALI_PAY'] || false,
                        ALI_PAY_SCAN_PAY: jsonObj['ALI_PAY'] || false,
                        ALI_PAY_TRANSFER: jsonObj['ALI_PAY_TRANSFER'] || false
                    },
                    WECHAT: {
                        WE_CHAT_PAY_APP: jsonObj['WE_CHAT_PAY_APP'] || false,
                        WE_CHAT_PAY_SCAN_PAY: jsonObj['WE_CHAT_PAY_SCAN_PAY'] || false,
                        WE_CHAT_PAY_JSAPI: jsonObj['WE_CHAT_PAY_JSAPI'] || false,
                        WE_CHAT_PAY_NATIVE: jsonObj['WE_CHAT_PAY_NATIVE'] || false
                    }
                }
            }

            for (i in map) {
                if (!map.hasOwnProperty(i)) {
                    continue;
                }
                arrays.push(map[i])
            }
            return arrays
        })
};

module.exports.sendContentToMq = (par) => {
    return OutAccountResultPublisher.sendMessage({
        system: par.system,
        accountId: par.accountId,
        message: par.content
    });
};