# Planilha de Revisão de Permissões - Sistema Diarc

**Data:** 18/02/2026**Objetivo:** Definir permissões fixas para cada role (nível de usuário)

---

## 📋 Legenda

- ✅ **Acesso Total** - Pode visualizar E usar todos os botões (criar, editar, excluir)

- 👁️ **Apenas Visualizar** - Pode ver a página mas TODOS os botões ficam ocultos

- ❌ **Sem Acesso** - Não vê o módulo no menu

---

## 🎯 PARTE 1: O QUE APARECE NO MENU (Sidebar)

Esta tabela define **quais módulos aparecem no menu lateral** para cada usuário:

| Módulo no Menu | Diretor | Comprador | Almoxarife | Manutenção | Financeiro |
| --- | --- | --- | --- | --- | --- |
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| Compras | ✅ | ✅ | 👁️ | 👁️ | 👁️ |
| Autorizações | ✅ | ❌ | ❌ | ❌ | ❌ |
| Estoque | ✅ | 👁️ | ✅ | 👁️ | ❌ |
| Orçamentos | ✅ | ✅ | ❌ | ❌ | ❌ |
| Manutenções | ✅ | 👁️ | ❌ | ✅ | ❌ |
| Chat | ✅ | ✅ | ✅ | ✅ | ✅ |
| Financeiro | ✅ | 👁️ | ❌ | ❌ | ✅ |
| Relatórios | ✅ | ✅ | 👁️ | 👁️ | 👁️ |
| Configurações | ✅ | ✅ | ✅ | ✅ | ✅ |
| Gestão | ✅ | ❌ | ❌ | ❌ | ❌ |
| Banco de Dados | ✅ | ✅ | 👁️ | 👁️ | ❌ |

---

## 🔘 PARTE 2: BOTÕES DENTRO DE CADA MÓDULO

Esta tabela define **quais botões aparecem dentro de cada página**:

### 📦 Módulo: COMPRAS (Requisições)

**Página:** `/compras` (lista de requisições)

| Botão/Ação | Diretor | Comprador | Almoxarife | Manutenção | Financeiro |
| --- | --- | --- | --- | --- | --- |
| "Nova Requisição" | ✅ | ✅ | ❌ | ❌ | ❌ |
| "Editar" (em cada linha) | ✅ | ✅ | ❌ | ❌ | ❌ |
| "Excluir Selecionadas" | ✅ | ✅ | ❌ | ❌ | ❌ |
| "Adicionar Cotação" | ✅ | ✅ | ❌ | ❌ | ❌ |
| "Gerar Ordem de Compra" | ✅ | ✅ | ❌ | ❌ | ❌ |

---

### 📦 Módulo: AUTORIZAÇÕES

**Página:** `/autorizacoes` (requisições pendentes de aprovação)

| Botão/Ação | Diretor | Comprador | Almoxarife | Manutenção | Financeiro |
| --- | --- | --- | --- | --- | --- |
| "Aprovar" | ✅ | ❌ | ❌ | ❌ | ❌ |
| "Reprovar" | ✅ | ❌ | ❌ | ❌ | ❌ |

**Nota:** Apenas Diretor vê este módulo no menu.

---

### 📦 Módulo: ESTOQUE INTERNO

**Página:** `/estoque/interno`

| Botão/Ação | Diretor | Comprador | Almoxarife | Manutenção | Financeiro |
| --- | --- | --- | --- | --- | --- |
| "Novo Item" | ✅ | ❌ | ✅ | ❌ | ❌ |
| "Editar" | ✅ | ❌ | ✅ | ❌ | ❌ |
| "Excluir" | ✅ | ❌ | ✅ | ❌ | ❌ |
| "Ajustar Quantidade" | ✅ | ❌ | ✅ | ❌ | ❌ |

---

### 📦 Módulo: PEÇAS FINALIZADAS

**Página:** `/estoque/pecas-finalizadas`

| Botão/Ação | Diretor | Comprador | Almoxarife | Manutenção | Financeiro |
| --- | --- | --- | --- | --- | --- |
| "Novo Item" | ✅ | ❌ | ✅ | ❌ | ❌ |
| "Editar" | ✅ | ❌ | ✅ | ❌ | ❌ |
| "Excluir" | ✅ | ❌ | ✅ | ❌ | ❌ |

---

### 📦 Módulo: ORÇAMENTOS

**Página:** `/orcamentos`

| Botão/Ação | Diretor | Comprador | Almoxarife | Manutenção | Financeiro |
| --- | --- | --- | --- | --- | --- |
| "Novo Orçamento" | ✅ | ✅ | ❌ | ❌ | ❌ |
| "Editar" | ✅ | ✅ | ❌ | ❌ | ❌ |
| "Excluir" | ✅ | ✅ | ❌ | ❌ | ❌ |
| "Gerar PDF" | ✅ | ✅ | ❌ | ❌ | ❌ |

---

### 📦 Módulo: MANUTENÇÕES

**Página:** `/manutencoes`

| Botão/Ação | Diretor | Comprador | Almoxarife | Manutenção | Financeiro |
| --- | --- | --- | --- | --- | --- |
| "Nova Manutenção" | ✅ | ❌ | ❌ | ✅ | ❌ |
| "Editar" | ✅ | ❌ | ❌ | ✅ | ❌ |
| "Avançar Status" | ✅ | ❌ | ❌ | ✅ | ❌ |
| "Adicionar Anexo" | ✅ | ❌ | ❌ | ✅ | ❌ |

---

### 📦 Módulo: FINANCEIRO - Recebimentos

**Página:** `/financeiro/recebimentos`

| Botão/Ação | Diretor | Comprador | Almoxarife | Manutenção | Financeiro |
| --- | --- | --- | --- | --- | --- |
| "Novo Recebimento" | ✅ | ❌ | ❌ | ❌ | ✅ |
| "Editar" | ✅ | ❌ | ❌ | ❌ | ✅ |
| "Excluir" | ✅ | ❌ | ❌ | ❌ | ✅ |

---

### 📦 Módulo: FINANCEIRO - Pagamentos

**Página:** `/financeiro/pagamentos`

| Botão/Ação | Diretor | Comprador | Almoxarife | Manutenção | Financeiro |
| --- | --- | --- | --- | --- | --- |
| "Novo Pagamento" | ✅ | ❌ | ❌ | ❌ | ✅ |
| "Editar" | ✅ | ❌ | ❌ | ❌ | ✅ |
| "Excluir" | ✅ | ❌ | ❌ | ❌ | ✅ |

---

### 📦 Módulo: BANCO DE DADOS - Fornecedores

**Página:** `/fornecedores`

| Botão/Ação | Diretor | Comprador | Almoxarife | Manutenção | Financeiro |
| --- | --- | --- | --- | --- | --- |
| "Novo Fornecedor" | ✅ | ✅ | ❌ | ❌ | ❌ |
| "Editar" | ✅ | ✅ | ❌ | ❌ | ❌ |
| "Excluir" | ✅ | ✅ | ❌ | ❌ | ❌ |

---

### 📦 Módulo: BANCO DE DADOS - Equipamentos

**Página:** `/equipment`

| Botão/Ação | Diretor | Comprador | Almoxarife | Manutenção | Financeiro |
| --- | --- | --- | --- | --- | --- |
| "Novo Equipamento" | ✅ | ✅ | ❌ | ✅ | ❌ |
| "Editar" | ✅ | ✅ | ❌ | ✅ | ❌ |
| "Excluir" | ✅ | ✅ | ❌ | ✅ | ❌ |

---

### 📦 Módulo: BANCO DE DADOS - Locais

**Página:** `/locais`

| Botão/Ação | Diretor | Comprador | Almoxarife | Manutenção | Financeiro |
| --- | --- | --- | --- | --- | --- |
| "Novo Local" | ✅ | ✅ | ❌ | ✅ | ❌ |
| "Editar" | ✅ | ✅ | ❌ | ✅ | ❌ |
| "Excluir" | ✅ | ✅ | ❌ | ✅ | ❌ |

---

### 📦 Módulo: BANCO DE DADOS - Itens

**Página:** `/itens`

| Botão/Ação | Diretor | Comprador | Almoxarife | Manutenção | Financeiro |
| --- | --- | --- | --- | --- | --- |
| "Novo Item" | ✅ | ✅ | ❌ | ❌ | ❌ |
| "Editar" | ✅ | ✅ | ❌ | ❌ | ❌ |
| "Excluir" | ✅ | ✅ | ❌ | ❌ | ❌ |

---

### 📦 Módulo: BANCO DE DADOS - Obras

**Página:** `/obras`

| Botão/Ação | Diretor | Comprador | Almoxarife | Manutenção | Financeiro |
| --- | --- | --- | --- | --- | --- |
| "Nova Obra" | ✅ | ✅ | ❌ | ❌ | ❌ |
| "Editar" | ✅ | ✅ | ❌ | ❌ | ❌ |
| "Excluir" | ✅ | ✅ | ❌ | ❌ | ❌ |

---

### 📦 Módulo: GESTÃO - Usuários

**Página:** `/usuarios`

| Botão/Ação | Diretor | Comprador | Almoxarife | Manutenção | Financeiro |
| --- | --- | --- | --- | --- | --- |
| "Novo Usuário" | ✅ | ❌ | ❌ | ❌ | ❌ |
| "Editar" | ✅ | ❌ | ❌ | ❌ | ❌ |
| "Excluir" | ✅ | ❌ | ❌ | ❌ | ❌ |
| "Alterar Nível" | ✅ | ❌ | ❌ | ❌ | ❌ |

**Nota:** Apenas Diretor vê módulo Gestão no menu.

---

### 📦 Módulo: GESTÃO - Permissões

**Página:** `/permissoes`

| Botão/Ação | Diretor | Comprador | Almoxarife | Manutenção | Financeiro |
| --- | --- | --- | --- | --- | --- |
| "Configurar Permissões" | ✅ | ❌ | ❌ | ❌ | ❌ |
| "Salvar Alterações" | ✅ | ❌ | ❌ | ❌ | ❌ |

**Nota:** Apenas Diretor vê módulo Gestão no menu. Esta página será REMOVIDA após implementar permissões fixas.

---

## 📝 Resumo por Role

### 👔 Diretor

- **Acesso:** TUDO (super admin)

- **Foco:** Aprovar autorizações, gerenciar usuários, visão geral de tudo

### 🛒 Comprador

- **Acesso:** Compras (total), Orçamentos (total), Banco de Dados (total), Financeiro (visualizar)

- **Foco:** Criar requisições, cotações, ordens de compra, gerenciar fornecedores

### 📦 Almoxarife

- **Acesso:** Estoque (total), Compras (visualizar)

- **Foco:** Gerenciar entrada/saída de peças, controlar estoque interno

### 🔧 Manutenção

- **Acesso:** Manutenções (total), Equipamentos e Locais (total), Compras (visualizar)

- **Foco:** Criar ordens de manutenção, gerenciar equipamentos, consultar estoque

### 💰 Financeiro

- **Acesso:** Financeiro (total), Compras (visualizar)

- **Foco:** Gerenciar recebimentos e pagamentos, consultar requisições para fluxo de caixa

---

## ❓ PERGUNTAS PARA VOCÊ REVISAR

Por favor, confirme ou corrija:

1. **Comprador** deve visualizar Financeiro? (para consultar fluxo de caixa ao fazer compras)

1. **Almoxarife** deve visualizar Compras? (para ver requisições de peças)

1. **Manutenção** deve criar/editar Equipamentos e Locais? (atualmente: ✅)

1. **Financeiro** deve visualizar Compras? (para ver requisições relacionadas a pagamentos)

1. **Relatórios** - todos devem apenas visualizar? (sem botões de criar/editar)

1. Faltou algum módulo ou botão importante?

---

**Após sua confirmação, vou implementar o sistema simplificado!**

