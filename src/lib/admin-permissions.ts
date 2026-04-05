export const ADMIN_PERMISSION_ROLES = ["admin", "editor", "visualizador"] as const;

export type AdminRole = (typeof ADMIN_PERMISSION_ROLES)[number];

export const ADMIN_PERMISSION_MODULES = [
  { key: "dashboard", label: "Dashboard", description: "Visão geral do painel e indicadores principais.", hrefs: ["/admin"] },
  { key: "clientes", label: "Clientes", description: "Gestão dos clientes e ecossistemas ativos.", hrefs: ["/admin/clientes", "/admin/checklist-clientes"] },
  { key: "leads", label: "Leads", description: "Pipeline comercial e novas oportunidades.", hrefs: ["/admin/leads"] },
  { key: "projetos", label: "Projetos", description: "Execução, prazos e entregas em andamento.", hrefs: ["/admin/projetos"] },
  { key: "pedidos", label: "Pedidos", description: "Pedidos, vendas e solicitações do time.", hrefs: ["/admin/pedidos"] },
  { key: "extras", label: "Extras", description: "Módulos, upgrades e extras vendidos.", hrefs: ["/admin/extras"] },
  { key: "recurrent_extras", label: "Extras Recorrentes", description: "Assinaturas e cobranças recorrentes de extras.", hrefs: ["/admin/recurrent-extras"] },
  { key: "financeiro", label: "Financeiro", description: "Receitas, cobranças e saúde financeira.", hrefs: ["/admin/financeiro"] },
  { key: "relatorios", label: "Relatórios", description: "Relatórios estratégicos, ROI e métricas.", hrefs: ["/admin/relatorios"] },
  { key: "contratos", label: "Contratos", description: "Documentos e gestão contratual.", hrefs: ["/admin/contratos"] },
  { key: "suporte", label: "Suporte", description: "Tickets e acompanhamento de atendimento.", hrefs: ["/admin/suporte"] },
  { key: "usuarios", label: "Usuários", description: "Equipe interna, acessos e segurança.", hrefs: ["/admin/usuarios"] },
  { key: "revenda", label: "Revenda", description: "Área de parceiros e revenda.", hrefs: ["/admin/revenda"] },
  { key: "configuracoes", label: "Configurações", description: "Ajustes sensíveis e parâmetros do sistema.", hrefs: ["/admin/configuracoes"] },
] as const;

export type AdminPermissionKey = (typeof ADMIN_PERMISSION_MODULES)[number]["key"];

export type AdminPermissionsConfig = Record<AdminPermissionKey, Record<AdminRole, boolean>>;

const ROLE_FALLBACK: AdminRole = "visualizador";

export const DEFAULT_ADMIN_PERMISSIONS: AdminPermissionsConfig = {
  dashboard: { admin: true, editor: true, visualizador: true },
  clientes: { admin: true, editor: true, visualizador: true },
  leads: { admin: true, editor: true, visualizador: true },
  projetos: { admin: true, editor: true, visualizador: false },
  pedidos: { admin: true, editor: true, visualizador: false },
  extras: { admin: true, editor: true, visualizador: false },
  recurrent_extras: { admin: true, editor: true, visualizador: false },
  financeiro: { admin: true, editor: false, visualizador: false },
  relatorios: { admin: true, editor: true, visualizador: true },
  contratos: { admin: true, editor: true, visualizador: false },
  suporte: { admin: true, editor: true, visualizador: false },
  usuarios: { admin: true, editor: false, visualizador: false },
  revenda: { admin: true, editor: false, visualizador: false },
  configuracoes: { admin: true, editor: false, visualizador: false },
};

const ROUTE_MODULE_LOOKUP = ADMIN_PERMISSION_MODULES.flatMap((module) =>
  module.hrefs.map((href) => ({ href, key: module.key }))
).sort((left, right) => right.href.length - left.href.length);

export function normalizeAdminRole(value?: string | null): AdminRole {
  if (value && ADMIN_PERMISSION_ROLES.includes(value as AdminRole)) {
    return value as AdminRole;
  }

  return ROLE_FALLBACK;
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
  moduleKey?: AdminPermissionKey | null
) {
  if (!moduleKey) return true;
  return permissions[moduleKey]?.[role] ?? false;
}

export function getModuleForPath(pathname: string): AdminPermissionKey | null {
  const match = ROUTE_MODULE_LOOKUP.find(({ href }) =>
    pathname === href || pathname.startsWith(`${href}/`)
  );

  return match?.key ?? null;
}

export function canAccessPath(role: AdminRole, permissions: AdminPermissionsConfig, pathname: string) {
  return canAccessModule(role, permissions, getModuleForPath(pathname));
}
