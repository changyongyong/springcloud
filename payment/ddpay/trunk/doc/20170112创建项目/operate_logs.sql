
CREATE TABLE
IF NOT EXISTS `operate_logs`(
	`id` INTEGER NOT NULL auto_increment ,
	`operate` VARCHAR(255) ,
	`params` TEXT ,
	`orderType` VARCHAR(400) ,
	`orderId` VARCHAR(200) ,
	`status` INTEGER ,
	`operator` VARCHAR(100) ,
	`operateLogNo` VARCHAR(100) ,
	`messageId` VARCHAR(100) ,
	`error` TEXT ,
	`createdAt` DATETIME NOT NULL ,
	`updatedAt` DATETIME NOT NULL ,
	PRIMARY KEY(`id`)
) ENGINE = INNODB DEFAULT CHARSET=utf8;


ALTER TABLE `operate_logs` ADD UNIQUE INDEX `messageId` (`messageId`, `operate`);
ALTER TABLE `operate_logs` ADD INDEX `operate_orderId` (`operate`, `orderId`);