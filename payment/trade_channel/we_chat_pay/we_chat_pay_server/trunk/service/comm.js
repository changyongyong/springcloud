'use strict'

/**
 * @author WXP
 * @description 通用内容
 */

// 提交的source实际走账户，用以对账
const sourceInfo = {
    'ddapp': {
        account: 'dd528'
    },
    'dd528': {
        account: 'dd528'
    },
    'psapp': {
        account: 'psapp'
    },
    'bsapp': {
        account: 'bsapp'
    },
    'wxmp': {
        account: 'wxmp'
    }
};

module.exports.sources = function () {
    return Promise.resolve(sourceInfo);
}