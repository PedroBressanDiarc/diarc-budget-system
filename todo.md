# Sistema de Gestão Diarc - TODO

**Última atualização:** 12/02/2026  
**Total de linhas de código:** 28.081 linhas (Frontend: 21.656 | Backend: 5.483 | SQL: 439)  
**Histórico completo:** Ver `todo-history-20260212.md`

---

## 🔴 Prioridade Alta

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
