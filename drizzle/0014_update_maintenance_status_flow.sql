-- Atualizar enum de status de manutenção
ALTER TABLE `maintenance_schedules` 
MODIFY COLUMN `status` ENUM('scheduled', 'approved', 'in_progress', 'sent_to_purchase', 'completed', 'cancelled') NOT NULL DEFAULT 'scheduled';

-- Adicionar campo para vincular com requisição de compra
ALTER TABLE `maintenance_schedules` 
ADD COLUMN `purchaseRequisitionId` INT NULL AFTER `status`;
