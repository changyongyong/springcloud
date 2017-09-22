CREATE TABLE
IF NOT EXISTS `dp_frozen_record` (
	`fr_id` INT (11) UNSIGNED PRIMARY KEY auto_increment COMMENT '递增主键',
	`fr_no` VARCHAR (100) COMMENT '冻结流水号',
	`fr_trade_account_no` VARCHAR (100) COMMENT '账户编号',
	`fr_amount` DECIMAL (15, 2) COMMENT '已使用冻结金额',
	`fr_limit_amount` DECIMAL (15, 2) COMMENT '冻结金额上限',
	`fr_status` VARCHAR (100) COMMENT '状态',
	`fr_trade_type` VARCHAR (100) COMMENT '冻结金额业务类型',
	`fr_number_id` VARCHAR (100) COMMENT '业务单据号',
	`fr_created_at` DATETIME NOT NULL,
	`fr_updated_at` DATETIME NOT NULL,
	`fr_dp_ta_id` INTEGER COMMENT 'tradeAccount.id',
	KEY(fr_dp_ta_id)
) ENGINE = INNODB comment '金额冻结表';

CREATE TABLE
IF NOT EXISTS `dp_frozen_record_log` (
	`frl_id` INT (11) UNSIGNED PRIMARY KEY auto_increment COMMENT '递增主键',
	`frl_before_status` VARCHAR (100) COMMENT '之前状态',
	`frl_after_status` VARCHAR (100) COMMENT '之后状态',
	`frl_amount` DECIMAL (15, 2) COMMENT '可用金额的变动金额',
	`frl_before_amount` DECIMAL (15, 2) COMMENT '变动前已使用金额',
	`frl_after_amount` DECIMAL (15, 2) COMMENT '变动后已使用金额',
	`frl_remark` VARCHAR (100) COMMENT '备注',
	`frl_created_at` DATETIME NOT NULL,
	`frl_updated_at` DATETIME NOT NULL,
	`frl_dp_fr_id` INTEGER COMMENT 'dp_frozen_record.id',
	KEY (`frl_dp_fr_id`)
) ENGINE = INNODB comment '金额冻结记录表';

CREATE TABLE
IF NOT EXISTS `dp_withdraw_apply` (
	`wa_id` INT (11) UNSIGNED PRIMARY KEY auto_increment COMMENT '递增主键',
	`wa_order_id` VARCHAR (100) COMMENT '业务单号',
	`wa_number_id` VARCHAR (255) COMMENT '提现的单号',
	`wa_system` VARCHAR(100) COMMENT '来源系统',
	`wa_trade_principal` VARCHAR (100) COMMENT '交易主体',
	`wa_operate_no` varchar(255) comment '操作记录单号',
	`wa_order_type` varchar(100) COMMENT '业务订单类型',
	`wa_transfer_record_no` VARCHAR (100) COMMENT '业务转账单号',
	`wa_req_account_id` VARCHAR (100) COMMENT '调用的accountId',
	`wa_amount` DECIMAL (9,2) COMMENT '转账金额',
	`wa_tip` DECIMAL (9,2) COMMENT '服务费',
	`wa_third_part_account` VARCHAR (100) COMMENT '第三方账户编号',
	`wa_real_name` VARCHAR (100) COMMENT '第三方账户真实姓名',
	`wa_status` VARCHAR (100) COMMENT '状态',
	`wa_trade_type` VARCHAR (100) COMMENT '提现使用渠道',
	`wa_remark` VARCHAR (255) COMMENT '转账备注',
	`wa_finish_time` VARCHAR (100) COMMENT '终结状态时间',
	`wa_trade_account_no` VARCHAR (100) COMMENT '支付账户编号',
	`wa_message` VARCHAR (100) COMMENT '错误信息',
	`wa_created_at` datetime COMMENT '创建时间',
	`wa_updated_at` datetime COMMENT '修改时间',
	`wa_dp_ta_id` INTEGER COMMENT 'tradeAccount.id',
	`wa_dp_fr_id` INTEGER COMMENT 'dp_frozen_record.id',
	`wa_tip_dp_fr_id` INTEGER COMMENT 'dp_frozen_record.id,服务费的Id',
	KEY(wa_dp_ta_id),
	KEY(wa_transfer_record_no),
	KEY(wa_trade_account_no),
KEY(wa_dp_fr_id)
) ENGINE = INNODB comment '提现申请表';

CREATE TABLE
IF NOT EXISTS `dp_withdraw_apply_log` (
	`wal_id` INT (11) UNSIGNED PRIMARY KEY auto_increment COMMENT '递增主键',
	`wal_before_status` varchar(100) COMMENT '之前状态',
	`wal_after_status` varchar(100) COMMENT '之后状态',
	`wal_message` varchar(255) COMMENT '说明',
	`wal_created_at` datetime COMMENT '创建时间',
    `wal_updated_at` datetime COMMENT '修改时间',
	`wal_dp_wa_id`  INTEGER COMMENT 'dp_withdraw_apply.id',
	KEY(wal_dp_wa_id)
) ENGINE = INNODB comment '提现日志申请表';

INSERT INTO `sequences` (`name`, `currentVal`, `step`, `currentDate`, `cacheLen`, `isDate`, `createdAt`, `updatedAt`) VALUES ('ddPayFrozenRecordNo', '1000000', '1', '2017-01-17', '10000', '0', now(), now());
