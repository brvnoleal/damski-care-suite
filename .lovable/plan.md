
## Odontograma Interativo

Nova aba "Odontograma" dentro de `PacienteDetalhe`, ao lado de "Detalhes". Apresenta a arcada FDI completa (permanente e decíduo), com cores de status por dente e popup de tratamento ao clicar.

### 1. Estrutura de UI

**Aba nova em `src/pages/PacienteDetalhe.tsx`**
- Adicionar `TabsTrigger value="odontograma"` ao lado de "Detalhes".
- Conteúdo: novo componente `<Odontograma pacienteId={...} />`.

**Componente `src/components/odontograma/Odontograma.tsx`**
- Toggle no topo: **Permanente (adulto)** | **Decíduo (infantil)**.
- Renderiza dois arcos (Superior / Inferior), numeração FDI por cima de cada dente.
- Permanente — quadrantes 1-4, dentes 11-18, 21-28, 31-38, 41-48.
- Decíduo — quadrantes 5-8, dentes 51-55, 61-65, 71-75, 81-85.
- Cada dente é um `<ToothSvg>` clicável.

**Componente `ToothSvg.tsx`**
- SVG estilizado por tipo (incisivo, canino, pré-molar, molar) — biblioteca interna de paths para ficar visualmente próximo de um odontograma real.
- Estados visuais (preenchimento do SVG):
  - **Cinza/branco** — sem tratamento
  - **Amarelo** (`hsl` token novo `--tooth-progress`) — em andamento
  - **Verde** (`--tooth-done`) — concluído
  - **X vermelho** sobreposto (`--tooth-removed`) — dente removido/ausente
- Cores HSL adicionadas em `index.css` + `tailwind.config.ts` seguindo o design system.

**Popup `ToothProcedureDialog.tsx`** (usa `ResponsiveDialog`)
Abre ao clicar em qualquer dente. Mostra histórico de procedimentos do dente + formulário:
- **Status do Procedimento** — Select: `pendente | em_andamento | concluido | removido`
- **Procedimento** — Select com lista: Restauração, Canal, Extração, Coroa, Implante, Limpeza, Selante, Clareamento, Aparelho, Prótese, Faceta, Bloco, Núcleo, Onlay/Inlay, Outro
- **Valor** — input BRL com máscara
- **Profissional** — Select de dentistas ativos (via `dentistaService`)
- **Observações** — Textarea
- Lista abaixo: histórico de procedimentos do dente (data, status, profissional), com editar/excluir.

A cor do dente no arco é derivada do procedimento **mais recente não cancelado**:
- Algum `removido` → X vermelho
- Senão último `em_andamento` → amarelo
- Senão último `concluido` → verde
- Senão neutro

### 2. Persistência (Supabase)

Migração nova com **uma tabela**:

```text
public.odontograma_procedimento
  id uuid pk
  paciente_id uuid not null
  dente smallint not null              -- código FDI (11..48, 51..85)
  status varchar not null              -- pendente|em_andamento|concluido|removido
  procedimento varchar not null
  valor numeric(10,2) not null default 0
  dentista_id uuid null
  observacoes text null
  data date not null default current_date
  created_at / updated_at timestamptz
```

- `GRANT` para `authenticated` e `service_role` (sem `anon`).
- RLS habilitada com as mesmas 4 policies por papel já usadas no projeto (admin/responsavel_tecnico full; recepcionista select/insert/update; delete só admin+RT).
- Trigger `update_updated_at_column` em UPDATE.
- Índice `(paciente_id, dente)`.

### 3. Camada de serviço

`src/services/odontogramaService.ts` (segue MVC):
- `listByPaciente(pacienteId)`
- `listByDente(pacienteId, dente)`
- `create(payload)` / `update(id, payload)` / `remove(id)`
- `getToothStatesMap(pacienteId)` → `Record<denteFDI, 'neutro'|'em_andamento'|'concluido'|'removido'>` para colorir os arcos.

Tipos em `src/types/index.ts`: `OdontogramaProcedimento`, `OdontogramaStatus`, `ProcedimentoOdonto`, mapa de labels.

### 4. Detalhes técnicos

- Constantes FDI em `src/lib/fdi.ts` (arrays por quadrante + tipo de dente).
- Sem dependências novas — SVG puro + Tailwind.
- Acessibilidade: cada dente é `<button>` com `aria-label="Dente 21"`.
- Mobile first: arcos em scroll-x horizontal abaixo de 640px; popup vira Drawer via `ResponsiveDialog`.
- Após criar a migração, regenerar tipos do Supabase automaticamente; depois implementar o código.

### Arquivos a criar/editar

Criar:
- `supabase/migrations/<timestamp>_odontograma.sql`
- `src/lib/fdi.ts`
- `src/services/odontogramaService.ts`
- `src/components/odontograma/Odontograma.tsx`
- `src/components/odontograma/ToothSvg.tsx`
- `src/components/odontograma/ToothProcedureDialog.tsx`

Editar:
- `src/pages/PacienteDetalhe.tsx` — nova aba.
- `src/types/index.ts` — novos tipos.
- `src/index.css` + `tailwind.config.ts` — tokens de cor de dente.
- `DOCS.md` — registrar módulo.
