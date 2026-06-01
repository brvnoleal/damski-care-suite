# Multi-tenant: isolamento por clínica

## Arquitetura

```text
auth.users ──┐
             │
             ▼
       clinica_membro ───► clinica (tenant)
        (user_id,            (id, nome, cnpj, ...)
         clinica_id,
         role)
             ▲
             │
   user_roles (global: super_admin)
```

- **`clinica`** — tenant. Campos: `nome`, `cnpj`, `email`, `telefone`, `status`.
- **`clinica_membro`** — vincula usuário a uma clínica com um role (`admin`, `responsavel_tecnico`, `recepcionista`). Substitui o uso atual de `user_roles` para roles dentro da clínica.
- **`user_roles`** — passa a guardar apenas o role **global** `super_admin` (você). Mantemos a tabela e a função `has_role` para compatibilidade com edge functions existentes.
- **`clinica_id`** adicionado em todas as 11 tabelas de domínio: `paciente`, `agendamento`, `dentista`, `despesa`, `evolucao`, `insumo`, `odontograma_procedimento`, `paciente_debito`, `paciente_foto`, `procedimento`, `sessao`.

## Como o isolamento funciona

Função SECURITY DEFINER:
- `get_user_clinica_id(uid)` → retorna `clinica_id` do usuário (1 clínica por usuário nesta fase).
- `has_clinica_role(uid, clinica_id, role)` → checa membership + role.

**RLS reescrita** em todas as tabelas:
```sql
USING (clinica_id = get_user_clinica_id(auth.uid()))
```

**Trigger BEFORE INSERT** em cada tabela: se `clinica_id` vier nulo, preenche com `get_user_clinica_id(auth.uid())`. Isso evita ter que mudar todos os services do frontend.

## Onboarding (convite-only)

- Edge function nova **`super-admin-create-clinica`**: valida que o caller é `super_admin`, cria clínica + cria primeiro user admin + insere `clinica_membro`.
- Edge function existente **`create-user`** ajustada: valida caller é admin da clínica, cria user e insere `clinica_membro` com a `clinica_id` do caller (não permite criar em outra clínica).

## Migração de dados

1. Criar clínica default `"Clínica Padrão"`.
2. Backfill todas as tabelas com `clinica_id = <default>`.
3. Inserir todos os usuários atuais em `clinica_membro` com a clínica default, mapeando seus roles de `user_roles` (exceto seu próprio user, que vira `super_admin`).
4. Tornar `clinica_id` `NOT NULL` ao final.

## Frontend (mudanças mínimas)

- Sem alterações nos services (`pacienteService`, etc.) — RLS + trigger garantem isolamento.
- **Header**: mostrar nome da clínica atual ao lado do avatar.
- **Configurações**: nova aba "Clínica" (só admin da clínica edita dados próprios; só super_admin vê lista de clínicas).
- **Página super-admin** (rota oculta `/super-admin`): listar clínicas, criar nova clínica + admin inicial.

## Detalhes técnicos

- Drop e recreate de **todas** as policies das 11 tabelas (não dá pra ALTER policy mudando expressão).
- Adicionar índice `(clinica_id)` em cada tabela para performance.
- `app_role` ganha valor `super_admin`.
- `clinica_membro`: UNIQUE `(user_id)` por enquanto (1 user = 1 clínica). Multi-clínica por user fica para depois.
- Triggers de auto-fill `clinica_id` ficam em uma função genérica `public.set_clinica_id_from_user()`.

## Entregas em ordem

1. **Migration SQL** (única, grande): cria `clinica` + `clinica_membro`, adiciona `super_admin` ao enum, função helper, coluna `clinica_id` em todas as tabelas, backfill, NOT NULL, drop+recreate de todas as RLS policies, triggers de auto-fill, índices.
2. **Edge function** `super-admin-create-clinica`.
3. **Edge function** `create-user` atualizada para inserir em `clinica_membro`.
4. **UI**: header com nome da clínica + página `/super-admin` mínima (lista clínicas + form criar nova).

Riscos: depois do passo 1, qualquer query existente continua funcionando porque os usuários atuais já estão na clínica default. Se algo quebrar, problema fica isolado a permissão (fácil debugar).

Confirma que posso seguir? Vou começar pela migration.