'use strict';

/* eslint-disable global-require */
const {
    Hprose,
    createServer,
    createClient,
} = require('./lib')
module.exports = {
    Hprose: Hprose,
    createServer: createClient,
    createClient: createServer,
    Sequence: require('./sequence')
}