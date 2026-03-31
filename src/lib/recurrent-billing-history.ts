import { supabase } from "@/integrations/supabase/client";

export interface RecurrentBillingHistory {
  id: string;
  cliente_id: string;
  mes: string; // Formato: "2026-03"
  ano: number;
  mes_numero: number; // 1-12
  valor_total: number;
  status: "pendente" | "pago_manualmente" | "pago_asaas" | "em_atraso";
  forma_pagamento?: "manual" | "asaas";
  data_pagamento?: string;
  financeiro_id?: string;
  asaas_payment_id?: string;
  asaas_invoice_url?: string;
  extras_count: number;
  descricao: string;
  created_at: string;
  updated_at: string;
}

export class RecurrentBillingHistoryService {
  /**
   * Busca histórico de cobranças recorrentes de um cliente
   */
  static async getHistoryByClient(clienteId: string): Promise<RecurrentBillingHistory[]> {
    const { data, error } = await (supabase as any)
      .from("recurrent_billing_history")
      .select("*")
      .eq("cliente_id", clienteId)
      .order("ano", { ascending: false })
      .order("mes_numero", { ascending: false });

    if (error) {
      console.error("Erro ao buscar histórico:", error);
      throw error;
    }

    return (data || []) as RecurrentBillingHistory[];
  }

  /**
   * Busca histórico por mês específico
   */
  static async getHistoryByMonth(clienteId: string, mes: string): Promise<RecurrentBillingHistory | null> {
    const { data, error } = await (supabase as any)
      .from("recurrent_billing_history")
      .select("*")
      .eq("cliente_id", clienteId)
      .eq("mes", mes)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Erro ao buscar histórico do mês:", error);
      throw error;
    }

    return data as RecurrentBillingHistory | null;
  }

  /**
   * Cria novo registro de histórico mensal
   */
  static async createHistoryRecord(record: Omit<RecurrentBillingHistory, "id" | "created_at" | "updated_at">): Promise<RecurrentBillingHistory> {
    const { data, error } = await supabase
      .from("recurrent_billing_history")
      .insert(record)
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar histórico:", error);
      throw error;
    }

    return data;
  }

  /**
   * Atualiza status de pagamento
   */
  static async updatePaymentStatus(
    id: string, 
    status: RecurrentBillingHistory["status"],
    formaPagamento?: RecurrentBillingHistory["forma_pagamento"],
    dataPagamento?: string
  ): Promise<RecurrentBillingHistory> {
    const updateData: Partial<RecurrentBillingHistory> = {
      status,
      updated_at: new Date().toISOString()
    };

    if (formaPagamento) updateData.forma_pagamento = formaPagamento;
    if (dataPagamento) updateData.data_pagamento = dataPagamento;

    const { data, error } = await supabase
      .from("recurrent_billing_history")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Erro ao atualizar status:", error);
      throw error;
    }

    return data;
  }

  /**
   * Verifica se já existe cobrança para o mês
   */
  static async hasBillingForMonth(clienteId: string, mes: string): Promise<boolean> {
    const existing = await this.getHistoryByMonth(clienteId, mes);
    return existing !== null;
  }

  /**
   * Formata mês para exibição
   */
  static formatMonthDisplay(mes: string): string {
    const [ano, mesNumero] = mes.split("-");
    const meses = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    return `${meses[parseInt(mesNumero) - 1]}/${ano}`;
  }

  /**
   * Gera próximo mês a partir do atual
   */
  static getNextMonth(currentMes: string): string {
    const [ano, mesNumero] = currentMes.split("-");
    let nextMes = parseInt(mesNumero) + 1;
    let nextAno = parseInt(ano);
    
    if (nextMes > 12) {
      nextMes = 1;
      nextAno++;
    }
    
    return `${nextAno}-${nextMes.toString().padStart(2, "0")}`;
  }

  /**
   * Verifica se mês está em atraso
   */
  static isMonthOverdue(mes: string): boolean {
    const [ano, mesNumero] = mes.split("-");
    const monthDate = new Date(parseInt(ano), parseInt(mesNumero) - 1, 1);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return monthDate < today;
  }

  /**
   * Obtém status para exibição
   */
  static getStatusDisplay(status: RecurrentBillingHistory["status"]): {
    label: string;
    color: string;
    bg: string;
  } {
    const statusMap = {
      pendente: {
        label: "Pendente",
        color: "text-amber-400",
        bg: "bg-amber-500/10"
      },
      pago_manualmente: {
        label: "Pago Manualmente",
        color: "text-blue-400",
        bg: "bg-blue-500/10"
      },
      pago_asaas: {
        label: "Pago pelo Asaas",
        color: "text-green-400",
        bg: "bg-green-500/10"
      },
      em_atraso: {
        label: "Em Atraso",
        color: "text-red-400",
        bg: "bg-red-500/10"
      }
    };

    return statusMap[status] || statusMap.pendente;
  }
}
