'use strict';

/**
 * @author WXP
 * @description 获取城市信息
 */
const _ = require('lodash');
const {
    GlobalInfo
} = require('../lib/rpc');
const Promise = require('bluebird');

/**
 * 获取城市信息
 * @param {object} par 
 */
const getEnabledCities = function (par) {
    return GlobalInfo.city.getEnabledCities(par);
};

/**
 * 补充城市数据
 * @param {arr} records
 */
const fullUpCityInfo = function (records) {
    let cityIds = _.uniq(_.without(_.map(records, 'tradePrincipal'), null, ''));
    if (cityIds.length === 0) {
        for (let record of records) {
            record.cityName = '暂无';
            record.cityId = '';
        }
        return Promise.resolve(records);
    }
    return getEnabledCities({
            cityId: cityIds
        })
        .then((dataArr) => {
            let map = {};
            let city;
            for (let data of dataArr) {
                map[data.cityId] = data;
            }
            for (let record of records) {
                city = map[record.tradePrincipal] || {
                    cityId: '',
                    cityName: '暂无'
                };
                record.cityName = city.cityName;
                record.cityId = city.cityId || null;
            }
            return records;
        })
};


module.exports = {
    getEnabledCities: getEnabledCities,
    fullUpCityInfo: fullUpCityInfo
};