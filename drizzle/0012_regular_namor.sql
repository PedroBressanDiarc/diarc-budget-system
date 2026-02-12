CREATE TABLE `payments_made` (
	`id` int AUTO_INCREMENT NOT NULL,
	`supplierId` int,
	`requisitionId` int,
	`valor` decimal(12,2) NOT NULL,
	`dataPrevista` date NOT NULL,
	`dataPagamento` date,
	`comprovante` text,
	`observacoes` text,
	`status` enum('pendente','pago','atrasado') NOT NULL DEFAULT 'pendente',
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payments_made_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments_received` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`valor` decimal(12,2) NOT NULL,
	`parcela` int NOT NULL,
	`dataPrevista` date NOT NULL,
	`dataRecebimento` date,
	`comprovante` text,
	`observacoes` text,
	`status` enum('pendente','recebido','atrasado') NOT NULL DEFAULT 'pendente',
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payments_received_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('storekeeper','buyer','director','manutencao','financeiro') NOT NULL DEFAULT 'buyer';