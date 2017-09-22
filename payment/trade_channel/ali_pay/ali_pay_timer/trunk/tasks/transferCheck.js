
const {
    Db,
    AliTransferLog: TransferRecord
} = require('../models/aliPayDb');
const {
    AliPay: Channel
} = require('../tradeChannel');
const {
    transferResult
} = require('../mq/publisher');
const moment = require('moment');
const logger = global.Logger('transferCheck');
// 查询从当前向前多少秒的订单
const OFF_SECOND = 120;

let task = {};

let STATUS = TransferRecord.getStatus();

let StatusMap = {
    '0': 'PENDDING',
    '1': 'SUCCESS',
    '-1': 'FAIL'
};

task.execute = function () {
    let endTime = moment().add(OFF_SECOND, 's').toDate();

    //todo startTime 只是为了来测试
    let startTime = moment().format('YYYY-MM-DD');

    return TransferRecord.findAll({
        where: {
            status: STATUS.PENDDING,
            createdAt: {
                $lte: endTime,
                $gte: startTime
            }
        }
    })
        .then((records) => {
            return Promise.each(records, (record) => {
                return query(record);
            })
        })
        .then(() => {
            return ''
        })
};


const query = function (record) {
    let {
        outBizNo,
        aliOrderId,
        source,
        sellerId
    } = record;
    let transaction;
    let status;
    return Db.transaction()
        .then((data) => {
            transaction = data;
            return Channel.transferQuery({
                outBizNo: outBizNo,
                aliOrderId: aliOrderId,
                source: source,
                sellerId: sellerId
            })
                .then((data) => {
                    if (data.outBizNo) {
                        data.status = STATUS.SUCCESS;
                    } else {
                        data.status = STATUS.FAIL;
                        data.outBizNo = outBizNo;
                    }
                    return data;
                })
                .catch((error) => {
                    let data = error.data || {};
                    if (data.sub_code == 'ACQ.TRADE_NOT_EXIST') {
                        return {
                            status: STATUS.FAIL,
                            outBizNo: outBizNo
                        }
                    }
                    throw (error);
                })
        })
        .then((data) => {
            if (data.outBizNo != outBizNo) {
                logger.error(`${outBizNo}查询转账结果失败，时间返回结果为${data.outBizNo}`);
                throw (Error(`${outBizNo}查询转账结果失败，时间返回结果为${data.outBizNo}`));
            }
            // console.log(record)
            // record.status = data.status;
            status = data.status;
            return TransferRecord.update({
                status: data.status
            }, {
                where: {
                    outBizNo: data.outBizNo
                },
                transaction: transaction
            })
            // return record.save({
            //     transaction: transaction
            // })
        })
        .then(() => {
            return transferResult.sendMessage({
                tradeRecordNo: outBizNo,
                status: StatusMap[status],
                chunnel: 'ALI_PAY_CHANNEL'
            }, {
                transaction: transaction
            })
        })
        .then(() => {
            return transaction.commit();
        })
        .catch((error) => {
            logger.error(error)
            if (error === true) {
                return transaction.commit();
            }
            logger.error(`error: ${error} message:${JSON.stringify(error.message)} ` +
                `sql:${error.sql} data:${JSON.stringify(error.data)} stack:${error.stack}`);
            return transaction.rollback();
        })
        .then(() => {
            return '';
        })
}

task.attributes = {
    name: '转账结果检查',
    id: 'transferCheck',
    version: '1.0.0',
    createAt: '2017年7月21日15:22:39',
    lastModifyTime: '2017年7月21日15:22:39'
};

module.exports.task = task;