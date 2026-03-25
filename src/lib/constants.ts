// Constants, type definitions, and labels used across the admin panel
// All data now comes from Supabase — no more mock arrays

export type CategoriaExtra = "fixo" | "intermediario" | "mensal";

export type StatusReuniao = "agendada" | "confirmada" | "realizada" | "cancelada" | "aguardando";
export type TipoReuniao = "apresentacao" | "alinhamento" | "suporte" | "fechamento";

export const tipoReuniaoLabels: Record<TipoReuniao, string> = {
  apresentacao: "Proposta de Arquitetura",
  alinhamento: "Sincronização de Ativos",
  suporte: "Engenharia de Evolução",
  fechamento: "Consolidação de Solução",
};

export const statusReuniaoLabels: Record<StatusReuniao, string> = {
  agendada: "Agendada",
  confirmada: "Confirmada",
  realizada: "Realizada",
  cancelada: "Cancelada",
  aguardando: "Aguardando",
};

export const statusReuniaoColors: Record<StatusReuniao, string> = {
  agendada: "#60a5fa",
  confirmada: "#4ade80",
  realizada: "#9ca3af",
  cancelada: "#ef4444",
  aguardando: "#facc15",
};

export const pageInfo: Record<string, { titulo: string; subtitulo: string }> = {
  "/admin": { titulo: "Cabine de Comando", subtitulo: "Inteligência & Arquitetura Operacional" },
  "/admin/clientes": { titulo: "Ecossistemas Digitais", subtitulo: "Gestão de ativos e parceiros estratégicos" },
  "/admin/projetos": { titulo: "Engenharia de Soluções", subtitulo: "Desenvolvimento e escala de ativos digitais" },
  "/admin/pedidos": { titulo: "Fluxos de Venda", subtitulo: "Controle de conversões e solicitações" },
  "/admin/extras": { titulo: "Módulos & Upgrades", subtitulo: "Expansão de funcionalidades e serviços premium" },
  "/admin/relatorios": { titulo: "Dossiês de Performance & ROI", subtitulo: "Análise estratégica de impacto e rentabilidade" },
  "/admin/financeiro": { titulo: "Engenharia Financeira", subtitulo: "Gestão de fluxos de valor e saúde do negócio" },
  "/admin/suporte": { titulo: "Engenharia de Evolução", subtitulo: "Otimização de ativos e experiência do parceiro" },
  "/admin/usuarios": { titulo: "Equipe Interna", subtitulo: "Gestão de acessos e colaboradores" },
  "/admin/configuracoes": { titulo: "Engenharia do Sistema", subtitulo: "Configurações avançadas e parâmetros" },
  "/admin/agenda": { titulo: "Agenda Estratégica", subtitulo: "Gestão de reuniões e alinhamentos de valor" },
  "/admin/leads": { titulo: "Máquina de Leads", subtitulo: "Acompanhe e qualifique novas oportunidades" },
  "/admin/contratos": { titulo: "Blindagem Jurídica", subtitulo: "Gestão de contratos e termos digitais" },
};
