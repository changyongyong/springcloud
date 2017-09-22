/**
 * Created by SEELE on 2017/7/18.
 */

const {
    AliMerchantToken: AliMerchantTokenDb
} = require('../models/aliPayDb');

//  获取sellerId
exports.getSellerId = (sources)=> {

    return AliMerchantTokenDb.findAll({
        where: {
            merchantSource: sources
        },
        raw: true,
        attributes: ['merchantSource', 'merchantNo']
    })
};