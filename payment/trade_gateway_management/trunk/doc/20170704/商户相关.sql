CREATE TABLE
IF NOT EXISTS `tg_account` (
	`ta_id` INT (11) UNSIGNED PRIMARY KEY auto_increment COMMENT '递增主键',
	`ta_account_id` varchar(255) COMMENT '业务唯一标识符',
	`ta_name` varchar(255) COMMENT '应用名称',
	`ta_salt` varchar(255) COMMENT '加密盐',
	`ta_out_id` varchar(255) COMMENT '业务Id',
	`ta_out_type` varchar(255) COMMENT '业务类型',
	`ta_out_system` varchar(255) COMMENT '业务系统',
	`ta_created_at`	datetime COMMENT '创建时间',
	`ta_updated_at` datetime COMMENT '修改时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT '业务应用加密表';


CREATE TABLE
IF NOT EXISTS `tg_account_merchant` (
	`tam_id` INT (11) UNSIGNED PRIMARY KEY auto_increment COMMENT '递增主键',
	`tam_state` int(5) COMMENT '是否被禁用',
	`tam_is_not_history` int(5) COMMENT '是否为历史，0代表历史，1代表正在使用',
	`tam_type` int(5) COMMENT '类型,是否自营还是商户',
	`tam_trade_type` varchar(64) COMMENT '支付方式',
	`tam_trade_channel` varchar(64) COMMENT '支付渠道',
	`tam_trade_merchant_no` varchar(255) COMMENT '商户号',
	`tam_trade_merchant_name` varchar(255) COMMENT '商户名称',
	`tam_trade_merchant_auth_no` varchar(255) COMMENT '授权认证号',
	`tam_tm_id` int(11) COMMENT '支付渠道配置的Id',
	`tam_ta_id` int(11) COMMENT '关联账户的Id',
    `tam_created_at`	datetime COMMENT '创建时间',
	`tam_updated_at` datetime COMMENT '修改时间',
	INDEX(`tam_tm_id`),
	INDEX(`tam_state`),
	INDEX(`tam_type`),
	INDEX(`tam_state`),
	INDEX(`tam_ta_id`),
	INDEX(`tam_is_not_history`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT '商户和业务和支付关系表';

CREATE TABLE
IF NOT EXISTS `tg_merchant_config` (
	`tc_id` INT (11) UNSIGNED PRIMARY KEY auto_increment COMMENT '递增主键',
	`tc_source` varchar(64) COMMENT '支付source',
	`tc_name` varchar(255) comment '商户名称',
	`tc_trade_channel` int(5) COMMENT '支付渠道',
	`tc_type` int(5) comment '自营还是商户',
		`tc_created_at`	datetime COMMENT '创建时间',
	`tc_updated_at` datetime COMMENT '修改时间',
	INDEX(`tc_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT '支付配置表';
