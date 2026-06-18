export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      agendamento: {
        Row: {
          clinica_id: string
          created_at: string
          data: string
          dentista_id: string
          forma_pagamento: string
          horario: string
          horario_fim: string | null
          id: string
          observacoes: string | null
          paciente_id: string
          parcelas: number
          procedimento: string
          status: string
          status_pagamento: string
          updated_at: string
          valor: number
        }
        Insert: {
          clinica_id: string
          created_at?: string
          data: string
          dentista_id: string
          forma_pagamento?: string
          horario: string
          horario_fim?: string | null
          id?: string
          observacoes?: string | null
          paciente_id: string
          parcelas?: number
          procedimento?: string
          status?: string
          status_pagamento?: string
          updated_at?: string
          valor?: number
        }
        Update: {
          clinica_id?: string
          created_at?: string
          data?: string
          dentista_id?: string
          forma_pagamento?: string
          horario?: string
          horario_fim?: string | null
          id?: string
          observacoes?: string | null
          paciente_id?: string
          parcelas?: number
          procedimento?: string
          status?: string
          status_pagamento?: string
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "agendamento_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "clinica"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamento_dentista_id_fkey"
            columns: ["dentista_id"]
            isOneToOne: false
            referencedRelation: "dentista"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamento_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "paciente"
            referencedColumns: ["id"]
          },
        ]
      }
      agendamento_insumo: {
        Row: {
          agendamento_id: string
          clinica_id: string
          created_at: string
          id: string
          insumo_id: string
          quantidade: number
          updated_at: string
        }
        Insert: {
          agendamento_id: string
          clinica_id: string
          created_at?: string
          id?: string
          insumo_id: string
          quantidade?: number
          updated_at?: string
        }
        Update: {
          agendamento_id?: string
          clinica_id?: string
          created_at?: string
          id?: string
          insumo_id?: string
          quantidade?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agendamento_insumo_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: false
            referencedRelation: "agendamento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamento_insumo_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "clinica"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamento_insumo_insumo_id_fkey"
            columns: ["insumo_id"]
            isOneToOne: false
            referencedRelation: "insumo"
            referencedColumns: ["id"]
          },
        ]
      }
      anamnese_tentativa: {
        Row: {
          bloqueado_ate: string | null
          clinica_id: string
          cpf_hash: string
          created_at: string
          id: string
          tentativas: number
          updated_at: string
        }
        Insert: {
          bloqueado_ate?: string | null
          clinica_id: string
          cpf_hash: string
          created_at?: string
          id?: string
          tentativas?: number
          updated_at?: string
        }
        Update: {
          bloqueado_ate?: string | null
          clinica_id?: string
          cpf_hash?: string
          created_at?: string
          id?: string
          tentativas?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "anamnese_tentativa_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "clinica"
            referencedColumns: ["id"]
          },
        ]
      }
      anamnese_token: {
        Row: {
          clinica_id: string
          created_at: string
          created_by: string | null
          expires_at: string
          id: string
          paciente_id: string | null
          token: string
          used_at: string | null
        }
        Insert: {
          clinica_id: string
          created_at?: string
          created_by?: string | null
          expires_at?: string
          id?: string
          paciente_id?: string | null
          token?: string
          used_at?: string | null
        }
        Update: {
          clinica_id?: string
          created_at?: string
          created_by?: string | null
          expires_at?: string
          id?: string
          paciente_id?: string | null
          token?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "anamnese_token_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "clinica"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anamnese_token_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "paciente"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          clinica_id: string | null
          created_at: string
          diff: Json | null
          entity: string
          entity_id: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          clinica_id?: string | null
          created_at?: string
          diff?: Json | null
          entity: string
          entity_id?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          clinica_id?: string | null
          created_at?: string
          diff?: Json | null
          entity?: string
          entity_id?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      clinica: {
        Row: {
          cnpj: string | null
          created_at: string
          email: string | null
          id: string
          nome: string
          status: string
          telefone: string | null
          updated_at: string
        }
        Insert: {
          cnpj?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nome: string
          status?: string
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          cnpj?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nome?: string
          status?: string
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      clinica_membro: {
        Row: {
          clinica_id: string
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          clinica_id: string
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          clinica_id?: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinica_membro_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "clinica"
            referencedColumns: ["id"]
          },
        ]
      }
      dentista: {
        Row: {
          bairro: string | null
          cep: string | null
          cidade: string | null
          clinica_id: string
          complemento: string | null
          created_at: string
          cro: string
          email: string | null
          especialidade: string
          estado: string | null
          id: string
          instagram: string | null
          nome: string
          numero: string | null
          ponto_referencia: string | null
          rua: string | null
          status: string
          telefone: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          clinica_id: string
          complemento?: string | null
          created_at?: string
          cro: string
          email?: string | null
          especialidade: string
          estado?: string | null
          id?: string
          instagram?: string | null
          nome: string
          numero?: string | null
          ponto_referencia?: string | null
          rua?: string | null
          status?: string
          telefone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          clinica_id?: string
          complemento?: string | null
          created_at?: string
          cro?: string
          email?: string | null
          especialidade?: string
          estado?: string | null
          id?: string
          instagram?: string | null
          nome?: string
          numero?: string | null
          ponto_referencia?: string | null
          rua?: string | null
          status?: string
          telefone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dentista_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "clinica"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dentista_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      despesa: {
        Row: {
          categoria: string | null
          clinica_id: string
          created_at: string
          descricao: string
          forma_pagamento: string | null
          fornecedor: string | null
          id: string
          observacoes: string | null
          status: string
          valor: number
          vencimento: string
        }
        Insert: {
          categoria?: string | null
          clinica_id: string
          created_at?: string
          descricao: string
          forma_pagamento?: string | null
          fornecedor?: string | null
          id?: string
          observacoes?: string | null
          status?: string
          valor: number
          vencimento: string
        }
        Update: {
          categoria?: string | null
          clinica_id?: string
          created_at?: string
          descricao?: string
          forma_pagamento?: string | null
          fornecedor?: string | null
          id?: string
          observacoes?: string | null
          status?: string
          valor?: number
          vencimento?: string
        }
        Relationships: [
          {
            foreignKeyName: "despesa_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "clinica"
            referencedColumns: ["id"]
          },
        ]
      }
      documento_modelo: {
        Row: {
          ativo: boolean
          clinica_id: string
          conteudo: string
          created_at: string
          id: string
          nome: string
          requer_assinatura_paciente: boolean
          requer_assinatura_responsavel: boolean
          tipo: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          clinica_id: string
          conteudo: string
          created_at?: string
          id?: string
          nome: string
          requer_assinatura_paciente?: boolean
          requer_assinatura_responsavel?: boolean
          tipo: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          clinica_id?: string
          conteudo?: string
          created_at?: string
          id?: string
          nome?: string
          requer_assinatura_paciente?: boolean
          requer_assinatura_responsavel?: boolean
          tipo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "documento_modelo_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "clinica"
            referencedColumns: ["id"]
          },
        ]
      }
      evolucao: {
        Row: {
          clinica_id: string
          conteudo: string
          created_at: string
          data: string
          dentista_id: string | null
          id: string
          paciente_id: string
          updated_at: string
        }
        Insert: {
          clinica_id: string
          conteudo: string
          created_at?: string
          data?: string
          dentista_id?: string | null
          id?: string
          paciente_id: string
          updated_at?: string
        }
        Update: {
          clinica_id?: string
          conteudo?: string
          created_at?: string
          data?: string
          dentista_id?: string | null
          id?: string
          paciente_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "evolucao_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "clinica"
            referencedColumns: ["id"]
          },
        ]
      }
      insumo: {
        Row: {
          categoria: string | null
          clinica_id: string
          created_at: string
          fabricante: string
          id: string
          lote: string
          nome: string
          pacientes_vinculados: number
          quantidade: number
          sem_validade: boolean
          unidade_medida: string | null
          updated_at: string
          validade: string | null
        }
        Insert: {
          categoria?: string | null
          clinica_id: string
          created_at?: string
          fabricante: string
          id?: string
          lote: string
          nome: string
          pacientes_vinculados?: number
          quantidade?: number
          sem_validade?: boolean
          unidade_medida?: string | null
          updated_at?: string
          validade?: string | null
        }
        Update: {
          categoria?: string | null
          clinica_id?: string
          created_at?: string
          fabricante?: string
          id?: string
          lote?: string
          nome?: string
          pacientes_vinculados?: number
          quantidade?: number
          sem_validade?: boolean
          unidade_medida?: string | null
          updated_at?: string
          validade?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "insumo_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "clinica"
            referencedColumns: ["id"]
          },
        ]
      }
      odontograma_procedimento: {
        Row: {
          clinica_id: string
          created_at: string
          data: string
          dente: number
          dentista_id: string | null
          id: string
          observacoes: string | null
          paciente_id: string
          procedimento: string
          status: string
          updated_at: string
          valor: number
        }
        Insert: {
          clinica_id: string
          created_at?: string
          data?: string
          dente: number
          dentista_id?: string | null
          id?: string
          observacoes?: string | null
          paciente_id: string
          procedimento: string
          status?: string
          updated_at?: string
          valor?: number
        }
        Update: {
          clinica_id?: string
          created_at?: string
          data?: string
          dente?: number
          dentista_id?: string | null
          id?: string
          observacoes?: string | null
          paciente_id?: string
          procedimento?: string
          status?: string
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "odontograma_procedimento_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "clinica"
            referencedColumns: ["id"]
          },
        ]
      }
      paciente: {
        Row: {
          avatar_url: string | null
          bairro: string | null
          cep: string | null
          cidade: string | null
          clinica_id: string
          complemento: string | null
          cpf: string
          created_at: string
          data_nascimento: string
          email: string | null
          emissor: string | null
          estado: string | null
          estado_civil: string | null
          id: string
          instagram: string | null
          nome: string
          numero: string | null
          numero_plano: string | null
          numero_prontuario: string | null
          plano: string | null
          ponto_referencia: string | null
          rg: string | null
          rua: string | null
          sexo: string | null
          situacao_profissional: string | null
          status: string
          telefone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          clinica_id: string
          complemento?: string | null
          cpf: string
          created_at?: string
          data_nascimento: string
          email?: string | null
          emissor?: string | null
          estado?: string | null
          estado_civil?: string | null
          id?: string
          instagram?: string | null
          nome: string
          numero?: string | null
          numero_plano?: string | null
          numero_prontuario?: string | null
          plano?: string | null
          ponto_referencia?: string | null
          rg?: string | null
          rua?: string | null
          sexo?: string | null
          situacao_profissional?: string | null
          status?: string
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          clinica_id?: string
          complemento?: string | null
          cpf?: string
          created_at?: string
          data_nascimento?: string
          email?: string | null
          emissor?: string | null
          estado?: string | null
          estado_civil?: string | null
          id?: string
          instagram?: string | null
          nome?: string
          numero?: string | null
          numero_plano?: string | null
          numero_prontuario?: string | null
          plano?: string | null
          ponto_referencia?: string | null
          rg?: string | null
          rua?: string | null
          sexo?: string | null
          situacao_profissional?: string | null
          status?: string
          telefone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "paciente_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "clinica"
            referencedColumns: ["id"]
          },
        ]
      }
      paciente_anamnese: {
        Row: {
          assinatura_em: string
          assinatura_ip: string | null
          assinatura_paciente: string
          assinatura_user_agent: string | null
          clinica_id: string
          created_at: string
          id: string
          origem: string
          paciente_id: string
          respostas: Json
          token_id: string | null
          updated_at: string
          versao: number
        }
        Insert: {
          assinatura_em?: string
          assinatura_ip?: string | null
          assinatura_paciente: string
          assinatura_user_agent?: string | null
          clinica_id: string
          created_at?: string
          id?: string
          origem?: string
          paciente_id: string
          respostas?: Json
          token_id?: string | null
          updated_at?: string
          versao?: number
        }
        Update: {
          assinatura_em?: string
          assinatura_ip?: string | null
          assinatura_paciente?: string
          assinatura_user_agent?: string | null
          clinica_id?: string
          created_at?: string
          id?: string
          origem?: string
          paciente_id?: string
          respostas?: Json
          token_id?: string | null
          updated_at?: string
          versao?: number
        }
        Relationships: [
          {
            foreignKeyName: "paciente_anamnese_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "clinica"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "paciente_anamnese_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "paciente"
            referencedColumns: ["id"]
          },
        ]
      }
      paciente_consentimento: {
        Row: {
          aceito: boolean
          aceito_em: string
          clinica_id: string
          conteudo: string
          created_at: string
          finalidade: string
          id: string
          ip: string | null
          paciente_id: string
          registrado_por: string | null
          revogado_em: string | null
          user_agent: string | null
          versao: string
        }
        Insert: {
          aceito?: boolean
          aceito_em?: string
          clinica_id: string
          conteudo: string
          created_at?: string
          finalidade: string
          id?: string
          ip?: string | null
          paciente_id: string
          registrado_por?: string | null
          revogado_em?: string | null
          user_agent?: string | null
          versao?: string
        }
        Update: {
          aceito?: boolean
          aceito_em?: string
          clinica_id?: string
          conteudo?: string
          created_at?: string
          finalidade?: string
          id?: string
          ip?: string | null
          paciente_id?: string
          registrado_por?: string | null
          revogado_em?: string | null
          user_agent?: string | null
          versao?: string
        }
        Relationships: []
      }
      paciente_debito: {
        Row: {
          clinica_id: string
          created_at: string
          data_vencimento: string
          descricao: string
          forma_pagamento: string | null
          id: string
          modalidade: string
          paciente_id: string
          parcelas: number
          status: string
          updated_at: string
          valor: number
        }
        Insert: {
          clinica_id: string
          created_at?: string
          data_vencimento: string
          descricao: string
          forma_pagamento?: string | null
          id?: string
          modalidade?: string
          paciente_id: string
          parcelas?: number
          status?: string
          updated_at?: string
          valor?: number
        }
        Update: {
          clinica_id?: string
          created_at?: string
          data_vencimento?: string
          descricao?: string
          forma_pagamento?: string | null
          id?: string
          modalidade?: string
          paciente_id?: string
          parcelas?: number
          status?: string
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "paciente_debito_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "clinica"
            referencedColumns: ["id"]
          },
        ]
      }
      paciente_documento: {
        Row: {
          assinado_em: string | null
          assinado_ip: string | null
          assinado_user_agent: string | null
          assinatura_paciente_dataurl: string | null
          assinatura_responsavel_dataurl: string | null
          clinica_id: string
          conteudo_renderizado: string
          created_at: string
          criado_por: string | null
          expira_em: string
          id: string
          modelo_id: string | null
          paciente_id: string
          status: string
          tipo: string
          titulo: string
          updated_at: string
        }
        Insert: {
          assinado_em?: string | null
          assinado_ip?: string | null
          assinado_user_agent?: string | null
          assinatura_paciente_dataurl?: string | null
          assinatura_responsavel_dataurl?: string | null
          clinica_id: string
          conteudo_renderizado: string
          created_at?: string
          criado_por?: string | null
          expira_em?: string
          id?: string
          modelo_id?: string | null
          paciente_id: string
          status?: string
          tipo: string
          titulo: string
          updated_at?: string
        }
        Update: {
          assinado_em?: string | null
          assinado_ip?: string | null
          assinado_user_agent?: string | null
          assinatura_paciente_dataurl?: string | null
          assinatura_responsavel_dataurl?: string | null
          clinica_id?: string
          conteudo_renderizado?: string
          created_at?: string
          criado_por?: string | null
          expira_em?: string
          id?: string
          modelo_id?: string | null
          paciente_id?: string
          status?: string
          tipo?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "paciente_documento_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "clinica"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "paciente_documento_modelo_id_fkey"
            columns: ["modelo_id"]
            isOneToOne: false
            referencedRelation: "documento_modelo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "paciente_documento_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "paciente"
            referencedColumns: ["id"]
          },
        ]
      }
      paciente_documento_token: {
        Row: {
          created_at: string
          documento_id: string
          expires_at: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          documento_id: string
          expires_at: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          documento_id?: string
          expires_at?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "paciente_documento_token_documento_id_fkey"
            columns: ["documento_id"]
            isOneToOne: false
            referencedRelation: "paciente_documento"
            referencedColumns: ["id"]
          },
        ]
      }
      paciente_foto: {
        Row: {
          categoria: Database["public"]["Enums"]["foto_categoria"]
          clinica_id: string
          created_at: string
          data: string
          descricao: string | null
          id: string
          nome_arquivo: string
          paciente_id: string
          storage_path: string
        }
        Insert: {
          categoria?: Database["public"]["Enums"]["foto_categoria"]
          clinica_id: string
          created_at?: string
          data?: string
          descricao?: string | null
          id?: string
          nome_arquivo: string
          paciente_id: string
          storage_path: string
        }
        Update: {
          categoria?: Database["public"]["Enums"]["foto_categoria"]
          clinica_id?: string
          created_at?: string
          data?: string
          descricao?: string | null
          id?: string
          nome_arquivo?: string
          paciente_id?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "paciente_foto_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "clinica"
            referencedColumns: ["id"]
          },
        ]
      }
      procedimento: {
        Row: {
          clinica_id: string
          created_at: string
          especialidade: string | null
          id: string
          nome: string
          plano: string | null
          preco: number
          updated_at: string
        }
        Insert: {
          clinica_id: string
          created_at?: string
          especialidade?: string | null
          id?: string
          nome: string
          plano?: string | null
          preco?: number
          updated_at?: string
        }
        Update: {
          clinica_id?: string
          created_at?: string
          especialidade?: string | null
          id?: string
          nome?: string
          plano?: string | null
          preco?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "procedimento_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "clinica"
            referencedColumns: ["id"]
          },
        ]
      }
      procedimento_insumo: {
        Row: {
          clinica_id: string
          created_at: string
          id: string
          insumo_id: string
          procedimento_id: string
          quantidade: number
          updated_at: string
        }
        Insert: {
          clinica_id: string
          created_at?: string
          id?: string
          insumo_id: string
          procedimento_id: string
          quantidade?: number
          updated_at?: string
        }
        Update: {
          clinica_id?: string
          created_at?: string
          id?: string
          insumo_id?: string
          procedimento_id?: string
          quantidade?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "procedimento_insumo_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "clinica"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "procedimento_insumo_insumo_id_fkey"
            columns: ["insumo_id"]
            isOneToOne: false
            referencedRelation: "insumo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "procedimento_insumo_procedimento_id_fkey"
            columns: ["procedimento_id"]
            isOneToOne: false
            referencedRelation: "procedimento"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id: string
          nome?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      sessao: {
        Row: {
          agendamento_id: string | null
          assinado: boolean
          clinica_id: string
          created_at: string
          data: string
          dentista_id: string | null
          id: string
          observacoes: string | null
          paciente_id: string
          procedimento: string
          substancia_lote: string | null
          tecnica: string | null
          updated_at: string
        }
        Insert: {
          agendamento_id?: string | null
          assinado?: boolean
          clinica_id: string
          created_at?: string
          data: string
          dentista_id?: string | null
          id?: string
          observacoes?: string | null
          paciente_id: string
          procedimento: string
          substancia_lote?: string | null
          tecnica?: string | null
          updated_at?: string
        }
        Update: {
          agendamento_id?: string | null
          assinado?: boolean
          clinica_id?: string
          created_at?: string
          data?: string
          dentista_id?: string | null
          id?: string
          observacoes?: string | null
          paciente_id?: string
          procedimento?: string
          substancia_lote?: string | null
          tecnica?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessao_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "clinica"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      anonimizar_paciente: {
        Args: { _paciente_id: string }
        Returns: undefined
      }
      exportar_dados_paciente: { Args: { _paciente_id: string }; Returns: Json }
      get_user_clinica_id: { Args: { _user_id: string }; Returns: string }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_clinica_role: {
        Args: {
          _clinica_id: string
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "admin"
        | "responsavel_tecnico"
        | "recepcionista"
        | "super_admin"
      foto_categoria: "antes" | "depois" | "durante" | "outro"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "admin",
        "responsavel_tecnico",
        "recepcionista",
        "super_admin",
      ],
      foto_categoria: ["antes", "depois", "durante", "outro"],
    },
  },
} as const
