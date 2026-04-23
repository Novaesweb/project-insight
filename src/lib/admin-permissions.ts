export const ADMIN_PERMISSION_ROLES = ["admin", "editor", "visualizador"] as const;
export const OWNER_ADMIN_EMAILS = ["novaesweb@gmail.com"] as const;

export type AdminRole = (typeof ADMIN_PERMISSION_ROLES)[number];

export const ADMIN_PERMISSION_MODULES = [
  { key: "dashboard", label: "Dashboard", description: "Visao geral do painel e indicadores principais.", hrefs: ["/admin"] },
  { key: "clientes", label: "Clientes", description: "Gestao dos clientes e ecossistemas ativos.", hrefs: ["/admin/clientes"] },
  { key: "leads", label: "Leads", description: "Pipeline comercial e novas oportunidades.", hrefs: ["/admin/leads"] },
  { key: "projetos", label: "Projetos", description: "Execucao, prazos e entregas em andamento.", hrefs: ["/admin/projetos"] },
  { key: "contratos", label: "Contratos", description: "Montagem, envio, revisao e assinatura dos contratos comerciais.", hrefs: ["/admin/contratos", "/admin/clausulas"] },
  { key: "pedidos", label: "Pedidos", description: "Pedidos, vendas e solicitacoes do time.", hrefs: ["/admin/pedidos"] },
  { key: "extras", label: "Extras", description: "Modulos, upgrades e extras vendidos.", hrefs: ["/admin/extras"] },
  { key: "recurrent_extras", label: "Extras Recorrentes", description: "Assinaturas e cobrancas recorrentes de extras.", hrefs: ["/admin/recurrent-extras"] },
  { key: "financeiro", label: "Financeiro", description: "Receitas, cobrancas, custos internos e saude financeira.", hrefs: ["/admin/financeiro", "/admin/custos-sistema"] },
  { key: "relatorios", label: "Relatorios", description: "Relatorios estrategicos, ROI e metricas.", hrefs: ["/admin/relatorios"] },
  { key: "briefings", label: "Briefings", description: "Coleta operacional do site e respostas do cliente por briefing ativo.", hrefs: ["/admin/briefings"] },
  { key: "suporte", label: "Suporte", description: "Tickets e acompanhamento de atendimento.", hrefs: ["/admin/suporte"] },
  { key: "usuarios", label: "Usuarios", description: "Equipe interna, acessos e seguranca.", hrefs: ["/admin/usuarios"] },
  { key: "revenda", label: "Revenda", description: "Area de parceiros e revenda.", hrefs: ["/admin/revenda"] },
  { key: "configuracoes", label: "Configuracoes", description: "Ajustes sensiveis e parametros do sistema.", hrefs: ["/admin/configuracoes"] },
] as const;

export type AdminPermissionKey = (typeof ADMIN_PERMISSION_MODULES)[number]["key"];

export type AdminPermissionsConfig = Record<AdminPermissionKey, Record<AdminRole, boolean>>;

const ROLE_FALLBACK: AdminRole = "visualizador";
const ROLE_ALIASES: Record<string, AdminRole> = {
  admin: "admin",
  administrador: "admin",
  administradora: "admin",
  owner: "admin",
  proprietario: "admin",
  superadmin: "admin",
  "super-admin": "admin",
  root: "admin",
  master: "admin",
  editor: "editor",
  editora: "editor",
  gestor: "editor",
  gerente: "editor",
  operador: "editor",
  operator: "editor",
  visualizador: "visualizador",
  viewer: "visualizador",
  visualizer: "visualizador",
  leitura: "visualizador",
  consulta: "visualizador",
  readonly: "visualizador",
  "read-only": "visualizador",
  "somente-leitura": "visualizador",
};

export const DEFAULT_ADMIN_PERMISSIONS: AdminPermissionsConfig = {
  dashboard: { admin: true, editor: true, visualizador: true },
  clientes: { admin: true, editor: true, visualizador: true },
  leads: { admin: true, editor: true, visualizador: true },
  projetos: { admin: true, editor: true, visualizador: false },
  contratos: { admin: true, editor: true, visualizador: false },
  pedidos: { admin: true, editor: true, visualizador: false },
  extras: { admin: true, editor: true, visualizador: false },
  recurrent_extras: { admin: true, editor: true, visualizador: false },
  financeiro: { admin: true, editor: false, visualizador: false },
  relatorios: { admin: true, editor: true, visualizador: true },
  briefings: { admin: true, editor: true, visualizador: false },
  suporte: { admin: true, editor: true, visualizador: false },
  usuarios: { admin: true, editor: false, visualizador: false },
  revenda: { admin: true, editor: false, visualizador: false },
  configuracoes: { admin: true, editor: false, visualizador: false },
};

const ROUTE_MODULE_LOOKUP = ADMIN_PERMISSION_MODULES.flatMap((module) =>
  module.hrefs.map((href) => ({ href, key: module.key })),
).sort((left, right) => right.href.length - left.href.length);

function normalizeRoleToken(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[_\s]+/g, "-");
}

export function isOwnerAdminEmail(email?: string | null) {
  if (!email) return false;

  const normalizedEmail = email.trim().toLowerCase();
  return OWNER_ADMIN_EMAILS.includes(normalizedEmail as (typeof OWNER_ADMIN_EMAILS)[number]);
}

export function normalizeAdminRole(value?: string | null): AdminRole {
  if (!value) return ROLE_FALLBACK;

  return ROLE_ALIASES[normalizeRoleToken(value)] ?? ROLE_FALLBACK;
}

export function parsePermissionsConfig(value?: string | null): AdminPermissionsConfig {
  if (!value) {
    return { ...DEFAULT_ADMIN_PERMISSIONS };
  }

  try {
    const parsed = JSON.parse(value) as Partial<AdminPermissionsConfig>;

    return ADMIN_PERMISSION_MODULES.reduce((accumulator, module) => {
      const savedModule = parsed?.[module.key];

      accumulator[module.key] = {
        admin: savedModule?.admin ?? DEFAULT_ADMIN_PERMISSIONS[module.key].admin,
        editor: savedModule?.editor ?? DEFAULT_ADMIN_PERMISSIONS[module.key].editor,
        visualizador: savedModule?.visualizador ?? DEFAULT_ADMIN_PERMISSIONS[module.key].visualizador,
      };

      return accumulator;
    }, {} as AdminPermissionsConfig);
  } catch {
    return { ...DEFAULT_ADMIN_PERMISSIONS };
  }
}

export function serializePermissionsConfig(permissions: AdminPermissionsConfig) {
  return JSON.stringify(permissions);
}

export function canAccessModule(
  role: AdminRole,
  permissions: AdminPermissionsConfig,
  moduleKey?: AdminPermissionKey | null,
) {
  if (!moduleKey) return true;
  return permissions[moduleKey]?.[role] ?? false;
}

export function getModuleForPath(pathname: string): AdminPermissionKey | null {
  const match = ROUTE_MODULE_LOOKUP.find(({ href }) =>
    pathname === href || pathname.startsWith(`${href}/`),
  );

  return match?.key ?? null;
}

export function canAccessPath(role: AdminRole, permissions: AdminPermissionsConfig, pathname: string) {
  return canAccessModule(role, permissions, getModuleForPath(pathname));
}
