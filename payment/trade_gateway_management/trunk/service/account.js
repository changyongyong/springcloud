/**
 * Created by wt on 2017/7/19.
 */

const _ = require('lodash');
const Promise = require('bluebird');
const {
    Db
} = require('../models/tradeGatewayDb');

exports.getAccount = (records)=> {
    let accountMerchantIds = _.uniq(_.without(_.map(records, 'accountMerchantId'), null, ''));
    let sources = _.uniq(_.without(_.map(records, 'source'), null, ''));
    let sourceMap = {};
    // if (accountMerchantIds.length === 0) {
    //     for (let dis of records) {
    //         dis.accountFrom = '';
    //         dis.accountTo = '';
    //     }
    //     return records;
    // }
    if (accountMerchantIds.length !== 0) {
        accountMerchantIds = accountMerchantIds.join(',');
    }
    sources = sources.join('","');
    let sql = 'select ' +
        ' tg_account_merchant.tam_id as id,' +
        ' tg_account.ta_name as `name`,' +
        ' tg_merchant_config.tc_name as configName ' +
        ' from' +
        ' tg_account_merchant' +
        ' left join tg_account on tg_account.ta_id = tg_account_merchant.tam_ta_id' +
        ' left join tg_merchant_config on tg_merchant_config.tc_id = tg_account_merchant.tam_tm_id' +
        ' where tg_account_merchant.tam_id in (' + `${accountMerchantIds}` + ')';

    let sourceSql = 'select ' +
        ' tc_name as name,' +
        ' tc_source as source' +
        ' from tg_merchant_config' +
        ' where tc_source in ("' + sources + '")';

    return Db.query(sourceSql, {nest: true})
        .then((results)=> {
            for (let config of results) {
                sourceMap[config.source] = config.name;
            }
            if (accountMerchantIds.length !== 0) {
                return Db.query(sql, {nest: true})
            }
            return [];
        })
        .then((results)=> {
            let map = {};
            for (let account of results) {
                map[account.id] = account;
            }
            for (let record of records) {
                record.accountFrom = map[record.accountMerchantId]
                    && map[record.accountMerchantId].configName || (sourceMap[record.source] || '');
                record.accountTo = map[record.accountMerchantId]
                    && map[record.accountMerchantId].name || ''
            }
            return records
        })
};