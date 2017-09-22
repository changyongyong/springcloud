/**
 * Created by SEELE on 2017/7/26.
 */

const {
    MerchantConfig, Db
} = require('../../models/tradeGatewayDb');

const Promise = require('bluebird');
const sequenceRpc = require('../../rpc/clientBase').sequence;
const SEQUENCE_NAME = 'paysource';
const tradeGataWayUrl = global.DDCONFIG.tradeGateWayUrl;
const request = require('request');

exports.addAccount = (params)=> {

    let {
        accountName,
        accountType,
        accountChannel,
        accountSecretKey,
        accountAppId,
        accountEmail
    } = params;
    let tradeChannel;
    let transaction;
    let sequenceResp;

    if (accountChannel === 'ALI') {
        tradeChannel = 1;
    }

    return sequenceRpc.sequence.get({
        name: SEQUENCE_NAME
    })
        .then((data)=> {
            if (!data) {
                return Promise.reject({
                    status: -1,
                    message: '获取取号服务失败'
                })
            }
            sequenceResp = data;
            return Db.transaction()
        })
        .then((t)=> {
            transaction = t;
            let result = sequenceResp.data;
            if (accountType === 'all') {
                return MerchantConfig.bulkCreate([{
                    source: accountChannel + result,
                    name: accountName,
                    tradeChannel: tradeChannel,
                    type: 1
                }, {
                    source: accountChannel + result,
                    name: accountName,
                    tradeChannel: tradeChannel,
                    type: 2
                }], {
                    transaction: transaction
                })
            } else {
                if (accountType === 'server') {
                    accountType = 2
                }
                if (accountType === 'self') {
                    accountType = 1
                }

                return MerchantConfig.create({
                    source: accountChannel + result,
                    name: accountName,
                    tradeChannel: tradeChannel,
                    type: accountType
                }, {
                    transaction: transaction
                })
            }
        })
        .then(()=> {
            //  向网关发送请求，存储source和秘钥
            return new Promise((resolve, reject)=> {
                request({
                    url: tradeGataWayUrl + '/api/account/add',
                    method: 'POST',
                    json: {
                        accountChannel: tradeChannel,
                        accountSecretKey: accountSecretKey,
                        name: accountName,
                        source: accountChannel + sequenceResp.data,
                        appId: accountAppId,
                        email: accountEmail
                    }
                }, (error, response, body)=> {
                    if (error) {
                        return reject({
                            status: -1,
                            message: '请求支付网关出错'
                        })
                    }
                    if (body.tag === 'success') {
                        return resolve()
                    }
                    return reject({
                        status: -1,
                        message: '添加账户失败'
                    })
                })
            })
        })
        .then(()=> {
            return transaction.commit()
        })
        .catch((error)=> {
            if (error) {
                return transaction.rollback()
                    .then(()=> {
                        return Promise.reject(error)
                    })
            }
            return Promise.reject(error)
        });
};