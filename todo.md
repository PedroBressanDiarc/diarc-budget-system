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
- [ ] Implementar lógica de aplicação de permissões customizadas no sistema

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
