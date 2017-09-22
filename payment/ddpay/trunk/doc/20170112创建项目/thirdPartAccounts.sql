CREATE TABLE
IF NOT EXISTS `third_part_accounts` (
	`id` INTEGER NOT NULL auto_increment,
	`userName` VARCHAR (200),
	`accountType` VARCHAR (200),
	`accountNo` VARCHAR (200),
	`verifyCode` VARCHAR (200),
	`createdAt` DATETIME NOT NULL,
	`updatedAt` DATETIME NOT NULL,
	`AccountId` INTEGER,
	PRIMARY KEY (`id`)
) ENGINE = INNODB DEFAULT CHARSET=utf8;