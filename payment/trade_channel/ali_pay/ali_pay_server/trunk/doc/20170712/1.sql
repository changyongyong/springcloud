ALTER TABLE `ali_refund_log` ADD COLUMN `arl_seller_id` varchar(255) COMMENT '支付商户号';

ALTER TABLE `ali_transfer_log` ADD COLUMN `atl_seller_id` varchar(255) COMMENT '支付商户号';

CREATE TABLE
IF NOT EXISTS `at_merchant_token` (
	`amt_id` INT (11) UNSIGNED PRIMARY KEY auto_increment COMMENT '递增主键',
	`amt_merchant_no` varchar(255) COMMENT '商户号',
	`amt_merchant_auth_token` varchar(255) COMMENT '商户认证token',
	`amt_merchant_source` varchar(255) COMMENT 'source名称',
	`amt_merchant_auth_start_time` datetime COMMENT '商户认证token认证开始时间',
	`amt_merchant_auth_end_time` datetime COMMENT '商户认证token认证失效时间（默认是一年）',
	`amt_created_at`	datetime COMMENT '创建时间',
	`amt_updated_at` datetime COMMENT '修改时间',
	INDEX(`amt_merchant_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT '商户号和authToken绑定表';


CREATE TABLE
IF NOT EXISTS `ali_source_list` (
	`asl_id` INT (11) UNSIGNED PRIMARY KEY auto_increment COMMENT '递增主键',
	`asl_source` varchar(64) COMMENT '类型',
	`asl_secret_key` text COMMENT '账户秘钥',
	`asl_name` varchar(255) COMMENT '账户名称',
	`asl_app_id` varchar(255) COMMENT '账户appId',
	`asl_input_charset` varchar(255) COMMENT '编码',
	`asl_seller_email` varchar(255) COMMENT '支付宝邮箱',
	`asl_created_at` datetime COMMENT '创建时间',
	`asl_updated_at` datetime COMMENT '修改时间',
	INDEX(`asl_source`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT '服务商基本的source和秘钥表';

ALTER TABLE ali_source_list ADD COLUMN asl_is_bill TINYINT COMMENT '是否对账';