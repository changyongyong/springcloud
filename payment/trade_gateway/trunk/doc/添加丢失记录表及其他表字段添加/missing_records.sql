DROP TABLE IF EXISTS `missing_records`;
CREATE TABLE `missing_records` (
  `ms_id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `ms_type` varchar(50) DEFAULT NULL COMMENT '丢失数据的类型（payment，refund，transfer）',
  `ms_trade_record_no` varchar(50) DEFAULT NULL COMMENT '上游支付订单号',
  `ms_source` varchar(50) DEFAULT NULL COMMENT '上游支付source',
  `ms_trade_channel` varchar(50) DEFAULT NULL COMMENT '上游渠道',
  `ms_status` varchar(50) DEFAULT NULL COMMENT '上游状态(success,pending,fail)',
  `ms_fee` decimal(10,0) DEFAULT '0' COMMENT '金额',
  `ms_message` varchar(300) DEFAULT NULL COMMENT '额外消息',
  `ms_operate_state` int(11) NOT NULL DEFAULT '0' COMMENT '操作状态',
  `ms_remark` varchar(300) DEFAULT NULL COMMENT '备注',
  `updatedAt` datetime DEFAULT NULL COMMENT '最近修改时间',
  `createdAt` datetime DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`ms_id`),
  KEY `index_ms_trade_record_no` (`ms_trade_record_no`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='丢失记录表';