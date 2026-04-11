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
      cliente_checklist_items: {
        Row: {
          cliente_id: string
          created_at: string
          descricao: string | null
          id: string
          item_key: string
          ordem: number
          status: string
          titulo: string
          updated_at: string
          updated_by: string | null
          valor_texto: string | null
        }
        Insert: {
          cliente_id: string
          created_at?: string
          descricao?: string | null
          id?: string
          item_key: string
          ordem?: number
          status?: string
          titulo: string
          updated_at?: string
          updated_by?: string | null
          valor_texto?: string | null
        }
        Update: {
          cliente_id?: string
          created_at?: string
          descricao?: string | null
          id?: string
          item_key?: string
          ordem?: number
          status?: string
          titulo?: string
          updated_at?: string
          updated_by?: string | null
          valor_texto?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cliente_checklist_items_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          auth_user_id: string | null
          avatar: string | null
          bairro: string | null
          bloqueado: boolean | null
          cep: string | null
          cidade: string | null
          codigo_desbloqueio: string | null
          complemento: string | null
          created_at: string
          documento: string | null
          email: string
          endereco: string | null
          estado: string | null
          id: string
          instagram: string | null
          nome: string
          nome_empresa: string | null
          numero_endereco: string | null
          referral_code: string | null
          senha: string | null
          site_url: string | null
          status: string
          telefone: string | null
          tentativas_login: number | null
          trial_ends_at: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          auth_user_id?: string | null
          avatar?: string | null
          bairro?: string | null
          bloqueado?: boolean | null
          cep?: string | null
          cidade?: string | null
          codigo_desbloqueio?: string | null
          complemento?: string | null
          created_at?: string
          documento?: string | null
          email: string
          endereco?: string | null
          estado?: string | null
          id?: string
          instagram?: string | null
          nome: string
          nome_empresa?: string | null
          numero_endereco?: string | null
          referral_code?: string | null
          senha?: string | null
          site_url?: string | null
          status?: string
          telefone?: string | null
          tentativas_login?: number | null
          trial_ends_at?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          auth_user_id?: string | null
          avatar?: string | null
          bairro?: string | null
          bloqueado?: boolean | null
          cep?: string | null
          cidade?: string | null
          codigo_desbloqueio?: string | null
          complemento?: string | null
          created_at?: string
          documento?: string | null
          email?: string
          endereco?: string | null
          estado?: string | null
          id?: string
          instagram?: string | null
          nome?: string
          nome_empresa?: string | null
          numero_endereco?: string | null
          referral_code?: string | null
          senha?: string | null
          site_url?: string | null
          status?: string
          telefone?: string | null
          tentativas_login?: number | null
          trial_ends_at?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      comissoes: {
        Row: {
          cliente_id: string | null
          data_gerada: string | null
          id: string
          pedido_id: string | null
          revendedor_id: string | null
          status_pagamento: string | null
          valor: number
        }
        Insert: {
          cliente_id?: string | null
          data_gerada?: string | null
          id?: string
          pedido_id?: string | null
          revendedor_id?: string | null
          status_pagamento?: string | null
          valor: number
        }
        Update: {
          cliente_id?: string | null
          data_gerada?: string | null
          id?: string
          pedido_id?: string | null
          revendedor_id?: string | null
          status_pagamento?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "comissoes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comissoes_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comissoes_revendedor_id_fkey"
            columns: ["revendedor_id"]
            isOneToOne: false
            referencedRelation: "revendedores"
            referencedColumns: ["id"]
          },
        ]
      }
      contratos: {
        Row: {
          archived_at: string | null
          assinatura_admin: string | null
          assinatura_cliente: string | null
          assinatura_cliente_email: string | null
          assinatura_cliente_nome: string | null
          builder_payload: Json | null
          cliente_id: string | null
          corpo: string | null
          created_at: string
          data_assinatura: string | null
          data_envio: string
          data_visualizacao: string | null
          descricao: string | null
          id: string
          modelo: string | null
          onboarding_started_at: string | null
          pedido_id: string | null
          reassinatura_motivo: string | null
          requer_reassinatura: boolean
          status: string
          titulo: string
          updated_at: string
          valor: number
        }
        Insert: {
          archived_at?: string | null
          assinatura_admin?: string | null
          assinatura_cliente?: string | null
          assinatura_cliente_email?: string | null
          assinatura_cliente_nome?: string | null
          builder_payload?: Json | null
          cliente_id?: string | null
          corpo?: string | null
          created_at?: string
          data_assinatura?: string | null
          data_envio?: string
          data_visualizacao?: string | null
          descricao?: string | null
          id?: string
          modelo?: string | null
          onboarding_started_at?: string | null
          pedido_id?: string | null
          reassinatura_motivo?: string | null
          requer_reassinatura?: boolean
          status?: string
          titulo: string
          updated_at?: string
          valor?: number
        }
        Update: {
          archived_at?: string | null
          assinatura_admin?: string | null
          assinatura_cliente?: string | null
          assinatura_cliente_email?: string | null
          assinatura_cliente_nome?: string | null
          builder_payload?: Json | null
          cliente_id?: string | null
          corpo?: string | null
          created_at?: string
          data_assinatura?: string | null
          data_envio?: string
          data_visualizacao?: string | null
          descricao?: string | null
          id?: string
          modelo?: string | null
          onboarding_started_at?: string | null
          pedido_id?: string | null
          reassinatura_motivo?: string | null
          requer_reassinatura?: boolean
          status?: string
          titulo?: string
          updated_at?: string
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
          {
            foreignKeyName: "contratos_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
        ]
      }
      contrato_versions: {
        Row: {
          builder_payload: Json | null
          contrato_id: string
          corpo: string | null
          created_at: string
          descricao: string | null
          id: string
          status: string
          titulo: string
          valor: number
          version_number: number
        }
        Insert: {
          builder_payload?: Json | null
          contrato_id: string
          corpo?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          status?: string
          titulo: string
          valor?: number
          version_number: number
        }
        Update: {
          builder_payload?: Json | null
          contrato_id?: string
          corpo?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          status?: string
          titulo?: string
          valor?: number
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "contrato_versions_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
        ]
      }
      custos_sistema: {
        Row: {
          categoria: string
          created_at: string
          descricao: string | null
          dia_vencimento: number | null
          fornecedor: string | null
          frequencia: string
          id: string
          nome: string
          observacoes: string | null
          pagamento_automatico: boolean
          proxima_cobranca: string | null
          status: string
          updated_at: string
          valor: number
        }
        Insert: {
          categoria?: string
          created_at?: string
          descricao?: string | null
          dia_vencimento?: number | null
          fornecedor?: string | null
          frequencia?: string
          id?: string
          nome: string
          observacoes?: string | null
          pagamento_automatico?: boolean
          proxima_cobranca?: string | null
          status?: string
          updated_at?: string
          valor: number
        }
        Update: {
          categoria?: string
          created_at?: string
          descricao?: string | null
          dia_vencimento?: number | null
          fornecedor?: string | null
          frequencia?: string
          id?: string
          nome?: string
          observacoes?: string | null
          pagamento_automatico?: boolean
          proxima_cobranca?: string | null
          status?: string
          updated_at?: string
          valor?: number
        }
        Relationships: []
      }
      demo_sites: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          descricao: string | null
          id: string
          imagem_url: string | null
          link: string
          nome: string
          ordem: number | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          imagem_url?: string | null
          link: string
          nome: string
          ordem?: number | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          imagem_url?: string | null
          link?: string
          nome?: string
          ordem?: number | null
        }
        Relationships: []
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
          subcategoria: string | null
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
          subcategoria?: string | null
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
          subcategoria?: string | null
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
          pacote_id: string | null
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
          pacote_id?: string | null
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
          pacote_id?: string | null
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
          {
            foreignKeyName: "extras_clientes_pacote_id_fkey"
            columns: ["pacote_id"]
            isOneToOne: false
            referencedRelation: "pacotes"
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
      health_check: {
        Row: {
          id: string
          last_ping: string | null
          name: string | null
        }
        Insert: {
          id?: string
          last_ping?: string | null
          name?: string | null
        }
        Update: {
          id?: string
          last_ping?: string | null
          name?: string | null
        }
        Relationships: []
      }
      healthcheck: {
        Row: {
          created_at: string | null
          id: string
          name: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string | null
        }
        Relationships: []
      }
      internal_notes: {
        Row: {
          content: string
          created_at: string
          created_by: string
          entity_id: string
          entity_type: string
          id: string
          pinned: boolean
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string
          entity_id: string
          entity_type: string
          id?: string
          pinned?: boolean
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string
          entity_id?: string
          entity_type?: string
          id?: string
          pinned?: boolean
        }
        Relationships: []
      }
      lead_submission_log: {
        Row: {
          created_at: string
          email_hash: string | null
          fingerprint_hash: string
          id: string
          origin_path: string | null
          phone_hash: string | null
          source: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          email_hash?: string | null
          fingerprint_hash: string
          id?: string
          origin_path?: string | null
          phone_hash?: string | null
          source?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          email_hash?: string | null
          fingerprint_hash?: string
          id?: string
          origin_path?: string | null
          phone_hash?: string | null
          source?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          cidade: string | null
          como_conheceu: string | null
          coupon_code: string | null
          created_at: string
          documento: string | null
          email: string
          estado: string | null
          id: string
          mensagem: string | null
          motivo_perda: string | null
          nome: string
          nome_negocio: string | null
          notas: string | null
          orcamento: string | null
          referred_by_id: string | null
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
          coupon_code?: string | null
          created_at?: string
          documento?: string | null
          email: string
          estado?: string | null
          id?: string
          mensagem?: string | null
          motivo_perda?: string | null
          nome: string
          nome_negocio?: string | null
          notas?: string | null
          orcamento?: string | null
          referred_by_id?: string | null
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
          coupon_code?: string | null
          created_at?: string
          documento?: string | null
          email?: string
          estado?: string | null
          id?: string
          mensagem?: string | null
          motivo_perda?: string | null
          nome?: string
          nome_negocio?: string | null
          notas?: string | null
          orcamento?: string | null
          referred_by_id?: string | null
          segmento?: string | null
          servicos?: string[] | null
          status?: string
          updated_at?: string
          visualizado?: boolean
          whatsapp?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_referred_by_id_fkey"
            columns: ["referred_by_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_categorias: {
        Row: {
          cliente_id: string
          created_at: string
          id: string
          nome: string
          ordem: number | null
          status: string
        }
        Insert: {
          cliente_id: string
          created_at?: string
          id?: string
          nome: string
          ordem?: number | null
          status?: string
        }
        Update: {
          cliente_id?: string
          created_at?: string
          id?: string
          nome?: string
          ordem?: number | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_categorias_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_itens: {
        Row: {
          categoria_id: string | null
          cliente_id: string
          created_at: string
          descricao: string | null
          id: string
          imagem: string | null
          nome: string
          opcoes: Json | null
          preco: number
          status: string
        }
        Insert: {
          categoria_id?: string | null
          cliente_id: string
          created_at?: string
          descricao?: string | null
          id?: string
          imagem?: string | null
          nome: string
          opcoes?: Json | null
          preco?: number
          status?: string
        }
        Update: {
          categoria_id?: string | null
          cliente_id?: string
          created_at?: string
          descricao?: string | null
          id?: string
          imagem?: string | null
          nome?: string
          opcoes?: Json | null
          preco?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_itens_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "menu_categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_itens_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_pedidos: {
        Row: {
          cliente_id: string
          created_at: string
          customer_endereco: string | null
          customer_nome: string
          customer_whatsapp: string | null
          id: string
          itens: Json
          metodo_pagamento: string | null
          status: string
          total: number
        }
        Insert: {
          cliente_id: string
          created_at?: string
          customer_endereco?: string | null
          customer_nome: string
          customer_whatsapp?: string | null
          id?: string
          itens?: Json
          metodo_pagamento?: string | null
          status?: string
          total?: number
        }
        Update: {
          cliente_id?: string
          created_at?: string
          customer_endereco?: string | null
          customer_nome?: string
          customer_whatsapp?: string | null
          id?: string
          itens?: Json
          metodo_pagamento?: string | null
          status?: string
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "menu_pedidos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
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
      contrato_eventos: {
        Row: {
          actor_id: string | null
          actor_type: string
          contrato_id: string
          created_at: string
          descricao: string | null
          id: string
          meta: Json
          tipo: string
          titulo: string
        }
        Insert: {
          actor_id?: string | null
          actor_type?: string
          contrato_id: string
          created_at?: string
          descricao?: string | null
          id?: string
          meta?: Json
          tipo: string
          titulo: string
        }
        Update: {
          actor_id?: string | null
          actor_type?: string
          contrato_id?: string
          created_at?: string
          descricao?: string | null
          id?: string
          meta?: Json
          tipo?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "contrato_eventos_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
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
      pacote_itens: {
        Row: {
          created_at: string | null
          extra_id: string | null
          id: string
          pacote_id: string | null
        }
        Insert: {
          created_at?: string | null
          extra_id?: string | null
          id?: string
          pacote_id?: string | null
        }
        Update: {
          created_at?: string | null
          extra_id?: string | null
          id?: string
          pacote_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pacote_itens_extra_id_fkey"
            columns: ["extra_id"]
            isOneToOne: false
            referencedRelation: "extras_catalogo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pacote_itens_pacote_id_fkey"
            columns: ["pacote_id"]
            isOneToOne: false
            referencedRelation: "pacotes"
            referencedColumns: ["id"]
          },
        ]
      }
      pacotes: {
        Row: {
          created_at: string | null
          descricao: string | null
          id: string
          nome: string
          preco_total: number | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome: string
          preco_total?: number | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          preco_total?: number | null
          status?: string | null
        }
        Relationships: []
      }
      pedidos: {
        Row: {
          cliente_id: string | null
          codigo: string
          created_at: string
          data: string
          descricao: string | null
          id: string
          observacoes: string | null
          projeto_id: string | null
          status: string
          titulo: string | null
          tipo: string
          valor: number
        }
        Insert: {
          cliente_id?: string | null
          codigo: string
          created_at?: string
          data?: string
          descricao?: string | null
          id?: string
          observacoes?: string | null
          projeto_id?: string | null
          status?: string
          titulo?: string | null
          tipo: string
          valor?: number
        }
        Update: {
          cliente_id?: string | null
          codigo?: string
          created_at?: string
          data?: string
          descricao?: string | null
          id?: string
          observacoes?: string | null
          projeto_id?: string | null
          status?: string
          titulo?: string | null
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
      briefing_attachments: {
        Row: {
          briefing_id: string
          cliente_id: string
          created_at: string
          enviado_por: string
          field_id: string | null
          id: string
          nome: string
          storage_bucket: string
          storage_path: string
          tamanho: number | null
          tipo: string | null
          url: string
        }
        Insert: {
          briefing_id: string
          cliente_id: string
          created_at?: string
          enviado_por?: string
          field_id?: string | null
          id?: string
          nome: string
          storage_bucket?: string
          storage_path: string
          tamanho?: number | null
          tipo?: string | null
          url: string
        }
        Update: {
          briefing_id?: string
          cliente_id?: string
          created_at?: string
          enviado_por?: string
          field_id?: string | null
          id?: string
          nome?: string
          storage_bucket?: string
          storage_path?: string
          tamanho?: number | null
          tipo?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "briefing_attachments_briefing_id_fkey"
            columns: ["briefing_id"]
            isOneToOne: false
            referencedRelation: "client_briefings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "briefing_attachments_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "briefing_attachments_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "client_briefing_fields"
            referencedColumns: ["id"]
          },
        ]
      }
      briefing_templates: {
        Row: {
          active: boolean
          created_at: string
          field_type: string
          help_text: string | null
          id: string
          label: string
          options: Json
          placeholder: string | null
          required_default: boolean
          section_name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          field_type?: string
          help_text?: string | null
          id?: string
          label: string
          options?: Json
          placeholder?: string | null
          required_default?: boolean
          section_name?: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          field_type?: string
          help_text?: string | null
          id?: string
          label?: string
          options?: Json
          placeholder?: string | null
          required_default?: boolean
          section_name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      client_briefing_answers: {
        Row: {
          answer_json: Json
          answer_text: string | null
          briefing_id: string
          cliente_id: string
          created_at: string
          field_id: string
          id: string
          updated_at: string
        }
        Insert: {
          answer_json?: Json
          answer_text?: string | null
          briefing_id: string
          cliente_id: string
          created_at?: string
          field_id: string
          id?: string
          updated_at?: string
        }
        Update: {
          answer_json?: Json
          answer_text?: string | null
          briefing_id?: string
          cliente_id?: string
          created_at?: string
          field_id?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_briefing_answers_briefing_id_fkey"
            columns: ["briefing_id"]
            isOneToOne: false
            referencedRelation: "client_briefings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_briefing_answers_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_briefing_answers_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "client_briefing_fields"
            referencedColumns: ["id"]
          },
        ]
      }
      client_briefing_fields: {
        Row: {
          briefing_id: string
          created_at: string
          field_type: string
          help_text: string | null
          id: string
          is_custom: boolean
          label: string
          options: Json
          placeholder: string | null
          required: boolean
          section_name: string
          sort_order: number
          template_id: string | null
          updated_at: string
        }
        Insert: {
          briefing_id: string
          created_at?: string
          field_type?: string
          help_text?: string | null
          id?: string
          is_custom?: boolean
          label: string
          options?: Json
          placeholder?: string | null
          required?: boolean
          section_name?: string
          sort_order?: number
          template_id?: string | null
          updated_at?: string
        }
        Update: {
          briefing_id?: string
          created_at?: string
          field_type?: string
          help_text?: string | null
          id?: string
          is_custom?: boolean
          label?: string
          options?: Json
          placeholder?: string | null
          required?: boolean
          section_name?: string
          sort_order?: number
          template_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_briefing_fields_briefing_id_fkey"
            columns: ["briefing_id"]
            isOneToOne: false
            referencedRelation: "client_briefings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_briefing_fields_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "briefing_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      client_briefings: {
        Row: {
          cliente_id: string
          completed_at: string | null
          created_at: string
          id: string
          instrucoes: string | null
          projeto_id: string | null
          sent_at: string | null
          snapshot_briefing: string | null
          snapshot_references: string | null
          started_at: string | null
          status: string
          submitted_at: string | null
          titulo: string
          updated_at: string
        }
        Insert: {
          cliente_id: string
          completed_at?: string | null
          created_at?: string
          id?: string
          instrucoes?: string | null
          projeto_id?: string | null
          sent_at?: string | null
          snapshot_briefing?: string | null
          snapshot_references?: string | null
          started_at?: string | null
          status?: string
          submitted_at?: string | null
          titulo: string
          updated_at?: string
        }
        Update: {
          cliente_id?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          instrucoes?: string | null
          projeto_id?: string | null
          sent_at?: string | null
          snapshot_briefing?: string | null
          snapshot_references?: string | null
          started_at?: string | null
          status?: string
          submitted_at?: string | null
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_briefings_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_briefings_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
        ]
      }
      client_brand_profiles: {
        Row: {
          accent_color: string | null
          cliente_id: string
          created_at: string
          font_body: string | null
          font_heading: string | null
          id: string
          inspiration_links: string | null
          logo_storage_bucket: string
          logo_storage_path: string | null
          logo_url: string | null
          notes: string | null
          primary_color: string | null
          references_text: string | null
          secondary_color: string | null
          style_tags: Json
          updated_at: string
        }
        Insert: {
          accent_color?: string | null
          cliente_id: string
          created_at?: string
          font_body?: string | null
          font_heading?: string | null
          id?: string
          inspiration_links?: string | null
          logo_storage_bucket?: string
          logo_storage_path?: string | null
          logo_url?: string | null
          notes?: string | null
          primary_color?: string | null
          references_text?: string | null
          secondary_color?: string | null
          style_tags?: Json
          updated_at?: string
        }
        Update: {
          accent_color?: string | null
          cliente_id?: string
          created_at?: string
          font_body?: string | null
          font_heading?: string | null
          id?: string
          inspiration_links?: string | null
          logo_storage_bucket?: string
          logo_storage_path?: string | null
          logo_url?: string | null
          notes?: string | null
          primary_color?: string | null
          references_text?: string | null
          secondary_color?: string | null
          style_tags?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_brand_profiles_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: true
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      projeto_arquivos: {
        Row: {
          briefing_field_id: string | null
          created_at: string | null
          enviado_por: string
          id: string
          nome: string
          projeto_id: string
          source: string
          tamanho: number | null
          tipo: string | null
          url: string
        }
        Insert: {
          briefing_field_id?: string | null
          created_at?: string | null
          enviado_por?: string
          id?: string
          nome: string
          projeto_id: string
          source?: string
          tamanho?: number | null
          tipo?: string | null
          url: string
        }
        Update: {
          briefing_field_id?: string | null
          created_at?: string | null
          enviado_por?: string
          id?: string
          nome?: string
          projeto_id?: string
          source?: string
          tamanho?: number | null
          tipo?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "projeto_arquivos_briefing_field_id_fkey"
            columns: ["briefing_field_id"]
            isOneToOne: false
            referencedRelation: "project_briefing_fields"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projeto_arquivos_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
        ]
      }
      project_briefing_answers: {
        Row: {
          answer_json: Json
          answer_text: string | null
          briefing_id: string
          cliente_id: string
          created_at: string
          field_id: string
          id: string
          updated_at: string
        }
        Insert: {
          answer_json?: Json
          answer_text?: string | null
          briefing_id: string
          cliente_id: string
          created_at?: string
          field_id: string
          id?: string
          updated_at?: string
        }
        Update: {
          answer_json?: Json
          answer_text?: string | null
          briefing_id?: string
          cliente_id?: string
          created_at?: string
          field_id?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_briefing_answers_briefing_id_fkey"
            columns: ["briefing_id"]
            isOneToOne: false
            referencedRelation: "project_briefings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_briefing_answers_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_briefing_answers_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "project_briefing_fields"
            referencedColumns: ["id"]
          },
        ]
      }
      project_briefing_fields: {
        Row: {
          briefing_id: string
          created_at: string
          field_type: string
          help_text: string | null
          id: string
          label: string
          options: Json
          placeholder: string | null
          required: boolean
          section_name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          briefing_id: string
          created_at?: string
          field_type?: string
          help_text?: string | null
          id?: string
          label: string
          options?: Json
          placeholder?: string | null
          required?: boolean
          section_name?: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          briefing_id?: string
          created_at?: string
          field_type?: string
          help_text?: string | null
          id?: string
          label?: string
          options?: Json
          placeholder?: string | null
          required?: boolean
          section_name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_briefing_fields_briefing_id_fkey"
            columns: ["briefing_id"]
            isOneToOne: false
            referencedRelation: "project_briefings"
            referencedColumns: ["id"]
          },
        ]
      }
      project_briefings: {
        Row: {
          cliente_id: string
          completed_at: string | null
          created_at: string
          id: string
          instrucoes: string | null
          projeto_id: string
          sent_at: string | null
          started_at: string | null
          status: string
          submitted_at: string | null
          titulo: string
          updated_at: string
        }
        Insert: {
          cliente_id: string
          completed_at?: string | null
          created_at?: string
          id?: string
          instrucoes?: string | null
          projeto_id: string
          sent_at?: string | null
          started_at?: string | null
          status?: string
          submitted_at?: string | null
          titulo: string
          updated_at?: string
        }
        Update: {
          cliente_id?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          instrucoes?: string | null
          projeto_id?: string
          sent_at?: string | null
          started_at?: string | null
          status?: string
          submitted_at?: string | null
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_briefings_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_briefings_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: true
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
          briefing: string | null
          cliente_id: string | null
          created_at: string
          data_entrega: string | null
          descricao: string | null
          hora_entrega: string | null
          id: string
          inicio: string | null
          prazo: string | null
          progresso: number
          referencias: string | null
          responsavel: string | null
          status: string
          titulo: string
          updated_at: string
          url_site: string | null
          valor: number
        }
        Insert: {
          briefing?: string | null
          cliente_id?: string | null
          created_at?: string
          data_entrega?: string | null
          descricao?: string | null
          hora_entrega?: string | null
          id?: string
          inicio?: string | null
          prazo?: string | null
          progresso?: number
          referencias?: string | null
          responsavel?: string | null
          status?: string
          titulo: string
          updated_at?: string
          url_site?: string | null
          valor?: number
        }
        Update: {
          briefing?: string | null
          cliente_id?: string | null
          created_at?: string
          data_entrega?: string | null
          descricao?: string | null
          hora_entrega?: string | null
          id?: string
          inicio?: string | null
          prazo?: string | null
          progresso?: number
          referencias?: string | null
          responsavel?: string | null
          status?: string
          titulo?: string
          updated_at?: string
          url_site?: string | null
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
      recurrent_billing_history: {
        Row: {
          ano: number
          asaas_invoice_url: string | null
          asaas_payment_id: string | null
          cliente_id: string
          created_at: string | null
          data_pagamento: string | null
          descricao: string | null
          extras_count: number
          financeiro_id: string | null
          forma_pagamento: string | null
          id: string
          mes: string
          mes_numero: number
          status: string
          updated_at: string | null
          valor_total: number
          vencimento: string | null
        }
        Insert: {
          ano: number
          asaas_invoice_url?: string | null
          asaas_payment_id?: string | null
          cliente_id: string
          created_at?: string | null
          data_pagamento?: string | null
          descricao?: string | null
          extras_count?: number
          financeiro_id?: string | null
          forma_pagamento?: string | null
          id?: string
          mes: string
          mes_numero: number
          status: string
          updated_at?: string | null
          valor_total: number
          vencimento?: string | null
        }
        Update: {
          ano?: number
          asaas_invoice_url?: string | null
          asaas_payment_id?: string | null
          cliente_id?: string
          created_at?: string | null
          data_pagamento?: string | null
          descricao?: string | null
          extras_count?: number
          financeiro_id?: string | null
          forma_pagamento?: string | null
          id?: string
          mes?: string
          mes_numero?: number
          status?: string
          updated_at?: string | null
          valor_total?: number
          vencimento?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recurrent_billing_history_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurrent_billing_history_financeiro_id_fkey"
            columns: ["financeiro_id"]
            isOneToOne: false
            referencedRelation: "financeiro"
            referencedColumns: ["id"]
          },
        ]
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
      revendedores: {
        Row: {
          avatar: string | null
          comissao_padrao: number | null
          created_at: string | null
          email: string
          id: string
          nome: string
          referral_code: string
          saldo_comissao: number | null
          status: string | null
          whatsapp: string | null
        }
        Insert: {
          avatar?: string | null
          comissao_padrao?: number | null
          created_at?: string | null
          email: string
          id?: string
          nome: string
          referral_code: string
          saldo_comissao?: number | null
          status?: string | null
          whatsapp?: string | null
        }
        Update: {
          avatar?: string | null
          comissao_padrao?: number | null
          created_at?: string | null
          email?: string
          id?: string
          nome?: string
          referral_code?: string
          saldo_comissao?: number | null
          status?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      saques_revenda: {
        Row: {
          chave_pix: string
          data_pagamento: string | null
          data_solicitacao: string | null
          id: string
          revendedor_id: string | null
          status: string | null
          valor: number
        }
        Insert: {
          chave_pix: string
          data_pagamento?: string | null
          data_solicitacao?: string | null
          id?: string
          revendedor_id?: string | null
          status?: string | null
          valor: number
        }
        Update: {
          chave_pix?: string
          data_pagamento?: string | null
          data_solicitacao?: string | null
          id?: string
          revendedor_id?: string | null
          status?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "saques_revenda_revendedor_id_fkey"
            columns: ["revendedor_id"]
            isOneToOne: false
            referencedRelation: "revendedores"
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
      ticket_support_meta: {
        Row: {
          assigned_to_user_id: string | null
          created_at: string
          due_at: string | null
          sla_hours: number | null
          ticket_id: string
          updated_at: string
        }
        Insert: {
          assigned_to_user_id?: string | null
          created_at?: string
          due_at?: string | null
          sla_hours?: number | null
          ticket_id: string
          updated_at?: string
        }
        Update: {
          assigned_to_user_id?: string | null
          created_at?: string
          due_at?: string | null
          sla_hours?: number | null
          ticket_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_support_meta_assigned_to_user_id_fkey"
            columns: ["assigned_to_user_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_support_meta_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: true
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
          bloqueado: boolean | null
          cargo: string | null
          codigo_desbloqueio: string | null
          created_at: string
          email: string
          id: string
          nome: string
          senha: string | null
          status: string
          tentativas_login: number | null
        }
        Insert: {
          acesso?: string
          avatar?: string | null
          bloqueado?: boolean | null
          cargo?: string | null
          codigo_desbloqueio?: string | null
          created_at?: string
          email: string
          id?: string
          nome: string
          senha?: string | null
          status?: string
          tentativas_login?: number | null
        }
        Update: {
          acesso?: string
          avatar?: string | null
          bloqueado?: boolean | null
          cargo?: string | null
          codigo_desbloqueio?: string | null
          created_at?: string
          email?: string
          id?: string
          nome?: string
          senha?: string | null
          status?: string
          tentativas_login?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      bootstrap_client_portal_profile: { Args: never; Returns: Json }
      get_cliente_id: { Args: never; Returns: string }
      is_admin: { Args: never; Returns: boolean }
      mark_contract_viewed: {
        Args: { p_contract_id: string }
        Returns: Database["public"]["Tables"]["contratos"]["Row"]
      }
      request_contract_revision: {
        Args: { p_contract_id: string; p_message: string }
        Returns: Database["public"]["Tables"]["contratos"]["Row"]
      }
      sign_contract_from_portal: {
        Args: { p_contract_id: string; p_full_name: string }
        Returns: Database["public"]["Tables"]["contratos"]["Row"]
      }
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
