/**
 * Created by SEELE on 2017/6/29.
 */

const create = require('./create');
const back = require('./back');
const transfer = require('./transfer');
const query = require('./query');
const auth = require('./auth');
const account = require('./account');

module.exports = {
    payment: create,
    back: back,
    transfer: transfer,
    query: query,
    auth: auth,
    account: account
};