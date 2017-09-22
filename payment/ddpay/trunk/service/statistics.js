'use strict'

/**
 * @author WXP
 * @description 账户金额统计
 */

const {
    Sequelize,
    //支付账户db
    TradeAccount: TradeAccountDb,
} = require('../models/ddPayDb');
const _ = require('lodash');

const Statistics = module.exports;

Statistics.byType = function ({
    type: types,
    tradeAccountNo
}) {
    if (!types && !tradeAccountNo) {
        throw ('需要账户类型或者账户编号');
    }
    let where = {};
    if (types) {
        if (!Array.isArray(types)) {
            types = [types];
        }
        where.type = types;
    }
    if (tradeAccountNo) {
        where.accountNo = tradeAccountNo;
    }
    return TradeAccountDb.findAll({
            where: where,
            attributes: [
                'type', [Sequelize.fn('count', Sequelize.col('id')), 'count'],
                [Sequelize.fn('sum', Sequelize.col('balance')), 'balance'],
                [Sequelize.fn('sum', Sequelize.col('deposit')), 'deposit']
            ],
            group: 'type',
            nest: true,
            raw: true
        })
        .then((dataArr) => {
            for (let type of types) {
                let data = _.find(dataArr, function (par) {
                    return par.type == type;
                });
                if (!data) {
                    dataArr.push({
                        type: type,
                        balance: 0,
                        deposit: 0,
                        count: 0
                    });
                }
            }
            return dataArr
        })
};