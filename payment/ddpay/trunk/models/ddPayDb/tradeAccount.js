'use strict';

const crypto = require('crypto');
const _ = require('lodash');

/**
 * 用以根据账户信息生成校验码防止篡改
 * @param data
 * @returns {string}
 */
const verifyCode = (data) => {
    let hash1 = crypto.createHash('RSA-SHA512');
    hash1.update(`${formartNum(data.balance)}${formartNum(data.amountFrozen)}` +
        `${formartNum(data.deposit)}${formartNum(data.creditLimit)}` +
        `${data.salt}${data.accountNo}`, 'utf8');
    let code = hash1.digest('hex');
    let hash2 = crypto.createHash('md5');
    hash2.update(reformat(code), 'utf8')
    //使用BASE64更短
    return encodeURI(hash2.digest('BASE64').toUpperCase());
};

const formartNum = (data) => {
    return parseFloat(data).toFixed(2);
}

/**
 * 更改生成秘钥结果的顺序
 * @param str
 * @returns {string}
 */
const reformat = function (str) {
    return `${str.substr(15, 6)}${str[9]}${str.substr(4, 6)}${str[14]}${str.substr(0, 4)}${str.substr(11, 4)}` +
        `${str.substr(21, 10)}${str[14]}${str[30]}${str.substr(32, 97)}`;
};

/**
 * 比对密码，通过pbkdf2对密码进行加密，防止破解
 * @param account
 * @param pwd
 */
const pwdVerify = (account, pwd) => {
    return new Promise((resolve) => {
        crypto.pbkdf2(pwd, Buffer.from(`${account.salt}${account.accountNo}`), 10000, 512, 'sha512', (err, key) => {
            if (err) {
                throw err
            }
            return resolve(key.toString('hex'));
        });
    });
};

/**
 * 交易账户类型
 * @type {{courier: string}}
 */
const TYPES = {
    COURIER: 'COURIER',
    THIRD_COMMISSION: 'THIRD_COMMISSION',
    BUSINESSMAN: 'BUSINESSMAN',
    BUSINESSMAN_LIFE: 'BUSINESSMAN_LIFE',
    BUSINESSMAN_DEPOSIT: 'BUSINESSMAN_DEPOSIT',
    BUSINESSMAN_BS: 'BUSINESSMAN_BS',
    BUSINESSMAN_CS: 'BUSINESSMAN_CS'
}

/**
 * 交易账户的状态
 * @type {{ACTIVE: number, PENDING: number, DEACTIVATE: number, DELETED: number}}
 */
const STATUS = {
    ACTIVE: 99,
    PENDING: 0,
    DEACTIVATE: -1,
    DELETED: -99
}

module.exports = function (sequelize, DataTypes) {
    var TradeAccount = sequelize.define('TradeAccount', {
        tradeAccountNo: {
            type: DataTypes.STRING(100),
            comment: '账户编号'
        },
        status: {
            type: DataTypes.INTEGER,
            comment: '账户状态'
        },
        //队列名
        type: {
            type: DataTypes.STRING(100),
            comment: '账户类型'
        },
        //余额
        balance: {
            type: DataTypes.DECIMAL(15, 5),
            comment: '余额'
        },
        //冻结金额
        amountFrozen: {
            type: DataTypes.DECIMAL(15, 5),
            comment: '冻结金额'
        },
        //押金
        deposit: {
            type: DataTypes.DECIMAL(15, 5),
            comment: '押金'
        },
        //信用额度
        creditLimit: {
            type: DataTypes.DECIMAL(15, 5),
            comment: '信用额度'
        },
        //交易密码：pbkdf2+盐+对称加密
        tradePwd: {
            type: DataTypes.STRING(1500),
            comment: '交易密码'
        },
        //账户编号
        accountNo: {
            type: DataTypes.STRING(100),
            comment: '账户编号'
        },
        //校验码，用以校验防止数据错误，通过以上其它列计算而出
        verifyCode: {
            type: DataTypes.STRING(300),
            comment: '验证码'
        },
        salt: {
            type: DataTypes.STRING(300),
            comment: '辅助加密'
        }
    }, {
        freezeTableName: true,
        tableName: 'trade_accounts',
        classMethods: {
            associate: function (model) {
                TradeAccount.belongsTo(model.Account, { foreignKey: 'AccountId' });
                TradeAccount.hasMany(model.FrozenRecord, {
                    foreignKey: {
                        name: 'TradeAccountId',
                        field: 'dp_ta_id'
                    }
                });
                TradeAccount.hasMany(model.WithdrawApply, {
                    foreignKey: {
                        name: 'TradeAccountId',
                        field: 'dp_ta_id'
                    }
                });
            },
            verifyBlance: function (data) {
                return verifyCode(data);
            },
            //交易密码
            tradePwdVerify: function (account, pwd) {
                return pwdVerify(account, pwd)
                    .then((pwd) => {
                        return pwd == account.tradePwd;
                    })
            },
            tradePwdCalc: function (account, pwd) {
                return pwdVerify(account, pwd);
            },
            calcVerifyCode: verifyCode,
            getTypes: function () {
                return _.clone(TYPES);
            },
            getStatus: function () {
                return _.clone(STATUS);
            }
        },
        hooks: {
            afterFind: function (data, options) {
                // 当没有查询到数据或者使用findAll进行查询时不进行校验码检查
                if (!data || Array.isArray(data) ||
                    options.isNotVerify === true) {
                    return data;
                }
                if (data.verifyCode !== verifyCode(data)) {
                    return Promise.reject(Error('账号信息错误，账户被禁用！请通知管理员！'));
                }
                return data;
            },
            beforeCreate: function (data) {
                let hash = crypto.createHash('RSA-SHA512');
                //根据账户编号，时间戳，随机数生成一个非对称的盐
                hash.update(`${data.accountNo}${Date.now()}${Math.random()}`, 'utf8');
                data.balance = 0;
                data.amountFrozen = 0;
                data.deposit = 0;
                data.creditLimit = 0;
                data.salt = hash.digest('BASE64');
                data.verifyCode = verifyCode(data);
                return;
            }
        }
    });
    return TradeAccount;
};