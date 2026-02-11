CREATE TABLE `budget_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`requisitionId` int NOT NULL,
	`requisitionItemId` int NOT NULL,
	`quoteId` int NOT NULL,
	`maxPrice` decimal(12,2) NOT NULL,
	`quotedPrice` decimal(12,2) NOT NULL,
	`excessAmount` decimal(12,2) NOT NULL,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`createdBy` int NOT NULL,
	`reviewedBy` int,
	`reviewedAt` timestamp,
	`reviewNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `budget_alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `items` ADD `quantity` decimal(10,2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE `items` ADD `unitPrice` decimal(10,2);--> statement-breakpoint
ALTER TABLE `items` ADD `totalValue` decimal(10,2);--> statement-breakpoint
ALTER TABLE `items` ADD `category` varchar(100);--> statement-breakpoint
ALTER TABLE `items` ADD `brand` varchar(255);--> statement-breakpoint
ALTER TABLE `items` ADD `location` varchar(255);--> statement-breakpoint
ALTER TABLE `items` ADD `minStock` decimal(10,2);--> statement-breakpoint
ALTER TABLE `items` ADD `maxStock` decimal(10,2);--> statement-breakpoint
ALTER TABLE `items` ADD `notes` text;--> statement-breakpoint
ALTER TABLE `purchase_requisitions` ADD `projectId` int;