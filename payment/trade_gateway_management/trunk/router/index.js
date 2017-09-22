'use strict'

/**
 * @author WXP
 * @description 
 */

const router = require('express').Router();

// 页面路由，不需要前缀
router.use(require('./view'));
// API 路由，获取数据
router.use('/api', require('./api'));


module.exports = router;