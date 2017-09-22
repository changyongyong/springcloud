'use strict';
/* eslint-disable global-require */
var env = process.env.NODE_ENV || 'development';
var path = require('path');
module.exports = require(path.join(__dirname, './' + env + '.js'));