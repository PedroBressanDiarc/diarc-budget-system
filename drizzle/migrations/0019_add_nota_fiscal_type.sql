-- Adicionar tipo "nota_fiscal" aos anexos de requisição
ALTER TABLE `requisition_attachments` 
MODIFY COLUMN `fileType` ENUM('cotacao', 'ordem_compra', 'nota_fiscal', 'adicional') NOT NULL;
