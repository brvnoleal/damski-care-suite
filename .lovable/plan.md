## Problema

A aba **Documentos** do paciente exibe TCLE, Contrato e Orçamento "hard-coded" como se já estivessem assinados, sem qualquer fluxo real. Não existe modelo, variável, assinatura digital LGPD nem link público.

## Objetivo

Sistema de documentos por paciente com:
1. **Modelos pré-configurados** por clínica: Contrato, Termo de Consentimento (TCLE), Receituário, Atestado + opção **Personalizado**.
2. **Variáveis** automáticas de paciente e clínica (`{{paciente.nome}}`, `{{clinica.razao_social}}`, etc.) substituídas no momento da emissão.
3. **Emissão por paciente** gerando documento + **link público temporário** com token único para o paciente assinar (canvas de assinatura, IP/UA/timestamp registrados — LGPD).
4. Aba Documentos lista somente o que foi **emitido** para aquele paciente, com status `pendente | assinado | expirado | cancelado`.

## Mudanças

### 1. Banco (migration)

**`documento_modelo`** — modelos por clínica:
- `id, clinica_id, tipo` (`contrato|tcle|receituario|atestado|personalizado`), `nome, conteudo` (markdown/HTML com `{{variaveis}}`), `requer_assinatura_paciente bool`, `requer_assinatura_responsavel bool`, `ativo bool`, timestamps.
- Trigger `set_clinica_id_from_user`. RLS por tenant.
- Seed automático de 4 modelos padrão (Contrato, TCLE, Receituário, Atestado) na primeira leitura via edge function — não no SQL para não duplicar.

**`paciente_documento`** — instância emitida:
- `id, clinica_id, paciente_id, modelo_id (nullable se personalizado avulso), tipo, titulo, conteudo_renderizado` (texto final com variáveis já substituídas), `status` (`pendente|assinado|expirado|cancelado`), `assinatura_paciente_dataurl, assinatura_responsavel_dataurl, assinado_em, assinado_ip, assinado_user_agent, expira_em, criado_por (uuid), created_at, updated_at`.
- RLS por tenant. Trigger `set_clinica_id_from_user`.

**`paciente_documento_token`** — link público:
- `id, documento_id, token (unique), expires_at, used_at`.
- Sem leitura via anon — resolvida por edge function service_role.

### 2. Edge functions (verify_jwt=false, CORS)

- **`documento-resolve`** — `{ token }` → valida (não usado, não expirado), retorna `{ documento_id, titulo, conteudo_renderizado, paciente_nome, clinica_nome, requer_assinatura_paciente }`.
- **`documento-assinar`** — `{ token, assinatura_paciente_dataurl }` → grava assinatura, IP, UA, marca `assinado`, marca token `used_at`.

### 3. Frontend

**`src/services/documentoService.ts`** (novo) — CRUD de modelos, emitir documento (renderiza variáveis + cria token), listar por paciente, gerar URL pública `/d/:token`.

**`src/lib/documentoTemplates.ts`** (novo) — 4 modelos padrão em texto pt-BR com variáveis (Contrato, TCLE, Receituário, Atestado) e função `renderTemplate(texto, { paciente, clinica })`.

**Configurações → nova seção `Modelos de Documentos`** (`src/components/configuracoes/ModelosDocumentosSection.tsx`): listar/criar/editar/desativar modelos. Editor de texto simples (`textarea` grande) com painel lateral mostrando variáveis disponíveis para clicar e inserir.

**`PacienteDetalhe.tsx` — aba Documentos refeita**:
- Botão "Emitir documento" → dialog: escolhe modelo (ou "Personalizado" → editor livre), pré-visualiza conteúdo já renderizado, define validade do link (default 7 dias) → cria `paciente_documento` + token → mostra link copiável.
- Lista somente documentos emitidos do paciente, com status real, botões "Copiar link", "Ver", "Cancelar". Sem nada hard-coded.

**Página pública `src/pages/DocumentoAssinar.tsx`** + rota `/d/:token` no `App.tsx`:
- Resolve via `documento-resolve`, mostra documento em leitura, `SignaturePad` para paciente, botão "Assinar" chama `documento-assinar`. Tela final de sucesso.

### 4. Variáveis suportadas (v1)

`{{paciente.nome}}`, `{{paciente.cpf}}`, `{{paciente.rg}}`, `{{paciente.data_nascimento}}`, `{{paciente.endereco}}`, `{{paciente.telefone}}`, `{{clinica.razao_social}}`, `{{clinica.cnpj}}`, `{{clinica.endereco}}`, `{{clinica.responsavel_tecnico}}`, `{{data_hoje}}`.

## Fora de escopo (v1)

- Geração de PDF do documento assinado (fica para depois — por ora salva HTML/texto + dataURL da assinatura).
- Assinatura do responsável técnico pela clínica (campo já existe no schema, mas UI só do paciente nesta versão).
- Versionamento de modelos.
