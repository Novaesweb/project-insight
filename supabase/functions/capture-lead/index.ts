// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

declare const Deno: any;

const SITE_URL = Deno.env.get("SITE_URL") || "https://novaesweb.site";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const DEFAULT_CONTACT_EMAIL = "contato@novaesweb.site";
const DEFAULT_WHATSAPP_NUMBER = "5551991189293";
const DEFAULT_BRAND_NAME = "NovaesWeb";

type LeadPayload = {
  nome: string;
  email: string;
  whatsapp: string;
  nome_negocio: string;
  servicos: string[];
  orcamento?: string;
  mensagem?: string;
  source?: string;
  origin?: string;
  _fax?: string;
};

function isAllowedOrigin(origin: string | null) {
  if (!origin) return false;

  try {
    const url = new URL(origin);
    const host = url.hostname.toLowerCase();

    return (
      host === "novaesweb.site" ||
      host === "www.novaesweb.site" ||
      host === "localhost" ||
      host === "127.0.0.1" ||
      host.endsWith(".vercel.app")
    );
  } catch {
    return false;
  }
}

function getCorsHeaders(origin: string | null) {
  return {
    "Access-Control-Allow-Origin": isAllowedOrigin(origin) ? origin || SITE_URL : SITE_URL,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

function jsonResponse(body: Record<string, unknown>, status: number, origin: string | null) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...getCorsHeaders(origin),
      "Content-Type": "application/json",
    },
  });
}

function normalizeEmail(value: string | undefined) {
  return String(value || "").trim().toLowerCase();
}

function normalizePhone(value: string | undefined) {
  return String(value || "").replace(/\D/g, "");
}

function escapeHtml(value: string | undefined) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function sha256(value: string) {
  const data = new TextEncoder().encode(value);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function getClientFingerprint(req: Request) {
  const forwardedFor = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = req.headers.get("x-real-ip")?.trim();
  const cfIp = req.headers.get("cf-connecting-ip")?.trim();
  const userAgent = req.headers.get("user-agent")?.trim() || "unknown";

  return [forwardedFor || realIp || cfIp || "unknown-ip", userAgent].join("|");
}

async function getPublicContactSettings(supabaseAdmin: ReturnType<typeof createClient>) {
  const { data } = await supabaseAdmin
    .from("app_config")
    .select("key, value")
    .in("key", ["whatsapp_number", "email", "nome"]);

  const contact = {
    whatsappNumber: DEFAULT_WHATSAPP_NUMBER,
    email: DEFAULT_CONTACT_EMAIL,
    brandName: DEFAULT_BRAND_NAME,
  };

  data?.forEach((row: { key: string; value: string }) => {
    if (row.key === "whatsapp_number" && row.value) {
      contact.whatsappNumber = normalizePhone(row.value) || DEFAULT_WHATSAPP_NUMBER;
    }

    if (row.key === "email" && row.value) {
      contact.email = normalizeEmail(row.value) || DEFAULT_CONTACT_EMAIL;
    }

    if (row.key === "nome" && row.value) {
      contact.brandName = row.value.trim() || DEFAULT_BRAND_NAME;
    }
  });

  return contact;
}

async function sendResendEmail(payload: Record<string, unknown>) {
  if (!RESEND_API_KEY) return;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });
}

serve(async (req: Request) => {
  const origin = req.headers.get("origin");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(origin) });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Método não permitido." }, 405, origin);
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const payload = (await req.json()) as LeadPayload;

    if (payload._fax) {
      return jsonResponse({ success: true, discarded: true }, 202, origin);
    }

    const nome = escapeHtml(payload.nome);
    const email = normalizeEmail(payload.email);
    const whatsapp = normalizePhone(payload.whatsapp);
    const nomeNegocio = escapeHtml(payload.nome_negocio);
    const mensagem = escapeHtml(payload.mensagem);
    const orcamento = escapeHtml(payload.orcamento);
    const servicos = Array.isArray(payload.servicos)
      ? payload.servicos.map((item) => escapeHtml(String(item))).filter(Boolean)
      : [];

    if (!nome || !email || !whatsapp || !nomeNegocio || servicos.length === 0) {
      return jsonResponse({ error: "Dados obrigatórios ausentes para concluir o envio." }, 400, origin);
    }

    const fingerprintHash = await sha256(getClientFingerprint(req));
    const emailHash = await sha256(email);
    const phoneHash = await sha256(whatsapp);
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();

    const [{ count: recentFingerprintCount }, { count: recentEmailCount }] = await Promise.all([
      supabaseAdmin
        .from("lead_submission_log")
        .select("id", { count: "exact", head: true })
        .eq("fingerprint_hash", fingerprintHash)
        .gte("created_at", tenMinutesAgo),
      supabaseAdmin
        .from("lead_submission_log")
        .select("id", { count: "exact", head: true })
        .eq("email_hash", emailHash)
        .gte("created_at", tenMinutesAgo),
    ]);

    if ((recentFingerprintCount || 0) >= 3 || (recentEmailCount || 0) >= 2) {
      return jsonResponse(
        { error: "Recebemos muitas tentativas seguidas. Aguarde alguns minutos e tente novamente." },
        429,
        origin,
      );
    }

    const { error: leadError } = await supabaseAdmin.from("leads").insert({
      nome,
      email,
      whatsapp,
      nome_negocio: nomeNegocio,
      servicos,
      orcamento: orcamento || null,
      mensagem: mensagem || null,
    });

    if (leadError) {
      return jsonResponse({ error: leadError.message }, 500, origin);
    }

    await supabaseAdmin.from("lead_submission_log").insert({
      fingerprint_hash: fingerprintHash,
      email_hash: emailHash,
      phone_hash: phoneHash,
      source: payload.source || "site",
      origin_path: payload.origin || null,
      user_agent: req.headers.get("user-agent") || null,
    });

    await supabaseAdmin.from("notifications").insert({
      title: "🆕 Novo Lead",
      body: `${nome} (${nomeNegocio})`,
      user_id: "admin",
      user_type: "admin",
      url: "/admin/leads",
    });

    const contact = await getPublicContactSettings(supabaseAdmin as any);
    const whatsappUrl = `https://wa.me/${contact.whatsappNumber}?text=${encodeURIComponent(
      `Olá! Sou ${nome} e acabei de enviar meu cadastro no site da ${contact.brandName}.`,
    )}`;
    const safeSiteUrl = SITE_URL.replace(/\/+$/, "");
    const warnings: string[] = [];

    await Promise.allSettled([
      sendResendEmail({
        from: `${contact.brandName} <${contact.email}>`,
        to: [contact.email],
        subject: `🆕 Novo lead: ${nome} (${nomeNegocio})`,
        html: `
          <div style="font-family:Segoe UI,Arial,sans-serif;max-width:640px;margin:0 auto;padding:32px;background:#0b0d12;color:#fff;border-radius:20px;border:1px solid rgba(255,255,255,0.08);">
            <p style="margin:0 0 12px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#ff7aa2;">Nova captação</p>
            <h1 style="margin:0 0 20px;font-size:24px;">Lead recebido com sucesso</h1>
            <div style="background:rgba(255,255,255,0.03);padding:20px;border-radius:16px;margin-bottom:16px;">
              <p><strong>Nome:</strong> ${nome}</p>
              <p><strong>Empresa:</strong> ${nomeNegocio}</p>
              <p><strong>E-mail:</strong> ${email}</p>
              <p><strong>WhatsApp:</strong> ${whatsapp}</p>
              <p><strong>Serviços:</strong> ${servicos.join(", ")}</p>
              <p><strong>Orçamento:</strong> ${orcamento || "Não informado"}</p>
            </div>
            <p style="color:#c7ccd8;line-height:1.7;">${mensagem || "Sem mensagem adicional."}</p>
          </div>
        `,
      }).catch(() => warnings.push("Falha ao enviar alerta interno por e-mail.")),
      sendResendEmail({
        from: `${contact.brandName} <${contact.email}>`,
        to: [email],
        subject: `${contact.brandName} recebeu seu pedido de contato`,
        html: `
          <div style="font-family:Segoe UI,Arial,sans-serif;max-width:640px;margin:0 auto;padding:0;background:#0b0d12;color:#fff;border-radius:24px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">
            <div style="padding:36px 32px;background:linear-gradient(135deg,#181d27 0%,#0b0d12 100%);">
              <p style="margin:0 0 12px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#ff7aa2;">Recebemos seu contato</p>
              <h1 style="margin:0;font-size:28px;">Olá, ${nome.split(" ")[0]}.</h1>
            </div>
            <div style="padding:32px;">
              <p style="color:#d7dbe5;line-height:1.8;">Sua solicitação já entrou na fila da nossa equipe. Vamos analisar o seu cenário e responder com o melhor direcionamento para o projeto.</p>
              <ul style="color:#b7bfce;line-height:1.9;padding-left:18px;">
                <li>Leitura do seu briefing</li>
                <li>Validação da solução mais adequada</li>
                <li>Retorno comercial com próximos passos</li>
              </ul>
              <div style="margin-top:28px;">
                <a href="${safeSiteUrl}" style="display:inline-block;padding:14px 22px;margin-right:10px;border-radius:12px;text-decoration:none;background:rgba(255,255,255,0.06);color:#fff;border:1px solid rgba(255,255,255,0.08);">Visitar site</a>
                <a href="${whatsappUrl}" style="display:inline-block;padding:14px 22px;border-radius:12px;text-decoration:none;background:#25d366;color:#fff;font-weight:700;">Falar no WhatsApp</a>
              </div>
            </div>
          </div>
        `,
      }).catch(() => warnings.push("Falha ao enviar confirmação para o cliente.")),
    ]);

    return jsonResponse({ success: true, warnings }, 200, origin);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha inesperada ao processar lead.";
    return jsonResponse({ error: message }, 500, origin);
  }
});
