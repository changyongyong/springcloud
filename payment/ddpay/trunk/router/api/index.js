const router = require('koa-router')();
const tradeAccount = require('./tradeAccount');
const trade = require('./trade');
const statistics = require('./statistics');
const bill = require('./bill');

router.use('/trade', trade.routes());
router.use('/tradeAccount', tradeAccount.routes());
router.use('/statistics', statistics.routes());
router.use('/bill', bill.routes());

module.exports = router;
