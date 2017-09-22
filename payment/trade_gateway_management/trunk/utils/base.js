/**
 * Created by SEELE on 2017/7/10.
 */


module.exports = {
    getIp: function (req) {
        const _ip = (req.headers['x-forwarded-for'] || '').split(',')[0] || req.connection.remoteAddress
            , __ip = _ip.match(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/g);
        return __ip && __ip[0] || '127.0.0.1';
    }
};