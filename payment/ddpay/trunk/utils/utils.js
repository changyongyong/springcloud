const redis = require('redis');
const NoRepeat = require('norepeat');
const config = global.DDCONFIG.redis;
const _ = require('lodash');
const request = require('request-promise');
// 配置redis 
let client = redis.createClient({
    host: config.host,
    db: config.db
});
let noRepeat = new NoRepeat(client);
module.exports.noRepeat = noRepeat;

module.exports.objToUrl = (obj) => {
    let arr = _.toPairs(obj);
    let arr2 = [];
    for (let data of arr) {
        if (_.includes([undefined, '', null], data[1])) {
            continue;
        }
        data[1] = encodeURIComponent(data[1]);
        arr2.push(data.join('='));
    }
    return arr2.join('&');
};

module.exports.configToFuncs = (() => {
    /**
     * 根据配置生成请求方法
     * @param {*} config 
     */
    const initRequest = function (config) {
        return function (query) {
            let uri = config.host + config.path;
            let data;
            if (config.method == 'GET') {
                uri += '?' + module.exports.objToUrl(query);
            } else {
                data = query;
            }
            return request({
                    uri: uri,
                    method: config.method,
                    json: true,
                    body: data
                })
                .then((data) => {
                    if (data.tag && data.tag == 'success') {
                        return data.data;
                    } else {
                        throw (data);
                    }
                });
        }
    };

    const initEach = (key, config, {
        services
    }) => {
        let funcPath = key.split('.');
        let funcName = funcPath.pop();
        let service = services;
        for (let path of funcPath) {
            if (!service[path]) {
                service[path] = {};
            }
            service = service[path];
        }
        let func = initRequest(config);
        service[funcName] = (args) => {
            return func(args)
                .catch((error) => {
                    return Promise.reject(
                        typeof error === 'string' ? error : error && error.message || '系统错误'
                    );
                });
        }
    }
    return (configs) => {
        let services = {};
        let keys = Object.keys(configs);
        for (let key of keys) {
            initEach(key, configs[key], {
                services
            });
        }
        return services;
    }
})()