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
