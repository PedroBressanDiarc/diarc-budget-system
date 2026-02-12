-- Criar tabela de chats (conversas)
CREATE TABLE IF NOT EXISTS `chats` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `name` varchar(255), -- Nome do grupo (NULL para chat privado)
  `isGroup` boolean NOT NULL DEFAULT false, -- true = grupo, false = privado
  `createdBy` int NOT NULL, -- Criador do chat/grupo
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Criar tabela de participantes do chat
CREATE TABLE IF NOT EXISTS `chat_participants` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `chatId` int NOT NULL, -- ID do chat
  `userId` int NOT NULL, -- ID do usuário participante
  `joinedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `lastRead` timestamp, -- Última vez que leu mensagens
  UNIQUE KEY `unique_chat_user` (`chatId`, `userId`)
);

-- Criar tabela de mensagens
CREATE TABLE IF NOT EXISTS `messages` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `chatId` int NOT NULL, -- ID do chat
  `senderId` int NOT NULL, -- ID do usuário que enviou
  `content` text NOT NULL, -- Conteúdo da mensagem
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices para melhor performance
CREATE INDEX `idx_chat_participants_chatId` ON `chat_participants` (`chatId`);
CREATE INDEX `idx_chat_participants_userId` ON `chat_participants` (`userId`);
CREATE INDEX `idx_messages_chatId` ON `messages` (`chatId`);
CREATE INDEX `idx_messages_createdAt` ON `messages` (`createdAt`);
