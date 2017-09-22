ALTER TABLE ali_transfer_log ADD COLUMN source VARCHAR (16) COMMENT '转出账户';
ALTER TABLE ali_transfer_log ADD COLUMN status TINYINT COMMENT '转账状态，0:转账中,1:成功 -1失败' DEFAULT 0;