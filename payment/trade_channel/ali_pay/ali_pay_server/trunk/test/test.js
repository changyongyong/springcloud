/**
 * Created by SEELE on 2017/6/27.
 */

const request = require('request');
const _ = require('lodash');
const should = require('should');
const Promise = require('bluebird');
const BASE_URL = 'http://127.0.0.1:3201';
const TIME_OUT = 6000;
const {AliTransactionLog} = require('../models/ctcdb');

describe('check http is success', ()=> {

    before((done)=> {
        done()
    });

    describe('pay', ()=> {

        it('create off line aliPay data', (done)=> {
            const orderId = 'unitTest' + new Date().getTime() + _.random(1000, 10000),  //must unique
                subject = 'alipay_test',    //when pay, display info
                totalFee = '0.1',   // amount for pay
                sellerId = '',
                // authToken = '',
                source = 'ALI34';   //  pay channel

                const url = BASE_URL + '/alipay/create?orderId='
                + `${orderId}` + '&subject=' + `${subject}` + '&totalFee=' + `${totalFee}` +
                '&source=' + `${source}` + '&sellerId=' + `${sellerId}`;
            const options = {
                url: url,
                method: 'GET',
                timeout: TIME_OUT
            };
            new Promise((resolve, reject)=> {
                return request(options, (error, response, body)=> {
                    if (error) {
                        return reject(error)
                    }
                    body = JSON.parse(body);
                    if (body.tag === 'success') {
                        resolve(body)
                    } else {
                        reject('there are some mistakes')
                    }
                })
            })
                .then(()=> {
                    return AliTransactionLog.find({
                        order: [['id', 'desc']],
                        raw: true
                    })
                })
                .then((data)=> {
                    should.equal(data.outTradeNo, orderId);
                    should.equal(data.tradeType, 'UNION');
                    should.equal(data.totalFee, totalFee);
                    should.equal(data.subject, subject);
                    should.equal(data.outTradeNo, orderId);
                    should.equal(data.payStatus, '0');
                    should.equal(data.closed, '0');
                    should.equal(data.source, source);
                    // appId and timeExpire is need check
                    done();
                })
                .catch((error)=> {
                    should.not.exist(error);
                    done(error)
                })
        });
        it('scan pay', (done)=> {
            const authCode = '289618111540247942';  //this code must be produced by ali
            const outTradeNo = '32321dssdscfc332s';    //when pay, display info
            const source = 'ALI36';   // amount for pay
            const subject = 'your goods theme';   //  pay channel
            const totalFee = '1';   // money for pay
            const orderId = 'unitTest' + new Date().getTime();
            const sellerId = '';

            const url = BASE_URL + '/scanPay?authCode='
                + `${authCode}` + '&outTradeNo=' + `${outTradeNo}` + '&source=' + `${source}` +
                '&subject=' + `${subject}` + '&totalFee=' + `${totalFee}` + '&orderId=' + `${orderId}` +
            '&sellerId=' + sellerId;
            const options = {
                url: url,
                method: 'GET',
                timeout: TIME_OUT
            };

            new Promise((resolve, reject)=> {
                request(options, (error)=> {
                    if (error) {
                        return reject(error)
                    }
                    //  not check response result
                    resolve()
                })
            })
                .then(()=> {
                    return AliTransactionLog.find({
                        order: [['id', 'desc']],
                        raw: true
                    })
                })
                .then((data)=> {
                    should.equal(data.outTradeNo, orderId);
                    should.equal(data.tradeType, 'SCAN');
                    should.equal(data.totalFee, totalFee);
                    should.equal(data.subject, subject);
                    // should.equal(data.payStatus, '0');   //这个状态因为无法做校验
                    should.equal(data.closed, '0');
                    should.equal(data.source, source);
                    //  not have storeId
                    done()
                })
                .catch((error)=> {
                    should.not.exist(error);
                    done()
                })
        });

        it('app pay create', (done)=> {
            const orderId = 'unitTest' + new Date().getTime() + _.random(1000, 10000);  //orderId
            const subject = 'your goods theme'; //goods theme
            const totalFee = '1';   //amount
            const source = 'ALI34'; //must be a source
            const sellerId = '';
            // const authToken = '';

            const url = BASE_URL + '/app/preCreate?orderId=' + `${orderId}` +
                '&subject=' + `${subject}` + '&totalFee=' + `${totalFee}` +
                    '&source=' + `${source}` + '&sellerId=' + sellerId;

            const options = {
                url: url,
                method: 'GET',
                timeout: TIME_OUT
            };

            new Promise((resolve, reject)=> {
                return request(options, (error, response, body)=> {
                    if (error) {
                        return reject(error)
                    }
                    body = JSON.parse(body);
                    if (body.tag === 'success') {
                        resolve(body)
                    } else {
                        reject('create fail')
                    }
                })
            })
                .then(()=> {
                    return AliTransactionLog.find({
                        order: [['id', 'desc']],
                        raw: true
                    })
                })
                .then((data)=> {
                    should.equal(data.outTradeNo, orderId);
                    should.equal(data.tradeType, 'APP');
                    should.equal(data.totalFee, totalFee);
                    should.equal(data.subject, subject);
                    should.equal(data.payStatus, '0');
                    should.equal(data.closed, '0');
                    should.equal(data.source, source);
                    //  appId and timeExpire is need check
                    done()
                })
                .catch((error)=> {
                    should.not.exist(error);
                    done(error)
                })
        })
    });
});
//
describe('close pay order', ()=> {
    let produceOrderId;
    before((done)=> {
        const orderId = 'unitTest_' + new Date().getTime() + _.random(1,1000),  //must unique
            subject = 'alipay_test',    //when pay, display info
            totalFee = '100',   // amount for pay
            source = 'ddapp';   //  pay channel

        const url = BASE_URL + '/alipay/create?orderId='
            + `${orderId}` + '&subject=' + `${subject}` + '&totalFee=' + `${totalFee}` +
            '&source=' + `${source}`;
        const options = {
            url: url,
            method: 'GET',
            timeout: TIME_OUT
        };
        request(options, (error, response, body)=> {
            should.not.exist(error);
            body = JSON.parse(body);
            should.equal(body.tag, 'success');
            produceOrderId = orderId;
            done()
        })
    });

    it('close order', (done)=> {
        const source = 'ddapp';
        const url = BASE_URL + '/alipay/close?outTradeNo=' + `${produceOrderId}` +
            '&source=' + `${source}`;
        const options = {
            url: url,
            method: 'GET',
            timeout: TIME_OUT
        };
        request(options, (error)=> {
            should.not.exist(error);
            done()
        })
    });

    it('cancel order', (done)=> {
        const source = 'ddapp';
        const url = BASE_URL + '/alipay/cancel?outTradeNo=' + `${produceOrderId}` +
            '&source=' + `${source}`;
        const options = {
            url: url,
            method: 'GET',
            timeout: TIME_OUT
        };
        request(options, (error)=> {
            should.not.exist(error);
            done()
        })
    })
});


describe('refund', ()=> {
    before((done)=> {
        done()
    });

    it('refund operate',(done)=> {
        const source = 'ALI34';
        const outTradeNo = 'unitTest1501057443282';
        const totalFee = '0.9';
        const refundFee = '0.9';
        const outRefundNo = 'unitTest1501057443282';
        // const authToken = '201707BB420c0110b87c4cf6897f51948cf8fX45';
        const sellerId = '';

        const url = BASE_URL + '/alipay/refund?source=' + source +
                '&outTradeNo=' + outTradeNo + '&totalFee=' + totalFee + '&refundFee=' + refundFee +
                '&outRefundNo=' + outRefundNo + '&sellerId=' + sellerId;

        const options = {
            url: url,
            method: 'GET',
            timeout: TIME_OUT
        };

        request(options, (error, respons, body)=> {
            should.not.exist(error);
            body = JSON.parse(body);
            body.should.have.keys('tag');
            done()
        })
    })
});


describe('transfer', ()=> {
    before((done)=> {
        //todo produce pay record
        done()
    });

    it('transfer operate',(done)=> {
        const source = 'ALI34';
        const outBizNo = 'unitTest_' + new Date().getTime() + _.random(1,100);
        const payeeAccount = 'wt_cqwan@163.com';
        const amount = '1';
        const remark = 'transfer test';
        const payeeRealName = '文坦';
        const sellerId = '';
        // const authToken = '';

        const url = BASE_URL + '/alipay/transfer?source=' + source +
            '&outBizNo=' + outBizNo + '&payeeAccount=' + payeeAccount + '&amount=' + amount +
            '&remark=' + remark + '&payeeRealName=' + encodeURI(payeeRealName) + '&sellerId=' + sellerId;

        const options = {
            url: url,
            method: 'GET',
            timeout: TIME_OUT
        };

        request(options, (error)=> {
            should.not.exist(error);
            done()
        })
    })
});


describe('query', ()=> {
    it('query trade record', (done)=> {
        const source = 'ALI34';
        const tradeNo = 'unitTest1501057443282';  // should produce trade before

        const url = BASE_URL + '/alipay/queryOrder?source=' + `${source}` +
            '&outTradeNo=' + `${tradeNo}`;
        const options = {
            url: url,
            method: 'GET',
            timeout: TIME_OUT
        };

        request(options, (error, response, body)=> {
            should.not.exist(error);
            body = JSON.parse(body);
            should.equal(body.tag, 'success');
            should.equal(body.data.outTradeNo, tradeNo);
            done()
        })
    });

    it('query trx', (done)=> {
        const source = 'ALI34';
        const tradeNo = 'unitTest1501057443282';  // should produce trade before

        const url = BASE_URL + '/alipay/queryTrx?source=' + `${source}` +
            '&orderId=' + `${tradeNo}`;
        const options = {
            url: url,
            method: 'GET',
            timeout: TIME_OUT
        };

        request(options, (error, response, body)=> {
            should.not.exist(error);
            body = JSON.parse(body);
            should.equal(body.tag, 'success');
            should.equal(body.data.outTradeNo, tradeNo);
            done()
        })
    });

    it('query different type record', (done)=> {
        const type = ['payment', 'refund', 'transfer']; //you can choose random index to test
        const date = '2017-07-20';  //  you should choose date to query
        const url = BASE_URL + '/alipay/' + `${type[0]}` + '/record?date=' + `${date}`;

        const options = {
            url: url,
            method: 'GET',
            timeout: TIME_OUT
        };
        request(options, (error, response, body)=> {
            should.not.exist(error);
            body = JSON.parse(body);
            should.equal(body.tag, 'success');
            body.data.should.be.an.Array();
            if (body.data[0]) {
                body.data[0].should.have.keys('tradeRecordNo', 'source', 'fee', 'tradeChannel',
                    'status', 'type', 'validateStatus', 'error')
            }
            done()
        })
    });

    it('query transfer', (done)=> {
        const source = 'ALI34';
        const outBizNo = 'unitTest_150105764965296';
        const url = BASE_URL + '/alipay/transferQuery?source=' + source + '&outBizNo=' + outBizNo;

        const options = {
            url: url,
            method: 'GET',
            timeout: TIME_OUT
        };
        request(options, (error, response, body)=> {
            should.not.exist(error);
            body = JSON.parse(body);
            should.equal(body.tag, 'success');
            should.equal(body.data.outBizNo, outBizNo);
            done()
        })
    });

    it('query refund', (done)=> {
        const source = 'ALI34';
        const outTradeNo = 'unitTest1501057443282';
        const outRefundNo = 'unitTest1501057443282';
        const sellerId = '';
        const url = BASE_URL + '/alipay/refundQuery?source=' + source + '&outTradeNo=' + outTradeNo +
        '&outRefundNo=' + outRefundNo + '&sellerId=' + sellerId;

        const options = {
            url: url,
            method: 'GET',
            timeout: TIME_OUT
        };
        request(options, (error, response, body)=> {
            should.not.exist(error);
            body = JSON.parse(body);
            should.equal(body.tag, 'success');
            should.equal(body.data.outTradeNo, outTradeNo);
            done()
        })
    });

    it('query bill', (done)=> {
        const source = 'ALI34';
        const billDate = '2017-07-13';
        const billType = 'trade';
        const url = BASE_URL + '/alipay/bill?source=' + source + '&billType=' + billType +
            '&billDate=' + billDate;

        const options = {
            url: url,
            method: 'GET',
            timeout: TIME_OUT
        };
        request(options, (error, response, body)=> {
            should.not.exist(error);
            body = JSON.parse(body);
            should.equal(body.tag, 'success');
            body.data.should.have.keys('billDownloadUrl');
            done()
        })

    })
});
//
