import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function SupabaseHeartbeat() {
  useEffect(() => {
    // ID do registro "WebNovaX Keeper" na tabela health_check
    const KEEPER_ID = "ad649f63-34a2-4623-86f9-e9f09ac36174";

    const sendPing = async () => {
      try {
        const { error } = await supabase
          .from("health_check")
          .update({ last_ping: new Date().toISOString() })
          .eq("id", KEEPER_ID);

        if (error) {
          console.error("Heartbeat: Erro ao pingar Supabase:", error.message);
        } else {
          console.log("Heartbeat: Supabase Ping enviado com sucesso.");
        }
      } catch (err) {
        console.error("Heartbeat: Falha na conexão:", err);
      }
    };

    // Enviar ping inicial
    sendPing();

    // Configurar intervalo de 60 segundos
    const interval = setInterval(sendPing, 60000);

    return () => clearInterval(interval);
  }, []);

  return null; // Componente invisível
}
