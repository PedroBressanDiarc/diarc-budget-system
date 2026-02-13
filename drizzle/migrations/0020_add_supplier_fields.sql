-- Adicionar novos campos aos fornecedores
ALTER TABLE `suppliers` ADD COLUMN `website` VARCHAR(255);
ALTER TABLE `suppliers` ADD COLUMN `paymentTerms` TEXT;
ALTER TABLE `suppliers` ADD COLUMN `deliveryTime` VARCHAR(100);
ALTER TABLE `suppliers` ADD COLUMN `category` VARCHAR(100);
ALTER TABLE `suppliers` ADD COLUMN `rating` INT;
