'use strict';

/**
 * 处理消息结果
 * @author 吴秀璞
 * @since 2017/1/16
 */

const ddPayDb = require('../../models/ddPayDb');
const {
    rechargeResult: TradeResultPublisher,
    transferResult: TransferResultPublisher
} = require('../../mq/publisher');
//sequence取号服务
const {
    PaymentRecord: PaymentRecordDb,
    WithdrawApply: WithdrawApplyDb
} = ddPayDb;
const PaymentRecord = require('../paymentRecord');
const {
    transferIn
} = require('./comm');

const {
    finishFrozenRecord
} = require('./frozen');

const {
    withDrawCreateAndLogUpdate
} = require('./balance');

/**
 * 付款结果处理
 */
const paymentHandle = function (data, options) {
    let {
        tradeRecordNo,
        status
    } = data;
    let record;
    // 查询付款记录
    return PaymentRecordDb.find({
            where: {
                outTradeRecordNo: tradeRecordNo
            }
        })
        .then((data) => {
            if (!data) {
                if (status == 'FAIL') {
                    throw (true);
                } else {
                    throw (`${tradeRecordNo}付款成功却没有对应的付款单据！`)
                }
            }
            if (data.status !== 'PENDDING') {
                if (data.status != status) {
                    throw (`${tradeRecordNo}当前状态与支付结果不符！`)
                }
                if (data.status == 'SUCCESS') {
                    throw (true);
                }
            }
            record = data;
            // 更改付款记录付款状态
            switch (status) {
                case 'SUCCESS':
                    return PaymentRecord.toSuccess({
                        record: record
                    }, options);
                case 'FAIL':
                    return PaymentRecord.toFail({
                        record: record
                    }, options);
            }
        })
        .then(() => {
            // 支付成功的情况下增加余额
            if (status == 'FAIL') {
                return;
            }
            let {
                tradeAccountNo,
                amount,
                type,
                tradeType,
                field,
                operateLogNo,
                orderType,
                orderId,
                remark,
                system,
                tradePrincipal
            } = record;
            options.lock = options.transaction.LOCK.UPDATE;
            // 增加金额
            return transferIn({
                tradeAccountNo: tradeAccountNo,
                outTradeRecordNo: tradeRecordNo,
                amount: amount,
                type: type,
                field: field,
                operateLogNo: operateLogNo,
                orderType: orderType,
                tradeType: tradeType,
                orderId: orderId,
                remark: remark,
                system,
                tradePrincipal
            }, options)
        })
        .then(() => {
            // 将处理结果发送给上层调用方
            return TradeResultPublisher.sendMessage({
                tradeRecordNo: record.outTradeRecordNo,
                status: status,
                system: record.system,
                orderId: record.orderId,
                orderType: record.orderType,
                amount: record.amount
            }, options)
        })
        .catch((error) => {
            if (error === true) {
                return;
            }
            throw (error);
        })
};

const transferHandle = function (data, options) {
    let {
        tradeRecordNo,
        operateLogNo
    } = data;

    let transaction = options.transaction;
    let withData;
    let resp;
    let tipResp;

    if (data.status === 'SUCCESS') {
        return WithdrawApplyDb.find({
            where: {
                transferRecordNo: tradeRecordNo
            },
            raw: true
        })
            .then((result)=> {
                if (!result) {
                    throw ('此转账记录不存在')
                }

                if (result.status !== WithdrawApplyDb.getStatus().APPLYING) {
                    throw ('单据状态错误')
                }
                withData = result;
                return finishFrozenRecord({
                    frozenRecordId: result.FrozenRecordId,
                    numberId: result.numberId,
                    amount: result.amount,
                    system: result.system,
                    orderId: result.orderId,
                    orderType: result.orderType,
                    operateLogNo: operateLogNo,
                    tradePrincipal: result.tradePrincipal
                }, {
                    transaction: transaction,
                    lock: transaction.LOCK.UPDATE
                })
            })
            .then((data)=> {
                resp = data;
                if (withData.tipFrozenRecordId) {
                    return finishFrozenRecord({
                        frozenRecordId: withData.tipFrozenRecordId,
                        numberId: withData.numberId,
                        amount: withData.tip,
                        system: withData.system,
                        orderId: withData.orderId,
                        orderType: withData.orderType,
                        operateLogNo: operateLogNo,
                        tradePrincipal: withData.tradePrincipal
                    }, {
                        transaction: transaction,
                        lock: transaction.LOCK.UPDATE
                    })
                }
            })
            .then((data)=> {
                if (data) {
                    tipResp = data;
                }
                return withDrawCreateAndLogUpdate({
                    updateInfo: {
                        status: WithdrawApplyDb.getStatus().SUCCESS
                    },
                    createInfo: {
                        beforeStatus: withData.status,
                        afterStatus: WithdrawApplyDb.getStatus().SUCCESS,
                        message: '结果回调成功',
                        WithdrawApplyId: withData.id
                    },
                    applyId: withData.id
                }, {
                    transaction: transaction
                })
            })
            .then(()=> {
                //发送mq消息给java处理结果
                return TransferResultPublisher.sendMessage({
                    tradeRecordNo: resp.tradeRecordNo,
                    tipTradeRecordNo: tipResp && tipResp.tradeRecordNo || null,
                    numberId: withData.numberId,
                    status: 'SUCCESS',
                    system: withData.system,
                    orderId: withData.orderId,
                    orderType: withData.orderType,
                    amount: withData.amount
                }, {
                    transaction: transaction
                })
            })
            .catch((error)=> {
                throw (error)
            })
    }
};

const handle = function (par, options) {
    switch (par.type) {
        case 'payment':
            return paymentHandle(par, options);
        case 'transfer':
            return transferHandle(par, options)
    }

};

module.exports = {
    handle
}