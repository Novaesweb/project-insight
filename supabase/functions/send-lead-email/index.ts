// @ts-expect-error - APIs do Deno não reconhecidas localmente
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LeadPayload {
  nome: string;
  email: string;
  whatsapp: string;
  nome_negocio: string;
  tipo_negocio: string;
  servicos: string[];
  orcamento?: string;
  mensagem?: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: LeadPayload = await req.json();
    const { nome, email, whatsapp, nome_negocio, tipo_negocio, servicos, orcamento, mensagem } = payload;

    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not set");
    }

    // 1. Notificação para o Administrador
    const adminEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "NovaesWeb <onboarding@resend.dev>", // Usar domínio verificado se houver
        to: ["novaesweb@gmail.com", "camila.lucas2604@gmail.com"],
        subject: `🆕 Novo Lead: ${nome} - ${nome_negocio}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #0f1117; color: #ffffff; padding: 40px; border-radius: 20px;">
            <h2 style="color: #ff3366; font-size: 24px; font-weight: 900; margin-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px;">Novo Cadastro Recebido! 🚀</h2>
            
            <div style="background-color: rgba(255,255,255,0.05); padding: 20px; border-radius: 12px; margin-bottom: 20px;">
              <p><strong>Lead:</strong> ${nome}</p>
              <p><strong>E-mail:</strong> ${email}</p>
              <p><strong>WhatsApp:</strong> ${whatsapp}</p>
              <p><strong>Negócio:</strong> ${nome_negocio} (${tipo_negocio})</p>
              <p><strong>Serviços:</strong> ${servicos.join(", ")}</p>
              <p><strong>Orçamento:</strong> ${orcamento || "Não informado"}</p>
            </div>

            <div style="background-color: rgba(255,255,255,0.05); padding: 20px; border-radius: 12px;">
              <p><strong>Mensagem/Briefing:</strong></p>
              <p style="color: rgba(255,255,255,0.7); line-height: 1.6;">${mensagem || "Sem mensagem adicional."}</p>
            </div>

            <p style="margin-top: 30px; font-size: 12px; color: rgba(255,255,255,0.3); text-align: center;">
              Elite CRM v2.5.0 Premium - NovaesWeb
            </p>
          </div>
        `,
      }),
    });

    // 2. Confirmação para o Cliente
    const clientEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "NovaesWeb <onboarding@resend.dev>",
        to: [email],
        subject: `Recebemos seu pedido, ${nome}! 🚀`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #0f1117; color: #ffffff; padding: 40px; border-radius: 20px;">
            <h2 style="color: #ff3366; font-size: 24px; font-weight: 900; margin-bottom: 20px;">Olá, ${nome}! 👋</h2>
            
            <p style="font-size: 16px; line-height: 1.6; color: rgba(255,255,255,0.8);">
              Recebemos suas informações sobre o projeto <strong>${nome_negocio}</strong> e já estamos analisando com atenção.
            </p>

            <p style="font-size: 16px; line-height: 1.6; color: rgba(255,255,255,0.8);">
              Em breve, nossa equipe entrará em contato via WhatsApp para conversarmos sobre os próximos passos e transformar sua visão em realidade.
            </p>

            <div style="margin: 40px 0; padding: 20px; border-left: 4px solid #ff3366; background-color: rgba(255,51,102,0.1);">
              <p style="margin: 0; font-weight: bold;">O que esperar agora?</p>
              <ul style="margin: 10px 0 0 0; padding-left: 20px; color: rgba(255,255,255,0.6);">
                <li>Análise técnica da sua ideia</li>
                <li>Proposta personalizada</li>
                <li>Design estratégico de alta conversão</li>
              </ul>
            </div>

            <p style="text-align: center; margin-top: 40px;">
              <a href="https://novaesweb.com.br" style="background-color: #ff3366; color: white; padding: 15px 30px; text-decoration: none; border-radius: 12px; font-weight: bold; display: inline-block;">Conhecer mais</a>
            </p>

            <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 40px 0;" />
            
            <p style="font-size: 12px; color: rgba(255,255,255,0.4); text-align: center;">
              NovaesWeb — Design & Engenharia de Software Especializada
            </p>
          </div>
        `,
      }),
    });

    const adminResult = await adminEmailResponse.json();
    const clientResult = await clientEmailResponse.json();

    return new Response(JSON.stringify({ adminResult, clientResult }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
