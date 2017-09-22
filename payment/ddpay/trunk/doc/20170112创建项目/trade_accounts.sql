CREATE TABLE
IF NOT EXISTS `trade_accounts`(
	`id` INTEGER NOT NULL auto_increment ,
	`tradeAccountNo` VARCHAR(100) ,
	`status` INTEGER ,
	`type` VARCHAR(100) ,
	`balance` DECIMAL(15 , 5) ,
	`amountFrozen` DECIMAL(15 , 5) ,
	`deposit` DECIMAL(15 , 5) ,
	`creditLimit` DECIMAL(15 , 5) ,
	`tradePwd` VARCHAR(1500) ,
	`accountNo` VARCHAR(100) ,
	`verifyCode` VARCHAR(300) ,
	`salt` VARCHAR(300) ,
	`createdAt` DATETIME NOT NULL ,
	`updatedAt` DATETIME NOT NULL ,
	`AccountId` INTEGER ,
	PRIMARY KEY(`id`) ,
	KEY(`AccountId`)
) ENGINE = INNODB DEFAULT CHARSET=utf8;