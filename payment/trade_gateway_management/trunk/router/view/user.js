'use strict'

/**
 * @author WXP
 * @description 页面视图
 */


const router = require('express').Router();

router.all('/check_out', function (req, res) {
    req.session.trade_gateway_management_user = '';
    res.redirect('login');
});

router.route('/login')
    .get(function (req, res) {
        res.render('./user/login', {
            title: '登录'
        });
    })
    .post(function (req, res) {
        if (req.body.userName == 'admin' && req.body.password == 'ddxx2017') {
            req.session.trade_gateway_management_user = { login: true };
            return res.redirect('/index');
        }
        res.redirect('back');
    })

module.exports = router;