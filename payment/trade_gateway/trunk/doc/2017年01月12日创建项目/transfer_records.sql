CREATE TABLE
IF NOT EXISTS `transfer_records` (
	`id` INTEGER NOT NULL auto_increment,
	`tradeRecordNo` VARCHAR (200),
	`status` VARCHAR (100),
	`tradeType` VARCHAR (100),
	`tradeChannel` VARCHAR (100),
	`totalFee` DECIMAL (15, 2),
	`thirdPartAccount` VARCHAR (255),
	`receiptFee` DECIMAL (15, 2),
	`operateLogNo` VARCHAR (100),
	`orderType` VARCHAR (400),
	`orderId` VARCHAR (200),
	`system` VARCHAR (200),
	`source` VARCHAR (100),
	`remark` VARCHAR (400),
	`message` VARCHAR (1000),
	`createdAt` DATETIME NOT NULL,
	`updatedAt` DATETIME NOT NULL,
	PRIMARY KEY (`id`)
) ENGINE = INNODB DEFAULT CHARSET=utf8;
ALTER TABLE `transfer_records` ADD INDEX `orderId` (`orderId`);
ALTER TABLE `transfer_records` ADD INDEX `orderId_tradeType` (`orderId`, `tradeType`);