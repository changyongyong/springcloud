ALTER TABLE trade_records ADD COLUMN system VARCHAR (128) COMMENT '来源系统',
 ADD COLUMN tradePrincipal VARCHAR (128) COMMENT '交易主体';