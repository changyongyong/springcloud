'use strict';

/**
 * @author WXP
 * @description 账单检查
 */
require('../config/loadConfig');

const Promise = require('bluebird');
const fs = require('fs');
const path = require('path');
const fsStat = Promise.promisify(fs.stat);
const fsMkdir = Promise.promisify(fs.mkdir);
const { WeChatPay } = require('../tradeChannel');
const WeChatPayBillValidate = require('../service/weChatPayBill');
const { billValidateResult } = require('../mq/publisher');
const TRADE_CHANNEL = 'WE_CHAT_PAY';

let task = {};
let sources = {
    dd528: ['ddapp', 'dd528'],
    psapp: ['psapp'],
    bsapp: ['bsapp'],
    wxmp: ['wxmp'],
    ddfws: ['ddfws']
};


//对账流程，先对支付账单，再对退款账单
//按照支付渠道定义的source分开对账
task.execute = function (date) {
    return Promise.resolve()
        .then(() => {
            return downloadFile({
                sources: sources,
                date: date,
                type: 'SUCCESS'
            })
        })
        .then((pathes) => {
            let arr = [];
            for (let source in pathes) {
                if (!pathes.hasOwnProperty(source)) {
                    continue;
                }
                arr.push({
                    type: 'payment',
                    date: date,
                    source: sources[source], //sources[source] ==> account
                    filePath: pathes[source]
                });
            }
            return Promise.each(arr, function (data) {
                return WeChatPayBillValidate(data);
            })
        })
        .then(() => {
            return downloadFile({
                sources: sources,
                date: date,
                type: 'REFUND'
            })
        })
        .then((pathes) => {
            let arr = [];
            for (let source in pathes) {
                if (!pathes.hasOwnProperty(source)) {
                    continue;
                }
                arr.push({
                    type: 'refund',
                    date: date,
                    source: sources[source],
                    filePath: pathes[source]
                });
            }
            return Promise.each(arr, function (data) {
                return WeChatPayBillValidate(data);
            })
        })
        .then(() => {
            let messages = [{
                type: 'REFUND',
                date: date
            }, {
                type: 'PAYMENT',
                date: date
            }];
            return Promise.each(messages, (message) => {
                return sendToMq(message);
            })
        })
        .then(() => {
            return 'success';
        })
};

/**
 * 发送到Mq，由支付网关接受处理，每次100条发放
 * @param {*} log 
 */
function sendToMq(message) {
    message.tradeChannel = TRADE_CHANNEL;
    return billValidateResult.sendMessage(message);
}

//下载对账文件
//sources: ['psapp', 'dd528', 'ddapp', 'bsapp', 'wxmp']
//date:  20140603
//type:  ALL \ SUCCESS \ REFUND
function downloadFile({ sources, date, type }) {
    let filePath = path.join(__dirname, `../data/wx_${date}_${type}`);
    let now = Date.now();
    let pathes = {};
    if (!sources) {
        throw ('没有对应的账户！');
    }
    sources = Object.keys(sources);
    return Promise.resolve()
        .then(() => {
            return fsStat(filePath)
                .catch(function (error) {
                    if (error.code == 'ENOENT') {
                        return fsMkdir(filePath);
                    }
                })
        })
        .then(() => {
            for (let source of sources) {
                // /[\/,\?,\*,\:,\|,\\,\<,\>,\"]/g 为windows下不允许命名中出现这些符号，通过正则替换为_
                pathes[source] = path.join(
                    filePath,
                    // 文件名为source+时间戳
                    `/${source.replace(/[\/,\?,\*,\:,\|,\\,\<,\>,\"]/g, '_')}_${now}.txt`
                );
            }
            return Promise.each(sources, function (source) {
                return WeChatPay.bill({
                    source: source,
                    date: date,
                    type: type,
                    filePath: pathes[source]
                })
            })
        })
        .then(() => {
            return pathes;
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


/*
 task.execute('20170415')
 .catch((error) => {
 console.log(error);
 });
 */