# Redesign Visual — SaaS Odonto (Light Mode Clínico)

## Objetivo

Substituir totalmente o estilo atual (Liquid Glass / glassmorphism / dark mode futurista) por uma estética **SaaS médico moderno**, exclusivamente Light Mode, baseada na paleta:

```text
#06141B  #11212D  #253745  #4A5C6A  #9BA8AB  #CCD0CF
```

Nenhuma funcionalidade, rota, serviço, store, schema ou lógica de negócio será alterada.

---

## 1. Design tokens (`src/index.css`)

Reescrever completamente o `:root`:

- **Background geral**: branco puro (`#FFFFFF`) com `--muted` em cinza muito claro (~`#F5F6F6` derivado de `#CCD0CF`).
- **Foreground/headings**: `#06141B` e `#11212D`.
- **Primary**: `#253745` (botões, ícones ativos). Foreground branco.
- **Secondary / accent**: `#4A5C6A`.
- **Border / divisores**: `#9BA8AB` (em opacidades suaves para tabelas/cards).
- **Card / surface secundário**: branco com bordas `#CCD0CF`; áreas suaves usam tom de `#CCD0CF` clareado.
- **Sidebar**: fundo `#11212D` sólido, foreground claro, item ativo `#253745`. (Mantém boa hierarquia em SaaS médico; sem blur.) Alternativa: sidebar branca com texto escuro — decidir na implementação visual.
- **Success / warning / destructive / info**: manter semântica mas reduzidos a tons sóbrios e sólidos, sem neon.
- **Radius**: `0.5rem` (suavemente arredondado, não exagerado).
- **Shadows**: substituir `--glass-shadow` por sombras realistas suaves (`0 1px 2px rgba(6,20,27,0.06)`, `0 4px 12px rgba(6,20,27,0.08)`).
- **Remover** todas as variáveis `--glass-*`, `--gold*`, `--burgundy*` (não usadas após redesign) e a classe `.dark` inteira.
- **Remover** o background com gradientes radiais coloridos do `body`; usar `background: #FFFFFF`.
- Scrollbar: cinza neutro derivado de `#9BA8AB`.

## 2. Tailwind config (`tailwind.config.ts`)

- Remover `darkMode: ["class"]` (ou trocar por `darkMode: false`).
- Remover tokens `gold` e `burgundy` da paleta.
- Manter `success/warning/info/destructive` apontando para os novos HSLs.
- Manter fontes `Plus Jakarta Sans` (display) + `IBM Plex Sans` (body) — boas para área médica.

## 3. Componente Liquid Glass

`src/components/ui/liquid-glass.tsx` — substituir o conteúdo por um **wrapper sólido equivalente** (mesmo nome, mesma API/props) que renderiza um card branco com borda `#CCD0CF` e sombra suave. Mantém compatibilidade com todos os `LiquidGlassCard` espalhados pelas páginas (Dashboard, StatCard, etc.), sem precisar reescrever cada uso.

- Remover camadas de blur, gradientes translúcidos, inner highlights.
- Manter `motion` apenas para hover/tap sutis (escala leve), sem brilho.

## 4. Layout principal (`src/components/AppLayout.tsx`)

- Remover SVG filter (`sidebar-glass-distortion`), camadas backdrop-blur, gradientes translúcidos.
- Remover toggle de Dark Mode (botão `Sun/Moon`, estado `darkMode`, `useEffect` de classe `dark`, `localStorage theme`).
- Sidebar: fundo sólido `#11212D` com itens em texto claro; ativo em `#253745`. Borda direita `#253745`.
- Header: fundo branco, borda inferior `#CCD0CF`, sombra inexistente ou `0 1px 0 #CCD0CF`.
- Overlay mobile: cinza neutro semi-opaco sem blur.
- Badge "RDC 1.002/2025" em outline sóbrio.

## 5. Páginas e componentes que tocam estilo

Varredura para remover classes/inline styles incompatíveis (sem mudar markup funcional):

- `src/pages/Dashboard.tsx`, `Pacientes.tsx`, `PacienteDetalhe.tsx`, `Dentistas.tsx`, `Agendamentos.tsx`, `Sessoes.tsx`, `Insumos.tsx`, `Financeiro.tsx`, `Fiscalizacao.tsx`, `Configuracoes.tsx`, `Index.tsx`, `NotFound.tsx`.
- `src/components/StatCard.tsx`, `AlertCard.tsx`, `WeeklyCalendar.tsx`, `NavLink.tsx`.
- Remover usos diretos de classes `glass`, `glass-strong`, `glass-hover`, `glass-sidebar`, `glass-header`, `shadow-gold`, `gradient-burgundy`, `gradient-gold`, `text-gold`, `bg-gold`, `border-gold`, `bg-burgundy*`.
- Substituir por tokens semânticos (`bg-card`, `bg-background`, `border-border`, `text-foreground`, `text-muted-foreground`, `bg-primary`).
- Substituir backgrounds escuros literais em páginas (se houver) por `bg-background` ou `bg-card`.

## 6. Componentes UI (shadcn)

Os componentes em `src/components/ui/*` já consomem tokens semânticos via `hsl(var(--...))`. **Não precisam ser alterados** — o redesign vem da nova paleta nos tokens. Verificação rápida apenas em `sidebar.tsx`, `sheet.tsx`, `dialog.tsx`, `card.tsx` para confirmar que nenhum estilo hardcoded de glass exista.

## 7. Tabelas, inputs, botões

Resultado esperado via tokens:
- **Botões primários**: `bg-primary` (`#253745`) texto branco, hover `#11212D`.
- **Botões secundários/ghost**: borda `#9BA8AB`, texto `#11212D`.
- **Inputs**: borda `#9BA8AB`, foco `ring #253745`, fundo branco.
- **Tabelas**: linhas separadas por `border-b #CCD0CF`, header em `#F5F6F6`, texto `#11212D`.
- **Cards**: fundo branco, borda `#CCD0CF`, sombra `0 1px 2px rgba(6,20,27,0.06)`.

## 8. O que NÃO será alterado

- Rotas (`src/App.tsx`), services, stores, hooks de negócio, schemas, RLS, integrações Supabase, Google Calendar iframe (apenas re-estilizar o wrapper, não o conteúdo do iframe).
- Estrutura de componentes/markup das páginas; apenas substituição de classes/estilos.
- Layout responsivo (mobile-first) é preservado.

## 9. Atualização de memória

Após o redesign, atualizar:
- `mem://style/visual-identity` — nova paleta, sem glass, sem dark mode.
- `mem://style/ui-legibility` — remover regra de opacidade-sobre-glass (não se aplica mais).
- `mem://index.md` — remover menção a "Liquid Glass" e dark mode no bloco Core.

---

## Ordem de execução

1. Reescrever `src/index.css` (tokens + remover `.dark` + body limpo + scrollbar neutra).
2. Ajustar `tailwind.config.ts` (remover darkMode + tokens não usados).
3. Substituir conteúdo de `liquid-glass.tsx` por wrapper sólido.
4. Reescrever `AppLayout.tsx` (sem glass, sem dark toggle).
5. Varredura `rg` por classes glass/gold/burgundy/dark: nas páginas e componentes, substituir por tokens semânticos.
6. Verificar visualmente Dashboard, Pacientes, Agendamentos, Financeiro.
7. Atualizar memórias.

## Decisão pendente (impacto baixo)

Sidebar: **escura** (`#11212D` com texto claro) — tradicional em SaaS médicos, boa hierarquia — **ou clara** (branca com texto `#11212D`, item ativo `#CCD0CF`)? Padrão sugerido: **escura**, pois o briefing pede "fundo geral branco" mas permite elementos de navegação em cores fortes da paleta. Caso prefira sidebar totalmente clara, ajusto antes de implementar.