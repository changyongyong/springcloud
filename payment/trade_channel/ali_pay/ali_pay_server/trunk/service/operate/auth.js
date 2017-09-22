/**
 * Created by wt on 2017/7/11.
 */

const Promise = require('bluebird');
const request = require('request');
const moment = require('moment');

const authServer = require('../../utils/auth');

const AlipayConfig = global.AlipayConfig;
const BaseConfig = global.BASECONFIG;
const alib = require('../../utils/alib.js');
const publishers = require('../../mq/publisher');
const aliAuthMerchant = publishers.aliAuthMerchant;

const {AliMerchantToken} = require('../../models/ctcdb');

let Auth = {};

Auth.save = (par, options)=> {

    let {
        app_auth_code: appAuthCode,
        secret
    } = par;

    let {
        aliPay
    } = options;

    let {
        appId,
        inputCharset,
        secretKey
    } = aliPay;

    let account = authServer.decrypt(secret);
    try {
        account = JSON.parse(account);
    } catch (e) {
        return Promise.reject({
            status: -1,
            message: '解析授权信息失败'
        })
    }

    let {
        source,
        id: accountId
    } = account;

    let data = {};
    let app_id = appId;
    let charset = inputCharset;
    let method = 'alipay.open.auth.token.app';
    let sign_type = 'RSA';
    let timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
    let format = 'json';
    let version = '1.0';
    let biz_content = {
        grant_type: 'authorization_code',
        code: appAuthCode
    };

    let sParaTemp = [];
    let sURL;

    sParaTemp.push(['app_id', app_id]);
    sParaTemp.push(['method', method]);
    sParaTemp.push(['charset', charset]);
    sParaTemp.push(['sign_type', sign_type]);
    sParaTemp.push(['timestamp', timestamp]);
    sParaTemp.push(['format', format]);
    sParaTemp.push(['version', version]);
    sParaTemp.push(['biz_content', JSON.stringify(biz_content)]);

    sURL = alib.getPath(AlipayConfig.ALIPAY_PATH, alib.buildRequestPara2(sParaTemp, source, secretKey));
    return new Promise((resolve, reject)=> {
        request({
            url: AlipayConfig.APIHOST + sURL,
            method: 'GET',
            headers: {
                'charset': 'utf-8'
            }
        }, (error, response, body)=> {
            if (error) {
                return reject({
                    status: -1,
                    message: error.message || '获取token信息出错'
                })
            }

            try {
                body = JSON.parse(body);
            } catch (e) {
                return reject({
                    status: -1,
                    message: '验签失败'
                })
            }
            let result = alib.checkRSA(body.alipay_open_auth_token_app_response, body.sign);
            if (result) {
                let resp = body.alipay_open_auth_token_app_response;
                if (resp.code === '10000') {
                    data = resp;
                    resolve()
                } else {
                    reject({
                        tag: 'error',
                        status: -1,
                        message: resp.sub_msg
                    })
                }
            } else {
                reject({
                    tag: 'error',
                    status: -1,
                    message: '同步返回验签失败'
                })
            }
        })
    })
        .then(()=> {
            return AliMerchantToken.find({
                where: {
                    merchantNo: data.user_id,
                    merchantSource: source
                },
                raw: true
            })
        })
        .then((merchantInfo)=> {
            if (merchantInfo) {
                return AliMerchantToken.update({
                    merchantAuthToken: data.app_auth_token,
                    merchantAuthStartTime: new Date(),
                    merchantAuthEndTime: new Date(moment().add(data.expires_in, 's')),
                    merchantSource: source
                }, {
                    where: {
                        merchantNo: merchantInfo.merchantNo
                    }
                })
            } else {
                return AliMerchantToken.create({
                    merchantAuthToken: data.app_auth_token,
                    merchantAuthStartTime: new Date(),
                    merchantAuthEndTime: new Date(moment().add(data.expires_in, 's')),
                    merchantSource: source,
                    merchantNo: data.user_id
                })
            }
        })
        .then(()=> {
            data.accountId = accountId;
            return aliAuthMerchant.sendMessage({
                data: data,
                status: 'SUCCESS'
            })
        })
};

Auth.getAuthUrl = (par, options)=> {
    let {
        source,
        accountId
    } = par;
    let {
        aliPay
    } = options;

    let {
        appId,
    } = aliPay;
    let url;
    url = BaseConfig.aliPayUrl + '?source=' + source + '&app_id=' + appId + '&redirect_uri=' +
        BaseConfig.aliAuthUrl + '?secret=' + authServer.encrypt(JSON.stringify({
            id: accountId,
            source: source
        }));

    return url;
};

module.exports = Auth;