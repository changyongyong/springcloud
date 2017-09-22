
CREATE TABLE `ali_transaction_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `appId` varchar(32) DEFAULT NULL,
  `outTradeNo` varchar(64) DEFAULT NULL,
  `tradeType` varchar(16) DEFAULT NULL,
  `totalFee` decimal(9,2) DEFAULT NULL,
  `outBizNo` varchar(64) DEFAULT NULL,
  `subject` varchar(256) DEFAULT NULL,
  `codeUrl` varchar(1024) DEFAULT NULL,
  `tradeNo` varchar(64) DEFAULT NULL,
  `gmtPayment` varchar(32) DEFAULT NULL,
  `gmtClose` varchar(32) DEFAULT NULL,
  `buyerId` varchar(16) DEFAULT NULL,
  `buyerLogonId` varchar(100) DEFAULT NULL,
  `sellerId` varchar(30) DEFAULT NULL,
  `sellerEmail` varchar(100) DEFAULT NULL,
  `buyerPayAmount` decimal(9,2) DEFAULT NULL,
  `tradeStatus` varchar(32) DEFAULT NULL,
  `payStatus` varchar(1) DEFAULT NULL,
  `closed` varchar(1) DEFAULT NULL,
  `timeExpire` datetime NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `outTradeNo` (`outTradeNo`),
  KEY `outBizNo` (`outBizNo`),
  KEY `tradeNo` (`tradeNo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `ali_refund_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `status` varchar(64) DEFAULT NULL,
  `tradeNo` varchar(64) DEFAULT NULL,
  `outTradeNo` varchar(64) DEFAULT NULL,
  `outRefundNo` varchar(64) DEFAULT NULL,
  `totalFee` decimal(9,2) DEFAULT NULL,
  `fundChange` varchar(1) DEFAULT NULL,
  `refundFee` decimal(9,2) DEFAULT NULL,
  `gmtRefundPay` varchar(64) DEFAULT NULL,
  `buyerLogonId` varchar(100) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `outRefundNo` (`outRefundNo`),
  KEY `tradeNo` (`tradeNo`),
  KEY `outTradeNo` (`outTradeNo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE `ali_transfer_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `outBizNo` varchar(64) DEFAULT NULL,
  `payAccount` varchar(32) DEFAULT NULL,
  `payeeType` varchar(20) DEFAULT NULL,
  `payeeAccount` varchar(64) DEFAULT NULL,
  `amount` decimal(9,2) DEFAULT NULL,
  `payerShowName` varchar(64) DEFAULT NULL,
  `payeeRealName` varchar(64) DEFAULT NULL,
  `aliOrderId` varchar(64) DEFAULT NULL,
  `payDate` varchar(20) DEFAULT NULL,
  `remark` varchar(200) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `outBizNo` (`outBizNo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

