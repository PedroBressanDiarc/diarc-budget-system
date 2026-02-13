-- Versão 1: Adicionar campos de cliente diretamente na tabela budgets
ALTER TABLE `budgets` ADD COLUMN `clientName` VARCHAR(255) NOT NULL DEFAULT '';
ALTER TABLE `budgets` ADD COLUMN `clientCnpj` VARCHAR(18);
ALTER TABLE `budgets` ADD COLUMN `clientEmail` VARCHAR(320);
ALTER TABLE `budgets` ADD COLUMN `clientPhone` VARCHAR(20);
ALTER TABLE `budgets` ADD COLUMN `clientAddress` TEXT;

-- Adicionar campos de preço nos itens do orçamento
ALTER TABLE `budget_items` ADD COLUMN `unitPrice` DECIMAL(12, 2) NOT NULL DEFAULT 0;
ALTER TABLE `budget_items` ADD COLUMN `totalPrice` DECIMAL(12, 2) NOT NULL DEFAULT 0;

-- Adicionar campo de validade do orçamento
ALTER TABLE `budgets` ADD COLUMN `validUntil` VARCHAR(10);

-- Adicionar campo de observações gerais
ALTER TABLE `budgets` ADD COLUMN `observations` TEXT;
