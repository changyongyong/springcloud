const express = require('express');
const router = express.Router();

router.use('/', require('./alipay'));

module.exports = router;

