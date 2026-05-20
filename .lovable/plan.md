## Adicionar botão "Sair" na sidebar

**Arquivo:** `src/components/AppLayout.tsx`

1. Importar `LogOut` de `lucide-react`, `supabase` de `@/integrations/supabase/client` e `useNavigate` de `react-router-dom`.
2. Logo abaixo do item "Configurações" na `<nav>`, adicionar um `<button>` com o mesmo estilo dos links de navegação (ícone `LogOut` + label "Sair"), separado por um divisor sutil (`border-t border-sidebar-border`) para indicar ação distinta.
3. Ao clicar: chamar `await supabase.auth.signOut()` e em seguida `navigate("/login", { replace: true })`. Fechar a sidebar mobile no clique.

Sem alterações de schema, rotas ou backend.