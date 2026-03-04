# Diagrama Entidade-Relacionamento (DER)

## Modelo Conceitual — Damski Odonto

```
┌──────────────────┐       ┌──────────────────────┐       ┌──────────────────┐
│    PACIENTE       │       │     AGENDAMENTO       │       │     DENTISTA      │
├──────────────────┤       ├──────────────────────┤       ├──────────────────┤
│ id (PK)          │       │ id (PK)              │       │ id (PK)          │
│ nome             │──1:N──│ paciente_id (FK)     │──N:1──│ nome             │
│ cpf (UNIQUE)     │       │ dentista_id (FK)     │       │ especialidade    │
│ telefone         │       │ data                 │       │ cro (UNIQUE)     │
│ email            │       │ horario              │       │ telefone         │
│ data_nascimento  │       │ status               │       │ email            │
│ status           │       │ observacoes          │       │ status           │
│ created_at       │       │ created_at           │       │ created_at       │
│ updated_at       │       │ updated_at           │       │ updated_at       │
└──────────────────┘       └──────────┬───────────┘       └──────────────────┘
                                      │
                                      │ 1:N
                                      │
                           ┌──────────┴───────────┐
                           │     PAGAMENTO         │
                           ├──────────────────────┤
                           │ id (PK)              │
                           │ agendamento_id (FK)  │
                           │ valor_pago           │
                           │ forma_pagamento      │
                           │ data_pagamento       │
                           │ created_at           │
                           └──────────────────────┘

                           ┌──────────────────────┐
                           │   PROCEDIMENTO        │
                           ├──────────────────────┤
                           │ id (PK)              │
                           │ nome                 │
                           │ descricao            │
                           │ valor                │
                           │ created_at           │
                           └──────────────────────┘
```

## Relacionamentos

| Relação                   | Tipo | Descrição                                    |
|---------------------------|------|----------------------------------------------|
| Paciente → Agendamento    | 1:N  | Um paciente pode ter vários agendamentos     |
| Dentista → Agendamento    | 1:N  | Um dentista pode ter vários agendamentos     |
| Agendamento → Pagamento   | 1:N  | Um agendamento pode gerar vários pagamentos  |

## Regras de Integridade

- **Chaves Primárias**: Todas as tabelas possuem `id` UUID como chave primária
- **Chaves Estrangeiras**: `paciente_id`, `dentista_id` e `agendamento_id` com `ON DELETE CASCADE`
- **Constraints CHECK**: Validação de status e formas de pagamento
- **UNIQUE**: CPF do paciente e CRO do dentista são únicos
- **NOT NULL**: Campos obrigatórios garantidos pelo schema
