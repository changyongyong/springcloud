/**
 * Created by SEELE on 2017/7/10.
 */

module.exports = {
    transform: (par, options, next)=> {
        let {
            sellerId,
            source,
            merchantConfigId
        } = par;

        if (!options) {
            options = {}
        }
        options.merchant = {
            tradeMerchantNo: sellerId,
            id: null,
            source: source,
            merchantConfigId: merchantConfigId
        };
        return next(par, options)
    }
};