ALTER TABLE `equipment` MODIFY COLUMN `purchaseDate` varchar(10);--> statement-breakpoint
ALTER TABLE `equipment` MODIFY COLUMN `warrantyExpiry` varchar(10);--> statement-breakpoint
ALTER TABLE `maintenance_records` MODIFY COLUMN `performedDate` varchar(10) NOT NULL;--> statement-breakpoint
ALTER TABLE `maintenance_schedules` MODIFY COLUMN `scheduledDate` varchar(10) NOT NULL;--> statement-breakpoint
ALTER TABLE `purchase_orders` MODIFY COLUMN `orderDate` varchar(10) NOT NULL;--> statement-breakpoint
ALTER TABLE `purchase_orders` MODIFY COLUMN `expectedDelivery` varchar(10);--> statement-breakpoint
ALTER TABLE `purchase_orders` MODIFY COLUMN `actualDelivery` varchar(10);