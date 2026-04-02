import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    const { path, method, body } = await req.json()
    
    // Get Asaas configuration from environment variables
    const apiKey = Deno.env.get('ASAAS_API_KEY')
    const environment = Deno.env.get('ASAAS_ENVIRONMENT') || 'sandbox'
    
    if (!apiKey) {
      throw new Error('ASAAS_API_KEY not configured')
    }

    // Determine base URL based on environment
    const baseUrl = environment === 'production' 
      ? 'https://api.asaas.com/v3' 
      : 'https://sandbox.asaas.com/api/v3'

    const url = `${baseUrl}/${path}`
    
    const response = await fetch(url, {
      method: method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'access_token': apiKey,
        ...corsHeaders
      },
      body: body ? JSON.stringify(body) : undefined
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Asaas API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    
    return new Response(JSON.stringify(data), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    })

  } catch (error) {
    console.error('Asaas API proxy error:', error)
    return new Response(
      JSON.stringify({ error: (error as Error).message }), 
      { 
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})
