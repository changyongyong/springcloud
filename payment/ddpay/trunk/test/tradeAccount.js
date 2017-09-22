'use strict'

/**
 * @author WXP
 * @description 账户相关测试
 */

require('../config/loadConfig');
const Should = require('should');
const {
    TradeAccount: TradeAccountDb,
    Account: AccountDb,
    ThirdPartAccount: ThirdPartAccountDb
} = require('../models/ddPayDb');
const { TradeAccount } = require('../service');
let commInfo = {
    system: 'unit_test_system',
    // accountId: 'unit_test_accountId',
    orderId: 'unit_test_orderId',
    orderType: 'unit_test_orderType'
};

let accountInfo = {
    // nickname: 'UNIT_TEST_nickName',
    userName: 'UNIT_TEST_userName',
    phoneNum: 'UNIT_TEST_phoneNum',
    identityCardNo: 'UNIT_TEST_identityCardNo',
    // remark: 'UNIT_TEST_remark'
};
let tradeAccountInfo = {
    type: 'COURIER'
};
let thirdPartAccount = {
    accountNo: 'UNIT_TEST_accountNo',
    userName: 'UNIT_TEST_userName',
    accountType: 'ALI_PAY'
}

const validate = function (data, orderInfo, keys) {
    keys = keys || [];
    for (let key of keys) {
        Should.exist(data[key], `${key} expect to exist`);
    }
    /* eslint-disable guard-for-in */
    for (let key in orderInfo) {
        Should.exist(data[key], `key ${key} expected not undefined`);
        Should.equal(data[key], orderInfo[key], `key ${key} expected ${orderInfo[key]} to be ${data[key]}`);
    }
    /* eslint-enable guard-for-in */
};

function clear() {
    let account;
    return AccountDb.find({
            where: {
                userName: accountInfo.userName,
                phoneNum: accountInfo.phoneNum,
                identityCardNo: accountInfo.identityCardNo
            }
        })
        .then((data) => {
            account = data;
            if (!account) {
                return;
            }
            return TradeAccountDb.destroy({
                    where: {
                        AccountId: account.id
                    }
                })
                .then(() => {
                    return ThirdPartAccountDb.destroy({
                        where: {
                            AccountId: account.id
                        }
                    })
                })
                .then(() => {
                    return AccountDb.destroy({
                        where: {
                            id: account.id
                        }
                    })
                })
        })
}

describe('tradeAccount', () => {
    // 删除创建的测试账户
    before((done) => {
        clear()
            .then(() => {
                done();
            })
    });
    // 创建账户
    describe('.create', () => {
        it('应当能创建对应账户', () => {
            return TradeAccount.create({
                    system: commInfo.system,
                    orderId: commInfo.orderId,
                    orderType: commInfo.orderType,
                    userName: accountInfo.userName,
                    phoneNum: accountInfo.phoneNum,
                    type: tradeAccountInfo.type,
                    identityCardNo: accountInfo.identityCardNo
                })
                .then((tradeAccount) => {
                    tradeAccount.should.have.keys(
                        'tradeAccountNo', 'status', 'type', 'balance',
                        'amountFrozen', 'deposit', 'creditLimit', 'accountNo'
                    );
                    tradeAccount.status.should.equal(99);
                    tradeAccount.type.should.equal(tradeAccountInfo.type);
                    tradeAccountInfo = tradeAccount;
                })
        })
        it('应当能生成Account', () => {
            return AccountDb.find({
                    where: {
                        userName: accountInfo.userName,
                        phoneNum: accountInfo.phoneNum,
                        identityCardNo: accountInfo.identityCardNo
                    },
                    raw: true
                })
                .then((account) => {
                    Should.exist(account);
                    accountInfo.id = account.id;
                    accountInfo.accountNo = account.accountNo;
                    validate(account, accountInfo, [
                        'status', 'accountNo', 'nickname', 'userName', 'phoneNum',
                        'identityCardNo'
                    ]);
                    account.status.should.equal(99);
                    accountInfo.status = 99;
                })
        });
        it('应当生成了TradeAccount', () => {
            return TradeAccountDb.find({
                where: {
                    tradeAccountNo: tradeAccountInfo.tradeAccountNo
                },
                raw: true
            }).then((tradeAccount) => {
                Should.exist(tradeAccount);
                tradeAccount.AccountId.should.equal(accountInfo.id);
                validate(tradeAccount, tradeAccountInfo, [
                    'status', 'tradeAccountNo', 'type'
                ])
            })
        });
    });
    // 更某一账户增加账户
    describe('.add', () => {
        let tradeAccount2 = {
            type: 'BUSINESSMAN_CS'
        };
        it('应当能创建对应账户', () => {
            return TradeAccount.add({
                    system: commInfo.system,
                    accountNo: tradeAccountInfo.tradeAccountNo,
                    orderId: commInfo.orderId,
                    orderType: commInfo.orderType,
                    type: tradeAccount2.type
                })
                .then((tradeAccount) => {
                    tradeAccount.should.have.keys(
                        'tradeAccountNo', 'status', 'type', 'balance',
                        'amountFrozen', 'deposit', 'creditLimit', 'accountNo'
                    );
                    tradeAccount.status.should.equal(99);
                    tradeAccount.type.should.equal(tradeAccount2.type);
                    tradeAccount2 = tradeAccount;
                })
        });
        it('应当能仅有一个Account', () => {
            return AccountDb.count({
                    where: {
                        userName: accountInfo.userName,
                        phoneNum: accountInfo.phoneNum,
                        identityCardNo: accountInfo.identityCardNo
                    },
                    raw: true
                })
                .then((count) => {
                    count.should.equal(1);
                })
        });
        it('应当生成了TradeAccount', () => {
            return TradeAccountDb.find({
                    where: {
                        tradeAccountNo: tradeAccount2.tradeAccountNo
                    },
                    raw: true
                })
                .then((tradeAccount) => {
                    Should.exist(tradeAccount);
                    tradeAccount.AccountId.should.equal(accountInfo.id);
                    validate(tradeAccount, tradeAccount2, [
                        'status', 'tradeAccountNo', 'type'
                    ])
                })
        });
    });
    // 绑定第三方账户
    describe('.bindThirdPartAccount', () => {
        it('应当能正确绑定账户', () => {
            return TradeAccount.bindThirdPartAccount({
                    system: commInfo.system,
                    accountNo: thirdPartAccount.accountNo,
                    userName: thirdPartAccount.userName,
                    accountType: thirdPartAccount.accountType,
                    tradeAccountNo: tradeAccountInfo.tradeAccountNo
                })
                .then((data) => {
                    Should.exist(data);
                    validate(data, thirdPartAccount);
                })
        });
        it('应当生成了对应的第三方账户数据', () => {
            return ThirdPartAccountDb.find({
                    where: {
                        AccountId: accountInfo.id
                    },
                    raw: true
                })
                .then((data) => {
                    Should.exist(data);
                    validate(data, thirdPartAccount);
                    data.AccountId.should.equal(accountInfo.id);
                    thirdPartAccount.id = data.id;
                })
        })

    });
    // 查询第三方账户
    describe('.getThirdPartAccounts', () => {
        it('应当能正确查询出绑定的第三方账户，且仅有一个', () => {
            return TradeAccount.getThirdPartAccounts({
                    accountType: thirdPartAccount.accountType,
                    tradeAccountNo: tradeAccountInfo.tradeAccountNo
                })
                .then((data) => {
                    Should.exist(data);
                    data.length.should.equal(1);
                    validate(data[0], thirdPartAccount);
                })
        });
    });
    // 更新第三方账户
    describe('.updateThirdPartAccount', () => {
        it('应当能正确的更新', () => {
            thirdPartAccount.accountNo += '2';
            thirdPartAccount.userName += '2';
            return TradeAccount.updateThirdPartAccount({
                    system: commInfo.system,
                    accountNo: thirdPartAccount.accountNo,
                    userName: thirdPartAccount.userName,
                    accountType: thirdPartAccount.accountType,
                    tradeAccountNo: tradeAccountInfo.tradeAccountNo,
                    thirdPartAccountId: thirdPartAccount.id
                })
                .then((data) => {
                    Should.exist(data);
                    validate(data, thirdPartAccount);
                })
        });
        it('应当更改了数据库中第三方账户数据', () => {
            return ThirdPartAccountDb.find({
                    where: {
                        id: thirdPartAccount.id
                    },
                    raw: true
                })
                .then((data) => {
                    Should.exist(data);
                    validate(data, thirdPartAccount);
                    data.AccountId.should.equal(accountInfo.id);
                })
        })
    });
    // 解绑第三方账户
    describe('.unbindThirdPartAccount', () => {
        it('应当能正确的解绑', () => {
            return TradeAccount.unbindThirdPartAccount({
                system: commInfo.system,
                tradeAccountNo: tradeAccountInfo.tradeAccountNo,
                thirdPartAccountId: thirdPartAccount.id
            })
        });
        it('应当删除了数据库中第三方账户数据', () => {
            return ThirdPartAccountDb.count({
                    where: {
                        id: thirdPartAccount.id
                    },
                    raw: true
                })
                .then((data) => {
                    data.should.equal(0);
                })
        })
    });
    // 查询账户信息
    describe('.find', () => {
        it('应当能正确查询出账户', () => {
            return TradeAccount.find({
                    tradeAccountNo: tradeAccountInfo.tradeAccountNo
                })
                .then((data) => {
                    Should.exist(data);
                    validate(data, tradeAccountInfo);
                })
        });
        it('当账户被修改时应当正确查询出账户已被冻结', () => {
            tradeAccountInfo.balance = 1;
            return TradeAccountDb.update({
                    balance: tradeAccountInfo.balance
                }, {
                    where: {
                        tradeAccountNo: tradeAccountInfo.tradeAccountNo
                    }
                })
                .then(() => {
                    return TradeAccount.find({
                            tradeAccountNo: tradeAccountInfo.tradeAccountNo
                        })
                        .then((data) => {
                            Should.exist(data);
                            validate(data, tradeAccountInfo);
                        })
                        .then(() => {
                            throw ('应当返回异常');
                        })
                        .catch((error) => {
                            error.message.should.equal('账号信息错误，账户被禁用！请通知管理员！');
                            return;
                        })
                })
        });
    });
    // 修复账户禁用
    describe('.fix', () => {
        it('应当能修复数据库中数据错误', () => {
            return TradeAccount.fix({
                    tradeAccountNo: tradeAccountInfo.tradeAccountNo
                })
                .then((data) => {
                    Should.exist(data);
                    validate(data, tradeAccountInfo);
                })
                .then(() => {
                    return TradeAccountDb.find({
                        where: {
                            tradeAccountNo: tradeAccountInfo.tradeAccountNo
                        },
                        raw: true
                    })
                })
                .then((tradeAccount) => {
                    Should.exist(tradeAccount);
                    tradeAccount.AccountId.should.equal(accountInfo.id);
                    validate(tradeAccount, tradeAccountInfo, [
                        'status', 'tradeAccountNo', 'type'
                    ])
                })
        });

    });
    after((done) => {
        clear()
            .then(() => {
                done();
            })
    });
});