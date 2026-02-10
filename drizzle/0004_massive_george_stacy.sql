CREATE TABLE `requisition_attachments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`requisitionId` int NOT NULL,
	`fileType` enum('cotacao','ordem_compra','adicional') NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileUrl` text NOT NULL,
	`fileSize` int,
	`mimeType` varchar(100),
	`uploadedBy` int NOT NULL,
	`uploadedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `requisition_attachments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `purchase_requisitions` MODIFY COLUMN `status` enum('solicitacao','cotacao_em_progresso','cotacoes_em_analise','aguardando_autorizacao','ordem_compra_enviada','aguardando_recebimento','recebido','cancelado') NOT NULL DEFAULT 'solicitacao';--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('storekeeper','buyer','director') NOT NULL DEFAULT 'buyer';--> statement-breakpoint
ALTER TABLE `purchase_requisitions` ADD `changeRequested` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `purchase_requisitions` ADD `changeRequestReason` text;--> statement-breakpoint
ALTER TABLE `purchase_requisitions` ADD `changeRequestedAt` timestamp;--> statement-breakpoint
ALTER TABLE `purchase_requisitions` ADD `changeApprovedBy` int;