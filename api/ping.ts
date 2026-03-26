import { createClient } from "@supabase/supabase-js";

export default async function handler(req: any, res: any) {
  // Log conforme solicitado pelo Sócio
  console.log("Ping recebido:", new Date().toISOString());

  const authHeader = req.headers['authorization'] || req.headers.authorization;
  const PING_SECRET = process.env.PING_SECRET?.trim();

  if (!PING_SECRET) {
    console.error("ERRO CRÍTICO: PING_SECRET não encontrado no process.env");
  }

  const receivedToken = authHeader?.replace("Bearer ", "").trim();

  // 1. Validar Token (com limpeza de espaços e aspas extras)
  if (!receivedToken || receivedToken !== PING_SECRET) {
    console.warn(`Bloqueio 401: Recebido(${receivedToken?.length ?? 0}) vs Esperado(${PING_SECRET?.length ?? 0})`);
    return res.status(401).json({ error: "Unauthorized" });
  }

  // 2. Configurar Supabase via Variáveis Oficiais
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // 3. Consulta Leve (Batimento Cardíaco)
    const { data, error } = await supabase
      .from("healthcheck")
      .select("id")
      .limit(1);

    if (error) throw error;

    return res.status(200).json({ ok: true });
  } catch (error: any) {
    return res.status(500).json({ ok: false, error: error.message });
  }
}
