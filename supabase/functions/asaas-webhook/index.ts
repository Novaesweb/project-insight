import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const signature = req.headers.get('asaas_signature')
    if (!signature) {
      throw new Error('Missing Asaas signature')
    }

    const body = await req.text()
    const event = JSON.parse(body)

    console.log('Asaas webhook received:', event)

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    // Handle different event types
    switch (event.event) {
      case 'PAYMENT_CONFIRMED': {
        // Update payment status in database
        const { data, error } = await supabase
          .from('financeiro')
          .update({ status: 'pago' })
          .eq('descricao', `ilike.*Asaas: ${event.payment.id}%`)

        if (error) {
          console.error('Error updating payment:', error)
        } else {
          console.log('Payment confirmed and updated:', event.payment.id)
        }
        break
      }

      case 'PAYMENT_DELETED': {
        // Handle payment deletion
        console.log('Payment deleted:', event.payment.id)
        break
      }

      default: {
        console.log('Unhandled event type:', event.event)
        break
      }
    }

    return new Response('OK', { headers: corsHeaders })

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: (error as Error).message }), 
      { 
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})
