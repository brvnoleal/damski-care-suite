# Plano: Liquid Glass estilo Lovable (sistema inteiro, base clara)

Aplicar um efeito Liquid Glass sutil — translucidez + `backdrop-blur` + borda luminosa fina + sombra suave — em todo o sistema, **preservando** a paleta clara azul-acinzentada atual. Sem alterar nenhuma funcionalidade, rota, serviço ou regra de negócio.

## Referência visual (estilo Lovable)
- Superfícies brancas com ~70–80% de opacidade
- `backdrop-filter: blur(12–20px) saturate(140%)`
- Borda de 1px branca com leve luminosidade (`rgba(255,255,255,0.6)` interna + `border-border` externa)
- Sombra dupla: difusa baixa + halo sutil colorido
- Background da página com gradientes radiais decorativos muito suaves (manchas claras azul-acinzentadas) para o blur ter "o que borrar"

## Mudanças por arquivo

### 1. `src/index.css`
- Adicionar tokens glass:
  - `--glass-bg: 0 0% 100% / 0.72`
  - `--glass-bg-strong: 0 0% 100% / 0.85`
  - `--glass-border: 0 0% 100% / 0.6`
  - `--glass-blur: 16px`
  - `--shadow-glass: 0 8px 32px -8px rgba(37,55,69,0.12), 0 2px 8px -2px rgba(37,55,69,0.06)`
  - `--shadow-glass-hover`
- Adicionar gradientes radiais decorativos no `body` (manchas `#CCD0CF` e `#9BA8AB` muito diluídas, fixas no fundo) para criar profundidade sob o blur.
- Criar utilitários:
  - `.glass` — base translúcida + blur + borda
  - `.glass-strong` — variante mais opaca para conteúdo denso
  - `.glass-hover` — transição de elevação
  - `.glass-sidebar` — variante para sidebar (mais saturada, mantém legibilidade)
  - `.glass-header` — topbar fina translúcida

### 2. `src/components/ui/liquid-glass.tsx`
- Restaurar comportamento glass real: classe `.glass-strong` + `backdrop-blur` + borda luminosa + `shadow-glass`.
- Manter API atual (props ignoradas continuam ignoradas) — zero quebra nas páginas que já o usam.
- Hover sobe sombra suavemente.

### 3. `src/components/AppLayout.tsx`
- Sidebar: continua dark (`#11212D`) mas com `.glass-sidebar` (leve translucidez + blur) para coerência com o resto.
- Header: `bg-card/70 backdrop-blur-xl` + borda inferior translúcida.
- Mobile overlay: `bg-foreground/30 backdrop-blur-sm`.
- Popover de notificações ganha visual glass.

### 4. Componentes shadcn (apenas surfaces flutuantes)
Atualizar para usar glass nas superfícies que aparecem sobre o conteúdo:
- `popover.tsx`, `dropdown-menu.tsx`, `select.tsx`, `hover-card.tsx`, `context-menu.tsx`, `tooltip.tsx`, `dialog.tsx`, `alert-dialog.tsx`, `sheet.tsx`, `drawer.tsx`, `menubar.tsx`, `command.tsx`
- Trocar `bg-popover` / `bg-background` sólidos por classe `.glass-strong` (mantendo `text-popover-foreground`).

### 5. `src/components/ui/card.tsx`
- Adicionar variante glass por padrão: `bg-card/75 backdrop-blur-md border-white/60 shadow-glass` em vez de `bg-card shadow-sm` puro. Mantém tokens semânticos.

### 6. Páginas (`Dashboard`, `Pacientes`, `Dentistas`, `Agendamentos`, `Insumos`, `Financeiro`, `Configuracoes`, `PacienteDetalhe`, `Fiscalizacao`)
- Sem refatoração estrutural. As páginas já usam `LiquidGlassCard` / `Card` / classes semânticas → herdam o glass automaticamente das mudanças 2, 4 e 5.
- Varredura final por classes hardcoded `bg-white`, `bg-card` sólido que devam virar glass.

## Garantias
- **Zero mudanças** em rotas, serviços, stores, hooks, schemas, Supabase, RLS, edge functions, Google Calendar, lógica de negócio.
- Paleta atual preservada — apenas opacidade + blur adicionados sobre ela.
- Legibilidade mantida: textos críticos seguem em `text-foreground` 100%, glass nunca abaixo de 70% de opacidade em superfícies com texto.
- Performance: `backdrop-blur` apenas em superfícies elevadas (sidebar, header, cards, popovers) — não no `<main>`.

## Detalhe técnico (tokens glass)
```css
.glass {
  background: hsl(var(--card) / 0.72);
  backdrop-filter: blur(16px) saturate(140%);
  -webkit-backdrop-filter: blur(16px) saturate(140%);
  border: 1px solid hsl(0 0% 100% / 0.6);
  box-shadow: var(--shadow-glass);
}
.glass-strong {
  background: hsl(var(--card) / 0.88);
  backdrop-filter: blur(20px) saturate(150%);
  border: 1px solid hsl(0 0% 100% / 0.7);
  box-shadow: var(--shadow-glass);
}
```

## Arquivos a editar
`src/index.css`, `src/components/ui/liquid-glass.tsx`, `src/components/ui/card.tsx`, `src/components/AppLayout.tsx`, `src/components/ui/{popover,dropdown-menu,select,hover-card,context-menu,tooltip,dialog,alert-dialog,sheet,drawer,menubar,command}.tsx`.
