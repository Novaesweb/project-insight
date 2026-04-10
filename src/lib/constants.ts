import { PUBLIC_SUPABASE_CONFIG } from "@/integrations/supabase/public-config";

// App Configuration
export const APP_CONFIG = {
  name: "NovaesWeb",
  version: "10.0.0",
  description: "Criamos sites profissionais que alavancam negócios no digital. Transforme sua presença online em uma máquina de vendas com sistemas premium e automação inteligente.",
  author: "NovaesWeb",
  siteUrl: "https://novaesweb.site",
} as const;

// API Configuration
export const API_CONFIG = {
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
  baseUrl: import.meta.env.VITE_SUPABASE_URL || PUBLIC_SUPABASE_CONFIG.url,
} as const;

// Cache Configuration
export const CACHE_CONFIG = {
  defaultStaleTime: 5 * 60 * 1000, // 5 minutes
  defaultCacheTime: 10 * 60 * 1000, // 10 minutes
  queryKeyPrefix: "novaesweb",
} as const;

// Theme Configuration
export const THEME_CONFIG = {
  default: "dark",
  storageKey: "novaesweb-theme",
  systemPreferenceKey: "novaesweb-system-theme",
} as const;

// Notification Configuration
export const NOTIFICATION_CONFIG = {
  defaultDuration: 5000, // 5 seconds
  maxNotifications: 5,
  storageKey: "novaesweb-notifications",
} as const;

// Sidebar Configuration
export const SIDEBAR_CONFIG = {
  defaultCollapsed: false,
  width: {
    expanded: 260,
    collapsed: 64,
  },
  storageKey: "novaesweb-sidebar-collapsed",
} as const;

// Animation Configuration
export const ANIMATION_CONFIG = {
  duration: {
    fast: 0.15,
    normal: 0.2,
    slow: 0.3,
  },
  easing: {
    easeOut: "easeOut",
    easeInOut: "easeInOut",
    bounce: "bounce",
  },
} as const;

// Breakpoints
export const BREAKPOINTS = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

// Z-Index layers
export const Z_INDEX = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
  toast: 1700,
  notification: 1800,
} as const;

// Color palette
export const COLORS = {
  primary: {
    50: "#f3e8ff",
    100: "#e4d4f8",
    500: "#7b1fa2",
    600: "#6a1b9e",
    700: "#4a148c",
  },
  secondary: {
    50: "#fce4ec",
    100: "#f8bbd9",
    500: "#c2185b",
    600: "#ad1457",
    700: "#880e4f",
  },
  gold: {
    50: "#fff8e1",
    100: "#ffecb3",
    500: "#ffb800",
    600: "#ffa000",
    700: "#ff8f00",
  },
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
  info: "#3b82f6",
} as const;

// Routes
export const ROUTES = {
  public: {
    home: "/",
    site: "/site",
    cadastro: "/cadastro",
    agendar: "/agendar",
    funcionalidades: "/funcionalidades",
    instalar: "/instalar",
  },
  client: {
    login: "/cliente",
    dashboard: "/cliente/dashboard",
    projetos: "/cliente/projetos",
    extras: "/cliente/extras",
    contratos: "/cliente/contratos",
    faturas: "/cliente/faturas",
    reunioes: "/cliente/reunioes",
    suporte: "/cliente/suporte",
    indique: "/cliente/indique",
    arquivos: "/cliente/arquivos",
  },
  admin: {
    login: "/admin/login",
    dashboard: "/admin",
    clientes: "/admin/clientes",
    leads: "/admin/leads",
    projetos: "/admin/projetos",
    pedidos: "/admin/pedidos",
    extras: "/admin/extras",
    agenda: "/admin/agenda",
    relatorios: "/admin/relatorios",
    financeiro: "/admin/financeiro",
    custosSistema: "/admin/custos-sistema",
    suporte: "/admin/suporte",
    usuarios: "/admin/usuarios",
    configuracoes: "/admin/configuracoes",
    revenda: "/admin/revenda",
    contratos: "/admin/contratos",
    menu: "/admin/menu",
    depoimentos: "/admin/depoimentos",
  },
  reseller: {
    dashboard: "/revenda/dashboard",
    indicacoes: "/revenda/indicacoes",
    financeiro: "/revenda/financeiro",
    materiais: "/revenda/materiais",
    suporte: "/revenda/suporte",
  },
} as const;

// Validation patterns
export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s\-()]+$/,
  cpf: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
  cnpj: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
  url: /^https?:\/\/.+/,
  slug: /^[a-z0-9-]+$/,
} as const;

// File size limits (in bytes)
export const FILE_SIZE_LIMITS = {
  avatar: 2 * 1024 * 1024, // 2MB
  document: 10 * 1024 * 1024, // 10MB
  image: 5 * 1024 * 1024, // 5MB
  video: 50 * 1024 * 1024, // 50MB
} as const;

// Supported formats
export const SUPPORTED_FORMATS = {
  image: ["jpg", "jpeg", "png", "gif", "webp", "svg"],
  document: ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx"],
  video: ["mp4", "webm", "ogg"],
  audio: ["mp3", "wav", "ogg"],
} as const;

// Pagination
export const PAGINATION = {
  defaultPageSize: 10,
  pageSizeOptions: [10, 20, 50, 100],
  maxPageSize: 100,
} as const;

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
  "/admin/custos-sistema": { titulo: "Custos do Sistema", subtitulo: "Controle dos custos internos e operação da NovaesWeb" },
  "/admin/suporte": { titulo: "Engenharia de Evolução", subtitulo: "Otimização de ativos e experiência do parceiro" },
  "/admin/usuarios": { titulo: "Equipe Interna", subtitulo: "Gestão de acessos e colaboradores" },
  "/admin/configuracoes": { titulo: "Engenharia do Sistema", subtitulo: "Configurações avançadas e parâmetros" },
  "/admin/agenda": { titulo: "Agenda Estratégica", subtitulo: "Gestão de reuniões e alinhamentos de valor" },
  "/admin/leads": { titulo: "Máquina de Leads", subtitulo: "Acompanhe e qualifique novas oportunidades" },
  "/admin/contratos": { titulo: "Blindagem de Ativos", subtitulo: "Gestão de ativos jurídicos e blindagem contratual" },
};



