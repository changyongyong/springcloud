CREATE TABLE `ali_pay_bills` (
	`id` INTEGER NOT NULL auto_increment,
	`tradeNo` VARCHAR (64),
	`outTradeNo` VARCHAR (64),
	`type` VARCHAR (64),
	`body` VARCHAR (40 0),
	`finishTime` DATETIME,
	`buyerLogonId` VARCHAR (100),
	`inFee` DECIMAL (15, 2),
	`outFee` DECIMAL (15, 2),
	`totalFee` DECIMAL (15, 2),
	`remark` VARCHAR (400),
	`validateStatus` INTEGER (2),
	`error` VARCHAR (600),
	`createdAt` DATETIME NOT NULL,
	`updatedAt` DATETIME NOT NULL,
	PRIMARY KEY (`id`)
) ENGINE = INNODB;