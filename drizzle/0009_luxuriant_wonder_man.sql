CREATE TABLE `savings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`requisitionId` int NOT NULL,
	`requisitionItemId` int NOT NULL,
	`quoteId` int NOT NULL,
	`maxPrice` decimal(12,2) NOT NULL,
	`actualPrice` decimal(12,2) NOT NULL,
	`savedAmount` decimal(12,2) NOT NULL,
	`savedBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `savings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `requisition_items` ADD `maxPrice` decimal(12,2);