'use strict'
/* eslint-disable no-sync */

/**
 * @author WXP
 * @description 账单检查
 */
const Promise = require('bluebird');
const fs = require('fs');
const moment = require('moment');
const path = require('path');
const request = require('request');
const fsStat = Promise.promisify(fs.stat);
const fsMkdir = Promise.promisify(fs.mkdir);
const { AliPay } = require('../tradeChannel');
const iconv = require('iconv-lite');
const _ = require('lodash');
const AliPayBillValidate = require('../service/aliPayBillValidate.js');
const queryServer = require('../service/query');
// const _ = require('lodash');
const unzipper = require('unzipper');
const { billValidateResult } = require('../mq/publisher');
const logger = global.Logger('billCheck');
const TRADE_CHANNEL = 'ALI_PAY';
let task = {};

/**
 * 计算
 */
task.execute = function (date) {
    //todo 自营的好像也有存sellerId
    return getSources()
        .then(function (data) {
            let sourceArr = [];
            for (let i in data) {
                if (!data.hasOwnProperty(i)) {
                    continue;
                }
                sourceArr.push(i)
            }
            //根据key（实际对应的账户）下载账单，处理数据库中source的单据
            return Promise.each(sourceArr, (par)=> {
                return AliPay.bill({
                    date: date,
                    type: 'signcustomer',
                    source: par
                    // sellerId: sellerId
                })
                    .then((data) => {
                        return downloadFile({
                            uri: data.billDownloadUrl,
                            type: 'signcustomer',
                            date
                        });
                    })
                    // 当没有订单时不需要下载账单
                    .catch(function (data) {
                        if (data.data && data.data.sub_code == 'isp.bill_not_exist') {
                            return '';
                        } else {
                            throw ('下载账单失败');
                        }
                    })
                    .then((filePath) => {
                        return AliPayBillValidate({
                            filePath,
                            source: par,
                            date,
                            // sellerId
                        });
                    })
                    .catch((error) => {
                        logger.error(error);
                        return
                    })
            });
        })
        //TODO 发送至网关告知对应业务可以进行对账
        .then(() => {
            let messages = [{
                type: 'PAYMENT',
                date: date
            }, {
                type: 'REFUND',
                date: date
            }, {
                type: 'TRANSFER',
                date: date
            }]
            return Promise.each(messages, (message) => {
                return sendToMq(message);
            })
        })
        .then(() => {
            return 'success';
        })
        .catch((error) => {
            logger.error(error);
        })

};

/**
 * 获取source映射，并修改为{账户:[数据库source]}
 */
function getSources() {
    return AliPay.sources()
        .then((data) => {
            let sources = {};
            for (let key in data) {
                if (!data.hasOwnProperty(key)) {
                    continue;
                }
                let account = data[key].account;
                if (sources[account]) {
                    sources[account].push(key);
                } else {
                    sources[account] = [key];
                }
            }
            return sources;
        })
}
/**
 * 发送到Mq，由支付网关接受，而且支付网关查询对应的日账单进行对账
 * @param {*} log  
 */
function sendToMq(message) {
    message.tradeChannel = TRADE_CHANNEL;
    return billValidateResult.sendMessage(message);
}

/**
 * 下载并解压，转换编码格式数据
 * @param {*} param0 
 */
function downloadFile({
    uri,
    date,
    type
}) {
    let filePath = path.join(__dirname, `../data/ali_${date}_${type}`);
    let now = moment().format('YYYY-MM-DD_HHmmss_SSS');
    let zipUrl = path.join(filePath, now + '.zip');
    return Promise.resolve()
        // 检查是否有文件夹
        .then(() => {
            return fsStat(filePath)
                .catch(function (error) {
                    if (error.code == 'ENOENT') {
                        return fsMkdir(filePath);
                    }
                })
        })
        // 下载账单
        .then(() => {
            return new Promise(function (resolve, reject) {
                let req = request({
                    uri: uri
                }).pipe(fs.createWriteStream(zipUrl));
                req.on('close', function () {
                    resolve();
                })
                req.on('error', function (error) {
                    reject(error);
                })
            })
        })
        // 解压文件
        .then(() => {
            return new Promise(function (resolve, reject) {
                filePath = path.join(filePath, now + '.csv');
                let ws = fs.createWriteStream(filePath);
                ws.on('close', function () {
                    logger.info('-------', filePath);
                    resolve(filePath);
                });
                ws.on('error', function (error) {
                    reject(error);
                });
                // 读取解压文件
                fs.createReadStream(zipUrl)
                    // 只解压指定文件
                    .pipe(unzipper.ParseOne(iconv.encode('账务明细.csv', 'GBK')))
                    // 读取用GBK
                    .pipe(iconv.decodeStream('gbk'))
                    // 写回用utf8
                    .pipe(iconv.encodeStream('utf8'))
                    // 写入文件
                    .pipe(ws);
            })
        })
}

task.attributes = {
    name: '账单检查任务',
    id: 'billCheck',
    version: '1.0.0',
    createAt: '2017年3月30日16:18:23',
    lastModifyTime: '2017年3月30日16:18:23',
};

module.exports.task = task;