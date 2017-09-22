'use strict';

const router = require('koa-router')();

router.use('/weChatPay', require('./weChatPay').routes());
router.use('/aliPay', require('./aliPay').routes());
router.use('/refund', require('./refund').routes());
router.use('/transfer', require('./transfer').routes());
router.use('/test', require('./test').routes());
router.use('/account', require('./account').routes());

module.exports = router;