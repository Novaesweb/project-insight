// Constants, type definitions, and labels used across the admin panel
// All data now comes from Supabase — no more mock arrays

export type CategoriaExtra = "fixo" | "intermediario" | "mensal";

export type StatusReuniao = "agendada" | "confirmada" | "realizada" | "cancelada" | "aguardando";
export type TipoReuniao = "apresentacao" | "alinhamento" | "suporte" | "fechamento";

export const tipoReuniaoLabels: Record<TipoReuniao, string> = {
  apresentacao: "Apresentação",
  alinhamento: "Alinhamento",
  suporte: "Suporte",
  fechamento: "Fechamento",
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
  "/admin": { titulo: "Dashboard", subtitulo: "Visão geral do seu negócio" },
  "/admin/clientes": { titulo: "Clientes", subtitulo: "Gerencie sua base de clientes" },
  "/admin/projetos": { titulo: "Projetos", subtitulo: "Gerenciamento de projetos" },
  "/admin/pedidos": { titulo: "Pedidos", subtitulo: "Controle de pedidos e solicitações" },
  "/admin/extras": { titulo: "Extras & Serviços", subtitulo: "Catálogo de extras e serviços adicionais" },
  "/admin/relatorios": { titulo: "Relatórios", subtitulo: "Gere e exporte relatórios" },
  "/admin/financeiro": { titulo: "Financeiro", subtitulo: "Visão financeira do negócio" },
  "/admin/suporte": { titulo: "Suporte", subtitulo: "Gestão de tickets de suporte" },
  "/admin/usuarios": { titulo: "Usuários", subtitulo: "Equipe interna do sistema" },
  "/admin/configuracoes": { titulo: "Configurações", subtitulo: "Configurações do sistema" },
  "/admin/agenda": { titulo: "Agenda", subtitulo: "Gerencie suas reuniões e agendamentos" },
  "/admin/leads": { titulo: "Leads", subtitulo: "Acompanhe os leads do site" },
  "/admin/contratos": { titulo: "Contratos", subtitulo: "Gerencie contratos digitais" },
};
