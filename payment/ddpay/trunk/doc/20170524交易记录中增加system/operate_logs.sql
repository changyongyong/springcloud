ALTER TABLE operate_logs ADD COLUMN tradeAccountNo VARCHAR (100) comment '支付账户编号',
 ADD COLUMN system VARCHAR (128) COMMENT '调用系统',
 ADD INDEX tradeAccountNo (tradeAccountNo);