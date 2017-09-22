const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const baseConfig = global.BASECONFIG;
const config = baseConfig['dataBase']['ctcDb'];
const sequelize = new Sequelize(config.database, config.username, config.password, config);
const db = {};
/* eslint-disable no-sync */
fs
    .readdirSync(__dirname)
    .filter(function (file) {
        return (/\.\w+?$/.exec(file)[0] == '.js') && (file !== 'index.js');
    })
    .forEach(function (file) {
        var model = sequelize['import'](path.join(__dirname, file));
        db[model.name] = model;
    });

Object.keys(db).forEach(function (modelName) {
    if ('associate' in db[modelName]) {
        db[modelName].associate(db);
    }
});

db.Ctcdb = sequelize;
//db.InventoryManagementDb = sequelize;
//db.FinanceManagementDb = sequelize;
db.Sequelize = Sequelize;
//sequelize.sync();
//db.CatalogCity.sync({force:true});
//db.Catalog.sync();
//
//db.StoreShoppingCart.sync();
//db.WechatUser.sync();

//db.AliTransactionLog.sync();
//db.AliRefundLog.sync();
//db.AliTransferLog.sync();

module.exports = db;