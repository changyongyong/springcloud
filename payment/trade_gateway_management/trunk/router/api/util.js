/**
 * Created by SEELE on 2017/7/5.
 */


const router = require('express').Router();
const joiValidator = require('../../utils/joiValidator');
const Joi = require('joi');
const crypto = require('crypto');
const { encode } = require('../../utils/utils');

//  绑定商户和服务商的关系
router.post('/sign', joiValidator({
    body: Joi.object({
        data: Joi.object().required(),
        token: Joi.string()
    })
}), (req, res) => {
    let data = req.body.data;
    let token = req.body.token;
    if (!data.onceStr) {
        data.onceStr = generateNonceString(16);
    }
    if (!data.timestamp) {
        data.timestamp = parseInt(new Date().getTime() / 1000);
    }
    let hash = crypto.createHash('md5');
    let str = Object.keys(data)
        .sort()
        .map(function (key) {
            return key + '=' + encode(data[key]);
        })
        .join('&') + '&key=' + token;
    hash.update(str, 'utf8');
    let sign = hash.digest('hex');

    data.sign = sign;
    return res.success({
        str: str,
        data: data,
        sign: sign
    })
});

const generateNonceString = function (length) {
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var maxPos = chars.length;
    var noceStr = '';
    for (var i = 0; i < (length || 32); i++) {
        noceStr += chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return noceStr;
};

module.exports = router;