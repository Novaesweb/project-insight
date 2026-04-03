// @ts-expect-error Deno remote import
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-expect-error Deno remote import
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const asaasApiKey = Deno.env.get('ASAAS_API_KEY')
    const asaasEnv = Deno.env.get('ASAAS_ENVIRONMENT') || 'sandbox'

    if (!asaasApiKey) {
      return new Response(JSON.stringify({ error: 'ASAAS_API_KEY not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)
    const asaasBaseUrl = asaasEnv === 'production'
      ? 'https://api.asaas.com/v3'
      : 'https://sandbox.asaas.com/api/v3'

    // Buscar faturas pendentes no financeiro com vencimento nos próximos 3 dias
    const hoje = new Date()
    const tresDias = new Date(hoje)
    tresDias.setDate(tresDias.getDate() + 3)

    const hojeStr = hoje.toISOString().split('T')[0]
    const tresDiasStr = tresDias.toISOString().split('T')[0]

    console.log(`🔍 Buscando faturas pendentes com vencimento entre ${hojeStr} e ${tresDiasStr}...`)

    // Buscar do financeiro: pendentes, com vencimento nos próximos 3 dias, que ainda não foram enviadas ao Asaas
    const { data: faturas, error: fatErr } = await supabase
      .from('financeiro')
      .select('*, clientes(id, nome, email, documento, telefone)')
      .eq('status', 'pendente')
      .eq('tipo', 'entrada')
      .lte('vencimento', tresDiasStr)
      .gte('vencimento', hojeStr)

    if (fatErr) {
      console.error('❌ Erro ao buscar faturas:', fatErr)
      throw fatErr
    }

    if (!faturas || faturas.length === 0) {
      console.log('✅ Nenhuma fatura pendente para enviar ao Asaas')
      return new Response(JSON.stringify({ message: 'Nenhuma fatura para enviar', count: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Verificar quais faturas já têm cobrança no Asaas (via recurrent_billing_history)
    const faturaIds = faturas.map((f: any) => f.id)
    const { data: jaEnviadas } = await supabase
      .from('recurrent_billing_history')
      .select('financeiro_id, asaas_payment_id')
      .in('financeiro_id', faturaIds)
      .not('asaas_payment_id', 'is', null)

    const envidasSet = new Set((jaEnviadas || []).map((r: any) => r.financeiro_id))

    let enviadas = 0
    let erros = 0

    for (const fatura of faturas) {
      // Pular se já tem cobrança no Asaas
      if (envidasSet.has(fatura.id)) {
        console.log(`⏭️ Fatura ${fatura.id} já tem cobrança no Asaas, pulando...`)
        continue
      }

      const cliente = fatura.clientes
      if (!cliente) {
        console.warn(`⚠️ Fatura ${fatura.id} sem cliente vinculado, pulando...`)
        continue
      }

      try {
        // 1. Buscar ou criar cliente no Asaas
        let asaasCustomerId: string | null = null

        if (cliente.documento) {
          const searchResp = await fetch(`${asaasBaseUrl}/customers?cpfCnpj=${cliente.documento}`, {
            headers: { 'access_token': asaasApiKey }
          })
          const searchData = await searchResp.json()
          if (searchData.data && searchData.data.length > 0) {
            asaasCustomerId = searchData.data[0].id
          }
        }

        if (!asaasCustomerId && cliente.email) {
          const searchResp = await fetch(`${asaasBaseUrl}/customers?email=${encodeURIComponent(cliente.email)}`, {
            headers: { 'access_token': asaasApiKey }
          })
          const searchData = await searchResp.json()
          if (searchData.data && searchData.data.length > 0) {
            asaasCustomerId = searchData.data[0].id
          }
        }

        if (!asaasCustomerId) {
          const createResp = await fetch(`${asaasBaseUrl}/customers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'access_token': asaasApiKey },
            body: JSON.stringify({
              name: cliente.nome,
              email: cliente.email,
              cpfCnpj: cliente.documento || undefined,
              mobilePhone: cliente.telefone || undefined,
              externalReference: cliente.id,
            })
          })
          const createData = await createResp.json()
          if (createData.id) {
            asaasCustomerId = createData.id
          } else {
            console.error(`❌ Erro ao criar cliente ${cliente.nome} no Asaas:`, createData)
            erros++
            continue
          }
        }

        // 2. Criar cobrança no Asaas
        const paymentResp = await fetch(`${asaasBaseUrl}/payments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'access_token': asaasApiKey },
          body: JSON.stringify({
            customer: asaasCustomerId,
            billingType: 'UNDEFINED',
            value: Number(fatura.valor),
            dueDate: fatura.vencimento,
            description: fatura.descricao || `Cobrança - ${cliente.nome}`,
            externalReference: fatura.id,
          })
        })
        const paymentData = await paymentResp.json()

        if (paymentData.id) {
          console.log(`✅ Cobrança criada no Asaas para ${cliente.nome}: ${paymentData.id}`)

          // 3. Atualizar recurrent_billing_history se existir
          await supabase
            .from('recurrent_billing_history')
            .update({
              asaas_payment_id: paymentData.id,
              asaas_invoice_url: paymentData.invoiceUrl || null,
              updated_at: new Date().toISOString(),
            })
            .eq('financeiro_id', fatura.id)

          // 4. Atualizar descrição no financeiro com link do Asaas
          if (paymentData.invoiceUrl) {
            const novaDesc = `${fatura.descricao}\n(Asaas: ${paymentData.invoiceUrl})`
            await supabase
              .from('financeiro')
              .update({ descricao: novaDesc })
              .eq('id', fatura.id)
          }

          enviadas++
        } else {
          console.error(`❌ Erro ao criar cobrança para ${cliente.nome}:`, paymentData)
          erros++
        }
      } catch (err) {
        console.error(`❌ Erro processando fatura ${fatura.id}:`, err)
        erros++
      }
    }

    const result = { message: `Processamento concluído`, enviadas, erros, total: faturas.length }
    console.log('📊 Resultado:', result)

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error: any) {
    console.error('❌ Erro geral:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
