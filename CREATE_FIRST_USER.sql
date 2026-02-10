-- ============================================
-- CRIAR PRIMEIRO USUÁRIO ADMINISTRADOR
-- ============================================
--
-- INSTRUÇÕES:
-- 1. Execute este script no banco de dados via Management UI > Database
-- 2. Após criar o usuário, você poderá fazer login em /login
-- 3. Use este usuário para criar outros usuários via interface
--
-- IMPORTANTE: Troque os valores abaixo antes de executar!
-- ============================================

-- Exemplo: Criar usuário admin
-- Email: admin@diarc.com.br
-- Senha: Admin@123 (hash gerado com bcrypt)
-- Nome: Administrador Diarc
-- Role: director (diretor tem acesso total)

INSERT INTO users (
  email,
  passwordHash,
  name,
  role,
  isActive,
  loginMethod,
  username
) VALUES (
  'admin@diarc.com.br',
  -- Hash bcrypt da senha 'Admin@123'
  -- IMPORTANTE: Este é apenas um exemplo! Gere um novo hash para sua senha!
  '$2b$10$Qolem5WnYVCRkeFctArtFuSPrw6vh7qNQzwI41xEOgE20MHOaTTkC',
  'Administrador Diarc',
  'director',
  1,
  'local',
  'admin'
);

-- ============================================
-- COMO GERAR UM NOVO HASH DE SENHA
-- ============================================
--
-- Opção 1: Usar o sistema (RECOMENDADO)
-- 1. Execute o script acima com uma senha temporária
-- 2. Faça login no sistema
-- 3. Vá em Usuários > Resetar Senha
-- 4. Defina a senha definitiva
--
-- Opção 2: Gerar hash manualmente (Node.js)
-- Execute no terminal do servidor:
-- 
-- node -e "const bcrypt = require('bcrypt'); bcrypt.hash('SuaSenhaAqui', 10, (err, hash) => console.log(hash));"
--
-- Copie o hash gerado e substitua no INSERT acima
-- ============================================

-- Verificar se o usuário foi criado
SELECT id, email, name, role, isActive FROM users WHERE email = 'admin@diarc.com.br';
