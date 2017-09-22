'use strict';


const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const Logger = global.Logger('DD_PAY_DB');
let dbConfig = global.DDCONFIG.dataBase.tradeGatewayDb;
dbConfig.options.logging = function (sql) {
    return Logger.info(sql);
};

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, dbConfig.options);
const db = {};

//允许读取数据库信息时使用同步读取已防止后面出现错误
/* eslint-disable no-sync */
fs
    .readdirSync(__dirname)
    /* eslint-enable no-sync */
    .filter(function (file) {
        return (/\.\w+?$/.exec(file)[0] == '.js') && (file !== 'index.js');
    })
    .forEach(function (file) {
        let model = sequelize['import'](path.join(__dirname, file));
        db[model.name] = model;
    });

Object.keys(db).forEach(function (modelName) {
    if ('associate' in db[modelName]) {
        db[modelName].associate(db);
    }
});

db.Db = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
