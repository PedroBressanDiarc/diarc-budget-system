-- Adicionar campos de estoque na tabela items
ALTER TABLE `items` ADD COLUMN `quantity` decimal(10,2) NOT NULL DEFAULT '0';
ALTER TABLE `items` ADD COLUMN `unitPrice` decimal(10,2);
ALTER TABLE `items` ADD COLUMN `totalValue` decimal(10,2);
ALTER TABLE `items` ADD COLUMN `category` varchar(100);
ALTER TABLE `items` ADD COLUMN `brand` varchar(255);
ALTER TABLE `items` ADD COLUMN `supplier` varchar(255);
ALTER TABLE `items` ADD COLUMN `location` varchar(255);
ALTER TABLE `items` ADD COLUMN `minStock` decimal(10,2);
ALTER TABLE `items` ADD COLUMN `maxStock` decimal(10,2);
ALTER TABLE `items` ADD COLUMN `notes` text;
