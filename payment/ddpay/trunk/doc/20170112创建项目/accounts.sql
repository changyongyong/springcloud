CREATE TABLE
IF NOT EXISTS `accounts`(
	`id` INTEGER NOT NULL auto_increment ,
	`status` INTEGER ,
	`accountNo` VARCHAR(100) ,
	`nickname` VARCHAR(100) ,
	`userName` VARCHAR(100) ,
	`phoneNum` VARCHAR(100) ,
	`identityCardNo` CHAR(50) ,
	`pwd` VARCHAR(2000) ,
	`verifyCode` VARCHAR(200) ,
	`salt` VARCHAR(100) ,
	`remark` VARCHAR(255) ,
	`createdAt` DATETIME NOT NULL ,
	`updatedAt` DATETIME NOT NULL ,
	PRIMARY KEY(`id`)
) ENGINE = INNODB  DEFAULT CHARSET=utf8;