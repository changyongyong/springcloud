
require('../config/loadConfig');
const server = require('../service');
const _ = require('lodash');
const {Account, TradeAccount} = require('../models/ddPayDb');
const should = require('should');


describe('check http is success', ()=> {

        let baseAccount = '';
        let thirdAccount;
        let accountId = '8d0a0510-6ad2-11e7-b870-8723078fd0aa';
       before((done)=> {

           Account.create({
               status: 99,
               accountNo: 'testZH00000' + _.random(1,100),
               nickname: '文老板',
               userName: '文老板',
               phoneNum: '15921373555'
           })
               .then((data)=> {
                   baseAccount = data;
                    return TradeAccount.create({
                        tradeAccountNo: 'testTH000000' + _.random(0,1000),
                        AccountId: data.id,
                        accountNo: data.accountNo,
                        balance: 99,
                        status: 99,
                        type: 'TEST'
                    })
               })
               .then((data)=> {
                    thirdAccount = data;
                    // done()
               })
               .then(()=> {
                    return server.Trade.chargeBalance({
                        system: 'unitTest',
                        tradeAccountNo: thirdAccount.tradeAccountNo,
                        amount: 100,
                        orderType: 'unitTest',
                        orderId: 'unitTest' + new Date().getTime(),
                        remark: '单元测试充值',
                        tradePrincipal: '000000',
                        // accountId: Joi.string()
                    })
               })
               .then(()=> {
                    done()
               })
               .catch((error)=> {
                    done(error)
               })
       });


       describe('trade', ()=> {

           it('withdraw', (done)=> {

               let system = 'unitTest';
               let tradeAccountNo = thirdAccount.tradeAccountNo;
               let amount = '1';
               let orderType = 'unitTest';
               let orderId = 'unitTest_' + new Date().getTime() + _.random(1,100);
               let remark = '单元测试';
               let tradeType = 'ALI_PAY';
               let realName = '黑哥';
               let thirdPartAccount = 'wt_cqwan@163.com';
               let tradePrincipal = '00000';
               // let accountId = '';
               let tip = '1';
               server.Trade.withdrawCash({
                   system,
                   tradeAccountNo,
                   amount,
                   orderType,
                   orderId,
                   remark,
                   tradeType,
                   thirdPartAccount,
                   realName,
                   tradePrincipal,
                   tip,
                   accountId
               })
                   .then(()=> {

                       done()
                   })
                   .catch((error)=> {
                        if (error === '支付宝用户姓名与账户不一致') {
                            should.equal(error, '支付宝用户姓名与账户不一致');
                            return done()
                        }

                       done(error)
                   })
           });

           it('add deposit', (done)=> {
               server.Trade.chargeDeposit({
                   system: 'unitTest',
                   tradeAccountNo: thirdAccount.tradeAccountNo,
                   amount: '1',
                   orderType: 'unitTest',
                   orderId: 'unitTest_' + new Date().getTime() + _.random(1,100),
                   remark: '单元测试',
                   tradeType: 'ALI_PAY_UNION',
                   body: 'unitTest',
                   spbillCreateIp: '127.0.0.1',
                   noCredit: '0',
                   tradePrincipal: '00000',
                   accountId
               })
                   .then((data)=> {
                       data.should.have.keys('codeUrl');
                    done()
                   })
                   .catch((error)=> {
                       done(error)
                   })
           })

           it('decrease Balance', (done)=> {
               server.Trade.decreaseBalance({
                   system: 'system',
                   tradeAccountNo: thirdAccount.tradeAccountNo,
                   amount: 1,
                   orderType: 'unitTest',
                   orderId: 'unitTest_' + new Date().getTime() + _.random(1,100),
                   remark: '单元测试',
                   // tradePwd: Joi.string(),

                   tradePrincipal: '000000',
                   accountId
               })
                   .then((data)=> {
                       should.equal(data.afterAmount, 97);
                       done()
                   })
                   .catch((error)=> {
                    done(error)
                   })
           })

           it('balance to deposit', (done)=> {
               server.Trade.balanceToDeposit({
                   system: 'system',
                   tradeAccountNo: thirdAccount.tradeAccountNo,
                   amount: 40,
                   orderType: 'unitTest',
                   orderId: 'unitTest_' + new Date().getTime() + _.random(1,100),
                   remark: '单元测试',
                   // tradePwd: Joi.string(),
                   tradePrincipal: '000000',
                   accountId
               })
                   .then((data)=> {
                       should.equal(data.afterAmount, 40);
                    done()
                   })
                   .catch((error)=> {
                    done(error)
                   })
           })

           it('deposit to balance', (done)=> {
               server.Trade.depositToBalance({
                   system: 'system',
                   tradeAccountNo: thirdAccount.tradeAccountNo,
                   amount: 40,
                   orderType: 'unitTest',
                   orderId: 'unitTest_' + new Date().getTime() + _.random(1,100),
                   remark: '单元测试',
                   // tradePwd: Joi.string(),
                   tradePrincipal: '000000',
                   accountId
               })
                   .then((data)=> {
                       should.equal(data.afterAmount, 97);
                    done()
                   })
                   .catch((error)=> {
                    done(error)
                   })
           })

       });

        after((done)=> {
            Account.destroy({
                where: {
                    id: baseAccount.id
                }
            })
                .then(()=> {
                    return TradeAccount.destroy({
                        where: {
                            AccountId: baseAccount.id
                        }
                    })
                })
                .then(()=> {
                    done()
                })
                .catch((error)=> {
                    done(error)
                })
        })
});