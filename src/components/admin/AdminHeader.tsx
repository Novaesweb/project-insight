import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { Sun, Moon, Settings, Plus, Users, FileSignature, Headphones } from "lucide-react";

import { Button } from "@/components/ui/button";
import GlobalSearch from "@/components/GlobalSearch";
import NotificationCenter from "@/components/NotificationCenter";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { useTheme } from "@/hooks/useTheme";
import { pageInfo } from "@/lib/constants";
import { getRecentAdminRoutes } from "@/lib/admin-navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AdminHeaderProps {
  title?: string;
  subtitle?: string;
}

const extraPageInfo: Record<string, { titulo: string; subtitulo: string }> = {
  "/admin/clausulas": {
    titulo: "Gerenciador de Clausulas",
    subtitulo: "Biblioteca global, variaveis e composicao visual das clausulas",
  },
  "/admin/briefings/em-andamento": {
    titulo: "Briefings em Andamento",
    subtitulo: "Montagem, filtros e fluxo de envio",
  },
  "/admin/briefings/enviados": {
    titulo: "Briefings Enviados",
    subtitulo: "Respostas, acompanhamento e proximos passos",
  },
  "/admin/briefings/biblioteca": {
    titulo: "Biblioteca de Perguntas",
    subtitulo: "CRUD de perguntas modelo do briefing",
  },
};

function resolvePageInfoMatch(pathname: string) {
  const availablePageInfo = { ...pageInfo, ...extraPageInfo };
  const directMatch = availablePageInfo[pathname as keyof typeof availablePageInfo];
  if (directMatch) return directMatch;

  const prefixMatch = Object.entries(availablePageInfo)
    .filter(([route]) => pathname === route || pathname.startsWith(`${route}/`))
    .sort((left, right) => right[0].length - left[0].length)[0];

  return prefixMatch?.[1];
}

export default function AdminHeader({ title, subtitle }: AdminHeaderProps) {
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const { pathname } = useLocation();
  const { canAccessPath } = useAdminAccess();

  const recentLinks = useMemo(
    () => getRecentAdminRoutes().filter((route) => route.href !== pathname && canAccessPath(route.href)).slice(0, 2),
    [canAccessPath, pathname],
  );

  const quickActions = [
    { href: "/admin/clientes", label: "Novo Cliente", icon: Users },
    { href: "/admin/contratos/novo/cliente", label: "Novo Contrato", icon: FileSignature },
    { href: "/admin/leads", label: "Ver Leads", icon: Headphones },
  ].filter((action) => canAccessPath(action.href));

  const matchedPageInfo = resolvePageInfoMatch(pathname);
  const pageTitle = title || matchedPageInfo?.titulo || "Painel Admin";
  const pageSubtitle = subtitle || matchedPageInfo?.subtitulo || "Gestao Digital";

  return (
    <header className="glass-header-admin sticky top-0 z-40 flex h-16 items-center justify-between gap-3 overflow-hidden px-4 sm:px-6 lg:h-20 lg:px-10">
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-brand-gradient opacity-40" />

      <div className="flex min-w-0 flex-1 items-center gap-4">
        <div className="flex min-w-0 flex-col">
          <h1
            className="admin-shell-title truncate text-[var(--admin-text)]"
            role="heading"
            aria-level={1}
          >
            {pageTitle}
          </h1>

          <div className="mt-1.5 hidden items-center gap-3 lg:flex">
            <p className="admin-kicker text-[var(--admin-muted)]">{pageSubtitle}</p>
            <div className="h-1 w-1 rounded-full bg-brand-gradient" />
            {recentLinks.map((route) => (
              <Link
                key={route.href}
                to={route.href}
                className="rounded-full border border-[rgba(124,58,237,0.22)] bg-[rgba(255,255,255,0.04)] px-3 py-1 text-[10px] font-bold text-[var(--admin-muted)] transition-all hover:bg-[rgba(124,58,237,0.18)] hover:text-white"
              >
                {route.shortLabel || route.label}
              </Link>
            ))}
          </div>

          <p className="admin-kicker mt-1 hidden text-[var(--admin-muted)] sm:block lg:hidden">{pageSubtitle}</p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <div className="mr-4 hidden items-center gap-2 rounded-[14px] border border-[var(--admin-border-color)] bg-[rgba(255,255,255,0.04)] px-3 py-1.5 sm:flex">
          <div className="relative">
            <div className="absolute h-1.5 w-1.5 animate-ping rounded-full bg-[#FF1F1F] opacity-50" />
            <div className="relative h-1.5 w-1.5 rounded-full bg-brand-gradient" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[var(--admin-muted)]">Painel Ativo</span>
        </div>

        <div className="flex items-center gap-2 rounded-[14px] border border-[var(--admin-border-color)] bg-[rgba(255,255,255,0.04)] p-1.5 shadow-[0_12px_30px_rgba(0,0,0,0.2)]">
          <GlobalSearch />
          <div className="mx-1 h-4 w-[1px] bg-[rgba(124,58,237,0.18)]" />

          {quickActions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-[14px] border-0 bg-brand-gradient text-white shadow-[0_12px_30px_rgba(124,58,237,0.25)] transition-all hover:scale-110"
                  aria-label="Acoes rapidas"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass-premium w-56 rounded-[14px] border-[var(--admin-border-color)] p-2">
                {quickActions.map((action) => (
                  <DropdownMenuItem
                    key={action.href}
                    onClick={() => navigate(action.href)}
                    className="group cursor-pointer gap-3 rounded-[14px] py-3 text-[var(--admin-muted)] transition-all focus:bg-brand-gradient focus:text-white"
                  >
                    <action.icon className="h-4 w-4 text-[#C4B5FD] group-focus:text-white" />
                    <span className="text-xs font-bold uppercase tracking-[0.16em]">{action.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-[14px] text-[var(--admin-muted)] hover:bg-[rgba(255,255,255,0.06)] hover:text-[var(--admin-text)]"
            onClick={toggle}
            aria-label="Alternar tema"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          <NotificationCenter userType="admin" userId="admin" />

          {canAccessPath("/admin/configuracoes") && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-[14px] text-[var(--admin-muted)] hover:bg-[rgba(255,255,255,0.06)] hover:text-[var(--admin-text)]"
              onClick={() => navigate("/admin/configuracoes")}
              aria-label="Configuracoes"
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
