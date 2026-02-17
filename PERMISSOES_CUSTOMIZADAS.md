# Sistema de Permissões Customizadas - Diarc Budget System

## 📋 Visão Geral

O sistema de permissões customizadas permite criar níveis de acesso personalizados para cada módulo do sistema, substituindo o modelo fixo de 5 roles (diretor, comprador, almoxarife, manutenção, financeiro).

## 🎯 O Que Foi Implementado

### 1. Estrutura de Banco de Dados

**Tabela `custom_roles`** - Armazena os níveis de permissão customizados:
- `id`: ID único do nível
- `name`: Nome interno (ex: "gerente_obra")
- `display_name`: Nome para exibição (ex: "Gerente de Obra")
- `description`: Descrição do nível
- `color`: Cor para UI (blue, green, orange, purple, gray)
- `is_system`: Se é nível do sistema (diretor, comprador, etc.) - não pode ser deletado
- `is_active`: Se o nível está ativo
- `created_at`, `updated_at`, `created_by`: Metadados

**Tabela `role_permissions`** - Armazena as permissões de cada nível:
- `id`: ID único
- `role_id`: FK para custom_roles
- `permissions`: JSON com permissões por módulo (ex: `{"compras": "total", "manutencoes": "readonly", "financeiro": "none"}`)
- `created_at`, `updated_at`: Metadados

**Campo `custom_role_id` na tabela `users`**:
- Vincula usuário a um nível de permissão customizado
- Se NULL, usa lógica antiga (baseada no campo `role`)

### 2. Middleware de Verificação de Permissões

**Arquivo:** `server/_core/permissionMiddleware.ts`

**Função principal:** `checkPermission(userId, customRoleId, moduleKey, requiredLevel)`
- Consulta `role_permissions` para verificar se usuário tem acesso ao módulo
- Suporta 3 níveis: `"total"` (leitura + escrita), `"readonly"` (apenas leitura), `"none"` (sem acesso)
- Se `customRoleId` for NULL, mantém compatibilidade com sistema antigo

**Procedures criados:**
- `manutencoesReadProcedure` / `manutencoesWriteProcedure`
- `financeiroReadProcedure` / `financeiroWriteProcedure`
- `bancoFornecedoresReadProcedure` / `bancoFornecedoresWriteProcedure`
- `bancoEquipamentosReadProcedure` / `bancoEquipamentosWriteProcedure`
- `bancoLocaisReadProcedure` / `bancoLocaisWriteProcedure`
- `bancoItensReadProcedure` / `bancoItensWriteProcedure`
- `bancoProjetosReadProcedure` / `bancoProjetosWriteProcedure`

### 3. Módulos Disponíveis

Os seguintes módulos podem ter permissões configuradas:

**Módulos principais:**
- `compras` - Módulo de Compras
- `autorizacoes` - Autorizações
- `estoque` - Estoque
- `orcamentos` - Orçamentos
- `manutencoes` - Manutenções
- `chat` - Chat
- `financeiro` - Financeiro
- `relatorios` - Relatórios
- `configuracoes` - Configurações
- `gestao` - Gestão (Usuários e Permissões)
- `banco_dados` - Banco de Dados

**Submódulos:**
- `compras_manutencao`, `compras_administrativo`, `compras_fabrica`, `compras_obras`
- `estoque_pecas`, `estoque_interno`
- `financeiro_recebimentos`, `financeiro_pagamentos`
- `relatorios_visao_geral`, `relatorios_economias`, `relatorios_obras`, `relatorios_alertas`, `relatorios_manutencoes`
- `gestao_usuarios`, `gestao_permissoes`
- `banco_fornecedores`, `banco_equipamentos`, `banco_locais`, `banco_itens`, `banco_projetos`

### 4. Endpoints Atualizados

**Módulo de Manutenções** (já aplicado):
- `maintenanceSchedules.create` → usa `manutencoesWriteProcedure`
- `maintenanceSchedules.update` → usa `manutencoesWriteProcedure`
- `maintenanceSchedules.updateStatus` → usa `manutencoesWriteProcedure`

**Endpoint de Usuários** (já aplicado):
- `users.update` → aceita campo `customRoleId` para atribuir nível customizado

## 🧪 Como Testar

### Passo 1: Criar um Nível de Permissão Customizado

1. Acesse **Gestão → Permissões**
2. Clique em **"Criar Novo Nível"**
3. Preencha:
   - Nome: `teste_limitado`
   - Nome de Exibição: `Teste Limitado`
   - Descrição: `Nível de teste com acesso limitado`
   - Cor: `gray`
4. Configure permissões:
   - **Manutenções**: Somente Leitura
   - **Financeiro**: Nenhum
   - **Banco de Dados → Fornecedores**: Nenhum
   - Demais módulos: Nenhum
5. Salve o nível

### Passo 2: Atribuir Nível a um Usuário

1. Acesse **Gestão → Usuários**
2. Edite um usuário de teste
3. No campo **Nível de Permissão Customizado**, selecione "Teste Limitado"
4. Salve

### Passo 3: Fazer Login com Usuário de Teste

1. Faça logout do usuário atual
2. Faça login com o usuário de teste
3. Tente acessar:
   - ✅ **Manutenções → Ver Detalhes**: Deve funcionar (readonly)
   - ❌ **Manutenções → Criar Nova**: Deve bloquear (sem permissão de escrita)
   - ❌ **Financeiro**: Deve bloquear completamente
   - ❌ **Banco de Dados → Fornecedores**: Deve bloquear completamente

### Passo 4: Validar Mensagens de Erro

Ao tentar acessar módulo sem permissão, deve aparecer:
- Erro 403 (FORBIDDEN)
- Mensagem: "Você não tem permissão para acessar/modificar este módulo"

## 🔄 Compatibilidade com Sistema Antigo

O sistema mantém **compatibilidade total** com o modelo antigo:

- Se usuário **não tem** `custom_role_id` (NULL), usa lógica antiga baseada em `role` (diretor, comprador, etc.)
- Se usuário **tem** `custom_role_id`, usa permissões customizadas da tabela `role_permissions`
- Procedures antigos (`buyerProcedure`, `maintenanceProcedure`, etc.) continuam funcionando normalmente

## 📝 Próximos Passos

### Aplicar Permissões Customizadas em Mais Endpoints

**Módulo de Compras:**
```typescript
// Substituir buyerProcedure por comprasWriteProcedure
suppliers: router({
  create: bancoFornecedoresWriteProcedure.input(...).mutation(...),
  update: bancoFornecedoresWriteProcedure.input(...).mutation(...),
  delete: bancoFornecedoresWriteProcedure.input(...).mutation(...),
})
```

**Módulo de Financeiro:**
```typescript
paymentsReceived: router({
  create: financeiroWriteProcedure.input(...).mutation(...),
  update: financeiroWriteProcedure.input(...).mutation(...),
  delete: financeiroWriteProcedure.input(...).mutation(...),
})
```

**Módulo de Banco de Dados:**
```typescript
equipment: router({
  create: bancoEquipamentosWriteProcedure.input(...).mutation(...),
  update: bancoEquipamentosWriteProcedure.input(...).mutation(...),
  delete: bancoEquipamentosWriteProcedure.input(...).mutation(...),
})

locations: router({
  create: bancoLocaisWriteProcedure.input(...).mutation(...),
  update: bancoLocaisWriteProcedure.input(...).mutation(...),
  delete: bancoLocaisWriteProcedure.input(...).mutation(...),
})
```

### Adicionar Seletor de Nível Customizado na Página de Usuários

**Arquivo:** `client/src/pages/Users.tsx`

1. Buscar lista de níveis customizados: `trpc.customRoles.list.useQuery()`
2. Adicionar dropdown no formulário de edição de usuário
3. Ao salvar, enviar `customRoleId` no `trpc.users.update.useMutation()`

### Ocultar Menus no Frontend Baseado em Permissões

**Arquivo:** `client/src/components/DashboardLayout.tsx`

1. Criar hook `usePermissions()` que consulta `trpc.customRoles.getUserPermissions.useQuery()`
2. Filtrar itens do menu baseado nas permissões do usuário
3. Ocultar botões de ação (Criar, Editar, Deletar) se usuário só tem `readonly`

## 🐛 Troubleshooting

**Erro: "manutencoesWriteProcedure is not defined"**
- Reinicie o servidor: `webdev_restart_server`
- Verifique se imports estão corretos em `server/routers.ts`

**Erro: "Unknown column 'custom_role_id'"**
- Execute migração SQL: `ALTER TABLE users ADD COLUMN custom_role_id INT NULL AFTER role;`

**Permissões não estão sendo aplicadas:**
- Verifique se usuário tem `custom_role_id` preenchido
- Verifique se `role_permissions` tem registro para o `role_id` do usuário
- Verifique logs do servidor para ver se middleware está sendo executado

## 📚 Referências

- **Schema:** `drizzle/schema.ts` (linhas 705-740)
- **Middleware:** `server/_core/permissionMiddleware.ts`
- **Procedures:** `server/_core/trpc.ts` (linhas 113-230)
- **Routers:** `server/routers.ts` (imports linhas 5-30, endpoints de manutenções linhas 1151-1250)
