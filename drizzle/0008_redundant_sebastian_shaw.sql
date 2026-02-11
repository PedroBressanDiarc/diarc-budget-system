CREATE TABLE `items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`secondaryName` varchar(255),
	`defaultUnit` varchar(50) NOT NULL,
	`ncm` varchar(20),
	`ncmDefinition` text,
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdBy` int NOT NULL,
	CONSTRAINT `items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`startDate` date,
	`endDate` date,
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdBy` int NOT NULL,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
