# Damski Odonto — Sistema de Gestão Odontológica

## 📋 Descrição

Sistema SaaS de gestão para clínicas odontológicas, desenvolvido como **Projeto Integrador** de desenvolvimento web com banco de dados e controle de versão. O sistema contempla gerenciamento de pacientes, dentistas, agendamentos, insumos, financeiro e conformidade regulatória.

## 🎯 Objetivo

Fornecer uma solução completa para administração de clínicas odontológicas, com foco em:
- Gerenciamento de prontuários eletrônicos
- Controle de agendamentos e consultas
- Rastreabilidade de insumos
- Gestão financeira
- Conformidade com regulamentações sanitárias

## 🛠️ Tecnologias Utilizadas

| Tecnologia | Função |
|---|---|
| **React 18** | Biblioteca de UI (interface do usuário) |
| **TypeScript** | Linguagem de programação com tipagem estática |
| **Vite** | Bundler e servidor de desenvolvimento |
| **Tailwind CSS** | Framework CSS utilitário para estilização |
| **shadcn/ui** | Biblioteca de componentes (baseada em Radix UI) |
| **React Router DOM** | Roteamento SPA (Single Page Application) |
| **Recharts** | Visualização de dados e gráficos |
| **PostgreSQL** | Banco de dados relacional (schema documentado) |
| **Git / GitHub** | Controle de versão |

> **Nota:** Este projeto é uma SPA (Single Page Application) construída com React. Não utiliza framework full-stack (Next.js, Angular, etc.). O React atua como a camada de apresentação (View) da arquitetura.

## 🏗️ Arquitetura

O projeto segue uma **arquitetura em camadas** inspirada no padrão MVC:

```
src/
├── types/              # Camada de Modelo (Model) — Tipos TypeScript
│   └── index.ts        # Interfaces: Paciente, Dentista, Agendamento, etc.
│
├── data/               # Camada de Dados — Mock data (substituível por API)
│   ├── mockPacientes.ts
│   ├── mockDentistas.ts
│   └── mockAgendamentos.ts
│
├── services/           # Camada de Serviço (Controller) — Lógica de negócio
│   ├── pacienteService.ts    # CRUD de Pacientes
│   ├── dentistaService.ts    # CRUD de Dentistas
│   └── agendamentoService.ts # CRUD de Agendamentos
│
├── pages/              # Camada de Visão (View) — Páginas/Telas
│   ├── Dashboard.tsx
│   ├── Pacientes.tsx         # CRUD completo
│   ├── PacienteDetalhe.tsx
│   ├── Dentistas.tsx         # CRUD completo
│   ├── Agendamentos.tsx      # CRUD completo
│   ├── Sessoes.tsx
│   ├── Insumos.tsx
│   ├── Financeiro.tsx
│   ├── Fiscalizacao.tsx
│   ├── Configuracoes.tsx
│   └── NotFound.tsx
│
├── components/         # Componentes reutilizáveis
│   ├── AppLayout.tsx         # Layout principal com sidebar
│   ├── StatCard.tsx
│   ├── AlertCard.tsx
│   ├── NavLink.tsx
│   └── ui/                   # Componentes shadcn/ui
│
├── hooks/              # Custom hooks
├── lib/                # Utilitários
├── App.tsx             # Roteamento principal
├── main.tsx            # Entry point
└── index.css           # Design system (tokens CSS)

docs/
└── database/
    ├── schema.sql      # Script SQL de criação das tabelas
    └── DER.md          # Diagrama Entidade-Relacionamento
```

## 🗄️ Modelagem do Banco de Dados

### Tabelas

| Tabela | Descrição | Chave Primária |
|---|---|---|
| `paciente` | Cadastro de pacientes | `id (UUID)` |
| `dentista` | Cadastro de dentistas | `id (UUID)` |
| `agendamento` | Agendamentos de consultas | `id (UUID)` |
| `procedimento` | Catálogo de procedimentos | `id (UUID)` |
| `pagamento` | Registros de pagamento | `id (UUID)` |

### Relacionamentos

- **Paciente → Agendamento** (1:N) — Um paciente pode ter vários agendamentos
- **Dentista → Agendamento** (1:N) — Um dentista pode ter vários agendamentos
- **Agendamento → Pagamento** (1:N) — Um agendamento pode gerar vários pagamentos

### Arquivos de Referência

- Script SQL: [`docs/database/schema.sql`](docs/database/schema.sql)
- Diagrama DER: [`docs/database/DER.md`](docs/database/DER.md)

## ⚙️ Fluxo de Funcionamento

```
Usuário → React Router → Página (View)
                            ↓
                      Service (Controller)
                            ↓
                      Data Layer (Model)
                            ↓
                      Mock Data / Banco PostgreSQL
```

1. O usuário navega pelas rotas da aplicação
2. A página correspondente é renderizada
3. Operações CRUD chamam a camada de serviço
4. A camada de serviço abstrai o acesso aos dados
5. Atualmente usa dados mock; preparado para integração com PostgreSQL

## 🚀 Instalação e Execução

### Pré-requisitos

- Node.js 18+ instalado ([instalar com nvm](https://github.com/nvm-sh/nvm))
- npm ou bun como gerenciador de pacotes

### Passos

```bash
# 1. Clonar o repositório
git clone <URL_DO_REPOSITORIO>

# 2. Acessar a pasta do projeto
cd damski-odonto

# 3. Instalar dependências
npm install

# 4. Iniciar o servidor de desenvolvimento
npm run dev

# 5. Acessar no navegador
# http://localhost:5173
```

### Scripts Disponíveis

| Script | Comando | Descrição |
|---|---|---|
| Desenvolvimento | `npm run dev` | Inicia servidor com hot-reload |
| Build | `npm run build` | Gera build de produção |
| Preview | `npm run preview` | Preview do build de produção |
| Testes | `npm run test` | Executa testes automatizados |
| Lint | `npm run lint` | Verifica qualidade do código |

## 📱 Telas do Sistema

| Tela | Rota | Funcionalidade |
|---|---|---|
| Dashboard | `/` | Visão geral com KPIs e alertas |
| Pacientes | `/pacientes` | CRUD completo de pacientes |
| Detalhe Paciente | `/pacientes/:id` | Prontuário detalhado |
| Dentistas | `/dentistas` | CRUD completo de dentistas |
| Agendamentos | `/agendamentos` | CRUD completo de agendamentos |
| Sessões | `/sessoes` | Registro de evoluções clínicas |
| Insumos | `/insumos` | Controle de estoque e validade |
| Financeiro | `/financeiro` | Faturamento, despesas e gráficos |
| Fiscalização | `/fiscalizacao` | Modo auditoria e conformidade |
| Configurações | `/configuracoes` | Controle de acesso e segurança |

## 🔀 Controle de Versão

### Estratégia de Branches

```
main                    ← Branch principal (produção)
├── feature/pacientes   ← CRUD de pacientes
├── feature/dentistas   ← CRUD de dentistas
├── feature/agendamentos← CRUD de agendamentos
├── feature/financeiro  ← Módulo financeiro
└── feature/docs        ← Documentação
```

### Convenção de Commits

```
feat: adiciona CRUD de pacientes
feat: implementa página de dentistas
feat: cria módulo de agendamentos
docs: adiciona documentação acadêmica
refactor: reorganiza arquitetura em camadas
```

## 👤 Autor

**Projeto Integrador — Desenvolvimento Web**

---
