# Especificação Técnica: Sistema de Permissões Customizáveis

## Visão Geral

Sistema de controle de acesso baseado em **níveis de permissão configuráveis** (RBAC - Role-Based Access Control), onde o diretor pode criar, editar e deletar níveis, e configurar permissões granulares por módulo, submódulo e ação.

---

## Requisitos Funcionais

### 1. Gerenciamento de Níveis

**Criação de Níveis:**
- Diretor pode criar novos níveis com nome customizado (ex: "Supervisor", "Assistente", "Almoxarife")
- Campos: nome único, nome de exibição, descrição opcional

**Edição de Permissões:**
- Interface em "Gestão → Permissões"
- Checkboxes cíclicos com 3 estados:
  - **✅ Total**: acesso completo (ver + criar + editar + deletar)
  - **👁️ Somente Leitura**: pode visualizar, mas botões de ação ficam ocultos
  - **❌ Nenhum**: módulo não aparece na sidebar

**Deleção de Níveis:**
- Diretor pode deletar níveis (exceto se houver usuários vinculados)

### 2. Granularidade de Permissões

**Estrutura hierárquica:**
```
Módulo
├── Submódulo 1
│   ├── Visualizar
│   ├── Criar
│   ├── Editar
│   └── Deletar
└── Submódulo 2
    ├── Visualizar
    ├── Criar
    ├── Editar
    └── Deletar
```

**Exemplo prático:**
```
Compras
├── Manutenção
│   ├── Visualizar: Total
│   ├── Criar: Total
│   ├── Editar: Somente Leitura
│   └── Deletar: Nenhum
└── Obras
    ├── Visualizar: Somente Leitura
    ├── Criar: Nenhum
    ├── Editar: Nenhum
    └── Deletar: Nenhum
```

### 3. Atribuição a Usuários

- Vinculação na página "Usuários" (dropdown ao criar/editar)
- Cada usuário tem **apenas 1 nível** de permissão
- Campo `role` da tabela `users` é **substituído** por `permission_role_id`

### 4. Comportamento no Frontend

**Filtragem de Menus:**
- Menus sem permissão: **OCULTADOS** (não aparecem na sidebar)
- Módulos universais (sempre visíveis): Dashboard, Chat, Configurações

**Ocultação de Botões:**
- Modo "Somente Leitura": botões de Criar/Editar/Deletar ficam **ocultos**
- Modo "Total": todos os botões aparecem

**Redirecionamento:**
- Acesso direto a URL sem permissão → página **"Módulo Não Existe"** (404 customizado)

### 5. Comportamento no Backend

**Verificação de Permissões:**
- Middleware `checkPermission(module, submodule, action, requiredLevel)`
- Retorna erro **403 Forbidden** com mensagem **"Sem permissão"**

**Procedures:**
- `readProcedure`: requer permissão "Somente Leitura" ou superior
- `writeProcedure`: requer permissão "Total"

### 6. Casos Especiais

**Diretor (Super Admin):**
- Acesso total a tudo, **independente de configuração**
- Não precisa ter nível de permissão atribuído

**Módulos Universais:**
- Dashboard, Chat, Configurações: **todos os usuários têm acesso**

**Sem Expiração:**
- Permissões são **permanentes** (sem data de validade)

---

## Estrutura do Banco de Dados

### Tabela: `permission_roles`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | INT AUTO_INCREMENT PRIMARY KEY | ID único do nível |
| `name` | VARCHAR(50) UNIQUE NOT NULL | Nome único (ex: "almoxarife") |
| `display_name` | VARCHAR(100) NOT NULL | Nome de exibição (ex: "Almoxarife") |
| `description` | TEXT | Descrição opcional |
| `created_by` | INT | ID do usuário que criou |
| `created_at` | TIMESTAMP DEFAULT CURRENT_TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Data de atualização |

### Tabela: `role_permissions`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | INT AUTO_INCREMENT PRIMARY KEY | ID único da permissão |
| `role_id` | INT NOT NULL | FK para `permission_roles.id` |
| `module` | VARCHAR(50) NOT NULL | Nome do módulo (ex: "compras") |
| `submodule` | VARCHAR(50) | Nome do submódulo (ex: "manutencao") |
| `action` | VARCHAR(20) NOT NULL | Ação (ex: "view", "create", "edit", "delete") |
| `permission_level` | ENUM('total', 'readonly', 'none') NOT NULL | Nível de permissão |

**Índices:**
- `UNIQUE KEY (role_id, module, submodule, action)` - evita duplicatas
- `INDEX (role_id)` - otimiza buscas por nível

### Alteração na Tabela: `users`

```sql
ALTER TABLE users ADD COLUMN permission_role_id INT NULL;
ALTER TABLE users ADD FOREIGN KEY (permission_role_id) REFERENCES permission_roles(id) ON DELETE SET NULL;
```

---

## Mapeamento de Módulos

### Módulos e Submódulos do Sistema

```typescript
const MODULES = {
  dashboard: { label: "Dashboard", submodules: [] },
  compras: {
    label: "Compras",
    submodules: ["manutencao", "administrativo", "fabrica", "obras"]
  },
  autorizacoes: { label: "Autorizações", submodules: [] },
  estoque: {
    label: "Estoque",
    submodules: ["pecas_finalizadas", "estoque_interno"]
  },
  orcamentos: { label: "Orçamentos", submodules: [] },
  manutencoes: { label: "Manutenções", submodules: [] },
  chat: { label: "Chat", submodules: [] },
  financeiro: {
    label: "Financeiro",
    submodules: ["recebimentos", "pagamentos"]
  },
  relatorios: {
    label: "Relatórios",
    submodules: ["economias", "obras", "alertas_orcamento", "manutencoes"]
  },
  configuracoes: { label: "Configurações", submodules: [] },
  gestao: {
    label: "Gestão",
    submodules: ["usuarios", "permissoes"]
  },
  banco_dados: {
    label: "Banco de Dados",
    submodules: ["fornecedores", "equipamentos", "itens", "obras_bd", "locais"]
  }
};
```

### Ações Disponíveis

```typescript
const ACTIONS = ["view", "create", "edit", "delete"];
```

---

## Fluxo de Implementação

### Fase 1: Backend - Schema e Migrations
1. Criar tabelas `permission_roles` e `role_permissions`
2. Adicionar campo `permission_role_id` na tabela `users`
3. Executar migrations via `webdev_execute_sql`

### Fase 2: Backend - Endpoints
1. Router `permissionRoles` com CRUD completo
2. Endpoint `getUserPermissions` (retorna permissões do usuário logado)
3. Atualizar endpoint `users.update` para aceitar `permission_role_id`

### Fase 3: Backend - Middleware
1. Criar função `checkPermission(ctx, module, submodule, action, requiredLevel)`
2. Criar procedures `readProcedure` e `writeProcedure` por módulo
3. Aplicar em endpoints críticos

### Fase 4: Frontend - Interface de Gerenciamento
1. Página `PermissionsManagement.tsx` em "Gestão → Permissões"
2. Lista de níveis existentes com botão "Editar"
3. Modal de edição com checkboxes cíclicos (✅ → 👁️ → ❌)
4. Botão "Criar Novo Nível"

### Fase 5: Frontend - Atribuição a Usuários
1. Adicionar dropdown de níveis na página `Users.tsx`
2. Atualizar mutation `users.update` para enviar `permissionRoleId`

### Fase 6: Frontend - Hook e Filtragem
1. Hook `usePermissions()` com funções `hasPermission`, `hasReadAccess`, `hasWriteAccess`
2. Filtrar menus no `DashboardLayout.tsx`
3. Ocultar botões de ação em componentes (modo leitura)

### Fase 7: Frontend - Página 404 Customizada
1. Criar `ModuleNotFound.tsx`
2. Redirecionar acessos não autorizados

### Fase 8: Testes
1. Criar nível de teste com permissões mistas
2. Atribuir a usuário de teste
3. Validar filtragem de menus, ocultação de botões, bloqueio de endpoints

---

## Considerações de Segurança

**Validação no Backend:**
- **NUNCA** confiar apenas na filtragem do frontend
- **SEMPRE** verificar permissões no backend antes de executar ações

**Proteção contra Bypass:**
- Verificar permissões em **todos os endpoints** (queries e mutations)
- Retornar erro genérico "Sem permissão" (não revelar estrutura interna)

**Auditoria:**
- Registrar criação/edição de níveis (campo `created_by`)
- Logs de tentativas de acesso não autorizado (futuro)

---

## Exemplos de Uso

### Criar Nível "Almoxarife"

```typescript
await trpc.permissionRoles.create.mutate({
  name: "almoxarife",
  displayName: "Almoxarife",
  description: "Gerencia estoque e peças finalizadas",
  permissions: [
    { module: "dashboard", submodule: null, action: "view", permissionLevel: "total" },
    { module: "estoque", submodule: "estoque_interno", action: "view", permissionLevel: "total" },
    { module: "estoque", submodule: "estoque_interno", action: "create", permissionLevel: "total" },
    { module: "estoque", submodule: "estoque_interno", action: "edit", permissionLevel: "total" },
    { module: "estoque", submodule: "pecas_finalizadas", action: "view", permissionLevel: "readonly" },
    { module: "compras", submodule: "manutencao", action: "view", permissionLevel: "readonly" },
  ]
});
```

### Verificar Permissão no Backend

```typescript
// Middleware
const checkPermission = async (ctx, module, submodule, action, requiredLevel) => {
  if (ctx.user.role === 'diretor') return true; // Super admin
  
  const permissions = await getUserPermissions(ctx.user.permissionRoleId);
  const perm = permissions.find(p => 
    p.module === module && 
    p.submodule === submodule && 
    p.action === action
  );
  
  if (!perm || perm.permissionLevel === 'none') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Sem permissão' });
  }
  
  if (requiredLevel === 'total' && perm.permissionLevel !== 'total') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Sem permissão' });
  }
  
  return true;
};
```

### Verificar Permissão no Frontend

```typescript
const { hasPermission } = usePermissions();

// Verificar se pode ver módulo
if (hasPermission('compras', 'manutencao', 'view')) {
  // Mostrar menu
}

// Verificar se pode criar
if (hasPermission('compras', 'manutencao', 'create', 'total')) {
  // Mostrar botão "Criar"
}
```

---

## Cronograma Estimado

| Fase | Descrição | Tempo Estimado |
|------|-----------|----------------|
| 1 | Schema e Migrations | 15 min |
| 2 | Endpoints Backend | 30 min |
| 3 | Middleware Backend | 30 min |
| 4 | Interface de Gerenciamento | 45 min |
| 5 | Atribuição a Usuários | 15 min |
| 6 | Hook e Filtragem Frontend | 30 min |
| 7 | Página 404 Customizada | 10 min |
| 8 | Testes | 20 min |
| **TOTAL** | | **~3h 15min** |

---

## Notas Finais

- Sistema projetado para ser **escalável** (fácil adicionar novos módulos/ações)
- **Seguro** (verificação no backend, não apenas frontend)
- **Flexível** (diretor pode criar quantos níveis quiser)
- **Intuitivo** (checkboxes cíclicos, interface visual clara)
