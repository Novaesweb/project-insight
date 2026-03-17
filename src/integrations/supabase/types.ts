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
      audit_log: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          record_id: string | null
          table_name: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          record_id?: string | null
          table_name: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          record_id?: string | null
          table_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      cadastros: {
        Row: {
          aprovado_em: string | null
          aprovado_por: string | null
          cidade: string | null
          created_at: string
          descricao_empresa: string | null
          email: string | null
          estado: string | null
          fotos_urls: string[] | null
          funcionalidades: string[] | null
          id: string
          informacoes_extras: string | null
          logo_url: string | null
          nome_empresa: string
          nome_responsavel: string
          ramo: string | null
          status: Database["public"]["Enums"]["cadastro_status"]
          tipo_busca: string[] | null
          updated_at: string
          whatsapp: string
        }
        Insert: {
          aprovado_em?: string | null
          aprovado_por?: string | null
          cidade?: string | null
          created_at?: string
          descricao_empresa?: string | null
          email?: string | null
          estado?: string | null
          fotos_urls?: string[] | null
          funcionalidades?: string[] | null
          id?: string
          informacoes_extras?: string | null
          logo_url?: string | null
          nome_empresa: string
          nome_responsavel: string
          ramo?: string | null
          status?: Database["public"]["Enums"]["cadastro_status"]
          tipo_busca?: string[] | null
          updated_at?: string
          whatsapp: string
        }
        Update: {
          aprovado_em?: string | null
          aprovado_por?: string | null
          cidade?: string | null
          created_at?: string
          descricao_empresa?: string | null
          email?: string | null
          estado?: string | null
          fotos_urls?: string[] | null
          funcionalidades?: string[] | null
          id?: string
          informacoes_extras?: string | null
          logo_url?: string | null
          nome_empresa?: string
          nome_responsavel?: string
          ramo?: string | null
          status?: Database["public"]["Enums"]["cadastro_status"]
          tipo_busca?: string[] | null
          updated_at?: string
          whatsapp?: string
        }
        Relationships: []
      }
      client_notifications: {
        Row: {
          cliente_id: string
          created_at: string
          id: string
          lida: boolean
          mensagem: string | null
          tipo: string
          titulo: string
        }
        Insert: {
          cliente_id: string
          created_at?: string
          id?: string
          lida?: boolean
          mensagem?: string | null
          tipo?: string
          titulo: string
        }
        Update: {
          cliente_id?: string
          created_at?: string
          id?: string
          lida?: boolean
          mensagem?: string | null
          tipo?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_notifications_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      cliente_extras: {
        Row: {
          ativado_por: string | null
          ativo: boolean
          cliente_id: string
          created_at: string
          extra_id: string
          id: string
          projeto_id: string | null
        }
        Insert: {
          ativado_por?: string | null
          ativo?: boolean
          cliente_id: string
          created_at?: string
          extra_id: string
          id?: string
          projeto_id?: string | null
        }
        Update: {
          ativado_por?: string | null
          ativo?: boolean
          cliente_id?: string
          created_at?: string
          extra_id?: string
          id?: string
          projeto_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cliente_extras_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cliente_extras_extra_id_fkey"
            columns: ["extra_id"]
            isOneToOne: false
            referencedRelation: "extras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cliente_extras_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          ativo: boolean
          cadastro_id: string | null
          cidade: string | null
          created_at: string
          criado_por: string | null
          email: string | null
          estado: string | null
          id: string
          nome_empresa: string
          nome_responsavel: string
          observacao_admin: string | null
          ramo: string | null
          updated_at: string
          user_id: string | null
          whatsapp: string
        }
        Insert: {
          ativo?: boolean
          cadastro_id?: string | null
          cidade?: string | null
          created_at?: string
          criado_por?: string | null
          email?: string | null
          estado?: string | null
          id?: string
          nome_empresa: string
          nome_responsavel: string
          observacao_admin?: string | null
          ramo?: string | null
          updated_at?: string
          user_id?: string | null
          whatsapp: string
        }
        Update: {
          ativo?: boolean
          cadastro_id?: string | null
          cidade?: string | null
          created_at?: string
          criado_por?: string | null
          email?: string | null
          estado?: string | null
          id?: string
          nome_empresa?: string
          nome_responsavel?: string
          observacao_admin?: string | null
          ramo?: string | null
          updated_at?: string
          user_id?: string | null
          whatsapp?: string
        }
        Relationships: [
          {
            foreignKeyName: "clientes_cadastro_id_fkey"
            columns: ["cadastro_id"]
            isOneToOne: false
            referencedRelation: "cadastros"
            referencedColumns: ["id"]
          },
        ]
      }
      extras: {
        Row: {
          ativo: boolean
          created_at: string
          descricao: string | null
          id: string
          nome: string
          preco: number | null
          preco_mensal: number | null
          tipo: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          preco?: number | null
          preco_mensal?: number | null
          tipo?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          preco?: number | null
          preco_mensal?: number | null
          tipo?: string
        }
        Relationships: []
      }
      faturas: {
        Row: {
          cliente_id: string
          created_at: string
          descricao: string
          id: string
          pago_em: string | null
          status: string
          updated_at: string
          valor: number
          vencimento: string
        }
        Insert: {
          cliente_id: string
          created_at?: string
          descricao: string
          id?: string
          pago_em?: string | null
          status?: string
          updated_at?: string
          valor?: number
          vencimento: string
        }
        Update: {
          cliente_id?: string
          created_at?: string
          descricao?: string
          id?: string
          pago_em?: string | null
          status?: string
          updated_at?: string
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
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string | null
          read: boolean
          title: string
          type: Database["public"]["Enums"]["notification_type"]
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          read?: boolean
          title: string
          type?: Database["public"]["Enums"]["notification_type"]
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          read?: boolean
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
        }
        Relationships: []
      }
      pedidos: {
        Row: {
          aceito_em: string | null
          aceito_por: string | null
          cliente_id: string
          created_at: string
          descricao: string
          entregue_em: string | null
          id: string
          projeto_id: string | null
          status: Database["public"]["Enums"]["pedido_status"]
          tipo: Database["public"]["Enums"]["pedido_tipo"]
          updated_at: string
          valor: number | null
        }
        Insert: {
          aceito_em?: string | null
          aceito_por?: string | null
          cliente_id: string
          created_at?: string
          descricao: string
          entregue_em?: string | null
          id?: string
          projeto_id?: string | null
          status?: Database["public"]["Enums"]["pedido_status"]
          tipo?: Database["public"]["Enums"]["pedido_tipo"]
          updated_at?: string
          valor?: number | null
        }
        Update: {
          aceito_em?: string | null
          aceito_por?: string | null
          cliente_id?: string
          created_at?: string
          descricao?: string
          entregue_em?: string | null
          id?: string
          projeto_id?: string | null
          status?: Database["public"]["Enums"]["pedido_status"]
          tipo?: Database["public"]["Enums"]["pedido_tipo"]
          updated_at?: string
          valor?: number | null
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
      pending_users: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          assigned_role: Database["public"]["Enums"]["app_role"] | null
          created_at: string
          display_name: string | null
          email: string
          id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          assigned_role?: Database["public"]["Enums"]["app_role"] | null
          created_at?: string
          display_name?: string | null
          email: string
          id?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          assigned_role?: Database["public"]["Enums"]["app_role"] | null
          created_at?: string
          display_name?: string | null
          email?: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      projetos: {
        Row: {
          arquivos_urls: string[] | null
          cliente_id: string
          created_at: string
          criado_por: string | null
          descricao: string | null
          id: string
          nome: string
          notas: string | null
          status: Database["public"]["Enums"]["projeto_status"]
          updated_at: string
        }
        Insert: {
          arquivos_urls?: string[] | null
          cliente_id: string
          created_at?: string
          criado_por?: string | null
          descricao?: string | null
          id?: string
          nome: string
          notas?: string | null
          status?: Database["public"]["Enums"]["projeto_status"]
          updated_at?: string
        }
        Update: {
          arquivos_urls?: string[] | null
          cliente_id?: string
          created_at?: string
          criado_por?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          notas?: string | null
          status?: Database["public"]["Enums"]["projeto_status"]
          updated_at?: string
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
      site_settings: {
        Row: {
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      tickets_suporte: {
        Row: {
          assunto: string
          cliente_id: string
          created_at: string
          id: string
          mensagem: string
          respondido_em: string | null
          respondido_por: string | null
          resposta: string | null
          status: string
          updated_at: string
        }
        Insert: {
          assunto: string
          cliente_id: string
          created_at?: string
          id?: string
          mensagem: string
          respondido_em?: string | null
          respondido_por?: string | null
          resposta?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          assunto?: string
          cliente_id?: string
          created_at?: string
          id?: string
          mensagem?: string
          respondido_em?: string | null
          respondido_por?: string | null
          resposta?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_suporte_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      send_push_via_edge: {
        Args: { body: string; target_type: string; title: string; url?: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "vendendo" | "administrativo"
      cadastro_status: "novo" | "em_analise" | "aprovado" | "recusado"
      notification_type: "cadastro" | "cliente" | "alerta" | "suporte"
      pedido_status:
        | "recebido"
        | "em_analise"
        | "aceito"
        | "entregue"
        | "cancelado"
      pedido_tipo: "produto" | "servico" | "combo"
      projeto_status: "planejamento" | "em_andamento" | "concluido"
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
      app_role: ["admin", "moderator", "user", "vendendo", "administrativo"],
      cadastro_status: ["novo", "em_analise", "aprovado", "recusado"],
      notification_type: ["cadastro", "cliente", "alerta", "suporte"],
      pedido_status: [
        "recebido",
        "em_analise",
        "aceito",
        "entregue",
        "cancelado",
      ],
      pedido_tipo: ["produto", "servico", "combo"],
      projeto_status: ["planejamento", "em_andamento", "concluido"],
    },
  },
} as const
