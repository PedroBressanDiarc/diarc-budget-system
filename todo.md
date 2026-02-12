# Sistema de Gestão Diarc - TODO

## Infraestrutura e Autenticação
- [x] Configurar schema do banco de dados completo
- [x] Aplicar migrações no banco de dados
- [x] Implementar controle de permissões (comprador vs diretor)
- [x] Configurar layout Dashboard com sidebar em português

## Módulo de Fornecedores
- [x] Criar cadastro de fornecedores (nome, CNPJ, contato, endereço)
- [x] Listar fornecedores com busca e filtros
- [ ] Visualizar histórico de cotações por fornecedor
- [ ] Visualizar histórico de compras concluídas por fornecedor

## Módulo de Compras (Fluxo Real Diarc)

### Permissões (3 níveis)
- [x] Adicionar role "almoxarife" ao schema
- [x] Atualizar sistema de permissões para 3 níveis: almoxarife, comprador (buyer), diretor

### Status de Requisições (6 etapas)
- [x] Atualizar schema com novos status:
  - solicitação (almoxarife cria)
  - cotação_em_progresso (comprador adicionando cotações)
  - cotações_em_analise (comprador fez comparação inicial)
  - aguardando_autorização (diretor vai aprovar)
  - ordem_compra_enviada (aprovado, pedido gerado)
  - aguardando_recebimento (pedido enviado, aguardando entrega)

### Funcionalidades por Papel

**Almoxarife:**
- [ ] Criar requisição de compra (itens, quantidade, marca, observações)
- [ ] Visualizar suas requisições (somente leitura após criar)
- [ ] Solicitar alteração em requisição existente
- [ ] Comprador/Diretor pode autorizar ou negar solicitação de alteração

**Comprador (Suprimentos):**
- [ ] Visualizar todas as requisições
- [ ] Adicionar múltiplas cotações de fornecedores
- [ ] Fazer upload de arquivos de cotação (PDF, imagens, etc)
- [ ] Fazer comparação inicial de preços
- [ ] Mudar status para "cotações_em_analise"
- [ ] Gerar e fazer upload da ordem de compra após aprovação do diretor
- [ ] Confirmar recebimento de pedidos
- [ ] Autorizar/negar solicitações de alteração

**Diretor (Gerente):**
- [ ] Visualizar todas as requisições
- [ ] Fazer comparação detalhada de preços
- [ ] Aprovar ou rejeitar requisição
- [ ] Autorizar/negar solicitações de alteração

### Sistema de Arquivos
- [x] Criar tabela de anexos (requisition_attachments)
- [ ] Upload de arquivos de cotação (PDF, imagens, Excel)
- [ ] Upload de ordem de compra (PDF)
- [ ] Upload de arquivos adicionais (qualquer tipo)
- [ ] Visualização e download de arquivos anexados
- [ ] Organização por tipo: "cotação", "ordem_compra", "adicional"

### Interface
- [ ] Página de listagem com filtros por status
- [ ] Página de detalhes da requisição
- [ ] Comparação de preços lado a lado
- [ ] Botão "Requisitar Alteração" para almoxarife
- [ ] Botões de upload de arquivos (cotação, ordem de compra, adicionais)
- [ ] Lista de arquivos anexados com opção de download
- [ ] Fluxo visual do status atual

## Módulo de Orçamentos
- [ ] Criar orçamento com itens (nome, quantidade, marca, observações)
- [ ] Gerar PDF com dados da empresa (logo, CNPJ, endereço)
- [ ] Criar templates padrão de orçamento
- [ ] Listar e gerenciar orçamentos criados

## Módulo de Manutenções
- [x] Cadastrar equipamentos e máquinas
- [x] Agendar manutenção preventiva
- [x] Agendar manutenção corretiva
- [x] Registrar manutenção realizada manualmente
- [x] Visualizar histórico completo por equipamento
- [x] Listar próximas manutenções agendadas

## Dashboard Principal
- [x] Exibir volume mensal de compras
- [x] Exibir status de requisições pendentes
- [x] Exibir próximas manutenções agendadas
- [x] Exibir comparação de gastos por fornecedor
- [x] Gráficos e visualizações de métricas

## Sistema de Relatórios
- [ ] Relatório de compras por período (exportável)
- [ ] Relatório de análise de fornecedores (preços médios, tempo de entrega)
- [ ] Relatório de histórico de manutenções por equipamento
- [ ] Exportação em PDF e Excel

## Design e UX
- [ ] Aplicar estilo elegante e perfeito em toda interface
- [ ] Implementar navegação sidebar em português
- [ ] Otimizar para desktop
- [ ] Garantir consistência visual entre módulos
- [ ] Adicionar estados de loading e feedback visual

## Testes e Deploy
- [ ] Testar fluxo completo de compras
- [ ] Testar permissões de usuários
- [ ] Testar geração de PDFs
- [ ] Criar checkpoint final
- [ ] Documentar processo de deploy para Hostinger

## Sistema de Autenticação Independente
- [x] Atualizar schema do banco com campos de senha
- [x] Aplicar migração para adicionar password_hash e username
- [x] Instalar bcrypt para hash de senhas
- [x] Criar endpoints de autenticação (login, logout)
- [x] Criar página de login customizada
- [x] Criar página de gerenciamento de usuários
- [x] Permitir cadastro de novos usuários (admin)
- [x] Permitir edição de usuários existentes
- [x] Permitir reset de senha manual
- [x] Documentar como criar primeiro usuário admin no banco

## Bugs Reportados
- [x] Corrigir erros TypeScript no módulo de Manutenções (navigate e tipo de status)

## Bugs Reportados Anteriores
- [x] Corrigir loop de redirecionamento após login (tela fica preta e volta para login)
- [x] Verificar se o cookie auth_token está sendo setado corretamente
- [x] Login bem-sucedido mas não redireciona - auth.me não atualiza antes do redirect
- [x] Cookie não persistia entre requisições - corrigido com sameSite: none e secure: true

## Bugs Reportados (Novos)
- [x] Role "almoxarife" não aparece na página de criação de usuários
- [x] Módulo de Compras não tem páginas frontend funcionais
- [x] Fornecedor de teste sendo criado automaticamente

- [x] Erro ao criar requisição: status "draft" não existe, deve usar "solicitacao" (resolvido com restart do servidor)
- [x] Validar quantidade como número antes de enviar requisição (erro NaN)

## Melhorias Solicitadas
- [x] Expandir dialog de criação de requisição para tela cheia
- [x] Criar página de detalhes da requisição completa
- [ ] Implementar seção de cotações na página de detalhes
- [ ] Implementar comparação de preços lado a lado
- [ ] Adicionar botões de ação conforme permissão (almoxarife/comprador/diretor)
- [ ] Adicionar botões de ação conforme status da requisição

## Novas Melhorias Solicitadas (10/02/2026)
- [x] Corrigir formulário de nova requisição para ocupar toda a tela (fullscreen)
- [x] Implementar dialog de adicionar cotações para compradores
- [x] Criar tabela de comparação de preços lado a lado
- [x] Implementar upload de arquivos (cotação, ordem_compra, adicional) com S3
- [ ] Implementar ações de aprovação/rejeição para diretores
- [ ] Implementar solicitação de alteração para almoxarifes

## Bug Reportado (10/02/2026)
- [x] Formulário de nova requisição ainda não está preenchendo toda a tela apesar das classes w-screen h-screen (resolvido com !important para sobrescrever classes padrão do Dialog)

## Melhorias de UX (10/02/2026)
- [x] Ajustar formulário de requisição para 90% da tela (popup mais natural) em vez de fullscreen

## Novas Funcionalidades (10/02/2026)
- [x] Adicionar dropdown de unidades no formulário de requisição (un, caixa, pacote, kg, m, L, etc)

## Melhorias Solicitadas (10/02/2026 - Parte 2)
- [x] Implementar formatação monetária brasileira (R$ 1.250,43) em todos os valores
- [x] Melhorar comparação de preços item a item entre fornecedores (incluindo prazo pagamento e entrega)
- [x] Verificar e implementar visualização do fluxo de compras (status e transições)

## Features de Qualidade de Vida (10/02/2026)
- [x] Adicionar checkboxes de seleção múltipla na listagem de requisições
- [x] Adicionar botões de ação em lote (excluir/editar) quando requisições estiverem selecionadas
- [x] Adicionar botões de editar e excluir na página de detalhes da requisição
- [x] Tornar timeline de fluxo clicável para atualizar status com confirmação

## Nova Funcionalidade (10/02/2026)
- [x] Implementar dialog de edição completo na página de detalhes (título, descrição, itens)
- [x] Criar endpoint update no backend para requisições
- [x] Adicionar validações e feedback visual durante edição

## Correções e Limpeza (10/02/2026)
- [x] Verificar e corrigir visibilidade do botão "Adicionar Cotação"
- [x] Limpar todas as cotações de teste do banco de dados
- [x] Limpar todos os fornecedores de teste do banco de dados

## Nova Funcionalidade (10/02/2026)
- [x] Adicionar endpoints update e delete para cotações no backend
- [x] Adicionar menu dropdown (chevron) em cada cotação com opções de editar e excluir
- [x] Implementar funcionalidade de editar cotação existente
- [x] Implementar funcionalidade de excluir cotação com confirmação

## Novas Funcionalidades - Autorizações (10/02/2026)
- [x] Atualizar schema de status: adicionar "aguardando_autorizacao" e renomear "autorizacao" para "autorizado"
- [x] Atualizar timeline de fluxo com novo status e ícone de pendência
- [x] Adicionar menu "Autorizações" na sidebar (visível apenas para admins)
- [x] Mostrar badge com contador de autorizações pendentes no menu
- [x] Criar página de Autorizações com listagem similar à de Compras
- [x] Adicionar botões de Aprovar (verde) e Rejeitar (vermelho) em cada requisição
- [x] Implementar dialog para motivo de rejeição (opcional)
- [x] Criar endpoints backend para aprovar e rejeitar requisições

## Correções e Melhorias - Autorizações (10/02/2026)
- [x] Corrigir contador de badge mostrando número incorreto quando não há pendências
- [x] Adicionar filtros/tabs na página de Autorizações (Pendentes, Autorizadas, Rejeitadas)

## Novas Funcionalidades (10/02/2026)
- [x] Adicionar campo de observações ao aprovar requisições
- [x] Implementar busca por número/título nas tabs de autorizações
- [x] Adicionar ordenação por data nas tabs de autorizações
- [x] Adicionar campo "Local de Uso" no formulário de requisição (dropdown: Obra Comil, Fabrica, Administrativo)
- [x] Criar menu dropdown "Base de Dados" na sidebar (apenas admins)
- [x] Mover "Fornecedores" e "Equipamentos" para dentro do dropdown "Base de Dados"
- [x] Criar página "Itens" para cadastro de itens
- [x] Criar página "Obras" para cadastro de obras

## Correção Urgente (11/02/2026)
- [x] Remover toda lógica de criação automática de fornecedores de teste
- [x] Remover toda lógica de criação automática de cotações de teste
- [x] Remover toda lógica de criação automática de arquivos de teste
- [x] Limpar banco de dados de todos os dados de teste existentes

## Nova Funcionalidade - Controle de Orçamento (11/02/2026)
- [x] Adicionar campo "valor máximo" por item nas requisições (apenas admins podem definir)
- [x] Exibir valor máximo para compradores ao adicionar cotações
- [x] Calcular automaticamente "valor economizado" quando cotação for menor que máximo
- [x] Armazenar economia por usuário (comprador que conseguiu o melhor preço)
- [x] Criar tabela de economias no banco de dados
- [x] Preparar dados de economia para exibição futura no módulo de relatórios

## Módulo de Relatórios (11/02/2026)

### Dashboard de Economias
- [x] Criar endpoint para ranking de compradores por economia total
- [x] Criar endpoint para gráfico de evolução mensal de economias
- [x] Criar endpoint para top 10 itens com maior economia
- [x] Implementar página Dashboard de Economias com cards de métricas
- [x] Adicionar gráfico de barras para evolução temporal
- [x] Adicionar tabela de ranking de compradores

### Sistema de Alertas de Orçamento
- [x] Criar tabela budget_alerts no schema para registrar alertas
- [x] Adicionar validação no endpoint de cotações para detectar excesso
- [x] Criar endpoint para aprovar/rejeitar cotações com orçamento excedido
- [x] Implementar alertas automáticos quando orçamento for excedido
- [x] Criar página de Alertas de Orçamento para diretores
- [x] Criar interface para diretores aprovarem/rejeitarem alertas

### Relatório por Obras
- [x] Adicionar campo projectId (obra) nas requisições
- [x] Criar endpoint para listar economias filtradas por obra
- [x] Criar endpoint para calcular economia total por obra
- [x] Implementar página de Relatório de Obras
- [x] Adicionar métricas de economia por obra
- [x] Adicionar análise de performance por projeto

### Módulo de Relatórios Gerais
- [x] Criar página principal de Relatórios no menu
- [x] Adicionar cards de acesso rápido aos relatórios
- [x] Criar relatório de requisições por status
- [x] Criar relatório de fornecedores mais utilizados
- [x] Adicionar métricas de performance de compras
- [x] Adicionar indicadores de taxa de conclusão e aprovação
- [ ] Adicionar exportação para PDF e Excel (futura melhoria)

## Bug Reportado (11/02/2026)
- [x] Corrigir menu dropdown de Estoque na sidebar que não está funcionando

## Nova Funcionalidade - Importação de Estoque (11/02/2026)
- [x] Analisar estrutura da planilha Excel de estoque
- [x] Criar script de importação dividindo: abas "peças - bonpland" e "peças - lang" → Peças Finalizadas, demais abas → Estoque Interno
- [x] Adicionar botão de importação na página de Peças Finalizadas
- [x] Adicionar botão de importação na página de Estoque Interno
- [x] Criar endpoint backend para processar upload e importação
- [x] Implementar processamento automático de Excel com xlsx

## Bug Crítico - Importação (11/02/2026)
- [x] Adicionar campo stockType ao schema de items para diferenciar tipos de estoque
- [x] Atualizar importação para definir stockType ('finished_pieces' ou 'internal_stock')
- [x] Adicionar filtro por stockType nas queries de listagem
- [x] Limpar dados duplicados do banco após correção

## Nova Funcionalidade - Dialog de Progresso (11/02/2026)
- [x] Criar dialog de progresso com barra de carregamento
- [x] Adicionar contador de itens processados/total
- [x] Implementar botão de cancelar importação
- [x] Integrar dialog nas páginas de Peças Finalizadas e Estoque Interno

## Módulo Financeiro (12/02/2026)

### Permissões
- [x] Adicionar role "financeiro" ao schema de usuários
- [x] Aplicar migração para adicionar role financeiro

### Estrutura de Dados
- [x] Criar tabela de recebimentos (payments_received)
  - Campos: id, projectId, valor, parcela, dataPrevista, dataRecebimento, comprovante (S3 URL), observacoes, createdBy, createdAt
- [x] Criar tabela de pagamentos (payments_made) para futura implementação
  - Campos: id, fornecedorId, requisitionId, valor, dataPrevista, dataPagamento, comprovante, observacoes

### Backend
- [x] Criar endpoints CRUD para recebimentos
- [x] Criar endpoint para resumo de recebimentos por obra
- [x] Criar endpoint para upload de comprovantes
- [x] Implementar cálculo de totais (recebido vs previsto)

### Frontend - Recebimentos
- [x] Criar página de Recebimentos com listagem por obra
- [x] Implementar dialog de cadastro de recebimento
- [x] Adicionar campo de upload de comprovante
- [x] Criar card de resumo por obra (total previsto, recebido, pendente)
- [x] Implementar filtros por obra e período

### Frontend - Pagamentos
- [x] Criar página de Pagamentos (placeholder para futura implementação)

### Menu e Navegação
- [x] Adicionar menu dropdown "Financeiro" na sidebar
- [x] Adicionar submenu "Recebimentos"
- [x] Adicionar submenu "Pagamentos"
- [x] Restringir acesso ao role financeiro e director


## Melhoria de UX - Menu Dashboard (12/02/2026)
- [x] Transformar Dashboard em item clicável com dropdown
- [x] Mover Dashboard de Manutenções para submenu do Dashboard
- [x] Mover Relatório Manutenções para submenu de Relatórios
- [x] Implementar lógica: clicar no item vai para página, clicar na setinha abre dropdown
- [x] Restringir submenus específicos apenas para diretores


## Formatação de Campos (12/02/2026)
- [x] Criar componentes de input com máscaras (CNPJ, CPF, telefone, CEP, moeda)
- [x] Atualizar campos de CNPJ em Fornecedores e outros formulários
- [x] Atualizar campos de telefone com seletor de código de país (+55, etc)
- [ ] Atualizar campos de CPF se existirem
- [ ] Atualizar campos de CEP se existirem
- [ ] Garantir formatação monetária consistente (R$ 1.250,43)
- [ ] Adicionar validação de CNPJ/CPF


## Bugs Críticos (12/02/2026)
- [x] Tabelas de chat não existem no banco de dados (chats, chat_participants, messages)
- [x] Procedure "system.me" não existe - deve ser "auth.me" na página de chat
- [x] Menu inteligente de Dashboard/Relatórios foi sobrescrito pelo commit do chat
- [x] Restaurar lógica: clicar no item navega, clicar na setinha abre dropdown
- [x] Restaurar submenu de Dashboard com "Dashboard Manutenções" (só diretores)
- [x] Restaurar submenu de Relatórios com "Relatório Manutenções" (só diretores)


## Bug Chat (12/02/2026)
- [x] Busca de usuários no chat não funciona (não mostra usuários existentes)
- [x] Verificar endpoint de listagem de usuários
- [x] Corrigir lógica de busca na página de chat
- [x] Criar endpoint público listForChat (protectedProcedure) que retorna apenas id, name e email


## Aplicar Máscaras nas Páginas de Compras (12/02/2026)
- [x] Aplicar CurrencyInput no campo maxPrice em PurchasesMaintenance
- [x] Aplicar CurrencyInput no campo maxPrice em PurchasesAdministration
- [x] Aplicar CurrencyInput no campo maxPrice em PurchasesFactory


## Melhorias Solicitadas (12/02/2026)

### Passo 1: Aplicar máscaras nas demais páginas
- [x] Identificar campos monetários em Requisições
- [x] Identificar campos monetários em Recebimentos (não existe página ainda)
- [x] Aplicar CurrencyInput no campo maxPrice em Requisitions

### Passo 2: Adicionar validação de CNPJ/CPF
- [x] Implementar algoritmo de validação de CNPJ no componente CNPJInput
- [x] Implementar algoritmo de validação de CPF no componente CPFInput
- [x] Adicionar feedback visual de validação (borda verde=válido, vermelha=inválido)
- [x] Adicionar prop showValidation para ativar feedback visual

### Passo 3: Corrigir 57 erros TypeScript
- [x] Corrigir erros 'database possibly null' em server/routers.ts (19 erros corrigidos)
- [x] Corrigir campos incorretos em Maintenances (type → maintenanceType, completedDate → performedDate)
- [x] Reduzir erros de 59 para 26 (33 erros corrigidos no total)
- [ ] Erros restantes (26): clientName/code não existem no schema, conversões de tipo CurrencyInput
