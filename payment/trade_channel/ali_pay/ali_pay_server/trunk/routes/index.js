const express = require('express');
const router = express.Router();

//router.use('/weixin',require('./weixin'));

router.use(['/alipay', '/'], require('./alipay'));

module.exports = router;