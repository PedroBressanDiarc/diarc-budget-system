-- Adicionar role 'manutencao' ao enum de roles
ALTER TABLE `users` MODIFY COLUMN `role` enum('storekeeper','buyer','director','manutencao') NOT NULL DEFAULT 'buyer';
