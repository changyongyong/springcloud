'use strict';
/* eslint-disable global-require */
const env = process.env.NODE_ENV || 'development';
const path = require('path');
module.exports = require(path.join(__dirname, './' + env + '.js'));