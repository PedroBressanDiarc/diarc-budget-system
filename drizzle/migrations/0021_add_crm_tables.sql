-- Criar tabelas do CRM

-- Tabela de Leads
CREATE TABLE `leads` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `company` VARCHAR(255),
  `email` VARCHAR(320),
  `phone` VARCHAR(20),
  `source` VARCHAR(100),
  `status` ENUM('novo', 'contatado', 'qualificado', 'proposta_enviada', 'negociacao', 'ganho', 'perdido') NOT NULL DEFAULT 'novo',
  `score` INT DEFAULT 0,
  `assignedTo` INT,
  `notes` TEXT,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `createdBy` INT NOT NULL
);

-- Tabela de Oportunidades
CREATE TABLE `opportunities` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `clientId` INT,
  `leadId` INT,
  `value` DECIMAL(15, 2),
  `stage` ENUM('prospeccao', 'qualificacao', 'proposta', 'negociacao', 'fechamento', 'ganho', 'perdido') NOT NULL DEFAULT 'prospeccao',
  `probability` INT DEFAULT 0,
  `expectedCloseDate` DATE,
  `actualCloseDate` DATE,
  `assignedTo` INT NOT NULL,
  `description` TEXT,
  `lostReason` TEXT,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `createdBy` INT NOT NULL
);

-- Tabela de Interações
CREATE TABLE `interactions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `type` ENUM('ligacao', 'email', 'reuniao', 'whatsapp', 'visita', 'outro') NOT NULL,
  `subject` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `clientId` INT,
  `leadId` INT,
  `opportunityId` INT,
  `interactionDate` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `duration` INT,
  `outcome` VARCHAR(100),
  `nextSteps` TEXT,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdBy` INT NOT NULL
);

-- Tabela de Tarefas CRM
CREATE TABLE `crm_tasks` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `type` ENUM('ligacao', 'email', 'reuniao', 'follow_up', 'outro') NOT NULL,
  `priority` ENUM('baixa', 'media', 'alta', 'urgente') NOT NULL DEFAULT 'media',
  `status` ENUM('pendente', 'em_andamento', 'concluida', 'cancelada') NOT NULL DEFAULT 'pendente',
  `dueDate` TIMESTAMP,
  `completedAt` TIMESTAMP,
  `clientId` INT,
  `leadId` INT,
  `opportunityId` INT,
  `assignedTo` INT NOT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `createdBy` INT NOT NULL
);

-- Tabela de Estágios do Pipeline
CREATE TABLE `pipeline_stages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `order` INT NOT NULL,
  `probability` INT DEFAULT 0,
  `color` VARCHAR(7),
  `active` BOOLEAN NOT NULL DEFAULT TRUE,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdBy` INT NOT NULL
);

-- Inserir estágios padrão do pipeline
INSERT INTO `pipeline_stages` (`name`, `order`, `probability`, `color`, `createdBy`) VALUES
('Prospecção', 1, 10, '#6B7280', 1),
('Qualificação', 2, 25, '#3B82F6', 1),
('Proposta', 3, 50, '#F59E0B', 1),
('Negociação', 4, 75, '#10B981', 1),
('Fechamento', 5, 90, '#8B5CF6', 1);
