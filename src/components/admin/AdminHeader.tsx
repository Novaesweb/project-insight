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
      className="h-16 md:h-20 flex items-center justify-between px-6 sm:px-8 lg:px-10 sticky top-0 z-40 glass-header-admin overflow-hidden"
    >
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-brand-gradient opacity-40" />

      <div className="flex items-center gap-4 min-w-0">
        <div className="flex flex-col min-w-0">
          <h1 
            className="text-lg md:text-xl font-light tracking-tight text-slate-900 truncate" 
            style={{ fontFamily: "'Playfair Display', serif" }}
            role="heading" 
            aria-level={1}
          >
            {pageTitle}
          </h1>
          <div className="hidden lg:flex items-center gap-3 mt-1.5">
            <p className="text-[10px] text-slate-400 font-bold tracking-[0.3em] uppercase">{pageSubtitle}</p>
            <div className="w-1 h-1 rounded-full bg-brand-gradient" />
            {recentLinks.map((route) => (
              <Link
                key={route.href}
                to={route.href}
                className="px-3 py-1 rounded-full text-[10px] font-bold transition-all hover:text-[#7C3AED] border border-slate-200 bg-white text-slate-400"
              >
                {route.label}
              </Link>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 font-bold tracking-[0.3em] uppercase lg:hidden hidden sm:block mt-1">{pageSubtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* System live indicator */}
        <div className="hidden sm:flex items-center gap-2 mr-4 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200">
          <div className="relative">
            <div className="absolute w-1.5 h-1.5 rounded-full animate-ping opacity-50 bg-[#FF1F1F]" />
            <div className="relative w-1.5 h-1.5 rounded-full bg-brand-gradient" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Premium Live</span>
        </div>

        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/50 border border-slate-200">
          <GlobalSearch />
          
          <div className="h-4 w-[1px] mx-1 bg-slate-200" />

          {quickActions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-white text-[#FF1F1F] hover:scale-110 transition-all border border-[#FF1F1F]/10 shadow-sm shadow-red-500/5"
                  aria-label="Ações rápidas"
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 glass-premium p-2 rounded-2xl border-slate-200">
                {quickActions.map((action) => (
                  <DropdownMenuItem key={action.href} onClick={() => navigate(action.href)} className="gap-3 cursor-pointer py-3 rounded-xl focus:bg-brand-gradient focus:text-white transition-all group text-slate-600">
                    <action.icon className="w-4 h-4 text-[#7C3AED] group-focus:text-white" /> 
                    <span className="text-xs font-bold uppercase tracking-wider">{action.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100"
            onClick={toggle} aria-label="Alternar tema">
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          
          <NotificationCenter userType="admin" userId="admin" />
          
          {canAccessPath("/admin/configuracoes") && (
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100"
              onClick={() => navigate("/admin/configuracoes")} aria-label="Configurações">
              <Settings className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
