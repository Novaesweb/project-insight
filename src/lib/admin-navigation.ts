export interface AdminRouteMeta {
  href: string;
  label: string;
  shortLabel?: string;
  keywords?: string[];
}

const RECENT_ADMIN_ROUTES_KEY = "novaesweb-admin-recent-routes";

export const adminRoutes: AdminRouteMeta[] = [
  { href: "/admin", label: "Dashboard", shortLabel: "Início", keywords: ["dashboard", "home", "inicio", "painel"] },
  { href: "/admin/clientes", label: "Clientes", shortLabel: "Clientes", keywords: ["clientes", "ecossistemas"] },
  { href: "/admin/checklist-clientes", label: "Checklist Clientes", shortLabel: "Checklist", keywords: ["checklist", "cadastro", "onboarding", "clientes"] },
  { href: "/admin/leads", label: "Leads", shortLabel: "Leads", keywords: ["leads", "pipeline", "oportunidades"] },
  { href: "/admin/projetos", label: "Projetos", shortLabel: "Projetos", keywords: ["projetos", "entregas", "execucao"] },
  { href: "/admin/pedidos", label: "Pedidos", shortLabel: "Pedidos", keywords: ["pedidos", "vendas", "faturas"] },
  { href: "/admin/extras", label: "Extras", shortLabel: "Extras", keywords: ["extras", "upgrades", "modulos"] },
  { href: "/admin/recurrent-extras", label: "Extras Recorrentes", shortLabel: "Recorrentes", keywords: ["recorrentes", "assinaturas"] },
  { href: "/admin/financeiro", label: "Financeiro", shortLabel: "Financeiro", keywords: ["financeiro", "receitas", "cobrancas"] },
  { href: "/admin/custos-sistema", label: "Custos do Sistema", shortLabel: "Custos", keywords: ["custos", "sistema", "operacao", "despesas"] },
  { href: "/admin/relatorios", label: "Relatórios", shortLabel: "Relatórios", keywords: ["relatorios", "metricas", "roi"] },
  { href: "/admin/contratos", label: "Contratos", shortLabel: "Contratos", keywords: ["contratos", "juridico"] },
  { href: "/admin/suporte", label: "Suporte", shortLabel: "Suporte", keywords: ["suporte", "tickets"] },
  { href: "/admin/usuarios", label: "Usuários", shortLabel: "Usuários", keywords: ["usuarios", "equipe"] },
  { href: "/admin/revenda", label: "Revenda", shortLabel: "Revenda", keywords: ["revenda", "afiliados"] },
  { href: "/admin/configuracoes", label: "Configurações", shortLabel: "Ajustes", keywords: ["configuracoes", "ajustes", "sistema"] },
];

export function findAdminRoute(href: string) {
  return adminRoutes.find((route) => route.href === href);
}

export function getFavoriteAdminRoutes() {
  return ["/admin", "/admin/leads", "/admin/financeiro", "/admin/projetos"]
    .map((href) => findAdminRoute(href))
    .filter(Boolean) as AdminRouteMeta[];
}

export function trackAdminRoute(pathname: string) {
  if (typeof window === "undefined" || !pathname.startsWith("/admin")) return;

  const route = findAdminRoute(pathname);
  if (!route) return;

  const current = getStoredRecentRoutePaths();
  const next = [pathname, ...current.filter((item) => item !== pathname)].slice(0, 6);
  window.localStorage.setItem(RECENT_ADMIN_ROUTES_KEY, JSON.stringify(next));
}

export function getRecentAdminRoutes() {
  return getStoredRecentRoutePaths()
    .map((href) => findAdminRoute(href))
    .filter(Boolean) as AdminRouteMeta[];
}

function getStoredRecentRoutePaths() {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(RECENT_ADMIN_ROUTES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}
