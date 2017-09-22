ALTER TABLE refund_records ADD COLUMN tpr_ta_id INT COMMENT "账户商户ID",
 ADD COLUMN tpr_tm_id INT COMMENT "商户配置表ID",
 ADD COLUMN tpr_trade_merchant_no varchar(255) COMMENT "对应子商户编号";