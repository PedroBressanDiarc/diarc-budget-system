-- Versão 2: Criar tabela separada de clientes
CREATE TABLE `clients` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `cnpj` VARCHAR(18),
  `email` VARCHAR(320),
  `phone` VARCHAR(20),
  `address` TEXT,
  `notes` TEXT,
  `active` BOOLEAN NOT NULL DEFAULT TRUE,
  `createdBy` INT NOT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Adicionar campo clientId na tabela budgets
ALTER TABLE `budgets` ADD COLUMN `clientId` INT;

-- Adicionar campos de preço nos itens do orçamento
ALTER TABLE `budget_items` ADD COLUMN `unitPrice` DECIMAL(12, 2) NOT NULL DEFAULT 0;
ALTER TABLE `budget_items` ADD COLUMN `totalPrice` DECIMAL(12, 2) NOT NULL DEFAULT 0;

-- Adicionar campo de validade do orçamento
ALTER TABLE `budgets` ADD COLUMN `validUntil` VARCHAR(10);

-- Adicionar campo de observações gerais
ALTER TABLE `budgets` ADD COLUMN `observations` TEXT;
