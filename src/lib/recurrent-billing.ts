import { supabase } from "@/integrations/supabase/client";
import { AsaasService } from "./asaas-service";

interface RecurrentBillingData {
  cliente_id: string;
  extra_id: string;
  nome_extra: string;
  preco_mensal: number;
  dia_vencimento: number; // Dia do mês para cobrar
  asaas_subscription_id?: string;
}

export class RecurrentBillingService {
  // Gerar cobranças recorrentes do mês
  static async generateMonthlyRecurrentBills(): Promise<void> {
    try {
      console.log("🔄 Iniciando geração de cobranças recorrentes mensais...");
      
      // 1. Buscar todos os extras mensais ativos
      const { data: extrasMensais, error: extrasError } = await supabase
        .from("extras_clientes")
        .select(`
          *,
          clientes!inner(nome, email, documento, whatsapp),
          extras_catalogo!inner(nome, categoria)
        `)
        .eq("status", "ativo")
        .in("categoria", ["mensal", "intermediario"])
        .gt("preco_mensal", 0);

      if (extrasError) {
        console.error("❌ Erro ao buscar extras mensais:", extrasError);
        return;
      }

      if (!extrasMensais || extrasMensais.length === 0) {
        console.log("✅ Nenhum extra mensal encontrado para cobrar");
        return;
      }

      console.log(`📊 Encontrados ${extrasMensais.length} extras mensais para processar`);

      // 2. Agrupar por cliente
      const clientesComExtras = this.groupByCliente(extrasMensais);
      
      // 3. Gerar fatura para cada cliente
      for (const [clienteId, dados] of Object.entries(clientesComExtras)) {
        await this.generateRecurrentBillForClient(clienteId, dados);
      }

      console.log("✅ Cobranças recorrentes geradas com sucesso!");
      
    } catch (error) {
      console.error("❌ Erro geral na geração de cobranças recorrentes:", error);
    }
  }

  // Gerar fatura recorrente para um cliente específico
  private static async generateRecurrentBillForClient(
    clienteId: string, 
    dados: {
      cliente: any;
      extras: any[];
    }
  ): Promise<void> {
    try {
      const { cliente, extras } = dados;
      
      // Calcular valor total das mensalidades
      const valorTotalMensal = extras.reduce((acc, extra) => 
        acc + Number(extra.preco_mensal || 0), 0
      );

      if (valorTotalMensal <= 0) {
        console.log(`⚠️ Cliente ${cliente.nome} não tem valor mensal para cobrar`);
        return;
      }

      // Verificar se já existe fatura para este mês
      const dataAtual = new Date();
      const mesAno = `${dataAtual.getFullYear()}-${String(dataAtual.getMonth() + 1).padStart(2, '0')}`;
      
      const { data: faturaExistente } = await supabase
        .from("financeiro")
        .select("id")
        .eq("cliente_id", clienteId)
        .like("descricao", "%RECURRENTE%")
        .like("descricao", `%${mesAno}%`)
        .eq("tipo", "entrada")
        .single();

      if (faturaExistente) {
        console.log(`⚠️ Cliente ${cliente.nome} já possui fatura recorrente para ${mesAno}`);
        return;
      }

      // Criar fatura recorrente
      const financeiroData = {
        cliente_id: clienteId,
        descricao: `COBRANÇA RECURRENTE - ${mesAno}\n` + 
          extras.map(extra => 
            `• ${extra.extras_catalogo.nome}: R$ ${Number(extra.preco_mensal).toFixed(2)}/mês`
          ).join('\n'),
        tipo: "entrada",
        valor: valorTotalMensal,
        vencimento: this.getProximoVencimento(dataAtual),
        status: "pendente"
      };

      const { data: financeiroRecord, error: financeiroError } = await supabase
        .from("financeiro")
        .insert(financeiroData)
        .select()
        .single();

      if (financeiroError) {
        console.error(`❌ Erro ao criar fatura recorrente para ${cliente.nome}:`, financeiroError);
        return;
      }

      // Gerar cobrança no Asaas
      if (financeiroRecord) {
        try {
          // Criar/atualizar cliente no Asaas
          const asaasCustomer = await AsaasService.getOrCreateCustomer({
            name: cliente.nome,
            email: cliente.email,
            cpfCnpj: cliente.documento || undefined,
            phone: cliente.whatsapp || undefined,
            externalReference: clienteId
          });

          // Gerar cobrança recorrente no Asaas
          const payment = await AsaasService.createPayment({
            customer: asaasCustomer.id,
            billingType: "UNDEFINED",
            value: valorTotalMensal,
            dueDate: financeiroData.vencimento,
            description: `Cobrança Recorrente - ${mesAno} - ${extras.length} Extras`
          });

          // Atualizar descrição com link do Asaas
          const novaDescricao = `${financeiroData.descricao}\n(Asaas: ${payment.invoiceUrl})`;
          await supabase
            .from("financeiro")
            .update({ descricao: novaDescricao })
            .eq("id", financeiroRecord.id);

          console.log(`✅ Cobrança recorrente gerada para ${cliente.nome} - R$ ${valorTotalMensal.toFixed(2)}`);
          
        } catch (asaasError) {
          console.error(`❌ Erro ao gerar cobrança Asaas para ${cliente.nome}:`, asaasError);
        }
      }

    } catch (error) {
      console.error(`❌ Erro ao gerar fatura recorrente para cliente ${clienteId}:`, error);
    }
  }

  // Agrupar extras por cliente
  private static groupByCliente(extras: any[]): Record<string, { cliente: any; extras: any[] }> {
    const grouped: Record<string, { cliente: any; extras: any[] }> = {};

    extras.forEach(extra => {
      const clienteId = extra.cliente_id;
      
      if (!grouped[clienteId]) {
        grouped[clienteId] = {
          cliente: {
            id: extra.cliente_id,
            nome: extra.clientes.nome,
            email: extra.clientes.email,
            documento: extra.clientes.documento,
            whatsapp: extra.clientes.whatsapp
          },
          extras: []
        };
      }

      grouped[clienteId].extras.push(extra);
    });

    return grouped;
  }

  // Calcular próximo vencimento (dia útil do próximo mês)
  private static getProximoVencimento(dataAtual: Date): string {
    const proximoMes = new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 1, 5); // Dia 5 do próximo mês
    
    // Se for fim de semana, adiar para segunda-feira
    if (proximoMes.getDay() === 0) { // Domingo
      proximoMes.setDate(proximoMes.getDate() + 1);
    } else if (proximoMes.getDay() === 6) { // Sábado
      proximoMes.setDate(proximoMes.getDate() + 2);
    }

    return proximoMes.toISOString().split('T')[0];
  }

  // Verificar cobranças próximas (para dashboard)
  static async getUpcomingBills(days: number = 7): Promise<any[]> {
    const dataFutura = new Date();
    dataFutura.setDate(dataFutura.getDate() + days);

    const { data, error } = await supabase
      .from("financeiro")
      .select(`
        *,
        clientes!inner(nome)
      `)
      .eq("tipo", "entrada")
      .like("descricao", "%RECURRENTE%")
      .lte("vencimento", dataFutura.toISOString().split('T')[0])
      .eq("status", "pendente")
      .order("vencimento", { ascending: true });

    return data || [];
  }

  // Cancelar assinatura recorrente
  static async cancelRecurrentSubscription(clienteId: string, extraId: string): Promise<void> {
    try {
      // 1. Desativar extra do cliente
      await supabase
        .from("extras_clientes")
        .update({ status: "cancelado" })
        .eq("cliente_id", clienteId)
        .eq("extra_id", extraId);

      // 2. Buscar assinaturas Asaas do cliente
      const { data: cliente } = await supabase
        .from("clientes")
        .select("asaas_customer_id")
        .eq("id", clienteId)
        .single();

      if (cliente?.asaas_customer_id) {
        // 3. Cancelar assinaturas no Asaas (se houver API para isso)
        // await AsaasService.cancelSubscriptions(customer.asaas_customer_id);
      }

      console.log(`✅ Assinatura recorrente cancelada para cliente ${clienteId}, extra ${extraId}`);
      
    } catch (error) {
      console.error("❌ Erro ao cancelar assinatura recorrente:", error);
      throw error;
    }
  }
}
