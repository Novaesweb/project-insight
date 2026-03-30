import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import GlobalSearch from "@/components/GlobalSearch";
import NotificationCenter from "@/components/NotificationCenter";
import { useTheme } from "@/hooks/useTheme";
import { pageInfo } from "@/lib/constants";
import { Sun, Moon, Settings } from "lucide-react";

interface AdminHeaderProps {
  title?: string;
  subtitle?: string;
}

export default function AdminHeader({ title, subtitle }: AdminHeaderProps) {
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const { pathname } = useLocation();

  const pageTitle = title || pageInfo[pathname as keyof typeof pageInfo]?.titulo || "Painel Admin";
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
          <p className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase hidden sm:block">{pageSubtitle}</p>
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

        <GlobalSearch />

        <div className="h-4 w-px mx-1 hidden sm:block" style={{ background: 'hsl(var(--border))' }} />

        <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'hsl(var(--secondary))', border: '1px solid hsl(var(--border))' }}>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
            onClick={toggle} aria-label="Alternar tema">
            {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </Button>
          <NotificationCenter userType="admin" userId="admin" />
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
            onClick={() => navigate("/admin/configuracoes")} aria-label="Configurações">
            <Settings className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
