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
          created_at: string
          data: string
          dentista_id: string
          forma_pagamento: string
          horario: string
          id: string
          observacoes: string | null
          paciente_id: string
          parcelas: number
          procedimento: string
          status: string
          updated_at: string
          valor: number
        }
        Insert: {
          created_at?: string
          data: string
          dentista_id: string
          forma_pagamento?: string
          horario: string
          id?: string
          observacoes?: string | null
          paciente_id: string
          parcelas?: number
          procedimento?: string
          status?: string
          updated_at?: string
          valor?: number
        }
        Update: {
          created_at?: string
          data?: string
          dentista_id?: string
          forma_pagamento?: string
          horario?: string
          id?: string
          observacoes?: string | null
          paciente_id?: string
          parcelas?: number
          procedimento?: string
          status?: string
          updated_at?: string
          valor?: number
        }
        Relationships: [
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
      dentista: {
        Row: {
          bairro: string | null
          cep: string | null
          cidade: string | null
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
        }
        Insert: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
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
        }
        Update: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
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
        }
        Relationships: []
      }
      despesa: {
        Row: {
          categoria: string | null
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
        Relationships: []
      }
      insumo: {
        Row: {
          created_at: string
          fabricante: string
          id: string
          lote: string
          nome: string
          pacientes_vinculados: number
          quantidade: number
          updated_at: string
          validade: string
        }
        Insert: {
          created_at?: string
          fabricante: string
          id?: string
          lote: string
          nome: string
          pacientes_vinculados?: number
          quantidade?: number
          updated_at?: string
          validade: string
        }
        Update: {
          created_at?: string
          fabricante?: string
          id?: string
          lote?: string
          nome?: string
          pacientes_vinculados?: number
          quantidade?: number
          updated_at?: string
          validade?: string
        }
        Relationships: []
      }
      paciente: {
        Row: {
          bairro: string | null
          cep: string | null
          cidade: string | null
          complemento: string | null
          cpf: string
          created_at: string
          data_nascimento: string
          email: string | null
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
        }
        Insert: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          cpf: string
          created_at?: string
          data_nascimento: string
          email?: string | null
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
        }
        Update: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          cpf?: string
          created_at?: string
          data_nascimento?: string
          email?: string | null
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
        }
        Relationships: []
      }
      paciente_foto: {
        Row: {
          categoria: Database["public"]["Enums"]["foto_categoria"]
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
          created_at?: string
          data?: string
          descricao?: string | null
          id?: string
          nome_arquivo?: string
          paciente_id?: string
          storage_path?: string
        }
        Relationships: []
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
        Relationships: []
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
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "responsavel_tecnico" | "recepcionista"
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
      app_role: ["admin", "responsavel_tecnico", "recepcionista"],
      foto_categoria: ["antes", "depois", "durante", "outro"],
    },
  },
} as const
