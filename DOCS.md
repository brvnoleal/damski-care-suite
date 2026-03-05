# 📄 Documentação Acadêmica — Damski Odonto

## Projeto Integrador: Desenvolvimento Web com Banco de Dados e Controle de Versão

---

## 1. Introdução

O presente documento descreve o desenvolvimento do sistema **Damski Odonto**, uma aplicação web do tipo SaaS (Software as a Service) para gestão de clínicas odontológicas. O projeto foi desenvolvido como parte do componente curricular **Projeto Integrador**, integrando conhecimentos de desenvolvimento web, banco de dados relacional e controle de versão.

O sistema aborda problemas reais enfrentados por clínicas odontológicas, como o gerenciamento de pacientes, profissionais, agendamentos, controle financeiro e rastreabilidade de insumos, aplicando conceitos de engenharia de software em um cenário prático.

---

## 2. Objetivo Geral

Desenvolver uma aplicação web funcional para gestão de clínicas odontológicas, utilizando tecnologias modernas de desenvolvimento frontend, banco de dados relacional PostgreSQL e controle de versão com Git/GitHub, atendendo aos requisitos acadêmicos de um Projeto Integrador.

---

## 3. Objetivos Específicos

- Implementar uma interface de usuário moderna e responsiva utilizando React e TypeScript
- Projetar e documentar um banco de dados relacional com no mínimo 5 tabelas interrelacionadas
- Implementar operações CRUD (Create, Read, Update, Delete) completas para as entidades principais
- Organizar o código-fonte seguindo padrões de arquitetura em camadas (Model-View-Controller)
- Utilizar controle de versão Git com estratégia de branches por funcionalidade
- Documentar tecnicamente o projeto para apresentação acadêmica

---

## 4. Justificativa

Clínicas odontológicas lidam com um volume significativo de informações: dados de pacientes, histórico de procedimentos, controle de estoque de insumos, agendamentos e gestão financeira. A ausência de um sistema integrado resulta em:

- **Perda de dados**: Registros em papel ou planilhas descentralizadas
- **Ineficiência operacional**: Agendamentos conflitantes, falta de controle de estoque
- **Risco regulatório**: Não conformidade com exigências sanitárias (RDC 1.002/2025)
- **Perda financeira**: Falta de visibilidade sobre faturamento e despesas

A digitalização desses processos por meio de uma aplicação web resolve esses problemas de forma escalável e acessível.

---

## 5. Metodologia de Desenvolvimento

### 5.1 Abordagem

O projeto adotou uma abordagem **iterativa e incremental**, onde cada módulo foi desenvolvido, testado e integrado progressivamente ao sistema. As etapas seguiram o ciclo:

1. **Análise de Requisitos** — Levantamento das funcionalidades necessárias
2. **Modelagem** — Definição do schema do banco de dados e DER
3. **Implementação** — Desenvolvimento das telas, serviços e tipos
4. **Testes** — Validação funcional das operações CRUD
5. **Documentação** — Registro técnico e acadêmico

### 5.2 Ferramentas Utilizadas

| Ferramenta | Propósito |
|---|---|
| VS Code / Lovable Editor | IDE de desenvolvimento |
| Git / GitHub | Controle de versão |
| Vite | Build tool e dev server |
| React DevTools | Depuração de componentes |
| PostgreSQL | SGBD relacional |

### 5.3 Arquitetura em Camadas

```
┌─────────────────────────────────────────────────┐
│                  CAMADA DE VISÃO (View)          │
│         React Components / Pages (.tsx)          │
├─────────────────────────────────────────────────┤
│               CAMADA DE SERVIÇO (Controller)     │
│          Services (pacienteService, etc.)         │
├─────────────────────────────────────────────────┤
│               CAMADA DE MODELO (Model)           │
│         Types (interfaces TypeScript)            │
├─────────────────────────────────────────────────┤
│               CAMADA DE DADOS (Data)             │
│     Mock Data / PostgreSQL (via API futura)       │
└─────────────────────────────────────────────────┘
```

---

## 6. Modelagem do Banco de Dados

### 6.1 Diagrama Entidade-Relacionamento

O DER completo está disponível em [`docs/database/DER.md`](docs/database/DER.md).

### 6.2 Tabelas

| # | Tabela | PK | FKs | Descrição |
|---|---|---|---|---|
| 1 | `paciente` | `id (UUID)` | — | Cadastro de pacientes |
| 2 | `dentista` | `id (UUID)` | — | Cadastro de dentistas |
| 3 | `agendamento` | `id (UUID)` | `paciente_id`, `dentista_id` | Consultas agendadas |
| 4 | `procedimento` | `id (UUID)` | — | Catálogo de procedimentos |
| 5 | `pagamento` | `id (UUID)` | `agendamento_id` | Registros financeiros |

### 6.3 Integridade Referencial

- Chaves estrangeiras com `ON DELETE CASCADE`
- Constraints `CHECK` para validação de domínio (status, forma_pagamento)
- Campos `UNIQUE` para CPF e CRO
- Campos `NOT NULL` para dados obrigatórios
- Timestamps automáticos (`created_at`, `updated_at`)

### 6.4 Script SQL

O script completo de criação está em [`docs/database/schema.sql`](docs/database/schema.sql).

---

## 7. Tecnologias Utilizadas

### 7.1 Frontend

- **React 18**: Biblioteca JavaScript para construção de interfaces reativas baseadas em componentes
- **TypeScript**: Superset do JavaScript que adiciona tipagem estática, melhorando a manutenibilidade
- **Vite**: Ferramenta de build moderna com Hot Module Replacement (HMR) para desenvolvimento ágil
- **Tailwind CSS**: Framework CSS utilitário que permite estilização rápida e consistente
- **shadcn/ui**: Coleção de componentes acessíveis baseados em Radix UI
- **React Router DOM**: Biblioteca de roteamento para SPAs, gerenciando navegação client-side
- **Recharts**: Biblioteca de gráficos para React, usada nos dashboards financeiros

### 7.2 Banco de Dados

- **PostgreSQL 15+**: SGBD relacional open-source, escolhido por sua robustez e conformidade SQL

### 7.3 Controle de Versão

- **Git**: Sistema de controle de versão distribuído
- **GitHub**: Plataforma de hospedagem de repositórios com colaboração

## 8. Integrações e APIs Externas

### 8.1 API ViaCEP

O sistema integra a API pública **ViaCEP** (https://viacep.com.br) para preenchimento automático de endereços a partir do CEP informado pelo usuário. A integração funciona da seguinte forma:

- **Endpoint utilizado**: `GET https://viacep.com.br/ws/{cep}/json/`
- **Formato de resposta**: JSON contendo logradouro, bairro, cidade e UF
- **Fluxo de uso**: Ao digitar um CEP válido (8 dígitos) no cadastro de dentistas, o sistema realiza uma requisição assíncrona à API e preenche automaticamente os campos de endereço
- **Tratamento de erros**: CEPs inválidos ou inexistentes são tratados com feedback visual ao usuário
- **Benefício**: Reduz erros de digitação e agiliza o cadastro, melhorando a experiência do usuário

A utilização de uma API REST externa demonstra a capacidade do sistema de se integrar com serviços de terceiros, um requisito comum em aplicações web modernas.

---

## 9. Design System — Liquid Glass

### 9.1 Conceito Visual

O projeto adota o conceito de design **Liquid Glass** (Glassmorphism), uma tendência moderna de UI que simula superfícies de vidro translúcido com efeitos de desfoque. Essa abordagem proporciona uma interface elegante, com profundidade visual e hierarquia clara entre os elementos.

### 9.2 Características Técnicas

| Propriedade | Implementação |
|---|---|
| Transparência | `background: rgba(255, 255, 255, 0.45)` com variações de intensidade |
| Desfoque | `backdrop-filter: blur(16px)` e `blur(24px)` para elementos de destaque |
| Bordas | Bordas semi-transparentes (`rgba(255, 255, 255, 0.5)`) para efeito de borda luminosa |
| Sombras | Sombras suaves e difusas (`0 8px 32px rgba(0, 0, 0, 0.06)`) |
| Fundo gradiente | Gradientes radiais multicamada em Indigo, Verde e Dourado como base da aplicação |

### 9.3 Tokens Semânticos (Design Tokens)

O sistema de cores é implementado inteiramente via **CSS Custom Properties (variáveis CSS)** em formato HSL, consumidas pelo Tailwind CSS através do arquivo `tailwind.config.ts`. Isso garante:

- **Consistência**: Todas as cores são referenciadas por tokens semânticos (`--primary`, `--background`, `--muted`, etc.)
- **Tematização**: Suporte nativo a modo escuro (dark mode) com troca automática de paleta
- **Manutenibilidade**: Alterações de cor propagam-se automaticamente por toda a aplicação

### 9.4 Tipografia

| Uso | Fonte | Pesos |
|---|---|---|
| Títulos (display) | Plus Jakarta Sans | 600 (semibold), 700 (bold) |
| Corpo (body) | IBM Plex Sans | 400 (regular), 500 (medium) |

### 9.5 Animações

A biblioteca **Framer Motion** é utilizada para animações de entrada (mount animations) nos componentes, incluindo:

- **Fade-in com deslocamento vertical**: Elementos surgem de baixo para cima com opacidade progressiva
- **Scale-in**: Componentes expandem suavemente ao aparecer
- **Stagger**: Animações coordenadas em listas, onde cada item aparece com um pequeno atraso em relação ao anterior
- **Transições suaves**: Curvas de easing personalizadas (`cubic-bezier`) para naturalidade no movimento

---

## 10. Funcionalidades Implementadas

### 8.1 CRUD de Pacientes
- ✅ Criar paciente (formulário com validação)
- ✅ Listar pacientes (tabela com busca)
- ✅ Editar paciente (modal de edição)
- ✅ Excluir paciente (confirmação de exclusão)

### 8.2 CRUD de Dentistas
- ✅ Criar dentista
- ✅ Listar dentistas
- ✅ Editar dentista
- ✅ Excluir dentista

### 8.3 CRUD de Consultas (anteriormente Agendamentos)
- ✅ Criar consulta (com seleção de paciente, dentista e procedimento odontológico)
- ✅ Listar consultas (tabela com coluna de procedimento)
- ✅ Editar consulta (alterar procedimento, data, horário)
- ✅ Cancelar/Excluir consulta
- ✅ Campo Procedimento com tipos específicos: Limpeza, Restauração, Extração, Tratamento de Canal, Clareamento, Ortodontia, Implante, Prótese, Avaliação, Retorno, Urgência

### 8.4 Módulos Complementares
- Dashboard com KPIs e alertas
- Controle de insumos com rastreabilidade
- Painel financeiro com gráficos
- Configurações de sistema

---

## 9. Conclusão

O projeto **Damski Odonto** atingiu os objetivos propostos, resultando em uma aplicação web funcional que demonstra a integração entre desenvolvimento frontend moderno, modelagem de banco de dados relacional e práticas de controle de versão.

As principais entregas incluem:

1. **Aplicação web responsiva** com 10 telas funcionais
2. **Banco de dados relacional** com 5 tabelas, chaves primárias/estrangeiras e integridade referencial
3. **Operações CRUD completas** para Pacientes, Dentistas e Agendamentos
4. **Arquitetura em camadas** (Model-View-Controller) documentada
5. **Controle de versão** com Git e estratégia de branches
6. **Documentação técnica e acadêmica** completa

O sistema está preparado para evolução futura, incluindo integração com backend PostgreSQL real (via Lovable Cloud), autenticação de usuários e deployment em ambiente de produção.

---

*Documento gerado como parte do Projeto Integrador — Desenvolvimento Web com Banco de Dados e Controle de Versão*
