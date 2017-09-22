ALTER TABLE payment_records ADD COLUMN payTime DATETIME COMMENT '支付时间';
ALTER TABLE payment_records ADD COLUMN validateStatus INT NOT NULL DEFAULT 0 COMMENT '对账状态';
ALTER TABLE payment_records ADD COLUMN error VARCHAR(255) NULL COMMENT '对账错误信息';
ALTER TABLE payment_records ADD COLUMN validateTime DATETIME COMMENT '对账时间';
ALTER TABLE payment_records ADD COLUMN `validateBalance`  decimal(12,3) NOT NULL DEFAULT 0 COMMENT '对账差额（网关的金额 - 渠道的金额）';

ALTER TABLE refund_records ADD COLUMN payTime DATETIME COMMENT '退款时间';
ALTER TABLE refund_records ADD COLUMN validateStatus INT NOT NULL DEFAULT 0 COMMENT '对账状态';
ALTER TABLE refund_records ADD COLUMN error VARCHAR(255) NULL COMMENT '对账错误信息';
ALTER TABLE refund_records ADD COLUMN validateTime DATETIME COMMENT '对账时间';
ALTER TABLE refund_records ADD COLUMN `validateBalance`  decimal(12,3) NOT NULL DEFAULT 0 COMMENT '对账差额（网关的金额 - 渠道的金额）';

ALTER TABLE transfer_records ADD COLUMN payTime DATETIME COMMENT '转账时间';
ALTER TABLE transfer_records ADD COLUMN validateStatus INT NOT NULL DEFAULT 0 COMMENT '对账状态';
ALTER TABLE transfer_records ADD COLUMN error VARCHAR(255) NULL COMMENT '对账错误信息';
ALTER TABLE transfer_records ADD COLUMN validateTime DATETIME COMMENT '对账时间';
ALTER TABLE transfer_records ADD COLUMN `validateBalance`  decimal(12,3) NOT NULL DEFAULT 0 COMMENT '对账差额（网关的金额 - 渠道的金额）';