'use strict'

/**
 * @author WXP
 * @description 微信支付的单元测试
 */


require('../config/loadConfig');
const apiUrl = `http://localhost:${global.DD_CONFIG.port}`;
const logger = global.Logger('test');
const moment = require('moment');
const Should = require('should');
const request = require('request-promise');
const {
    WxTransactionLog,
    WxRefundLog
} = require('../models/wxdb');
const _ = require('lodash');
const tagOk = function (data) {
    Should.exist(data.tag);
    data.tag.should.equal('success');
}
const objToUrl = function (obj) {
    let arr = _.toPairs(obj);
    let arr2 = [];
    for (let data of arr) {
        data[1] = encodeURI(data[1]);
        arr2.push(data.join('='));
    }
    return arr2.join('&');
}

/**
 * 包装下请求默认包含host
 */
const requestPackage = function (host) {
    return function (args) {
        args.uri = host + args.uri;
        logger.info('uri:' + args.uri, 'data：' + JSON.stringify(args.data || ''));
        return request(args)
            .then((data) => {
                if (data.tag != 'success') {
                    let message = data.message;
                    if (typeof message !== 'string') {
                        message = JSON.stringify(message);
                    }
                    throw ({
                        message: `请求失败，状态:${data.status}，原因:${message}`,
                        data: data.data,
                        orignalMessage: data.message
                    });
                }
                return data;
            })
    }
};

const requestUtil = requestPackage(apiUrl);

let i = 1;
// 用来关闭订单的交易流水号
let closeTradeNo;
// 用来退款的支付单号
let refundOutTradeNo;
let j = 1;

const transactionValidate = function (orderInfo, keys) {
    keys = keys || [];
    return WxTransactionLog.findAll({
            where: {
                outTradeNo: orderInfo.outTradeNo
            }
        })
        .then((data) => {
            data.length.should.equal(1);
            data = data[0];
            /* eslint-disable guard-for-in */
            for (let key of keys) {
                Should.exist(data[key], `key ${key} expected to exist`);
            }
            for (let key in orderInfo) {
                Should.exist(data[key], `key ${key} expected not undefined`);
                Should.equal(data[key], orderInfo[key], `key ${key} expected ${orderInfo[key]} to be ${data[key]}`);
            }
            /* eslint-enable guard-for-in */
        })
};

const refundValidate = function (refundInfo, keys) {
    keys = keys || [];
    return WxRefundLog.findAll({
            where: {
                outRefundNo: refundInfo.outRefundNo
            }
        })
        .then((data) => {
            data.length.should.equal(1);
            data = data[0];
            /* eslint-disable guard-for-in */
            for (let key of keys) {
                Should.exist(data[key]);
            }
            for (let key in refundInfo) {
                Should.exist(data[key], `key ${key} expected not undefined`);
                Should.equal(data[key], refundInfo[key], `key ${key} expected ${refundInfo[key]} to be ${data[key]}`);
            }
            /* eslint-enable guard-for-in */
        })
}

describe(i + ' 支付相关接口', () => {

    describe(`${i}.${j}` + ' 测试正常支付接口', () => {
        it('NATIVE支付应当返回正确的支付参数', (done) => {
            const orderInfo = {
                noCredit: '1',
                fee: 1,
                orderId: `unitTest_${new Date().getTime()}_${_.random(100,200)}`,
                body: '2017年6月27日-单元测试',
                source: 'dd528',
                outTradeNo: `unitTest_${new Date().getTime()}_${_.random(1,100)}`,
                tradeType: 'NATIVE'
            };
            closeTradeNo = orderInfo.outTradeNo;
            requestUtil({
                    uri: '/weixin/create?' + objToUrl(orderInfo),
                    json: true
                })
                .then((data) => {
                    orderInfo.payStatus = 0;
                    orderInfo.closed = 0;
                    tagOk(data);
                    data = data.data;
                    data.should.have.keys('codeUrl', 'prepayId', 'outTradeNo', 'outTradeNo');
                    data.outTradeNo.should.be.equal(orderInfo.outTradeNo);
                    return transactionValidate({
                        outTradeNo: orderInfo.outTradeNo,
                        tradeType: orderInfo.tradeType,
                        totalFee: orderInfo.fee,
                        productId: orderInfo.orderId,
                        codeUrl: data.codeUrl,
                        payStatus: '0',
                        closed: '0'
                    }, [
                        'appId', 'mchId', 'source', 'prepayId',
                        'codeUrl', 'timeExpire'
                    ])
                })
                .then(() => {
                    done();
                })
                .catch((error) => {
                    done(error)
                })
        });

        it('APP支付应当返回正确的支付参数', (done) => {
            const orderInfo = {
                noCredit: '1',
                fee: 1,
                orderId: `unitTest_${new Date().getTime()}_${_.random(100,200)}`,
                body: '2017年6月27日-单元测试',
                source: 'dd528',
                outTradeNo: `unitTest_${new Date().getTime()}_${_.random(1,100)}`,
                tradeType: 'APP'
            };
            requestUtil({
                    uri: '/weixin/create?' + objToUrl(orderInfo),
                    json: true
                })
                .then((data) => {
                    tagOk(data);
                    data = data.data;
                    data.should.have.keys('appParams', 'outTradeNo');
                    data.outTradeNo.should.be.equal(orderInfo.outTradeNo);
                    data.appParams.should.have.keys('appid', 'partnerid', 'timestamp',
                        'noncestr', 'prepayid', 'package', 'sign');
                    refundOutTradeNo = data.outTradeNo;
                    return transactionValidate({
                        outTradeNo: orderInfo.outTradeNo,
                        tradeType: orderInfo.tradeType,
                        totalFee: orderInfo.fee,
                        prepayId: data.appParams.prepayid,
                        payStatus: '0',
                        closed: '0'
                    }, [
                        'appId', 'mchId', 'source', 'prepayId', 'timeExpire'
                    ])
                })
                .then(() => {
                    done();
                })
                .catch((error) => {
                    done(error)
                })
        });

        it('JSAPI支付应当返回校验失败(因为没有用户的openId)', (done) => {
            const orderInfo = {
                noCredit: '1',
                fee: 1,
                orderId: `unitTest_${new Date().getTime()}_${_.random(100,200)}`,
                body: '2017年6月27日-单元测试',
                source: 'wxmp',
                outTradeNo: `unitTest_${new Date().getTime()}_${_.random(1,100)}`,
                openId: '123456',
                tradeType: 'JSAPI'
            };
            requestUtil({
                    uri: '/weixin/create?' + objToUrl(orderInfo),
                    json: true
                })
                .then(() => {
                    // 由于没有openId,所以无法测试
                    // tagOk(data);
                    // data = data.data;
                    // data.should.have.keys('codeUrl', 'prepayId', 'outTradeNo', 'outTradeNo');
                    // data.outTradeNo.should.be.equal(orderInfo.outTradeNo);
                    done();
                })
                .catch((error) => {
                    error.message.should.equal('请求失败，状态:-99，原因:openid is invalid');
                    done();
                })
        });

        it('SCANPAY应当返回授权码错误(因为没有用户的授权码)', (done) => {
            const orderInfo = {
                noCredit: '1',
                fee: 1,
                ip: '127.0.0.1',
                orderId: `unitTest_${new Date().getTime()}_${_.random(100,200)}`,
                body: '2017年6月27日-单元测试',
                source: 'wxmp',
                outTradeNo: `unitTest_${new Date().getTime()}_${_.random(1,100)}`,
                authCode: '12345678910'
            };
            requestUtil({
                    uri: '/weixin/scanPay?' + objToUrl(orderInfo),
                    json: true
                })
                .then((data) => {
                    // 由于没有openId,所以无法测试
                    tagOk(data);
                    // data = data.data;
                    data.should.have.keys('outTradeNo', 'status');
                    // data.outTradeNo.should.be.equal(orderInfo.outTradeNo);
                    data.outTradeNo.should.be.equal(orderInfo.outTradeNo);
                    data.status.should.be.oneOf('SUCCESS', 'PENDDING');
                }).catch((error) => {
                    error.message.should.equal('请求失败，状态:-99，原因: 授权码校验错误，请刷新重试');
                    return transactionValidate({
                        outTradeNo: orderInfo.outTradeNo,
                        tradeType: 'SCAN',
                        totalFee: orderInfo.fee,
                        payStatus: '-1',
                        closed: '0'
                    }, [
                        'appId', 'mchId', 'source', 'timeExpire'
                    ])
                })
                .then(() => {
                    done();
                })
                .catch((error) => {
                    done(error);
                })
        });
    });
    j++;

})
i++;
j = 1;
describe(`${i}.${j}` + ' 查询支付接口', () => {
    it('支付单查询应当返回未支付', (done) => {
        requestUtil({
                uri: '/weixin/queryOrder?' + objToUrl({
                    outTradeNo: closeTradeNo,
                    source: 'dd528'
                }),
                json: true
            })
            .then((data) => {
                tagOk(data);
                data = data.data;
                data.should.have.keys('tradeState');
                data.tradeState.should.equal('NOTPAY');
                data.outTradeNo.should.equal(closeTradeNo);
                done();
            })
            .catch((error) => {
                done(error);
            })
    });
});

i++;
j = 1;
describe(`${i}.${j}` + ' 关闭订单接口', () => {
    it('支付单查询应当返回未支付', (done) => {
        requestUtil({
                uri: '/weixin/closeOrder?' + objToUrl({
                    outTradeNo: closeTradeNo,
                    source: 'dd528'
                }),
                json: true
            })
            .then((data) => {
                tagOk(data);
                transactionValidate({
                    outTradeNo: closeTradeNo,
                    closed: 1
                })
                done();
            })
            .catch((error) => {
                done(error);
            })
    });
    it('支付单查询应当返回已关闭', (done) => {
        requestUtil({
                uri: '/weixin/queryOrder?' + objToUrl({
                    outTradeNo: closeTradeNo,
                    source: 'dd528'
                }),
                json: true
            })
            .then((data) => {
                tagOk(data);
                data = data.data;
                data.should.have.keys('tradeState');
                data.tradeState.should.equal('CLOSED');
                data.outTradeNo.should.equal(closeTradeNo);
                done();
            })
            .catch((error) => {
                done(error);
            })
    });
});

i++;
j = 1;
let outRefundNo;
describe(`${i}.${j}` + '退款申请接口', () => {
    it('应当返回交易不存在，无法退款，因为未实际付款', (done) => {
        outRefundNo = `unitTest_${new Date().getTime()}_${_.random(1,100)}`;
        requestUtil({
                uri: '/weixin/refund?' + objToUrl({
                    outRefundNo: outRefundNo,
                    outTradeNo: refundOutTradeNo,
                    refundFee: 1,
                    totalFee: 1,
                    source: 'dd528'
                }),
                json: true
            })
            .then((data) => {
                tagOk(data);
                data = data.data;
                data.should.have.keys('refundId', 'outRefundNo', 'outTradeNo');
                data.outTradeNo.should.equal(refundOutTradeNo);
                refundValidate({
                    outTradeNo: refundOutTradeNo,
                    outRefundNo: outRefundNo,
                    totalFee: 1,
                    refundFee: 1,
                    cashFee: 1,
                    source: 'dd528',
                    status: 'PENDDING'
                }, ['appId', 'mchId', 'refundId']);
                done();
            })
            .catch((error) => {
                error.message.should.be.equal('请求失败，状态:-99，原因:没有对应的付款单！');
                done();
            })
    });
});

i++;
j = 1;

describe(`${i}.${j}` + '退款查询接口', () => {
    it('应当返回退款不存在', (done) => {
        requestUtil({
                uri: '/weixin/refundQuery?' + objToUrl({
                    outRefundNo: outRefundNo,
                    source: 'dd528'
                }),
                json: true
            })
            .then((data) => {
                tagOk(data);
                data = data.data;
                data.should.have.keys('appId', 'mchId', 'outTradeNo',
                    'totalFee', 'cashFee', 'refundCount', 'outRefundNo', 'refundId',
                    'refundFee', 'refundStatus', 'refundRecvAccout');
                done();
            })
            .catch((error) => {
                error.message.should.equal('请求失败，状态:-99，原因:REFUNDNOTEXIST : not exist');
                done();
            })
    });
});

i++;
j = 1;
describe(`${i}.${j}` + '账单查询接口', () => {
    it('应当访问成功并获得数据', (done) => {
        logger.info(apiUrl + '/weixin/bill/download?' + objToUrl({
            billDate: moment().add(-1, 'd').format('YYYYMMDD'),
            source: 'dd528',
            billType: 'ALL'
        }));
        request({
                uri: apiUrl + '/weixin/bill/download?' + objToUrl({
                    billDate: moment().add(-1, 'd').format('YYYYMMDD'),
                    source: 'dd528',
                    billType: 'ALL'
                })
            },
            function (error, response, body) {
                done(error || (body && ''));
            })
    });
});

i++;
j = 1;
describe(`${i}.${j}` + '账单查询接口', () => {
    it('应当访问成功并获得数据', (done) => {
        requestUtil({
                uri: '/weixin/record?' + objToUrl({
                    type: 'payment',
                    date: moment().format('YYYY-MM-DD')
                }),
                json: true
            })
            .then((data) => {
                tagOk(data);
                data = data.data;
                data.length.should.above(0);
                done();
            })
            .catch((error) => {
                done(error);
            })
    });
});