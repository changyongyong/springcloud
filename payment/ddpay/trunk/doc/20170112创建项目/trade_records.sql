CREATE TABLE
IF NOT EXISTS `trade_records`(
	`id` INTEGER NOT NULL auto_increment ,
	`tradeRecordNo` BIGINT(20) ,
	`type` INTEGER ,
	`tradeType` VARCHAR(100) ,
	`totalAmount` DECIMAL(15 , 5) ,
	`receiptAmount` DECIMAL(15 , 5) ,
	`operateLogNo` VARCHAR(100) ,
	`tradeAccountNo` VARCHAR(100) ,
	`counterpartyNo` VARCHAR(100) ,
	`orderType` VARCHAR(400),
	`orderId` VARCHAR(200) ,
	`remark` VARCHAR(400) ,
	`outTradeRecordNo` VARCHAR(200) ,
	`createdAt` DATETIME NOT NULL ,
	`updatedAt` DATETIME NOT NULL ,
	`TradeAccountId` INTEGER ,
	PRIMARY KEY(`id`) ,
	KEY(`TradeAccountId`)
) ENGINE = INNODB DEFAULT CHARSET=utf8;