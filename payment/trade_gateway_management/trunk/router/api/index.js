'use strict'

/**
* @author WXP
* @description API相关路由
*/

const router = require('express').Router();

router.use('/util', require('./util'));
router.use('/payment', require('./payment'));
router.use('/refund', require('./refund'));
router.use('/transfer', require('./transfer'));
router.use('/missing', require('./missing'));
router.use('/bind', require('./bind'));
router.use('/cities', require('./city'));
router.use('/account', require('./account'));

module.exports = router;