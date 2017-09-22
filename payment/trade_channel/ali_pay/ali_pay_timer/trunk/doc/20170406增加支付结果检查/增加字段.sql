ALTER TABLE ali_transaction_log ADD COLUMN finishTime DATETIME COMMENT '付款时间',
 ADD COLUMN validateStatus INT (2)  default 0 COMMENT '校验状态',
 ADD COLUMN error VARCHAR (500) COMMENT '错误信息',
 ADD COLUMN validateTime DATETIME COMMENT '校验时间';
 ALTER TABLE ali_transfer_log ADD COLUMN finishTime DATETIME COMMENT '付款时间',
--  ADD COLUMN status 
 ADD COLUMN validateStatus INT (2)  default 0 COMMENT '校验状态',
 ADD COLUMN error VARCHAR (500) COMMENT '错误信息',
 ADD COLUMN validateTime DATETIME COMMENT '校验时间';
 ALTER TABLE ali_refund_log ADD COLUMN finishTime DATETIME COMMENT '付款时间',
 ADD COLUMN validateStatus INT (2)  default 0 COMMENT '校验状态',
 ADD COLUMN error VARCHAR (500) COMMENT '错误信息',
 ADD COLUMN validateTime DATETIME COMMENT '校验时间';