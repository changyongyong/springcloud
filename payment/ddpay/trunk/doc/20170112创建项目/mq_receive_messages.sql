CREATE TABLE
IF NOT EXISTS `mq_receive_messages` (
	`id` INTEGER NOT NULL auto_increment,
	`messageId` VARCHAR (255),
	`state` INTEGER,
	`type` VARCHAR (255),
	`content` TEXT,
	`error` TEXT,
	`timestamp` VARCHAR (255),
	`createdAt` DATETIME NOT NULL,
	`updatedAt` DATETIME NOT NULL,
	PRIMARY KEY (`id`)
) ENGINE = INNODB DEFAULT CHARSET=utf8;


ALTER TABLE `mq_receive_messages` ADD UNIQUE INDEX `messageId` (`messageId`);