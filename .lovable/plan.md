# Ficha de Anamnese — Vínculo e Cadastro por CPF

## Objetivo
Permitir que o paciente preencha a ficha de anamnese (via link público, link individual ou tablet na recepção), com o sistema:
1. **Identificando pelo CPF** se já existe cadastro na clínica e validando nome + data de nascimento antes de vincular.
2. **Criando o cadastro automaticamente** caso o CPF não exista, junto com a anamnese, em uma única transação.
3. **Exigindo assinatura digital** do paciente ao final (padrão LGPD/ANVISA já adotado no projeto).

## Fluxo do paciente

```text
[Abre link]
   │
   ▼
[Tela 1: CPF]──► valida dígito verificador
   │
   ▼
[Edge Function: lookup-paciente-by-cpf]
   │           (entrada: cpf + clinica_id;  saída: existe? + nome mascarado + ano nasc.)
   ├─ existe ──► [Tela 2a: Confirmar identidade]
   │                 - Digite nome completo
   │                 - Digite data de nascimento
   │                 - Edge function valida match exato (case/acentos normalizados)
   │                 - 3 tentativas → bloqueia por 15 min
   │
   └─ não existe ► [Tela 2b: Cadastro básico]
                     - Nome, nascimento, telefone, e-mail
                     - Endereço via ViaCEP, Instagram (padrão do projeto)
   │
   ▼
[Tela 3: Anamnese] (mesma para os dois fluxos)
   - Bloco A — Padrão odontológico
   - Bloco B — Estético/Injetáveis
   - Bloco C — Hábitos
   │
   ▼
[Tela 4: Termo + Assinatura digital] (canvas + aceite)
   │
   ▼
[Edge Function: submit-anamnese]
   - Se novo: cria paciente + anamnese + assinatura
   - Se existente: cria nova versão da anamnese vinculada
   - Registra audit_log + IP + user-agent
   │
   ▼
[Tela 5: Confirmação] "Ficha enviada com sucesso"
```

## Conteúdo da Anamnese

**Bloco A — Padrão odontológico**
Queixa principal, histórico médico, alergias (medicamentos, látex, anestésicos), medicamentos em uso, doenças sistêmicas (diabetes, hipertensão, cardiopatia, etc.), cirurgias prévias, tratamentos odontológicos anteriores.

**Bloco B — Estético / Injetáveis**
Procedimentos estéticos prévios (toxina botulínica, preenchedores, bioestimuladores, fios), data aproximada, marca/produto se souber, gestação ou amamentação, uso de anticoagulantes/isotretinoína, expectativas com o tratamento.

**Bloco C — Hábitos**
Tabagismo, etilismo, bruxismo/apertamento, hábitos de higiene bucal (frequência escovação/fio dental), alimentação (consumo de açúcar/ácidos), prática de esportes de contato.

## Modelo de dados (novo)

**Tabela `paciente_anamnese`**
- `paciente_id` (FK), `clinica_id` (multi-tenant padrão)
- `versao` (int, incrementa por paciente)
- `respostas` (jsonb com os 3 blocos)
- `assinatura_paciente` (texto base64 do canvas)
- `assinatura_ip`, `assinatura_user_agent`, `assinatura_em`
- `origem` ('link_publico' | 'link_individual' | 'tablet_recepcao')
- `token_id` (FK opcional para link individual)
- Campos padrão: id, created_at, updated_at

**Tabela `anamnese_token`** (para "Link individual com token")
- `clinica_id`, `paciente_id` (nullable, se já conhecido), `token` (uuid), `expires_at`, `used_at`

**Tabela `anamnese_tentativa`** (rate limit do CPF lookup)
- `cpf_hash`, `clinica_id`, `tentativas`, `bloqueado_ate`

RLS multi-tenant padrão do projeto (via `get_user_clinica_id`). As edge functions usam `service_role` internamente para o fluxo público.

## Edge Functions (públicas, sem JWT, com validação Zod)

1. **`anamnese-lookup-cpf`** — recebe `{ cpf, clinica_slug }`, retorna `{ existe: bool, nome_mascarado?: string, ano_nascimento?: number }`. Rate-limited.
2. **`anamnese-validar-identidade`** — recebe `{ cpf, nome, data_nascimento, clinica_slug }`, retorna `{ valido: bool, paciente_id?: string }`. Conta tentativas em `anamnese_tentativa`.
3. **`anamnese-submit`** — recebe payload completo (dados paciente opcionais + respostas + assinatura), executa em transação: cria paciente se necessário, insere anamnese, grava audit_log.

## UI / Páginas novas

- **`/anamnese/:clinicaSlug`** — fluxo público (3 telas em stepper, mobile-first, tema Liquid Glass).
- **`/anamnese/t/:token`** — fluxo com token individual (mesmo componente, pré-preenche paciente quando token está atrelado).
- **Dentro do prontuário do paciente** (`PacienteDetalhe.tsx`): nova aba **"Anamnese"** listando histórico de versões + botão "Gerar link individual" + visualização read-only de cada versão com assinatura.
- **Configurações → Anamnese**: botão "Copiar link público da clínica" + QR code para uso em tablet/recepção.

## Validações e segurança

- CPF validado por algoritmo (já existe `isValidCpf` em `src/lib/utils.ts`).
- Nome comparado com normalização (lowercase, sem acento, trim) para evitar falso negativo por acentuação.
- Máximo 3 tentativas de validação por CPF/15 min.
- LGPD: nome mascarado na tela de confirmação ("Maria S***"); CPF nunca devolvido em respostas; payload de submissão validado com Zod.
- Audit log de toda submissão (clinica_id, paciente_id, IP, origem).
- Edge functions com CORS, Zod e rate limit em memória + tabela.

## Documentação acadêmica (DOCS.md)
Adicionar seção descrevendo o módulo, fluxos, novas tabelas e endpoints, conforme padrão do projeto.

## Itens fora deste plano
- Envio do link por WhatsApp/e-mail automatizado (pode ser etapa futura — por ora, copiar link manualmente).
- Anamnese específica por procedimento (modelo único cobre A+B+C agora; versionamento permite evoluir).
