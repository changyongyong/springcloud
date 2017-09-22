'use strict'

/**
 * @author WXP
 * @description 微信回调相关路由
 */

const router = require('express').Router();
const service = require('../service');

router.all('/pay/notify', (req, res) => {
    let msg = req.body.xml || {};
    service.Pay.notify({
            msg,
            // 提交支付的副文是source
            source: msg.attach
        })
        .then((data) => {
            res.end(data);
        })
        .catch((error) => {
            res.end(error.message);
        })
});

module.exports = router;