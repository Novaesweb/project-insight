import { Link, useNavigate, useLocation } from "react-router-dom";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import GlobalSearch from "@/components/GlobalSearch";
import NotificationCenter from "@/components/NotificationCenter";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { useTheme } from "@/hooks/useTheme";
import { pageInfo } from "@/lib/constants";
import { getRecentAdminRoutes } from "@/lib/admin-navigation";
import { Sun, Moon, Settings, Plus, Users, FolderKanban, Headphones } from "lucide-react";
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
  if (pathname.startsWith("/admin/contratos")) {
    return {
      titulo: "Modulo em Reconstrucao",
      subtitulo: "Fluxo legado de contratos desligado do painel",
    };
  }

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
    [canAccessPath, pathname]
  );

  const quickActions = [
    { href: "/admin/clientes", label: "Novo Cliente", icon: Users },
    { href: "/admin/projetos", label: "Novo Projeto", icon: FolderKanban },
    { href: "/admin/leads", label: "Ver Leads", icon: Headphones },
  ].filter((action) => canAccessPath(action.href));

  const matchedPageInfo = resolvePageInfoMatch(pathname);
  const pageTitle = title || matchedPageInfo?.titulo || "Painel Admin";
  const pageSubtitle = subtitle || "Gestão Digital";

  return (
    <header
      className="h-14 md:h-16 flex items-center justify-between px-3 sm:px-5 lg:px-8 sticky top-0 z-40 backdrop-blur-xl"
      style={{
        background: 'hsl(var(--background) / 0.85)',
        borderBottom: '1px solid hsl(var(--border))',
      }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex flex-col min-w-0">
          <h1 className="text-sm md:text-base font-bold tracking-tight text-foreground truncate" role="heading" aria-level={1}>
            {pageTitle}
          </h1>
          <div className="hidden lg:flex items-center gap-2 mt-1">
            <p className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase">{pageSubtitle}</p>
            {recentLinks.map((route) => (
              <Link
                key={route.href}
                to={route.href}
                className="px-2 py-1 rounded-full text-[10px] font-semibold transition-colors"
                style={{
                  background: "hsl(var(--secondary))",
                  border: "1px solid hsl(var(--border))",
                  color: "hsl(var(--muted-foreground))",
                }}
              >
                {route.label}
              </Link>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase lg:hidden hidden sm:block">{pageSubtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {/* System live indicator */}
        <div className="hidden sm:flex items-center gap-1.5 mr-2 px-2.5 py-1.5 rounded-lg" style={{ background: 'hsl(var(--success) / 0.06)', border: '1px solid hsl(var(--success) / 0.12)' }}>
          <div className="relative">
            <div className="absolute w-1.5 h-1.5 rounded-full animate-ping opacity-50" style={{ background: 'hsl(var(--success))' }} />
            <div className="relative w-1.5 h-1.5 rounded-full" style={{ background: 'hsl(var(--success))' }} />
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'hsl(var(--success))' }}>Live</span>
        </div>

        {/* Quick Actions */}
        {quickActions.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                style={{ background: 'hsl(var(--primary) / 0.1)', border: '1px solid hsl(var(--primary) / 0.2)' }}
                aria-label="Ações rápidas"
              >
                <Plus className="w-4 h-4" style={{ color: 'hsl(var(--primary))' }} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {quickActions.map((action) => (
                <DropdownMenuItem key={action.href} onClick={() => navigate(action.href)} className="gap-2 cursor-pointer">
                  <action.icon className="w-4 h-4" /> {action.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <GlobalSearch />

        <div className="h-4 w-px mx-1 hidden sm:block" style={{ background: 'hsl(var(--border))' }} />

        <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'hsl(var(--secondary))', border: '1px solid hsl(var(--border))' }}>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
            onClick={toggle} aria-label="Alternar tema">
            {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </Button>
          <NotificationCenter userType="admin" userId="admin" />
          {canAccessPath("/admin/configuracoes") && (
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
              onClick={() => navigate("/admin/configuracoes")} aria-label="Configurações">
              <Settings className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
