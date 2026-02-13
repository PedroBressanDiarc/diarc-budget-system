CREATE TABLE `clients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`cnpj` varchar(18),
	`email` varchar(320),
	`phone` varchar(20),
	`address` text,
	`notes` text,
	`active` boolean NOT NULL DEFAULT true,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('diretor','comprador','almoxarife','manutencao','financeiro') NOT NULL DEFAULT 'comprador';--> statement-breakpoint
ALTER TABLE `budget_items` ADD `unitPrice` decimal(12,2) NOT NULL;--> statement-breakpoint
ALTER TABLE `budget_items` ADD `totalPrice` decimal(12,2) NOT NULL;--> statement-breakpoint
ALTER TABLE `budgets` ADD `clientId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `budgets` ADD `validUntil` varchar(10);--> statement-breakpoint
ALTER TABLE `budgets` ADD `observations` text;