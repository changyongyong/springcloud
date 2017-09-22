const router = require('express').Router();

router.use('/weixin', require('./weixin'));

module.exports = router;