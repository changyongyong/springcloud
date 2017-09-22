CREATE TABLE
IF NOT EXISTS `mq_send_messages` (
	`id` INTEGER NOT NULL auto_increment,
	`type` VARCHAR (255),
	`content` TEXT,
	`options` TEXT,
	`timestamp` VARCHAR (255),
	`createdAt` DATETIME NOT NULL,
	`updatedAt` DATETIME NOT NULL,
	PRIMARY KEY (`id`)
) ENGINE = INNODB DEFAULT CHARSET=utf8;