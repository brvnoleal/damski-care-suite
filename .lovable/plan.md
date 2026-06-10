## Problema

Em `src/services/documentoService.ts`, dentro de `emitir()`:

```ts
const { data: membro } = await supabase
  .from("clinica_membro")
  .select("clinica_id")
  .maybeSingle();
```

A query não filtra por `user_id`. Como `clinica_membro` pode conter várias linhas (vários usuários da mesma clínica ou o usuário em situações diversas), `.maybeSingle()` retorna `null` quando há mais de uma linha — disparando o erro "Clínica não identificada", mesmo com RLS ativo.

Outros pontos do app (ex.: `useClinicaContext`) já fazem corretamente: pegam `auth.getUser()` e filtram `clinica_membro` por `user_id`.

## Correção

Ajustar `documentoService.emitir` para obter a `clinica_id` de forma confiável:

1. Chamar `supabase.auth.getUser()`.
2. Buscar `clinica_membro` filtrando por `user_id = user.id` com `.maybeSingle()`.
3. Se ainda assim vier nulo, lançar mensagem mais clara ("Usuário sem clínica vinculada").

Alternativa equivalente (mesma correção, abordagem diferente): receber `clinicaId` como argumento de `emitir()` a partir do componente `DocumentosPacienteTab`, que já tem `useClinicaContext()`. Vou aplicar a opção 1 (autossuficiente no service) para não alterar a assinatura pública.

Nenhuma alteração de schema/RLS/edge function — apenas ~5 linhas em `documentoService.ts`.
