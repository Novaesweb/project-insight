import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const authHeader = req.headers.get("Authorization");
  const secret = Deno.env.get("PING_SECRET");

  // Validação de segurança via Token (com limpeza de espaços)
  const cleanSecret = secret?.trim();
  const cleanHeader = authHeader?.replace("Bearer ", "").trim();

  if (!cleanSecret || cleanHeader !== cleanSecret) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { 
      status: 401, 
      headers: { "Content-Type": "application/json" } 
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Ação que gera atividade real no banco
    const { data, error } = await supabase
      .from("health_check")
      .update({ last_ping: new Date().toISOString() })
      .eq("name", "WebNovaX Keeper")
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ ok: true, timestamp: data.last_ping }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
});
