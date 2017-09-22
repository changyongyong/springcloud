/**
 * URI encode方法，把所有符号都进行转换
 */
module.exports.encode = function (str) {
    return encodeURIComponent(str).replace(/[/.!'()*~_-]/g, x => `%${x.charCodeAt(0).toString(16).toUpperCase()}`);
}