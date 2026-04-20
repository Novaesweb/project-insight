import { Clock } from "lucide-react";

export interface ExtraRecorrente {
  id: string;
  nome: string;
  preco_mensal: number;
  status: string;
  data_ativacao: string;
}

export interface ClienteRecorrente {
  cliente_id: string;
  cliente_nome: string;
  cliente_email: string;
  cliente_documento?: string;
  cliente_telefone?: string;
  extras: ExtraRecorrente[];
  totalMensal: number;
}

export interface FaturaMes {
  id: string;
  cliente_id: string;
  mes: string;
  ano: number;
  mes_numero: number;
  valor_total: number;
  status: string;
  forma_pagamento?: string;
  data_pagamento?: string;
  financeiro_id?: string;
  asaas_payment_id?: string;
  asaas_invoice_url?: string;
  extras_count: number;
  descricao?: string;
  vencimento?: string;
  created_at: string;
}

export const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
  rascunho: { label: "Rascunho", variant: "outline", icon: null },
  pendente: { label: "Pendente", variant: "secondary", icon: Clock },
  pago_manualmente: { label: "Pago Manual", variant: "default", icon: null },
  pago_asaas: { label: "Pago Asaas", variant: "default", icon: null },
  em_atraso: { label: "Em Atraso", variant: "destructive", icon: null },
};

export const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
export const formatMes = (mes: string) => { 
  const [a, m] = mes.split("-"); 
  return `${MESES[parseInt(m)-1]}/${a}`; 
};
