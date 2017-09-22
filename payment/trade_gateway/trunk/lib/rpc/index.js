'use strict';

/* eslint-disable global-require */
const {
    Hprose,
    createClient,
} = require('./lib');
module.exports = {
    Hprose: Hprose,
    createClient: createClient,
    Sequence: require('./sequence')
}