'use strict'

/**
 * @author WXP
 * @description 提现申请表
 */

const STATUS = {
    'APPLYING': '1',
    'SUCCESS': '10',
    'REPEAT': '-5',
    'FAIL': '-10'
};

module.exports = function (sequelize, DataTypes) {
    const WithdrawApply = sequelize.define('WithdrawApply', {
        id: {
            field: 'wa_id',
            type: DataTypes.INTEGER,
            comment: '自增Id',
            primaryKey: true,
            autoIncrement: true
        },
        orderId: {
            type: DataTypes.STRING(100),
            comment: '业务单号',
            field: 'wa_order_id'
        },
        numberId: {
            type: DataTypes.STRING(255),
            comment: '提现的单号',
            field: 'wa_number_id'
        },
        system: {
            type: DataTypes.STRING(100),
            comment: '来源系统',
            field: 'wa_system'
        },
        orderType: {
            type: DataTypes.STRING(100),
            comment: '业务订单类型',
            field: 'wa_order_type'
        },
        transferRecordNo: {
            type: DataTypes.STRING(100),
            comment: '业务单号',
            field: 'wa_transfer_record_no'
        },
        reqAccountId: {
            type: DataTypes.STRING(100),
            comment: '调用的accountId',
            field: 'wa_req_account_id'
        },
        amount: {
            type: DataTypes.DECIMAL(9, 2),
            comment: '转账金额',
            field: 'wa_amount'
        },
        thirdPartAccount: {
            type: DataTypes.STRING(200),
            comment: '第三方账户编号',
            field: 'wa_third_part_account'
        },
        realName: {
            type: DataTypes.STRING(100),
            comment: '第三方账户真实姓名',
            field: 'wa_real_name'
        },
        // ALI_PAY，WE_CHAT_PAY
        tradeType: {
            type: DataTypes.STRING(100),
            comment: '提现使用渠道',
            field: 'wa_trade_type'
        },
        //  -10 为提现失败， -5 表示可以重新提交，申请，和撤销， 1代表申请成功， 10代表完结
        status: {
            type: DataTypes.STRING(100),
            comment: '状态',
            field: 'wa_status'
        },
        remark: {
            type: DataTypes.STRING(255),
            comment: '转账备注',
            field: 'wa_remark'
        },
        finishTime: {
            type: DataTypes.DATE,
            comment: '终结状态时间',
            field: 'wa_finish_time'
        },
        tradeAccountNo: {
            type: DataTypes.STRING(100),
            comment: '支付账户编号',
            field: 'wa_trade_account_no'
        },
        message: {
            type: DataTypes.STRING(),
            comment: '错误信息',
            field: 'wa_message'
        },
        tradePrincipal: {
            type: DataTypes.STRING(255),
            comment: '交易主体',
            field: 'wa_trade_principal'
        },
        operateLogNo: {
            type: DataTypes.STRING(255),
            comment: '操作记录单号',
            field: 'wa_operate_no'
        },
        TradeAccountId: {
            type: DataTypes.INTEGER,
            comment: 'TradeAccountId',
            field: 'wa_dp_ta_id'
        },
        FrozenRecordId: {
            type: DataTypes.INTEGER,
            comment: 'FrozenRecordId',
            field: 'wa_dp_fr_id'
        },
        tip: {
            type: DataTypes.DECIMAL(9, 2),
            comment: '转账服务费',
            field: 'wa_tip'
        },
        tipFrozenRecordId: {
            type: DataTypes.DECIMAL(9, 2),
            comment: '转账服务费锁定Id',
            field: 'wa_tip_dp_fr_id'
        }
    }, {
        freezeTableName: true,
        tableName: 'dp_withdraw_apply',
        classMethods: {
            getStatus: function () {
                return STATUS;
            }
        },
        createdAt: 'wa_created_at',
        updatedAt: 'wa_updated_at'
    });
    return WithdrawApply;
};