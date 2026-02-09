CREATE TABLE `budget_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`budgetId` int NOT NULL,
	`itemName` varchar(255) NOT NULL,
	`quantity` decimal(10,2) NOT NULL,
	`unit` varchar(50),
	`brand` varchar(255),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `budget_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `budget_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `budget_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `budgets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`budgetNumber` varchar(50) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`templateId` int,
	`status` enum('draft','sent','approved','rejected') NOT NULL DEFAULT 'draft',
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `budgets_id` PRIMARY KEY(`id`),
	CONSTRAINT `budgets_budgetNumber_unique` UNIQUE(`budgetNumber`)
);
--> statement-breakpoint
CREATE TABLE `company_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyName` varchar(255) NOT NULL,
	`cnpj` varchar(18),
	`address` text,
	`phone` varchar(20),
	`email` varchar(320),
	`logoUrl` text,
	`updatedBy` int NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `company_settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `equipment` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`code` varchar(50),
	`type` varchar(100),
	`manufacturer` varchar(255),
	`model` varchar(255),
	`serialNumber` varchar(255),
	`location` varchar(255),
	`purchaseDate` date,
	`warrantyExpiry` date,
	`status` enum('active','maintenance','inactive','retired') NOT NULL DEFAULT 'active',
	`notes` text,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `equipment_id` PRIMARY KEY(`id`),
	CONSTRAINT `equipment_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `maintenance_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`equipmentId` int NOT NULL,
	`scheduleId` int,
	`maintenanceType` enum('preventive','corrective') NOT NULL,
	`performedDate` date NOT NULL,
	`description` text,
	`technician` varchar(255),
	`cost` decimal(12,2),
	`partsReplaced` text,
	`notes` text,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `maintenance_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `maintenance_schedules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`equipmentId` int NOT NULL,
	`maintenanceType` enum('preventive','corrective') NOT NULL,
	`scheduledDate` date NOT NULL,
	`description` text,
	`status` enum('scheduled','completed','cancelled') NOT NULL DEFAULT 'scheduled',
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `maintenance_schedules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `purchase_orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderNumber` varchar(50) NOT NULL,
	`requisitionId` int NOT NULL,
	`quoteId` int NOT NULL,
	`supplierId` int NOT NULL,
	`totalAmount` decimal(12,2) NOT NULL,
	`status` enum('pending','confirmed','received','cancelled') NOT NULL DEFAULT 'pending',
	`orderDate` date NOT NULL,
	`expectedDelivery` date,
	`actualDelivery` date,
	`notes` text,
	`createdBy` int NOT NULL,
	`receivedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `purchase_orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `purchase_orders_orderNumber_unique` UNIQUE(`orderNumber`)
);
--> statement-breakpoint
CREATE TABLE `purchase_requisitions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`requisitionNumber` varchar(50) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`status` enum('draft','pending_quotes','comparing','approved','ordered','received','cancelled') NOT NULL DEFAULT 'draft',
	`requestedBy` int NOT NULL,
	`approvedBy` int,
	`approvedAt` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `purchase_requisitions_id` PRIMARY KEY(`id`),
	CONSTRAINT `purchase_requisitions_requisitionNumber_unique` UNIQUE(`requisitionNumber`)
);
--> statement-breakpoint
CREATE TABLE `quote_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`quoteId` int NOT NULL,
	`requisitionItemId` int NOT NULL,
	`unitPrice` decimal(12,2) NOT NULL,
	`quantity` decimal(10,2) NOT NULL,
	`totalPrice` decimal(12,2) NOT NULL,
	`brand` varchar(255),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quote_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quotes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`requisitionId` int NOT NULL,
	`supplierId` int NOT NULL,
	`quoteNumber` varchar(50),
	`totalAmount` decimal(12,2),
	`deliveryTime` int,
	`paymentTerms` text,
	`notes` text,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `quotes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `requisition_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`requisitionId` int NOT NULL,
	`itemName` varchar(255) NOT NULL,
	`quantity` decimal(10,2) NOT NULL,
	`unit` varchar(50),
	`brand` varchar(255),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `requisition_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `suppliers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`cnpj` varchar(18),
	`contact` varchar(255),
	`phone` varchar(20),
	`email` varchar(320),
	`address` text,
	`notes` text,
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdBy` int NOT NULL,
	CONSTRAINT `suppliers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('buyer','director') NOT NULL DEFAULT 'buyer';