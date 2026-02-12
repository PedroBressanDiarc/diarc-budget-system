-- Tabela de menções em mensagens do chat
CREATE TABLE `message_mentions` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `messageId` int NOT NULL,
  `mentionedUserId` int NOT NULL,
  `isRead` boolean DEFAULT false NOT NULL,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Adicionar campo para armazenar menções e referências parseadas
ALTER TABLE `messages` ADD COLUMN `mentions` text;
ALTER TABLE `messages` ADD COLUMN `references` text;
