import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { Sun, Moon, Settings, Plus, Users, FileSignature, Headphones, Activity } from "lucide-react";

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
    <header className="glass-header-admin sticky top-0 z-40 flex h-16 items-center justify-between gap-3 overflow-hidden px-4 sm:px-6 lg:h-[68px] lg:px-8">
      {/* Top gradient line — mais espessa e viva */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background: "linear-gradient(90deg, rgba(220,38,38,0.8), rgba(107,33,168,0.9), rgba(236,72,153,0.8))",
          boxShadow: "0 0 12px rgba(236,72,153,0.3)",
        }}
      />

      {/* Page title + subtitle */}
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="flex min-w-0 flex-col"
        >
          <h1
            className="admin-shell-title truncate text-[var(--admin-text)]"
            role="heading"
            aria-level={1}
          >
            {pageTitle}
          </h1>

          <div className="mt-1 hidden items-center gap-2 lg:flex">
            <p className="admin-kicker text-[var(--admin-muted)]">{pageSubtitle}</p>
            <div className="h-1 w-1 rounded-full bg-[rgba(236,72,153,0.6)]" />
            {recentLinks.map((route) => (
              <Link
                key={route.href}
                to={route.href}
                className="rounded-full border border-[rgba(124,58,237,0.18)] bg-[rgba(255,255,255,0.03)] px-3 py-0.5 text-[10px] font-bold text-[var(--admin-muted)] transition-all hover:border-[rgba(124,58,237,0.4)] hover:bg-[rgba(124,58,237,0.1)] hover:text-white"
              >
                {route.shortLabel || route.label}
              </Link>
            ))}
          </div>

          <p className="admin-kicker mt-0.5 hidden text-[var(--admin-muted)] sm:block lg:hidden">{pageSubtitle}</p>
        </motion.div>
      </div>

      {/* Right side actions */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">

        {/* Pill "Painel Ativo" com borda animada */}
        <div
          className="admin-border-animated mr-2 hidden items-center gap-2 rounded-[12px] bg-[rgba(255,255,255,0.03)] px-3 py-1.5 sm:flex"
          style={{ borderRadius: "12px" }}
        >
          <div className="relative flex items-center justify-center">
            <span className="absolute h-2 w-2 rounded-full bg-[#10B981] opacity-50 animate-ping" style={{ animationDuration: "2s" }} />
            <span className="relative h-1.5 w-1.5 rounded-full bg-[#10B981]" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-[0.22em] text-[var(--admin-muted)]">Painel Ativo</span>
        </div>

        {/* Actions cluster */}
        <div className="flex items-center gap-1 rounded-[14px] border border-[var(--admin-border-color)] bg-[rgba(255,255,255,0.03)] p-1 shadow-[0_8px_24px_rgba(0,0,0,0.18)]">
          <GlobalSearch />

          <div className="mx-0.5 h-4 w-[1px] bg-[rgba(124,58,237,0.15)]" />

          {quickActions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="admin-btn-glow h-8 w-8 rounded-[10px] border-0 bg-brand-gradient text-white shadow-[0_6px_20px_rgba(124,58,237,0.3)]"
                  aria-label="Acoes rapidas"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass-premium w-52 rounded-[14px] border-[var(--admin-border-color)] p-2">
                {quickActions.map((action) => (
                  <DropdownMenuItem
                    key={action.href}
                    onClick={() => navigate(action.href)}
                    className="group cursor-pointer gap-3 rounded-[12px] py-2.5 text-[var(--admin-muted)] transition-all focus:bg-brand-gradient focus:text-white"
                  >
                    <action.icon className="h-3.5 w-3.5 text-[var(--admin-tone-primary)] group-focus:text-white" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.14em]">{action.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-[10px] text-[var(--admin-muted)] hover:bg-[rgba(255,255,255,0.06)] hover:text-[var(--admin-text)]"
            onClick={toggle}
            aria-label="Alternar tema"
          >
            {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </Button>

          <NotificationCenter userType="admin" userId="admin" />

          {canAccessPath("/admin/configuracoes") && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-[10px] text-[var(--admin-muted)] hover:bg-[rgba(255,255,255,0.06)] hover:text-[var(--admin-text)]"
              onClick={() => navigate("/admin/configuracoes")}
              aria-label="Configuracoes"
            >
              <Settings className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
