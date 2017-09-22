'use strict'

/**
 * @author WXP
 * @description 页面视图
 */


const router = require('express').Router();

router.use('/user', require('./user'));

router.get(['/', '/index'], function (req, res) {
    return res.redirect('/payment/record');
});

router.get('/alive', (req, res) => {
    res.success('alive');
})

router.get('/payment/record', function (req, res) {
    return res.render('./payment/record', {
        title: '付款记录'
    })
});
router.get('/refund/record', function (req, res) {
    return res.render('./refund/record', {
        title: '退款记录'
    })
});
router.get('/transfer/record', function (req, res) {
    return res.render('./transfer/record', {
        title: '转账记录'
    })
});
router.get('/missing/record', function (req, res) {
    return res.render('./missing/record', {
        title: '丢失记录'
    })
});
router.get('/bind', (req, res) => {
    let title = '绑定账户';
    if (req.query.id) {
        title = '修改账户'
    }
    return res.render('./bind/bind', {
        title: title,
        id: req.query.id
    })
});
router.get('/bind/list', (req, res) => {
    return res.render('./bind/list', {
        title: '账户列表'
    })
});
router.get('/util/sign', (req, res) => {
    return res.render('./util/sign', {
        title: '签名助手'
    })
});

router.get('/account/list', (req, res) => {
    return res.render('./account/list', {
        title: '基本账户列表'
    })
});


router.get('/account/add', (req, res) => {
    return res.render('./account/add', {
        title: '添加账户'
    })
});


module.exports = router;