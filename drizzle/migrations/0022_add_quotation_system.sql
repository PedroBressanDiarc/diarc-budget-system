-- Tabela de tokens de cotação
CREATE TABLE IF NOT EXISTS `quotation_tokens` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `token` varchar(64) NOT NULL UNIQUE,
  `requisitionId` int NOT NULL,
  `supplierId` int NOT NULL,
  `emailSent` boolean DEFAULT false NOT NULL,
  `emailSentAt` timestamp NULL,
  `accessed` boolean DEFAULT false NOT NULL,
  `accessedAt` timestamp NULL,
  `submitted` boolean DEFAULT false NOT NULL,
  `submittedAt` timestamp NULL,
  `expiresAt` timestamp NOT NULL,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `createdBy` int NOT NULL,
  FOREIGN KEY (`requisitionId`) REFERENCES `requisitions`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`supplierId`) REFERENCES `suppliers`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`)
);

-- Tabela de fornecedores selecionados para cotação
CREATE TABLE IF NOT EXISTS `requisition_suppliers` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `requisitionId` int NOT NULL,
  `supplierId` int NOT NULL,
  `invited` boolean DEFAULT true NOT NULL,
  `invitedAt` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `responded` boolean DEFAULT false NOT NULL,
  `respondedAt` timestamp NULL,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `createdBy` int NOT NULL,
  FOREIGN KEY (`requisitionId`) REFERENCES `requisitions`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`supplierId`) REFERENCES `suppliers`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`),
  UNIQUE KEY `requisition_supplier_unique` (`requisitionId`, `supplierId`)
);

-- Índices para performance
CREATE INDEX `idx_quotation_tokens_token` ON `quotation_tokens`(`token`);
CREATE INDEX `idx_quotation_tokens_requisition` ON `quotation_tokens`(`requisitionId`);
CREATE INDEX `idx_quotation_tokens_supplier` ON `quotation_tokens`(`supplierId`);
CREATE INDEX `idx_requisition_suppliers_requisition` ON `requisition_suppliers`(`requisitionId`);
CREATE INDEX `idx_requisition_suppliers_supplier` ON `requisition_suppliers`(`supplierId`);
