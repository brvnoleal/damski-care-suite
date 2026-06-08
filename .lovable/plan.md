## Problema

A página pública `AnamnesePublica.tsx` lê `anamnese_token` e `clinica` direto pelo client anônimo. As RLS dessas tabelas só liberam `authenticated` do mesmo tenant, então o anon recebe `null` e a tela mostra "Clínica indisponível" / "Link inválido". Afeta tanto `/anamnese/:clinicaId` quanto `/anamnese/t/:token`.

Não vamos abrir SELECT anônimo nessas tabelas (vazaria lista de clínicas e tokens). A correção é resolver via edge function pública usando service_role.

## Mudanças

### 1. Nova edge function `anamnese-resolve` (verify_jwt=false, CORS)
Entrada: `{ clinica_id?: string, token?: string }` (exatamente um).

Lógica:
- Se `token`: busca em `anamnese_token` por `token`. Valida `used_at IS NULL` e `expires_at > now()`. Pega `clinica_id` e `paciente_id`.
- Se `clinica_id`: usa direto.
- Busca `clinica` por id; exige `status = 'ativo'`.
- Retorna `{ clinica_id, clinica_nome, paciente_id (ou null), origem: 'link_publico'|'link_individual' }`.
- Erros padronizados: `404 link_invalido`, `410 link_expirado | link_usado`, `404 clinica_indisponivel`.

### 2. `src/pages/AnamnesePublica.tsx`
- Remover as duas chamadas `supabase.from("anamnese_token")` e `supabase.from("clinica")` do bootstrap.
- Substituir pelo `supabase.functions.invoke("anamnese-resolve", { body: { token } })` ou `{ body: { clinica_id: clinicaParam } }`.
- Mapear códigos de erro para mensagens em pt-BR já existentes ("Link inválido", "Link expirado", "Este link já foi utilizado", "Clínica indisponível").

### 3. Sem mudanças em RLS, migrations ou nas outras edge functions
`anamnese-lookup-cpf`, `anamnese-validar-identidade` e `anamnese-submit` continuam iguais (já usam service_role e validam o token internamente).

## Verificação
- Abrir `/anamnese/:clinicaId` (link público) deslogado → carrega nome da clínica e formulário.
- Gerar link individual em Configurações, abrir em aba anônima → mesmo comportamento, pulando direto para a anamnese quando o token tem `paciente_id`.
- Token expirado/usado → mensagem específica.
