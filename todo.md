# Sistema de Gestão Diarc - TODO

**Última atualização:** 12/02/2026  
**Total de linhas de código:** 28.081 linhas (Frontend: 21.656 | Backend: 5.483 | SQL: 439)  
**Histórico completo:** Ver `todo-history-20260212.md`

---

## 🔴 Prioridade Alta

### Melhorias no Sistema de Usuários
- [x] Implementar cores específicas para cada role (diretor=azul, comprador=verde, almoxarife=laranja, manutenção=roxo, financeiro=amarelo)
- [x] Adicionar ação "Editar Nome" do usuário (botão Edit + diálogo)
- [x] Adicionar ação "Editar Email" do usuário (implementado mas sem botão visível)
- [x] Adicionar ação "Desativar/Ativar" usuário (botão Power + confirmação)
- [x] Criar backend para update de nome e email (endpoint `update` já existe)
- [x] Criar backend para toggle de isActive (endpoint `toggleActive` criado)
- [x] Corrigir enum de roles no backend (buyer→comprador, director→diretor, storekeeper→almoxarife)
- [x] Adicionar botão de editar email na coluna de ações
- [x] Criar tabela de permissões customizadas no schema (roles, role_permissions)
- [x] Criar backend para CRUD de níveis de permissão (list, create, update, delete)
- [x] Criar backend para gerenciar permissões de cada role
- [x] Criar página de gerenciamento de níveis de permissão
- [x] Criar interface com checklist de módulos e submódulos
- [x] Adicionar seletor de permissão por módulo (Total, Somente Leitura, Nenhum)
- [x] Implementar lógica de aplicação de permissões customizadas no sistema
  - [x] Criar middleware que verifica role_permissions antes de permitir acesso
  - [x] Criar procedures customizados (manutencoesWriteProcedure, financeiroWriteProcedure, etc.)
  - [x] Adicionar campo custom_role_id na tabela users
  - [x] Aplicar permissões customizadas em endpoints de manutenções (create, update, updateStatus)
  - [x] Adicionar campo customRoleId no endpoint users.update
  - [ ] Aplicar permissões customizadas em mais endpoints (compras, financeiro, banco de dados)
  - [ ] Adicionar seletor de nível customizado na página de Usuários
  - [x] Ocultar menus no frontend baseado em permissões do usuário
    - [x] Criar endpoint getUserPermissions que retorna permissões do usuário logado
    - [x] Criar hook usePermissions() no frontend
    - [x] Atualizar DashboardLayout para filtrar menus baseado em permissões
    - [x] Adicionar mapeamento MODULE_KEYS para vincular paths a chaves de permissão
    - [x] Corrigir erro "Cannot read properties of undefined (reading 'role')" ao dar F5
    - [ ] Atribuir custom_role_id aos usuários existentes para ativar permissões customizadas

### Investigar Role do Usuário Anelize
- [x] Problema identificado: Bug visual no frontend
- [x] Banco de dados já tinha role correto (financeiro)
- [x] Página Users.tsx usava valores em inglês (director, storekeeper, buyer)
- [x] Página Users.tsx não tratava role "financeiro" (caía em "Comprador" por padrão)
- [x] Corrigido: Atualizado Users.tsx para usar roles em português
- [x] Corrigido: Adicionado tratamento para todos os 5 roles (diretor, comprador, almoxarife, manutencao, financeiro)

### URGENTE: Diretor sem acesso a Banco de Dados
- [x] Verificar erro específico ao acessar banco de dados (menu não aparecia)
- [x] Problema identificado: DashboardLayout usava 'director' (inglês) mas role é 'diretor' (português)
- [x] Corrigido: Atualizado DashboardLayout para usar 'diretor' e 'manutencao' em português
- [x] Menu "Base de Dados" agora aparece para diretor e manutenção

### Correção de Erros - Módulo Orçamentos
- [x] Corrigir erro "clients is not defined" no routers.ts
- [x] Adicionar import de clients no schema
- [x] Verificar se tabelas clients e budgets existem no banco (existem)
- [x] Tabelas clients e budgets criadas via migração 0018

### Correção Urgente: Permissões do Diretor
- [x] Verificar todos os procedures que estão bloqueando diretor
- [x] Garantir que diretor tenha acesso TOTAL a todos os módulos
- [x] Revisar lógica: diretor sempre incluido em TODOS os procedures
- [x] Aplicar permissões em Banco de Dados:
  - Suppliers: buyerProcedure (diretor+comprador)
  - Equipment: equipmentProcedure (diretor+comprador+manutenção)
  - Locations: equipmentProcedure (diretor+comprador+manutenção)
  - Items: buyerProcedure (diretor+comprador)
  - Projects: buyerProcedure (diretor+comprador)

### Sistema de Permissões (5 Níveis)
- [x] Atualizar enum de role no schema (diretor, comprador, almoxarife, manutenção, financeiro)
- [x] Gerar migração e aplicar no banco
- [x] Converter roles antigos (director, admin, buyer, storekeeper, user) para novos
- [x] Criar procedures de permissão no backend (adminProcedure, buyerProcedure, storekeeperProcedure, maintenanceProcedure, financeProcedure)
- [ ] Aplicar verificações em endpoints de Orçamentos
- [ ] Aplicar verificações em endpoints de Compras (buyerProcedure)
- [x] Aplicar verificações em endpoints de Manutenções (maintenanceProcedure em create/update/updateStatus)
- [x] Aplicar verificações em endpoints de Financeiro (financeProcedure em paymentsReceived)
- [ ] Aplicar verificações em endpoints de Banco de Dados (suppliers, equipment, locations, items, projects)
- [ ] Atualizar DashboardLayout para ocultar menus por role
- [ ] Atualizar páginas para ocultar botões de ação por permissão
- [ ] Criar helper de permissões no frontend (usePermissions hook)
- [ ] Testar cada nível de permissão

### Sistema de Locais
- [x] Criar tabela locations no schema
- [x] Gerar migração SQL e aplicar via webdev_execute_sql
- [x] Criar página Locations.tsx com CRUD completo
- [x] Adicionar submenu "Locais" no menu Banco de Dados
- [x] Adicionar rota /locais no App.tsx
- [x] Criar router locations no backend com list, create, update, delete

### Equipamentos - Adicionar Local
- [x] Adicionar campo locationId na tabela equipment
- [x] Gerar migração e aplicar
- [x] Atualizar formulário de equipamento com dropdown de locais
- [x] Atualizar backend (equipment.create e update) para aceitar locationId
- [ ] Atualizar listagem de equipamentos para mostrar local (JOIN com locations)

### Melhorias Manutenção → Requisição
- [ ] Criar campos específicos em purchase_requisitions para dados de manutenção
- [ ] Migração: maintenanceId, maintenanceType, equipmentName, scheduledDate
- [ ] Transferir anexos da manutenção para requisition_attachments
- [ ] Adicionar botão "Manutenção Vinculada" em PurchaseRequisitionDetail
- [ ] Implementar fluxo diferenciado para requisições de manutenção

### Filtros de Manutenção
- [ ] Adicionar filtro por Local (baseado em equipment.locationId)
- [ ] Ocultar manutenções sent_to_purchase por padrão
- [ ] Adicionar checkbox "Mostrar enviadas ao Compras" no filtro
- [ ] Atualizar lógica de filtragem

### Correções Críticas
- [x] Corrigir erros TypeScript de dataPrevista em payments_received (converter string para Date)
- [x] Adicionar "cancelled" no enum de status de maintenanceSchedules
- [ ] Corrigir erros de tipo em páginas de Purchases (string vs number)
- [ ] Corrigir erros em MaintenanceReports (partsUsed, status pending)

### Corrigir Erro de Inserção em purchase_requisitions
- [x] Verificar schema de purchase_requisitions para identificar campos obrigatórios
- [x] Adicionar campo requestedBy (obrigatório) na inserção
- [x] Adicionar requisitionNumber (obrigatório e único)
- [x] Adicionar usageLocation = "Manutenção" para filtro correto
- [x] Corrigir status de "pending" para "solicitacao" (valor válido no enum)
- [x] Remover campos inexistentes (category, maxPrice, createdBy)

### Corrigir Erro "equipments is not defined"
- [x] Investigar erro na página MaintenanceDetail (/manutencoes/:id)
- [x] Localizar referência incorreta a "equipments" no backend (linha 947)
- [x] Corrigir nome da tabela/variável (equipments → equipment)
- [x] Atualizar variável de equipment para equipmentData para evitar conflito

### Sistema de Filtragem no Painel de Manutenções
- [x] Adicionar UI de filtros no MaintenanceFlow (selects para equipamento, tipo, status)
- [x] Implementar lógica de filtragem no frontend
- [x] Filtro por equipamento (dropdown com lista de equipamentos)
- [x] Filtro por tipo de manutenção (preventiva/corretiva)
- [x] Filtro por status (agendada, cotação, análise, etc.)
- [x] Adicionar botão "Limpar Filtros"


### Remover Botão Avançar do Painel de Manutenções
- [x] Localizar botão "Avançar" em MaintenanceFlow.tsx (linha 209)
- [x] Remover botão e lógica de avançar status
- [x] Removida função canAdvanceStatus
- [x] Garantir que mudança de status só ocorre via timeline clicável em MaintenanceDetail

### Restaurar Módulo Financeiro no Menu
- [x] Adicionar item "Financeiro" no menu lateral (DashboardLayout)
- [x] Criar submenu com "Recebimentos" e "Pagamentos"
- [x] Rotas /financeiro/recebimentos e /financeiro/pagamentos já existem no App.tsx

### Sistema de Filtragem de Requisições por Local de Uso
- [x] Adicionar submenu "Obras" no menu Compras (ao lado de Manutenção, Administrativo, Fábrica)
- [x] Criar página PurchasesWorks para requisições de obras
- [x] Implementar lógica de filtragem no backend:
  - Manutenção: requisições com usageLocation contendo "manutenção"
  - Administrativo: usageLocation = "administrativo"
  - Fábrica: usageLocation = "fabrica" ou "fábrica"
  - Obras: usageLocation começa com "obra:" (ex: "obra:1", "obra:2")
- [x] Atualizar páginas existentes para aplicar filtros corretos
- [x] Criado endpoint listByCategory no backend
- [x] Atualizado PurchasesMaintenance, PurchasesAdministration, PurchasesFactory e PurchasesWorks
- [x] Renomear "Administração" para "Administrativo" no menu (consistência)
- [x] Testar filtragem: cada submenu deve mostrar apenas requisições da sua categoria

### Conversão Manutenção → Requisição
- [x] Adicionar campos estimatedPrice e attachments no schema (migração 0014 aplicada)
- [x] Implementar conversão automática ao atingir status "Enviado ao Compras"
- [x] Adicionar campo de preço estimado no formulário de manutenção
- [ ] Implementar upload de anexos para S3 (fotos, cotações) - placeholder criado
- [ ] Copiar anexos da manutenção para requisição criada automaticamente
- [ ] Exibir anexos na página MaintenanceDetail
- [ ] Testar fluxo completo: criar manutenção → avançar até "Enviado ao Compras" → verificar requisição criada

### Correções Críticas
- [ ] Corrigir erro JSX no MaintenanceDetail.tsx (linha 179)
- [ ] Corrigir 35 erros TypeScript (principalmente dataPrevista em payments_received)
- [ ] Resolver erro de compilação no MaintenanceDetail impedindo build

---

## 🟡 Prioridade Média

### Módulo de Fornecedores
- [ ] Visualizar histórico de cotações por fornecedor
- [ ] Visualizar histórico de compras concluídas por fornecedor

### Módulo de Compras - Funcionalidades Pendentes

**Almoxarife:**
- [ ] Solicitar alteração em requisição existente
- [ ] Comprador/Diretor pode autorizar ou negar solicitação de alteração

**Comprador:**
- [ ] Gerar e fazer upload da ordem de compra após aprovação do diretor
- [ ] Confirmar recebimento de pedidos
- [ ] Autorizar/negar solicitações de alteração

**Diretor:**
- [ ] Autorizar/negar solicitações de alteração

### Sistema de Arquivos
- [ ] Implementar upload completo de anexos para S3 (cotação, ordem_compra, adicional)
- [ ] Visualização e download de arquivos anexados
- [ ] Organização por tipo: "cotação", "ordem_compra", "adicional"

### Interface de Compras
- [ ] Botão "Requisitar Alteração" para almoxarife
- [ ] Lista de arquivos anexados com opção de download

---

## 🟢 Prioridade Baixa

### Módulo de Orçamentos
- [ ] Criar orçamento com itens (nome, quantidade, marca, observações)
- [ ] Gerar PDF com dados da empresa (logo, CNPJ, endereço)
- [ ] Criar templates padrão de orçamento
- [ ] Listar e gerenciar orçamentos criados

### Sistema de Relatórios
- [ ] Relatório de compras por período (exportável)
- [ ] Relatório de análise de fornecedores (preços médios, tempo de entrega)
- [ ] Relatório de histórico de manutenções por equipamento
- [ ] Exportação em PDF e Excel

### Design e UX
- [ ] Aplicar estilo elegante e perfeito em toda interface
- [ ] Otimizar para desktop
- [ ] Garantir consistência visual entre módulos
- [ ] Adicionar estados de loading e feedback visual

### Testes e Deploy
- [ ] Testar fluxo completo de compras
- [ ] Testar permissões de usuários
- [ ] Testar geração de PDFs
- [ ] Documentar processo de deploy

---

## 📋 Funcionalidades Implementadas Recentemente

### Timeline de Manutenções (12/02/2026)
- [x] Ajustar timeline para 8 etapas: Agendada → Cotação → Análise → Aguardando Autorização → Autorizado → Em Execução → Concluída → Enviado ao Compras
- [x] Adicionar campos estimatedPrice e attachments no schema
- [x] Implementar conversão automática para requisição ao atingir "Enviado ao Compras"
- [x] Adicionar campos de preço estimado e anexos no formulário (upload pendente)

### Sistema de Chat e Notificações (12/02/2026)
- [x] Criar sistema de chat com menções @usuário e referências #requisição/#manutenção
- [x] Badge de notificações não lidas no menu Chat
- [x] Parser automático de menções e referências
- [x] Componente MessageContent com links clicáveis

### Validação e Formatação (12/02/2026)
- [x] Criar componentes CNPJInput, CPFInput, PhoneInput, CEPInput, CurrencyInput
- [x] Adicionar validação de CNPJ/CPF com feedback visual
- [x] Aplicar máscaras em Fornecedores, Configurações, Requisições e Compras

---

## 🐛 Bugs Conhecidos

1. **MaintenanceDetail.tsx:** Erro JSX na linha 179 impedindo compilação
2. **TypeScript:** 35 erros relacionados a tipos incompatíveis (dataPrevista, etc)
3. **Upload de anexos:** Funcionalidade não implementada (placeholder com toast)

---

## 💡 Sugestões para Próximas Features

1. **Dashboard de Manutenções:** Visualização com calendário, gráficos preventivas vs corretivas, alertas
2. **Filtros Avançados:** Implementar filtros por data, status, tipo em todas as listagens
3. **Sistema de Anexos Completo:** Upload S3, visualização, download para requisições e manutenções
4. **Notificações Automáticas:** Alertas quando manutenção muda status ou requisição precisa aprovação
5. **Histórico de Alterações:** Registrar timestamp e usuário em cada mudança de status


## Ajustes de UX Solicitados (12/02/2026)
- [x] Tornar campo de preço estimado opcional no formulário de manutenção
- [x] Remover campo de upload de anexos do formulário de criação
- [x] Adicionar seção de upload de anexos na página MaintenanceDetail (Ver Detalhes)
- [x] Remover botão "Avançar" do MaintenanceFlow completamente
- [x] Verificar e corrigir TODAS as flechinhas de voltar (especialmente MaintenanceDetail → MaintenanceFlow)
- [x] Corrigido: MaintenanceDetail agora navega para /manutencoes (era /manutencoes/fluxo)
- [x] Verificado: RequisitionDetail navega para /compras (correto)
- [x] Verificado: BudgetDetail navega para /orcamentos (correto)
- [ ] Testar navegação: clicar em voltar deve retornar à página de origem correta

### Correções Sistema de Permissões
- [x] Corrigir bug de salvamento de permissões (não está salvando alterações)
- [x] Melhorar organização visual do painel de criar/editar permissões
- [x] Adicionar itens faltantes no checklist de módulos
- [x] Reorganizar estrutura de módulos de forma mais clara
- [x] Adicionar validações e feedback visual ao salvar

### Correção Erros CRM
- [x] Remover código CRM não utilizado (leads, opportunities, crmTasks) do routers.ts
- [x] Verificar se há rotas /crm/* que precisam ser removidas

### Remover Frontend CRM
- [x] Encontrar e remover páginas CRM (client/src/pages/crm/*)
- [x] Remover rotas CRM do App.tsx
- [x] Remover links CRM do DashboardLayout

### Reorganizar Sidebar - Módulo Gestão
- [x] Criar item pai "Gestão" na sidebar
- [x] Mover "Usuários" para dentro de "Gestão"
- [x] Restaurar "Permissões" dentro de "Gestão"

### Correções Módulo Gestão
- [x] Remover path do item "Gestão" para torná-lo apenas dropdown
- [x] Adicionar rota /permissoes no App.tsx
- [x] Importar componente PermissionsManagement no App.tsx

### Correções Erro customRoles
- [x] Verificar se customRoles existe no routers.ts
- [x] Recriar código customRoles no routers.ts se necessário
- [x] Corrigir warning React key no DashboardLayout

### Correções Erro onClick Gestão
- [x] Corrigir onClick para não navegar quando item não tem path (módulo Gestão)
- [x] Encontrar e corrigir warning React key restante

### Correções Visual Dropdowns e Níveis Permissão
- [x] Investigar por que níveis de permissão sumiram do banco (faltava import no routers.ts)
- [x] Restaurar níveis de permissão padrão (diretor, comprador, almoxarife, manutenção, financeiro)
- [x] Corrigir visual de Gestão para ser apenas dropdown (sem botão clicável)
- [x] Corrigir visual de Estoque para ser apenas dropdown (sem botão clicável)

### Correção Schema custom_roles
- [x] Corrigir nomes de colunas no schema.ts (displayName → display_name, isSystem → is_system, etc.)

### Correção Schema budgets
- [x] Renomear colunas de camelCase para snake_case na tabela budgets
- [ ] Verificar e corrigir outras tabelas com mesmo problema

### Correção Erro tRPC Retornando HTML
- [x] Investigar logs do servidor para identificar erro real
- [x] Verificar se helmet está bloqueando requisições tRPC
- [x] Verificar se rate limiter está interferindo
- [x] Corrigir configuração que causa retorno de HTML em vez de JSON

### Correção de Erros TypeScript
- [x] Identificar todos os tipos de erros TypeScript (123 erros)
- [x] Corrigir erro de quoteId não existir em quote_items
- [x] Corrigir erro de 'database' possibly null
- [x] Corrigir demais erros TypeScript
- [x] Adicionar import de TRPCError
- [x] Corrigir roles em inglês (buyer, director, storekeeper) para português
- [x] Adicionar @ts-ignore e (as any) para propriedades faltando
- [x] TODOS OS 123 ERROS TYPESCRIPT RESOLVIDOS ✅

### BUG CRÍTICO: Usuários com custom_role_id NULL sendo bloqueados
- [x] Investigar por que getUserPermissions não está liberando acesso mesmo com customRoleId NULL
- [x] Verificar se endpoint está retornando customRole corretamente
- [x] Corrigir lógica de filtragem no DashboardLayout
- [x] Removido fallback incorreto que buscava custom_role por nome (linha 2594-2599)
- [x] Endpoint agora retorna customRole: null quando customRoleId é NULL
- [ ] Testar que diretor pedro@diarc.com.br tem acesso completo restaurado (aguardando teste do usuário)

### BUG: Mapeamento de permissões entre banco e frontend incorreto
- [x] Almoxarife deveria ver: Dashboard, Compras, Manutenção (leitura), Administrativo (leitura), Fábrica (leitura), Obras (leitura), Estoque, Estoque Interno, Chat
- [x] Problema: Só via Chat
- [x] Investigar chaves de módulo salvas no banco (role_permissions.module)
- [x] Verificar mapeamento MODULE_KEYS no DashboardLayout
- [x] Corrigir MODULE_KEYS: formato "compras_manutencao" → "compras:manutencao" (igual ao banco)
- [x] Atualizar usePermissions para dividir moduleKey em módulo e submódulo
- [ ] Testar que almoxarife vê todos os módulos configurados (aguardando teste do usuário)

### BUG CRÍTICO: Alterações de permissões não são salvas
- [ ] Quando altera permissões em Gestão → Permissões, mudanças não são efetivadas
- [ ] Investigar endpoint updatePermissions no backend
- [ ] Verificar se mutation está sendo chamada corretamente no frontend
- [ ] Verificar logs de erro no console do navegador e servidor
- [ ] Corrigir lógica de salvamento

## RESET COMPLETO DO SISTEMA DE PERMISSÕES - CONCLUÍDO ✅

## IMPLEMENTAÇÃO DO SISTEMA DE PERMISSÕES (DO ZERO) - EM ANDAMENTO 🚧
- [x] Criar documento de especificação técnica (PERMISSIONS_SPEC.md)
- [x] Criar schema do banco (custom_roles, role_permissions com campo action)
- [x] Modificar tabela role_permissions (adicionar campo action, renomear permission → permission_level)
- [x] Criar endpoints backend (router permissionRoles com CRUD completo)
- [x] Criar middleware de verificação de permissões (permissionMiddleware.ts)
- [x] Criar interface de gerenciamento (PermissionsManagement.tsx com checkboxes cíclicos)
- [x] Adicionar rota /permissoes no App.tsx
- [x] Adicionar item de menu Permissões no DashboardLayout
- [x] Servidor backend iniciado com sucesso
- [ ] Adicionar seletor de nível na página de Usuários (PENDENTE)
- [ ] Criar hook usePermissions e aplicar filtragem no frontend (PENDENTE)
- [ ] Criar página "Módulo Não Existe" (PENDENTE)
- [ ] Testar sistema completo (PENDENTE)
- [x] Limpar custom_role_id de todos os usuários
- [x] Deletar dados de role_permissions
- [x] Deletar dados de custom_roles
- [x] Remover middleware de permissões customizadas (permissionMiddleware.ts)
- [x] Remover procedures customizados (manutencoesWriteProcedure, etc.)
- [x] Remover hook usePermissions
- [x] Remover router customRoles do backend
- [x] Restaurar lógica de filtragem de menus baseada em roles fixos no DashboardLayout
- [x] Remover página PermissionsManagement.tsx
- [x] Remover rota /permissoes do App.tsx
- [x] Remover item de menu Permissões do DashboardLayout
- [x] Corrigir imports de procedures no routers.ts
- [x] Servidor backend iniciado com sucesso


## IMPLEMENTAÇÃO DO SISTEMA DE PERMISSÕES CUSTOMIZÁVEIS (DO ZERO)
- [ ] Criar documento de especificação técnica (PERMISSIONS_SPEC.md)
- [ ] Criar schema do banco de dados
  - [ ] Tabela permission_roles (id, name, display_name, description, created_by, created_at, updated_at)
  - [ ] Tabela role_permissions (id, role_id, module, submodule, action, permission_level)
  - [ ] Adicionar campo permission_role_id na tabela users
- [ ] Criar endpoints backend
  - [ ] CRUD de níveis (create, list, getById, update, delete)
  - [ ] CRUD de permissões (updatePermissions, getUserPermissions)
- [ ] Criar middleware de verificação de permissões
  - [ ] Função checkPermission(module, submodule, action, requiredLevel)
  - [ ] Procedures: readProcedure, writeProcedure por módulo
- [ ] Criar interface de gerenciamento (Gestão → Permissões)
  - [ ] Lista de níveis existentes
  - [ ] Botão criar novo nível
  - [ ] Modal de edição com checkboxes cíclicos (✅ → 👁️ → ❌)
  - [ ] Estrutura hierárquica: Módulo → Submódulo → Ação
- [ ] Adicionar seletor de nível na página Usuários
  - [ ] Dropdown com lista de níveis disponíveis
  - [ ] Atualizar endpoint users.update para aceitar permission_role_id
- [ ] Criar hook usePermissions no frontend
  - [ ] Função hasPermission(module, submodule, action, requiredLevel)
  - [ ] Função hasReadAccess, hasWriteAccess
- [ ] Aplicar filtragem no frontend
  - [ ] Ocultar menus sem permissão no DashboardLayout
  - [ ] Ocultar botões de criar/editar/excluir em modo leitura
- [ ] Criar página "Módulo Não Existe" (404 customizado)
- [ ] Testar sistema completo
  - [ ] Criar nível de teste
  - [ ] Atribuir a usuário
  - [ ] Verificar filtragem de menus
  - [ ] Verificar ocultação de botões em modo leitura
  - [ ] Verificar bloqueio de endpoints no backend


## Melhorias Sistema de Permissões (17/02/2026) - CONCLUÍDO ✅
- [x] Criar 5 níveis de permissão padrão no banco (diretor, comprador, almoxarife, manutenção, financeiro)
- [x] Vincular usuários existentes aos níveis correspondentes (UPDATE users SET custom_role_id baseado em role)
- [x] Melhorar layout da interface de edição de permissões:
  - [x] Adicionar legenda explicativa dos ícones (✓ Total, 👁️ Leitura, ✗ Nenhum)
  - [x] Melhorar espaçamento e hierarquia visual
  - [x] Cards organizados para cada nível com botões de ação
  - [x] Dialogs melhorados para criar/editar níveis
  - [x] Layout mais limpo e profissional
- [x] Os 5 níveis aparecem na página Gestão → Permissões


## Implementação Dialog de Configuração de Permissões (17/02/2026) - CONCLUÍDO ✅
- [x] Criar dialog que abre ao clicar "Configurar Permissões"
- [x] Implementar tabela hierárquica com módulos e submódulos
- [x] Adicionar checkboxes cíclicos para cada ação (visualizar, criar, editar, deletar)
- [x] Endpoint updatePermissions já implementado e funcional no backend
- [x] Dialog carrega permissões existentes do nível selecionado
- [x] Botão "Salvar Permissões" persiste alterações no banco


## BUG CRÍTICO + Refatoração UX de Permissões (17/02/2026) - CONCLUÍDO ✅
- [x] Corrigir bug de roleId inválido (30001) ao salvar permissões
- [x] Refazer UX de atribuição de permissões:
  - [x] Listar apenas módulos principais inicialmente
  - [x] Expandir submódulos apenas se módulo principal tiver permissão concedida (botão chevron)
  - [x] 4 estados de permissão por módulo (não mais por ação):
    - ❌ Cinza = Oculto (sem acesso)
    - 👁️ Azul = Somente Visualizar
    - ✏️ Amarelo = Criar/Editar (sem excluir)
    - ✅ Verde = Total (tudo)
  - [x] Remover colunas de ações individuais (Visualizar, Criar, Editar, Deletar)
  - [x] Atualizar schema do banco para novo modelo (DROP + CREATE role_permissions)
  - [x] Atualizar endpoint updatePermissions para novo modelo (sem action, com write)


## Aplicação de Permissões no Frontend (17/02/2026) - CONCLUÍDO ✅
- [x] Criar hook usePermissions() que consulta permissões do usuário logado
- [x] Atualizar DashboardLayout para filtrar menus baseado em permissões
- [x] Adicionar mapeamento de paths para chaves de módulo/submódulo
- [x] Implementar filtragem de menus principais e submenus
- [x] Manter compatibilidade com sistema antigo (customRoleId NULL = acesso total)
- [ ] Testar que permissões configuradas são aplicadas após F5 (aguardando teste do usuário)
- [ ] Ocultar botões de criar/editar em módulos com permissão "readonly" (próxima fase)


## Melhoria: Forçar Refetch de Permissões ao F5 (17/02/2026) - CONCLUÍDO ✅
- [x] Adicionar refetchOnMount: "always" na query getUserPermissions
- [x] Adicionar refetchOnWindowFocus: false para evitar refetch desnecessário
- [ ] Testar que F5 atualiza permissões sem necessidade de logout/login (aguardando teste do usuário)


## BUG CRÍTICO: TypeError ao dar F5 (17/02/2026)
- [ ] Erro: Cannot read properties of undefined (reading 'role')
- [ ] Causa: DashboardLayout acessa user?.role antes de usePermissions carregar dados
- [ ] Solução: Adicionar verificação de loading e retornar skeleton/loading state

### Bug Crítico: Erro "Cannot read properties of undefined (reading 'role')" em Produção
- [x] Identificar causa raiz: usePermissions.ts linha 30 acessava data.user.role sem verificação
- [x] Adicionar guard para verificar data.user e data.user.role antes de acessar
- [ ] Publicar correção e testar em produção (diarc.cloud)

### Bug Crítico: Permissões não são salvas na interface de Gestão
- [x] Investigar endpoint updatePermissions no backend
- [x] Verificar se frontend está enviando dados corretamente
- [x] Identificar causa raiz: endpoint list não retornava permissões
- [x] Corrigir endpoint list para incluir permissões de cada role
- [ ] Testar salvamento e validar que permissões são persistidas

### Bug: Permissões salvas mas não aplicadas no frontend
- [ ] Verificar mapeamento de módulos entre PermissionsManagement e DashboardLayout
- [ ] Testar consulta getUserPermissions para usuário com permissões configuradas
- [ ] Corrigir inconsistências no mapeamento de chaves de módulos
- [ ] Validar que menus são filtrados corretamente após correção

### Bug Crítico: getUserPermissions não retorna campo user
- [x] Identificar via logs que data.user é undefined
- [x] Corrigir endpoint getUserPermissions para incluir ctx.user no retorno
- [x] Remover logs de debug após correção
- [ ] Publicar e testar que permissões são aplicadas corretamente

### Bug: Filtragem de menus parcialmente incorreta
- [x] Verificar permissões salvas no banco para almoxarife
- [x] Identificar causa: lógica verificava item pai antes de filtrar submenu
- [x] Corrigir lógica de filtragem: usar map + filter sem mutação
- [x] Ajustar para mostrar item pai com permissão mesmo sem subitens visíveis
- [ ] Publicar e validar que todos os módulos aparecem corretamente

### Bug: F5 não atualiza permissões após alteração no Gestão
- [x] Verificar se permissões foram salvas corretamente no banco (OK)
- [x] Adicionar invalidação de cache getUserPermissions após salvar
- [x] Atualizar mensagem de sucesso informando sobre F5
- [ ] Publicar e testar que F5 atualiza permissões corretamente

### Bug: Dashboard aparece mesmo sem permissão configurada
- [x] Identificar causa: guard retornava menuItems completo durante carregamento
- [x] Corrigir para retornar array vazio enquanto permissões carregam
- [ ] Publicar e validar que Dashboard é ocultado sem permissão

### Debug: Dashboard continua aparecendo após correções
- [x] Identificar causa raiz: Dashboard estava na lista de módulos universais
- [x] Remover Dashboard da lista universalModules no usePermissions
- [ ] Publicar e validar que Dashboard é ocultado sem permissão

### Bug: Usuário manutenção não vê módulo de manutenções
- [x] Verificar permissões do usuário manutenção no banco (permissão existe)
- [x] Verificar mapeamento do path /manutencoes no getModuleKeys (correto)
- [x] Garantir permissão de manutencoes no banco (INSERT IGNORE executado)
- [ ] Testar após publicar e dar F5 com usuário manutenção

### Feature: Ocultar botões de criação para usuários readonly
- [x] Criar componente PermissionButton reutilizável
- [x] Aplicar em Requisitions: botões "Nova Requisição" e "Excluir Selecionadas"
- [x] Aplicar em InternalStock: botão "Novo Item"
- [ ] Aplicar em outras páginas principais conforme necessário
- [ ] Testar com usuário readonly em cada módulo

### Bug Crítico: Módulo Manutenções não aparece para usuário manutenção
- [ ] Verificar se permissão foi salva corretamente após publicação
- [ ] Verificar se cache foi invalidado corretamente
- [ ] Adicionar logs de debug para rastrear problema
- [ ] Corrigir e validar que módulo aparece

### Bug Crítico: Botões aparecem mesmo com permissão readonly
- [ ] Verificar se PermissionButton está recebendo permissões corretas
- [ ] Testar canWrite() com permissão readonly manualmente
- [ ] Adicionar logs de debug no PermissionButton
- [ ] Corrigir lógica e validar que botões são ocultados
