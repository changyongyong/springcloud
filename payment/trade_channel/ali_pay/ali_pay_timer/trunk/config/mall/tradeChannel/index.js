'use strict';
/* eslint-disable global-require */
const path = require('path');
module.exports = require(path.join(__dirname, `./${global.ENV }.js`));