import type { NovaesFlowConfig, NovaesFlowFinishPayload } from "../src";

export function buildSupabaseDemoConfig(
  onFinish?: (payload: NovaesFlowFinishPayload) => void,
): NovaesFlowConfig {
  return {
    theme: "cyber-neon",
    colors: ["#8A2BE2", "#FF0000", "#FF007F"],
    title: "NovaesFlow UI com adapter Supabase",
    subtitle:
      "Este modo demonstra o shape do payload para integração segura. O frontend não embute chaves nem regras sensíveis.",
    plans: [
      { id: "starter", name: "Starter", price: 220, description: "Entrada comercial para uso genérico." },
      {
        id: "growth",
        name: "Growth",
        price: 790,
        monthlyPrice: 129,
        description: "Operação com extras recorrentes e total dinâmico.",
        badge: "Supabase ready",
      },
      {
        id: "exclusive",
        name: "Sob Medida",
        price: 0,
        description: "Fluxo premium com destaque rosa intenso.",
        emphasis: "exclusive",
      },
    ],
    extras: [
      { id: "crm", name: "CRM", price: 240, description: "Pipeline comercial" },
      { id: "payments", name: "Pagamentos", price: 310, description: "Camada financeira" },
    ],
    onFinish: async (payload) => {
      onFinish?.(payload);

      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        console.info("Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY para testar o adapter.");
      }
    },
  };
}
