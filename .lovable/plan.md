## Objetivo
Substituir todas as ocorrências de "Damski Odonto" / "Damski" por "SaaS Odonto" em todo o sistema (UI, documentação, dados mock, banco e migrations).

## Alterações por arquivo

**UI / Frontend**
- `index.html`: `<title>`, `og:title`, `twitter:title` → "SaaS Odonto".
- `src/components/AppLayout.tsx` (linha 145): logo/título do sidebar → "SaaS Odonto".
- `src/types/index.ts` (linha 2): comentário de cabeçalho → "SaaS Odonto".
- `src/pages/Fiscalizacao.tsx` (linhas 92, 94, 95): trocar "Dra. Damski" por "Dra. Amanda" no log de auditoria mock.
- `src/data/mockDentistas.ts`: renomear "Dra. Amanda Damski" → "Dra. Amanda Costa" e e-mails `@damski.com` → `@saasodonto.com`.

**Documentação**
- `README.md`: título e instrução `cd damski-odonto` → "SaaS Odonto" / `cd saas-odonto`.
- `DOCS.md`: título acadêmico e referências ao nome do sistema.
- `docs/database/DER.md` e `docs/database/schema.sql`: cabeçalhos.

**Banco de dados (Supabase)**
- Nova migration `UPDATE public.dentistas` para:
  - `nome = 'Dra. Amanda Costa'` onde `nome = 'Dra. Amanda Damski'`.
  - `email = replace(email, '@damski.com', '@saasodonto.com')`.
- A migration histórica `20260309143824_*.sql` permanece intacta (não se reescreve histórico de migrations); o UPDATE corrige os dados atuais.

**Memória do projeto**
- Atualizar `mem://index.md`: substituir "Damski Odonto" por "SaaS Odonto" na linha de Client & Context (Core).

## Itens fora de escopo
- Nome do projeto Supabase, URLs publicadas (`projetoa2026s1n4.lovable.app`) e ID do projeto não são alterados.
- Logo "D" no AppLayout é mantido (inicial de "Odonto"? — opcional trocar para "S"). Posso trocar para "S" se confirmar.
