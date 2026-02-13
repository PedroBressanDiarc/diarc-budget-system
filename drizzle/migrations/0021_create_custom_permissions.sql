-- Criar tabela de roles customizados
CREATE TABLE `custom_roles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `displayName` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `color` VARCHAR(50) DEFAULT 'blue',
  `isSystem` BOOLEAN DEFAULT FALSE NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  `createdBy` INT NOT NULL
);

-- Criar tabela de permissões por role
CREATE TABLE `role_permissions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `roleId` INT NOT NULL,
  `module` VARCHAR(100) NOT NULL,
  `submodule` VARCHAR(100),
  `permission` ENUM('total', 'readonly', 'none') DEFAULT 'none' NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (`roleId`) REFERENCES `custom_roles`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_role_module` (`roleId`, `module`, `submodule`)
);

-- Inserir roles do sistema (níveis atuais como customizáveis)
INSERT INTO `custom_roles` (`name`, `displayName`, `description`, `color`, `isSystem`, `createdBy`) VALUES
('diretor', 'Diretor', 'Acesso total ao sistema', 'blue', TRUE, 1),
('comprador', 'Comprador', 'Gerencia compras e cotações', 'green', TRUE, 1),
('almoxarife', 'Almoxarife', 'Gerencia requisições e estoque', 'orange', TRUE, 1),
('manutencao', 'Manutenção', 'Gerencia manutenções e equipamentos', 'purple', TRUE, 1),
('financeiro', 'Financeiro', 'Gerencia pagamentos e recebimentos', 'yellow', TRUE, 1);

-- Inserir permissões padrão do Diretor (acesso total a tudo)
INSERT INTO `role_permissions` (`roleId`, `module`, `submodule`, `permission`) VALUES
-- Dashboard
((SELECT id FROM custom_roles WHERE name = 'diretor'), 'dashboard', NULL, 'total'),
-- Chat
((SELECT id FROM custom_roles WHERE name = 'diretor'), 'chat', NULL, 'total'),
-- Orçamentos
((SELECT id FROM custom_roles WHERE name = 'diretor'), 'orcamentos', NULL, 'total'),
-- Compras
((SELECT id FROM custom_roles WHERE name = 'diretor'), 'compras', 'manutencao', 'total'),
((SELECT id FROM custom_roles WHERE name = 'diretor'), 'compras', 'administrativo', 'total'),
((SELECT id FROM custom_roles WHERE name = 'diretor'), 'compras', 'fabrica', 'total'),
((SELECT id FROM custom_roles WHERE name = 'diretor'), 'compras', 'obras', 'total'),
-- Manutenções
((SELECT id FROM custom_roles WHERE name = 'diretor'), 'manutencoes', NULL, 'total'),
-- Financeiro
((SELECT id FROM custom_roles WHERE name = 'diretor'), 'financeiro', 'recebimentos', 'total'),
((SELECT id FROM custom_roles WHERE name = 'diretor'), 'financeiro', 'pagamentos', 'total'),
-- Relatórios
((SELECT id FROM custom_roles WHERE name = 'diretor'), 'relatorios', NULL, 'total'),
-- Banco de Dados
((SELECT id FROM custom_roles WHERE name = 'diretor'), 'banco_dados', 'fornecedores', 'total'),
((SELECT id FROM custom_roles WHERE name = 'diretor'), 'banco_dados', 'equipamentos', 'total'),
((SELECT id FROM custom_roles WHERE name = 'diretor'), 'banco_dados', 'itens', 'total'),
((SELECT id FROM custom_roles WHERE name = 'diretor'), 'banco_dados', 'obras', 'total'),
((SELECT id FROM custom_roles WHERE name = 'diretor'), 'banco_dados', 'locais', 'total');

-- Inserir permissões do Comprador
INSERT INTO `role_permissions` (`roleId`, `module`, `submodule`, `permission`) VALUES
((SELECT id FROM custom_roles WHERE name = 'comprador'), 'dashboard', NULL, 'total'),
((SELECT id FROM custom_roles WHERE name = 'comprador'), 'chat', NULL, 'total'),
((SELECT id FROM custom_roles WHERE name = 'comprador'), 'orcamentos', NULL, 'none'),
((SELECT id FROM custom_roles WHERE name = 'comprador'), 'compras', 'manutencao', 'total'),
((SELECT id FROM custom_roles WHERE name = 'comprador'), 'compras', 'administrativo', 'total'),
((SELECT id FROM custom_roles WHERE name = 'comprador'), 'compras', 'fabrica', 'total'),
((SELECT id FROM custom_roles WHERE name = 'comprador'), 'compras', 'obras', 'total'),
((SELECT id FROM custom_roles WHERE name = 'comprador'), 'manutencoes', NULL, 'readonly'),
((SELECT id FROM custom_roles WHERE name = 'comprador'), 'financeiro', 'recebimentos', 'none'),
((SELECT id FROM custom_roles WHERE name = 'comprador'), 'financeiro', 'pagamentos', 'none'),
((SELECT id FROM custom_roles WHERE name = 'comprador'), 'relatorios', NULL, 'readonly'),
((SELECT id FROM custom_roles WHERE name = 'comprador'), 'banco_dados', 'fornecedores', 'total'),
((SELECT id FROM custom_roles WHERE name = 'comprador'), 'banco_dados', 'equipamentos', 'total'),
((SELECT id FROM custom_roles WHERE name = 'comprador'), 'banco_dados', 'itens', 'total'),
((SELECT id FROM custom_roles WHERE name = 'comprador'), 'banco_dados', 'obras', 'total'),
((SELECT id FROM custom_roles WHERE name = 'comprador'), 'banco_dados', 'locais', 'readonly');

-- Inserir permissões do Almoxarife
INSERT INTO `role_permissions` (`roleId`, `module`, `submodule`, `permission`) VALUES
((SELECT id FROM custom_roles WHERE name = 'almoxarife'), 'dashboard', NULL, 'total'),
((SELECT id FROM custom_roles WHERE name = 'almoxarife'), 'chat', NULL, 'total'),
((SELECT id FROM custom_roles WHERE name = 'almoxarife'), 'orcamentos', NULL, 'none'),
((SELECT id FROM custom_roles WHERE name = 'almoxarife'), 'compras', 'manutencao', 'total'),
((SELECT id FROM custom_roles WHERE name = 'almoxarife'), 'compras', 'administrativo', 'total'),
((SELECT id FROM custom_roles WHERE name = 'almoxarife'), 'compras', 'fabrica', 'total'),
((SELECT id FROM custom_roles WHERE name = 'almoxarife'), 'compras', 'obras', 'total'),
((SELECT id FROM custom_roles WHERE name = 'almoxarife'), 'manutencoes', NULL, 'readonly'),
((SELECT id FROM custom_roles WHERE name = 'almoxarife'), 'financeiro', 'recebimentos', 'none'),
((SELECT id FROM custom_roles WHERE name = 'almoxarife'), 'financeiro', 'pagamentos', 'none'),
((SELECT id FROM custom_roles WHERE name = 'almoxarife'), 'relatorios', NULL, 'readonly'),
((SELECT id FROM custom_roles WHERE name = 'almoxarife'), 'banco_dados', 'fornecedores', 'readonly'),
((SELECT id FROM custom_roles WHERE name = 'almoxarife'), 'banco_dados', 'equipamentos', 'readonly'),
((SELECT id FROM custom_roles WHERE name = 'almoxarife'), 'banco_dados', 'itens', 'readonly'),
((SELECT id FROM custom_roles WHERE name = 'almoxarife'), 'banco_dados', 'obras', 'readonly'),
((SELECT id FROM custom_roles WHERE name = 'almoxarife'), 'banco_dados', 'locais', 'readonly');

-- Inserir permissões da Manutenção
INSERT INTO `role_permissions` (`roleId`, `module`, `submodule`, `permission`) VALUES
((SELECT id FROM custom_roles WHERE name = 'manutencao'), 'dashboard', NULL, 'total'),
((SELECT id FROM custom_roles WHERE name = 'manutencao'), 'chat', NULL, 'total'),
((SELECT id FROM custom_roles WHERE name = 'manutencao'), 'orcamentos', NULL, 'none'),
((SELECT id FROM custom_roles WHERE name = 'manutencao'), 'compras', 'manutencao', 'readonly'),
((SELECT id FROM custom_roles WHERE name = 'manutencao'), 'compras', 'administrativo', 'none'),
((SELECT id FROM custom_roles WHERE name = 'manutencao'), 'compras', 'fabrica', 'none'),
((SELECT id FROM custom_roles WHERE name = 'manutencao'), 'compras', 'obras', 'none'),
((SELECT id FROM custom_roles WHERE name = 'manutencao'), 'manutencoes', NULL, 'total'),
((SELECT id FROM custom_roles WHERE name = 'manutencao'), 'financeiro', 'recebimentos', 'none'),
((SELECT id FROM custom_roles WHERE name = 'manutencao'), 'financeiro', 'pagamentos', 'none'),
((SELECT id FROM custom_roles WHERE name = 'manutencao'), 'relatorios', NULL, 'readonly'),
((SELECT id FROM custom_roles WHERE name = 'manutencao'), 'banco_dados', 'fornecedores', 'readonly'),
((SELECT id FROM custom_roles WHERE name = 'manutencao'), 'banco_dados', 'equipamentos', 'total'),
((SELECT id FROM custom_roles WHERE name = 'manutencao'), 'banco_dados', 'itens', 'readonly'),
((SELECT id FROM custom_roles WHERE name = 'manutencao'), 'banco_dados', 'obras', 'readonly'),
((SELECT id FROM custom_roles WHERE name = 'manutencao'), 'banco_dados', 'locais', 'total');

-- Inserir permissões do Financeiro
INSERT INTO `role_permissions` (`roleId`, `module`, `submodule`, `permission`) VALUES
((SELECT id FROM custom_roles WHERE name = 'financeiro'), 'dashboard', NULL, 'total'),
((SELECT id FROM custom_roles WHERE name = 'financeiro'), 'chat', NULL, 'total'),
((SELECT id FROM custom_roles WHERE name = 'financeiro'), 'orcamentos', NULL, 'readonly'),
((SELECT id FROM custom_roles WHERE name = 'financeiro'), 'compras', 'manutencao', 'readonly'),
((SELECT id FROM custom_roles WHERE name = 'financeiro'), 'compras', 'administrativo', 'readonly'),
((SELECT id FROM custom_roles WHERE name = 'financeiro'), 'compras', 'fabrica', 'readonly'),
((SELECT id FROM custom_roles WHERE name = 'financeiro'), 'compras', 'obras', 'readonly'),
((SELECT id FROM custom_roles WHERE name = 'financeiro'), 'manutencoes', NULL, 'readonly'),
((SELECT id FROM custom_roles WHERE name = 'financeiro'), 'financeiro', 'recebimentos', 'total'),
((SELECT id FROM custom_roles WHERE name = 'financeiro'), 'financeiro', 'pagamentos', 'total'),
((SELECT id FROM custom_roles WHERE name = 'financeiro'), 'relatorios', NULL, 'total'),
((SELECT id FROM custom_roles WHERE name = 'financeiro'), 'banco_dados', 'fornecedores', 'readonly'),
((SELECT id FROM custom_roles WHERE name = 'financeiro'), 'banco_dados', 'equipamentos', 'readonly'),
((SELECT id FROM custom_roles WHERE name = 'financeiro'), 'banco_dados', 'itens', 'readonly'),
((SELECT id FROM custom_roles WHERE name = 'financeiro'), 'banco_dados', 'obras', 'readonly'),
((SELECT id FROM custom_roles WHERE name = 'financeiro'), 'banco_dados', 'locais', 'readonly');
