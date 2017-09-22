/**
 * Created by SEELE on 2017/7/26.
 */

const {
    AliSourceList
} = require('../../models/ctcdb');

let Account = {};

Account.add = (par)=> {

    let {
        name,
        accountSecretKey,
        source,
        appId,
        email
    } = par;
    //  给秘钥增加一个开始和结尾头
    accountSecretKey = '-----BEGIN RSA PRIVATE KEY-----\n' +
        accountSecretKey + '\n' +
            '-----END RSA PRIVATE KEY-----';

    //todo 秘钥要加密
    return AliSourceList.create({
        secretKey: accountSecretKey,
        source: source,
        name: name,
        sellerEmail: email,
        inputCharset: 'UTF-8',
        signType: 'RSA',
        appId: appId
    })
};

module.exports = Account;