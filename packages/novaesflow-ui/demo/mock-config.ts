import type { NovaesFlowConfig, NovaesFlowFinishPayload } from "../src";

export function buildMockConfig(
  onFinish?: (payload: NovaesFlowFinishPayload) => void,
): NovaesFlowConfig {
  return {
    theme: "cyber-neon",
    colors: ["#8A2BE2", "#FF0000", "#FF007F"],
    title: "NovaesFlow UI em modo local",
    subtitle: "O payload final aparece logo abaixo do builder, sem backend.",
    plans: [
      {
        id: "exp",
        name: "Express",
        price: 180,
        description: "Essencial para delivery e presença digital rápida.",
        badge: "Plano base",
        features: ["Landing responsiva", "CTA de WhatsApp", "Copy inicial"],
      },
      {
        id: "pro",
        name: "Pro",
        price: 500,
        monthlyPrice: 97,
        description: "Estrutura completa para operação e expansão.",
        badge: "Escala",
        highlight: "Mais vendido",
        features: ["CRM", "Painel admin", "Automação comercial"],
      },
      {
        id: "custom",
        name: "Sob Medida",
        price: 0,
        description: "Arquitetura exclusiva para operação complexa.",
        badge: "Exclusivo",
        emphasis: "exclusive",
        features: ["Fluxo customizado", "Regras de negócio", "Módulos sob demanda"],
      },
    ],
    extras: [
      { id: "ia", name: "Robô IA", price: 150, monthlyPrice: 30, description: "Atendimento automático" },
      { id: "marketing", name: "Plano Marketing", price: 300, description: "Artes e calendário comercial" },
      { id: "analytics", name: "Analytics Pro", price: 190, description: "Relatórios e funil de conversão" },
    ],
    onFinish,
  };
}
