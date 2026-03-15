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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      app_config: {
        Row: {
          created_at: string
          key: string
          value: string
        }
        Insert: {
          created_at?: string
          key: string
          value: string
        }
        Update: {
          created_at?: string
          key?: string
          value?: string
        }
        Relationships: []
      }
      clientes: {
        Row: {
          avatar: string | null
          cidade: string | null
          created_at: string
          documento: string | null
          email: string
          endereco: string | null
          estado: string | null
          id: string
          nome: string
          status: string
          telefone: string | null
          updated_at: string
        }
        Insert: {
          avatar?: string | null
          cidade?: string | null
          created_at?: string
          documento?: string | null
          email: string
          endereco?: string | null
          estado?: string | null
          id?: string
          nome: string
          status?: string
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          avatar?: string | null
          cidade?: string | null
          created_at?: string
          documento?: string | null
          email?: string
          endereco?: string | null
          estado?: string | null
          id?: string
          nome?: string
          status?: string
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      contratos: {
        Row: {
          cliente_id: string | null
          created_at: string
          data_assinatura: string | null
          data_envio: string
          descricao: string | null
          id: string
          status: string
          titulo: string
          valor: number
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string
          data_assinatura?: string | null
          data_envio?: string
          descricao?: string | null
          id?: string
          status?: string
          titulo: string
          valor?: number
        }
        Update: {
          cliente_id?: string | null
          created_at?: string
          data_assinatura?: string | null
          data_envio?: string
          descricao?: string | null
          id?: string
          status?: string
          titulo?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      extras_catalogo: {
        Row: {
          categoria: string
          created_at: string
          descricao: string | null
          id: string
          nome: string
          preco_ativacao: number
          preco_mensal: number
          status: string
        }
        Insert: {
          categoria?: string
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          preco_ativacao?: number
          preco_mensal?: number
          status?: string
        }
        Update: {
          categoria?: string
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          preco_ativacao?: number
          preco_mensal?: number
          status?: string
        }
        Relationships: []
      }
      extras_clientes: {
        Row: {
          categoria: string
          cliente_id: string
          created_at: string
          data_ativacao: string
          data_cancelamento: string | null
          extra_id: string
          id: string
          observacao: string | null
          preco_ativacao: number
          preco_mensal: number
          status: string
        }
        Insert: {
          categoria?: string
          cliente_id: string
          created_at?: string
          data_ativacao?: string
          data_cancelamento?: string | null
          extra_id: string
          id?: string
          observacao?: string | null
          preco_ativacao?: number
          preco_mensal?: number
          status?: string
        }
        Update: {
          categoria?: string
          cliente_id?: string
          created_at?: string
          data_ativacao?: string
          data_cancelamento?: string | null
          extra_id?: string
          id?: string
          observacao?: string | null
          preco_ativacao?: number
          preco_mensal?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "extras_clientes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "extras_clientes_extra_id_fkey"
            columns: ["extra_id"]
            isOneToOne: false
            referencedRelation: "extras_catalogo"
            referencedColumns: ["id"]
          },
        ]
      }
      faturas: {
        Row: {
          cliente_id: string | null
          created_at: string
          data_emissao: string
          descricao: string
          id: string
          status: string
          valor: number
          vencimento: string
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string
          data_emissao?: string
          descricao: string
          id?: string
          status?: string
          valor?: number
          vencimento: string
        }
        Update: {
          cliente_id?: string | null
          created_at?: string
          data_emissao?: string
          descricao?: string
          id?: string
          status?: string
          valor?: number
          vencimento?: string
        }
        Relationships: [
          {
            foreignKeyName: "faturas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      financeiro: {
        Row: {
          cliente_id: string | null
          created_at: string
          data: string
          descricao: string
          id: string
          status: string
          tipo: string
          valor: number
          vencimento: string | null
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string
          data?: string
          descricao: string
          id?: string
          status?: string
          tipo?: string
          valor?: number
          vencimento?: string | null
        }
        Update: {
          cliente_id?: string | null
          created_at?: string
          data?: string
          descricao?: string
          id?: string
          status?: string
          tipo?: string
          valor?: number
          vencimento?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financeiro_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          cidade: string | null
          como_conheceu: string | null
          created_at: string
          documento: string | null
          email: string
          estado: string | null
          id: string
          mensagem: string | null
          motivo_perda: string | null
          nome: string
          nome_negocio: string | null
          orcamento: string | null
          segmento: string | null
          servicos: string[] | null
          status: string
          updated_at: string
          visualizado: boolean
          whatsapp: string
        }
        Insert: {
          cidade?: string | null
          como_conheceu?: string | null
          created_at?: string
          documento?: string | null
          email: string
          estado?: string | null
          id?: string
          mensagem?: string | null
          motivo_perda?: string | null
          nome: string
          nome_negocio?: string | null
          orcamento?: string | null
          segmento?: string | null
          servicos?: string[] | null
          status?: string
          updated_at?: string
          visualizado?: boolean
          whatsapp: string
        }
        Update: {
          cidade?: string | null
          como_conheceu?: string | null
          created_at?: string
          documento?: string | null
          email?: string
          estado?: string | null
          id?: string
          mensagem?: string | null
          motivo_perda?: string | null
          nome?: string
          nome_negocio?: string | null
          orcamento?: string | null
          segmento?: string | null
          servicos?: string[] | null
          status?: string
          updated_at?: string
          visualizado?: boolean
          whatsapp?: string
        }
        Relationships: []
      }
      notificacoes: {
        Row: {
          cliente_id: string | null
          created_at: string
          descricao: string | null
          id: string
          lida: boolean
          tipo: string
          titulo: string
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          lida?: boolean
          tipo?: string
          titulo: string
        }
        Update: {
          cliente_id?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          lida?: boolean
          tipo?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "notificacoes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          read: boolean
          title: string
          url: string | null
          user_id: string
          user_type: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          read?: boolean
          title: string
          url?: string | null
          user_id: string
          user_type?: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          read?: boolean
          title?: string
          url?: string | null
          user_id?: string
          user_type?: string
        }
        Relationships: []
      }
      pedidos: {
        Row: {
          cliente_id: string | null
          codigo: string
          created_at: string
          data: string
          id: string
          projeto_id: string | null
          status: string
          tipo: string
          valor: number
        }
        Insert: {
          cliente_id?: string | null
          codigo: string
          created_at?: string
          data?: string
          id?: string
          projeto_id?: string | null
          status?: string
          tipo: string
          valor?: number
        }
        Update: {
          cliente_id?: string | null
          codigo?: string
          created_at?: string
          data?: string
          id?: string
          projeto_id?: string | null
          status?: string
          tipo?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
        ]
      }
      projeto_atualizacoes: {
        Row: {
          created_at: string
          descricao: string
          id: string
          projeto_id: string
          visivel_cliente: boolean
        }
        Insert: {
          created_at?: string
          descricao: string
          id?: string
          projeto_id: string
          visivel_cliente?: boolean
        }
        Update: {
          created_at?: string
          descricao?: string
          id?: string
          projeto_id?: string
          visivel_cliente?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "projeto_atualizacoes_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
        ]
      }
      projetos: {
        Row: {
          cliente_id: string | null
          created_at: string
          descricao: string | null
          id: string
          inicio: string | null
          prazo: string | null
          progresso: number
          responsavel: string | null
          status: string
          titulo: string
          updated_at: string
          valor: number
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          inicio?: string | null
          prazo?: string | null
          progresso?: number
          responsavel?: string | null
          status?: string
          titulo: string
          updated_at?: string
          valor?: number
        }
        Update: {
          cliente_id?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          inicio?: string | null
          prazo?: string | null
          progresso?: number
          responsavel?: string | null
          status?: string
          titulo?: string
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "projetos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          user_id: string
          user_type: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          user_id: string
          user_type?: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          user_id?: string
          user_type?: string
        }
        Relationships: []
      }
      reunioes: {
        Row: {
          cliente_id: string | null
          created_at: string
          data: string
          hora_fim: string
          hora_inicio: string
          id: string
          link: string | null
          observacoes: string | null
          status: string
          tipo: string
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string
          data: string
          hora_fim: string
          hora_inicio: string
          id?: string
          link?: string | null
          observacoes?: string | null
          status?: string
          tipo?: string
        }
        Update: {
          cliente_id?: string | null
          created_at?: string
          data?: string
          hora_fim?: string
          hora_inicio?: string
          id?: string
          link?: string | null
          observacoes?: string | null
          status?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "reunioes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_mensagens: {
        Row: {
          created_at: string
          id: string
          nome: string
          remetente: string
          texto: string
          ticket_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
          remetente?: string
          texto: string
          ticket_id: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
          remetente?: string
          texto?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_mensagens_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          cliente_id: string | null
          codigo: string
          created_at: string
          descricao: string | null
          id: string
          prioridade: string
          status: string
          titulo: string
          updated_at: string
        }
        Insert: {
          cliente_id?: string | null
          codigo: string
          created_at?: string
          descricao?: string | null
          id?: string
          prioridade?: string
          status?: string
          titulo: string
          updated_at?: string
        }
        Update: {
          cliente_id?: string | null
          codigo?: string
          created_at?: string
          descricao?: string | null
          id?: string
          prioridade?: string
          status?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios: {
        Row: {
          acesso: string
          avatar: string | null
          cargo: string | null
          created_at: string
          email: string
          id: string
          nome: string
          status: string
        }
        Insert: {
          acesso?: string
          avatar?: string | null
          cargo?: string | null
          created_at?: string
          email: string
          id?: string
          nome: string
          status?: string
        }
        Update: {
          acesso?: string
          avatar?: string | null
          cargo?: string | null
          created_at?: string
          email?: string
          id?: string
          nome?: string
          status?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
