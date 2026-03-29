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


    // 1. Notificação para o Administrador (Dashboard Style)
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "NovaesWeb <contato@novaesweb.site>",
        to: ["novaesweb@gmail.com"],
        subject: `🚨 NOVO LEAD: ${nome} (@${nome_negocio})`,
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #080a0f; color: #ffffff; padding: 40px; border: 1px solid #1a1f2e; border-radius: 24px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <span style="background: linear-gradient(90deg, #ff3366, #ff00cc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 900; font-size: 10px; text-transform: uppercase; letter-spacing: 4px;">Inteligência de Vendas</span>
              <h1 style="font-size: 22px; font-weight: 800; margin-top: 10px; letter-spacing: -0.5px;">Alerta de Novo Lead 👋</h1>
            </div>

            <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); padding: 25px; border-radius: 20px; margin-bottom: 25px;">
              <h3 style="color: #ff3366; font-size: 14px; text-transform: uppercase; margin-top: 0; letter-spacing: 1px;">Perfil do Contato</h3>
              <p style="margin: 10px 0; font-size: 16px;"><strong>Prospect:</strong> <span style="color: #ffffff;">${nome}</span></p>
              <p style="margin: 10px 0; font-size: 16px;"><strong>Empresa:</strong> <span style="color: #ffffff;">${nome_negocio}</span></p>
              <p style="margin: 10px 0; font-size: 16px;"><strong>WhatsApp:</strong> <span style="color: #ffffff;">${whatsapp}</span></p>
              <p style="margin: 10px 0; font-size: 16px;"><strong>E-mail:</strong> <span style="color: #ffffff;">${email}</span></p>
            </div>

            <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); padding: 25px; border-radius: 20px; margin-bottom: 30px;">
              <h3 style="color: #ff3366; font-size: 14px; text-transform: uppercase; margin-top: 0; letter-spacing: 1px;">Interesse & Briefing</h3>
              <p style="margin: 10px 0; font-size: 14px;"><strong>Serviços:</strong> ${servicos.join(", ")}</p>
              <p style="margin: 10px 0; font-size: 14px;"><strong>Orçamento:</strong> ${orcamento || "Não informado"}</p>
              <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.05); color: #8a8f9e; font-style: italic; font-size: 13px; line-height: 1.6;">
                "${mensagem || "Sem mensagem adicional."}"
              </div>
            </div>

            <div style="text-align: center;">
              <p style="margin-top: 10px; font-size: 11px; color: #4a4f5e; text-transform: uppercase; letter-spacing: 2px;">Elite CRM Novaes Web v10.0</p>
            </div>
          </div>
        `,
      }),
    });

    // 2. Confirmação para o Cliente (Premium Impact)
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "NovaesWeb <contato@novaesweb.site>",
        to: [email],
        reply_to: "novaesweb@gmail.com",
        subject: `[Novaes Web] O planejamento do seu projeto começou, ${nome.split(' ')[0]}! 🚀`,
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #07080a; color: #ffffff; padding: 0; border-radius: 24px; overflow: hidden; border: 1px solid #1a1f2e;">
            
            <div style="background: linear-gradient(135deg, #1a1f2e 0%, #07080a 100%); padding: 50px 40px; text-align: center; border-bottom: 1px solid #1a1f2e;">
              <h1 style="font-size: 28px; font-weight: 900; margin: 0; background: linear-gradient(90deg, #ff3366, #ff00cc); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Iniciamos sua Jornada.</h1>
              <p style="color: #8a8f9e; font-size: 16px; margin-top: 15px; line-height: 1.5;">Prepare-se para transformar a <strong>${nome_negocio}</strong> em uma autoridade digital inquestionável.</p>
            </div>

            <div style="padding: 40px;">
              <p style="font-size: 16px; color: #ffffff; line-height: 1.8;">Olá, <strong>${nome}</strong>.</p>
              <p style="font-size: 16px; color: #8a8f9e; line-height: 1.8;">Recebemos suas informações e nossa equipe de engenharia já iniciou a análise técnica da sua solicitação. Na <strong>Novaes Web</strong>, não entregamos apenas sites — construímos máquinas de vendas otimizadas para o seu crescimento.</p>

              <div style="margin: 40px 0; padding: 25px; background: rgba(255,51,102,0.05); border-left: 4px solid #ff3366; border-radius: 12px;">
                <h4 style="margin: 0 0 10px 0; color: #ff3366; text-transform: uppercase; font-size: 13px; letter-spacing: 1px;">Próximos Passos Prioritários:</h4>
                <ul style="margin: 0; padding-left: 20px; color: #8a8f9e; font-size: 14px; line-height: 2;">
                  <li>Análise do seu modelo de negócio</li>
                  <li>Mapeamento de jornada do usuário</li>
                  <li>Estruturação de design de alta conversão</li>
                </ul>
              </div>

              <p style="font-size: 16px; color: #8a8f9e; line-height: 1.8;">Em breve, um de nossos estrategistas entrará em contato via WhatsApp para definirmos os detalhes finais e o cronograma de entrega.</p>
              
              <div style="text-align: center; margin-top: 40px;">
                <a href="https://novaesweb.com.br" style="display: inline-block; padding: 16px 30px; background: rgba(255,255,255,0.05); color: #ffffff; border-radius: 12px; font-weight: 600; text-decoration: none; font-size: 14px; margin-right: 10px; border: 1px solid rgba(255,255,255,0.1);">Ver Portfólio</a>
                <a href="https://wa.me/5551981964238?text=${encodeURIComponent(`Olá! Sou o ${nome}, acabei de enviar meu cadastro no site da Novaes Web e gostaria de conversar sobre o meu projeto. 🚀`)}" style="display: inline-block; padding: 16px 30px; background: #25d366; color: #ffffff; border-radius: 12px; font-weight: 800; text-decoration: none; font-size: 14px;">Chamar no WhatsApp</a>
              </div>
            </div>

            <div style="background-color: #0d1117; padding: 40px; text-align: center; color: #4a4f5e;">
              <div style="margin-bottom: 20px;">
                <strong style="color: #ffffff; font-size: 18px; letter-spacing: 2px;">NOVAES WEB</strong><br/>
                <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 3px; color: #ff3366;">Technology & Design</span>
              </div>
              <p style="font-size: 12px; line-height: 1.6; margin-bottom: 20px;">
                Este e-mail é uma confirmação automática de recepção de projeto.<br/>
                © 2026 Novaes Web - Soluções Digitais sob Medida.
              </p>
              <div style="border-top: 1px solid rgba(255,255,255,0.05); padding-top: 20px;">
                <p style="font-size: 11px; color: #8a8f9e;">Siga-nos: @novaesweb</p>
              </div>
            </div>
          </div>
        `,
      }),
    });

    return new Response(JSON.stringify({ success: true }), {
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
