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

## Módulo de Compras
- [ ] Criar requisição de compra (item, quantidade, marca, observações)
- [ ] Adicionar múltiplas cotações de fornecedores para uma requisição
- [ ] Comparar preços lado a lado entre fornecedores
- [ ] Aprovar/autorizar compra (apenas diretor)
- [ ] Registrar pedido após aprovação
- [ ] Confirmar recebimento de pedido
- [ ] Visualizar status do fluxo completo

## Módulo de Orçamentos
- [ ] Criar orçamento com itens (nome, quantidade, marca, observações)
- [ ] Gerar PDF com dados da empresa (logo, CNPJ, endereço)
- [ ] Criar templates padrão de orçamento
- [ ] Listar e gerenciar orçamentos criados

## Módulo de Manutenções
- [ ] Cadastrar equipamentos e máquinas
- [ ] Agendar manutenção preventiva
- [ ] Agendar manutenção corretiva
- [ ] Registrar manutenção realizada manualmente
- [ ] Visualizar histórico completo por equipamento
- [ ] Listar próximas manutenções agendadas

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
