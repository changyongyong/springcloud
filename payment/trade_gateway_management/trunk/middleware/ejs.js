'use strict'

/**
 * @author WXP
 * @description render方法
 */

const ejs = require('ejs');
const co = require('co');


module.exports = function (options) {
    return co.wrap(function* (ctx, next) {
        ctx.render = function (path, locals) {
            console.log('------');
            console.log(path, locals, options);
            console.log(ejs.render(path, locals, options));
            ctx.res.body = ejs.render(path, locals, options);
            return ctx;
        };
        yield next();
    })
}