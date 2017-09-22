/**
 * Created by SEELE on 2017/7/5.
 */

const { MerchantConfig, AccountMerchant, Account, Db } = require('../../models/tradeGatewayDb');
const Promise = require('bluebird');
const _ = require('lodash');
const uuidV1 = require('uuid/v1');
const moment = require('moment');
const request = require('request');

const ddConfig = global.DDCONFIG;
const AliPayUrl = ddConfig.aliPayServer;
const auth = require('../../utils/auth');

function sendContent(merchantData, outSystem, accountId) {
    let map = {};
    for (let data of merchantData) {
        if (data.tradeChannel === 'ALI_PAY' && !data.tradeType && data.state === 1) {
            map['ALI_PAY'] = true
        }
        if (data.state === 1) {
            map[data.tradeType] = true;
        }
    }
    let content = {
        ALI: {
            ALI_PAY_APP: map['ALI_PAY'] || false,
            ALI_PAY_UNION: map['ALI_PAY'] || false,
            ALI_PAY_SCAN_PAY: map['ALI_PAY'] || false,
            ALI_PAY_TRANSFER: map['ALI_PAY_TRANSFER'] || false
        },
        WECHAT: {
            WE_CHAT_PAY_APP: map['WE_CHAT_PAY_APP'] || false,
            WE_CHAT_PAY_SCAN_PAY: map['WE_CHAT_PAY_SCAN_PAY'] || false,
            WE_CHAT_PAY_JSAPI: map['WE_CHAT_PAY_JSAPI'] || false,
            WE_CHAT_PAY_NATIVE: map['WE_CHAT_PAY_NATIVE'] || false
        }
    };

    return new Promise((resolve, reject)=> {
        request({
            url: ddConfig.tradeGateWayUrl + '/api/account/send',
            method: 'POST',
            json: {
                content: content,
                system: outSystem,
                accountId: accountId
            }
        }, (error, response, body)=> {
            if (error) {
                return reject(error)
            }
            if (body.tag === 'success') {
                return resolve()
            }
            return reject(body.message)
        })
    });
}

/**
 * 绑定账户
 * @param par
 */
function bind(par) {

    let i;
    let transaction;
    let account;
    let serverConfigIds = [];
    let configData = par.data;
    let {
        name,
        outId,
        outType,
        outSystem
    } = par;
    for (i = 0; i < configData.length; i++) {
        if (configData[i].serverConfig) {
            serverConfigIds.push(configData[i].serverConfig);
        }
        if (configData[i].serverSelfConfig) {
            serverConfigIds.push(configData[i].serverSelfConfig)
        }
    }
    serverConfigIds = _.uniq(serverConfigIds);
    //  查找出所有的服务商的配置
    return MerchantConfig.findAll({
            where: {
                id: serverConfigIds
            },
            raw: true
        })
        .then((data) => {
            if (data.length !== serverConfigIds.length) {
                return Promise.reject({
                    status: -1,
                    message: '服务商配置缺失'
                })
            }
            return Db.transaction()
        })
        .then((t) => {
            transaction = t;
            //  创建账户信息
            return Account.create({
                name: name,
                outId: outId,
                outType: outType,
                outSystem: outSystem,
                accountId: uuidV1()
            }, {
                transaction: transaction
            })
        })
        .then((result) => {
            account = result;
            let data = [];
            for (i = 0; i < configData.length; i++) {
                let type;
                let tradeChannel;
                let configId;
                let tradeType;
                let merchantNo;
                let merchantName;
                //  自营还是商户
                switch (configData[i].accountType) {
                    case 'self':
                        type = 1;
                        configId = configData[i].serverSelfConfig;
                        merchantNo = null;
                        merchantName = null;
                        break;
                    case 'server':
                        type = 2;
                        configId = configData[i].serverConfig;
                        merchantNo = configData[i].merchantNo;
                        merchantName = configData[i].merchantName;
                        break;
                }
                //  支付宝和微信
                switch (configData[i].accountChannel) {
                    case 'ali_pay':
                        tradeChannel = 'ALI_PAY';
                        break;
                    case 'wechat_pay':
                        tradeChannel = 'WE_CHAT_PAY';
                        tradeType = 'WE_CHAT_PAY_NATIVE';
                        break;
                    case 'wechat_app':
                        tradeChannel = 'WE_CHAT_PAY';
                        tradeType = 'WE_CHAT_PAY_APP';
                        break;
                    case 'wechat_js_api':
                        tradeChannel = 'WE_CHAT_PAY';
                        tradeType = 'WE_CHAT_PAY_JSAPI';
                        break;
                    case 'wechat_scan':
                        tradeChannel = 'WE_CHAT_PAY';
                        tradeType = 'WE_CHAT_PAY_SCAN_PAY';
                        break;
                    case 'ali_transfer':
                        tradeChannel = 'ALI_PAY';
                        tradeType = 'ALI_PAY_TRANSFER';
                        break;
                    case 'ali_app':
                        tradeChannel = 'ALI_PAY';
                        tradeType = 'ALI_PAY_APP';
                        break;
                }

                data.push({
                    state: 1, //启用
                    isNotHistory: 1,
                    type: type,
                    tradeType: tradeType,
                    tradeChannel: tradeChannel,
                    tradeMerchantNo: merchantNo,
                    tradeMerchantName: merchantName,
                    merchantConfigId: configId,
                    accountId: result.id
                });
            }
            return AccountMerchant.bulkCreate(data, {
                transaction: transaction
            });
        })
        .then(() => {
            return transaction.commit()
        })
        .then(() => {
            return {
                token: Account.encrypt({
                    accountId: account.accountId,
                    salt: account.salt,
                    id: account.id
                }),
                id: account.id,
                uuid: account.accountId
            }
        })
        .catch((error) => {
            if (transaction) {
                return transaction.rollback()
                    .then(() => {
                        return Promise.reject({
                            status: error.status || -1,
                            message: error.message || '创建账户信息失败'
                        })
                    })
            }
            return Promise.reject({
                status: error.status || -1,
                message: error.message || '创建账户信息失败'
            })
        })
}
/**
 * 修改账户
 * @param par
 * @returns {*|{value}|Promise.<T>}
 */
function update(par) {
    let i;
    let transaction;
    let serverConfigIds = [];
    let configData = par.data;
    let {
        name,
        outId,
        outType,
        outSystem,
        id
    } = par;
    let merchantData;
    let account;

    for (i = 0; i < configData.length; i++) {
        if (configData[i].serverConfig) {
            serverConfigIds.push(configData[i].serverConfig);
        }
        if (configData[i].serverSelfConfig) {
            serverConfigIds.push(configData[i].serverSelfConfig)
        }
    }
    serverConfigIds = _.uniq(serverConfigIds);

    //  查找出所有的服务商的配置
    return MerchantConfig.findAll({
            where: {
                id: serverConfigIds
            },
            raw: true
        })
        .then((data) => {
            if (data.length !== serverConfigIds.length) {
                return Promise.reject({
                    status: -1,
                    message: '服务商配置缺失'
                })
            }
        })
        .then(() => {
            //  获取账户信息
            return Promise.props({
                getAccount: Account.find({
                    where: {
                        id: id
                    },
                    raw: true
                }),
                getMerchantAccount: AccountMerchant.find({
                    where: {
                        accountId: id,
                        isNotHistory: 1,
                        state: 1,
                        tradeChannel: 'ALI_PAY',
                        tradeType: null,
                        type: 2
                    },
                    raw: true
                })
            })
        })
        .then((result) => {
            let data = [];
            let merchantConfig = result.getMerchantAccount;
            account = result.getAccount;

            if (!account) {
                return Promise.reject({
                    status: -1,
                    message: '账户缺失'
                })
            }
            for (i = 0; i < configData.length; i++) {
                let type;
                let tradeChannel;
                let configId;
                let tradeType;
                let merchantNo;
                let merchantName;
                let tradeMerchantAuthNo;
                //  自营还是商户
                switch (configData[i].accountType) {
                    case 'self':
                        type = 1;
                        configId = configData[i].serverSelfConfig;
                        merchantNo = null;
                        merchantName = null;
                        break;
                    case 'server':
                        type = 2;
                        configId = configData[i].serverConfig;
                        merchantNo = configData[i].merchantNo;
                        merchantName = configData[i].merchantName;
                        break;
                }
                //  支付宝和微信
                switch (configData[i].accountChannel) {
                    case 'ali_pay':
                        tradeChannel = 'ALI_PAY';
                        if (configData[i].accountType === 'server') {
                            if (merchantConfig && merchantConfig.merchantConfigId == configId &&
                                merchantConfig.tradeMerchantAuthNo == configData[i].merchantNo) {
                                tradeMerchantAuthNo = merchantConfig.tradeMerchantAuthNo;
                            }
                        }
                        break;
                    case 'wechat_pay':
                        tradeChannel = 'WE_CHAT_PAY';
                        tradeType = 'WE_CHAT_PAY_NATIVE';
                        break;
                    case 'wechat_app':
                        tradeChannel = 'WE_CHAT_PAY';
                        tradeType = 'WE_CHAT_PAY_APP';
                        break;
                    case 'wechat_js_api':
                        tradeChannel = 'WE_CHAT_PAY';
                        tradeType = 'WE_CHAT_PAY_JSAPI';
                        break;
                    case 'wechat_scan':
                        tradeChannel = 'WE_CHAT_PAY';
                        tradeType = 'WE_CHAT_PAY_SCAN_PAY';
                        break;
                    case 'ali_transfer':
                        tradeChannel = 'ALI_PAY';
                        tradeType = 'ALI_PAY_TRANSFER';
                        break;
                    case 'ali_app':
                        tradeChannel = 'ALI_PAY';
                        tradeType = 'ALI_PAY_APP';
                        break;
                }

                data.push({
                    state: 1, //启用
                    isNotHistory: 1,
                    type: type,
                    tradeType: tradeType,
                    tradeChannel: tradeChannel,
                    tradeMerchantNo: merchantNo,
                    tradeMerchantName: merchantName,
                    merchantConfigId: configId,
                    accountId: account.id,
                    tradeMerchantAuthNo: tradeMerchantAuthNo
                });
            }
            merchantData = data;
            return Db.transaction()
        })
        .then((t) => {
            transaction = t;
            return Account.update({
                name: name,
                outId: outId,
                outType: outType,
                outSystem: outSystem
            }, {
                where: {
                    id: id
                },
                transaction: transaction
            })
        })
        .then(() => {
            //之前的全部变成历史
            return AccountMerchant.update({
                isNotHistory: 0
            }, {
                where: {
                    accountId: id
                },
                transaction: transaction
            })
        })
        .then(() => {
            //  从新创建配置信息
            return AccountMerchant.bulkCreate(merchantData, {
                transaction: transaction
            });
        })
        .then(()=> {
            return sendContent(merchantData, outSystem, account.accountId)
        })
        .then(() => {
            // return transaction.rollback()
            return transaction.commit()
        })
        .catch((error) => {
            console.log(error)
            if (transaction) {
                return transaction.rollback()
                    .then(() => {
                        return Promise.reject({
                            status: error.status || -1,
                            message: error.message || '修改账户信息失败'
                        })
                    })
            }
            return Promise.reject({
                status: error.status || -1,
                message: error.message || '修改账户信息失败'
            })
        })
}
/**
 * 获取所有服务商的配置
 * @returns {*}
 */
function getServerConfig() {
    return MerchantConfig.findAll({
        raw: true
    })
}
/**
 * 获取绑定的列表
 * @param option
 */
function getBindList(option) {

    let offset = parseInt(option.offset) || 0;
    let limit = parseInt(option.limit) || 20;

    let {
        accountName,
        accountSystem
    } = option;
    let where = {};

    if (accountName) {
        where.name = { $like: '%' + accountName + '%' }
    }

    if (accountSystem) {
        where.outSystem = { $like: '%' + accountSystem + '%' }
    }

    return Account.findAndCountAll({
            where: where,
            offset: offset,
            limit: limit,
            raw: true
        })
        .then((result) => {
            let count = result.count;
            let i;
            let data = [];
            for (i = 0; i < result.rows.length; i++) {
                let row = result.rows[i];
                data.push({
                    id: row.id,
                    name: row.name,
                    outId: row.outId,
                    outType: row.outType,
                    outSystem: row.outSystem,
                    token: Account.encrypt(row),
                    accountId: row.accountId
                })
            }
            return {
                count: count,
                data: data
            }
        })
        .catch((error) => {
            return Promise.reject({
                status: error.status || -1,
                message: '获取账户信息列表失败'
            })
        })
}
/**
 * 获取单个账户信息
 * @param option
 * @returns {*|{value}|Promise.<T>}
 */
function getOneAccount(option) {
    let id = option.id;
    let account;
    let accountMerchant;
    let configIdJsonArr = {};
    let authConfigId;
    let transferAuth;
    let payAuth;

    return Promise.props({
            //  获取账户信息
            getAccount: Account.find({
                where: {
                    id: id
                },
                attributes: ['id', 'accountId', 'name', 'outId', 'outType', 'outSystem', 'salt'],
                raw: true
            }),
            //  获取账户和商户的绑定关系
            getAccountMerchant: AccountMerchant.findAll({
                where: {
                    accountId: id,
                    isNotHistory: 1
                },
                raw: true
            })
        })
        .then((result) => {
            let i;
            let configIds = [];
            account = result.getAccount;
            accountMerchant = result.getAccountMerchant;
            if (!account) {
                return Promise.reject({
                    status: -1,
                    message: '此账户不存在'
                })
            }
            account.token = Account.encrypt(account);
            for (i = 0; i < accountMerchant.length; i++) {
                configIds.push(accountMerchant[i].merchantConfigId);
                if (accountMerchant[i].tradeType === null &&
                    accountMerchant[i].tradeChannel === 'ALI_PAY'
                ) {
                    if (accountMerchant[i].type === 1) {
                        payAuth = true;
                    } else {
                        if (accountMerchant[i].tradeMerchantAuthNo) {
                            payAuth = true;
                        }
                        authConfigId = accountMerchant[i].merchantConfigId;
                    }
                }
                if (accountMerchant[i].tradeType === 'ALI_PAY_TRANSFER' &&
                    accountMerchant[i].tradeChannel === 'ALI_PAY'
                ) {
                    if (accountMerchant[i].type === 1) {
                        transferAuth = true;
                    } else {
                        if (accountMerchant[i].tradeMerchantAuthNo) {
                            transferAuth = true;
                        }
                        authConfigId = accountMerchant[i].merchantConfigId;
                    }
                }
            }
            if (payAuth && transferAuth) {
                account.auth = true
            }
            return MerchantConfig.findAll({
                where: {
                    id: configIds
                },
                raw: true
            })
        })
        .then((configs) => {
            let i;
            for (i = 0; i < configs.length; i++) {
                if (!configIdJsonArr[configs[i].id]) {
                    configIdJsonArr[configs[i].id] = configs[i]
                }
            }
            // console.log(authConfigId)
            if (!account.auth && authConfigId) {
                // account.url = aliPayUrl + '?app_id=' + appId + '&redirect_uri=' +
                //     aliAuthUrl + '?secret=' + auth.encrypt(JSON.stringify({
                //         id: account.id,
                //         source: configIdJsonArr[authConfigId].source
                //     }))
                let url = AliPayUrl + '/alipay/authUrl?source=' + configIdJsonArr[authConfigId].source +
                '&accountId=' + account.id;
                return new Promise((resolve, reject)=> {
                    return request({
                        url: url,
                        method: 'GET'
                    }, (error, response, body)=> {
                        if (error) {
                            return reject(error)
                        }
                        try {
                            body = JSON.parse(body)
                        } catch (e) {
                            return reject(e)
                        }
                        if (body.tag === 'error') {
                            return reject(body.message)
                        }
                        return resolve(body.data)
                    })
                });
            }
        })
        .then((url)=> {
            account.url = url;
            account.transferAuth = transferAuth;
            account.payAuth = payAuth;
            delete account.salt;
            return {
                account: account,
                configIdJsonArr: configIdJsonArr,
                accountMerchant: accountMerchant
            }
        })
        .catch((error) => {
            return Promise.reject({
                status: error.status || -1,
                message: error.message || '获取账户信息失败'
            })
        })
}
/**
 * 支付测试
 * @param option
 */
function payTest(option) {
    const ORDER_TYPE = 'tt';
    let {
        ip,
        type,
        configId,
        sellerId
    } = option;
    let orderId = global.nodeEnv + 't_' + new Date().getTime() + 'sj' + _.random(1, 10);
    let testData = {
        fee: '0.1',
        orderId: orderId,
        orderType: ORDER_TYPE,
        system: 'trade_management',
        remark: '用来做后台测试',
        tradeType: '',
        subject: '后台测试',
        source: '',
        body: '后台进行测试',
        noCredit: '1',
        spbillCreateIp: ip || '',
        timeExpire: moment().add(2400, 's').format('YYYY-MM-DD HH:mm:ss'),
        tradePrincipal: '000000',
        sellerId: sellerId
    };

    let transferTest = {
        orderId: orderId,
        system: 'tt',
        remark: '后台管理测试转账',
        fee: '1',
        realName: '黑哥',
        thirdPartAccount: 'wt_cqwan@163.com',
        tradeType: 'ALI_PAY',
        tradePrincipal: '000000',
        orderType: 'transfer_test',
        sellerId: sellerId
    };

    return MerchantConfig.find({
            where: {
                id: configId
            },
            raw: true
        })
        .then((configInfo) => {
            if (!configInfo) {

                return Promise.reject({
                    status: -1,
                    message: '此服务商配置缺失'
                })
            }

            testData.source = configInfo.source;
            testData.merchantConfigId = configId + '';
            if (type === 'ali_pay') {
                testData.tradeType = 'UNION';
                return new Promise((resolve, reject)=> {
                    request({
                        url: ddConfig.tradeGateWayUrl + '/api/test/aliPay',
                        method: 'POST',
                        json: testData
                    }, (error, response, body)=> {
                        return resolve()
                    })
                })
                // return tradeRpc.PayTest.aliTest(testData)

            }
            if (type === 'wechat_pay') {
                testData.tradeType = 'NATIVE';
                return new Promise((resolve, reject)=> {
                    request({
                        url: ddConfig.tradeGateWayUrl + '/api/test/wxPay',
                        method: 'POST',
                        json: testData
                    }, (error, response, body)=> {
                        if (body.tag === 'success') {
                            return resolve()
                        }
                        return reject(body.message)
                    })
                })
            }
            if (type === 'wechat_js_api') {
                testData.tradeType = 'JSAPI';
                return new Promise((resolve, reject)=> {
                    request({
                        url: ddConfig.tradeGateWayUrl + '/api/test/wxPay',
                        method: 'POST',
                        json: testData
                    }, (error, response, body)=> {
                        console.log(body)
                        if (body.tag === 'success') {
                            return resolve()
                        }
                        if (body.message === '请求失败，状态:-99，原因:JSAPI支付必须传openid') {
                            return resolve()
                        }
                        return reject(body.message)
                    })
                })
            }
            if (type === 'wechat_scan') {
                testData.tradeType = 'SCAN';
                testData.authCode = '2112' + new Date().getTime();
                return new Promise((resolve, reject)=> {
                    request({
                        url: ddConfig.tradeGateWayUrl + '/api/test/wxScanPay',
                        method: 'POST',
                        json: testData
                    }, (error, response, body)=> {
                        if (body.tag === 'success') {
                            return resolve()
                        }
                        if (body.message === '请求失败，状态:-99，原因: 授权码校验错误，请刷新重试') {
                            return resolve()
                        }
                        return reject(body.message)
                    })
                })
            }
            if (type === 'wechat_app') {
                testData.tradeType = 'APP';
                return new Promise((resolve, reject)=> {
                    request({
                        url: ddConfig.tradeGateWayUrl + '/api/test/wxPay',
                        method: 'POST',
                        json: testData
                    }, (error, response, body)=> {
                        if (body.tag === 'success') {
                            return resolve()
                        }
                        return reject(body.message)
                    })
                })
            }

            if (type === 'ali_transfer') {
                transferTest.source = configInfo.source;
                transferTest.merchantConfigId = configId + '';
                return new Promise((resolve, reject)=> {
                    request({
                        url: ddConfig.tradeGateWayUrl + '/api/test/aliTransfer',
                        method: 'POST',
                        json: transferTest
                    }, (error, response, body)=> {
                        return resolve()
                        // console.log(body)
                        // if (body.tag === 'success') {
                        //     if (body.data.code === 'PAYEE_USER_INFO_ERROR') {
                        //         return resolve()
                        //     }
                        // }
                        // return reject()
                    })
                })
                // return tradeRpc.PayTest.aliTransfer(transferTest)
                //     .then((data) => {
                //         if (data.code === 'PAYEE_USER_INFO_ERROR') {
                //             return Promise.resolve()
                //         }
                //         return Promise.reject({
                //             message: '测试转账失败'
                //         })
                //     })
            }
        })
        .then(() => {
            return Promise.resolve()
        })
        .catch((error) => {
            return Promise.reject({
                status: -1,
                message: typeof error === 'object' && error.message || error
            })
        })
}

module.exports = {
    //  绑定商户
    bind: bind,
    //  修改绑定关系
    update: update,
    //  获取服务商的配置
    getServerConfig: getServerConfig,
    //  获取绑定列表
    getBindList: getBindList,
    //  获取单条信息根据条件
    getOneAccount: getOneAccount,
    //  支付测试
    payTest: payTest
};