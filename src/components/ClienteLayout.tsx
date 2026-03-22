import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, FolderKanban, Plus, FileText, Receipt,
  CalendarDays, Headphones, User, LogOut, Bell, Menu, Share2, ShoppingCart
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import NotificationCenter from "@/components/NotificationCenter";
import { ReloadPrompt } from "./ReloadPrompt";
import nwLogo from "@/assets/novaesweb-logo-n.jpeg";
import { useBranding } from "@/hooks/useBranding";

const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/cliente/dashboard" },
  { label: "Pedidos (Fome)", icon: ShoppingCart, path: "/cliente/pedidos" },
  { label: "Meus Projetos", icon: FolderKanban, path: "/cliente/projetos" },
  { label: "Meus Extras", icon: Plus, path: "/cliente/extras" },
  { label: "Contratos", icon: FileText, path: "/cliente/contratos" },
  { label: "Faturas", icon: Receipt, path: "/cliente/faturas" },
  { label: "Reuniões", icon: CalendarDays, path: "/cliente/reunioes" },
  { label: "Arquivos", icon: FileText, path: "/cliente/arquivos" },
  { label: "Indique e Ganhe", icon: Share2, path: "/cliente/indique" },
  { label: "Suporte", icon: Headphones, path: "/cliente/suporte" },
  { label: "Meus Dados", icon: User, path: "/cliente/dados" },
];

function ClienteSidebar({ currentPath, onNavigate }: { currentPath: string; onNavigate?: () => void }) {
  const cliente = JSON.parse(localStorage.getItem("clienteLogado") || "{}");
  const branding = useBranding();

  return (
    <div className="flex flex-col h-full bg-black/20 backdrop-blur-2xl border-r border-white/5 relative z-50">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      <div className="px-4 py-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          {branding.logo ? (
            <img src={branding.logo} alt={branding.nome} className="w-8 h-8 rounded-lg object-cover" />
          ) : (
            <img src={nwLogo} alt="NovaesWeb" className="w-8 h-8 rounded-lg object-cover" />
          )}
          <div>
            <span className="text-sm font-bold">
              <span className="text-white">{branding.nome || "NovaesWeb"}</span>
            </span>
            <p className="text-[9px] text-white/40 tracking-widest uppercase">Portal Cliente</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {menuItems.map(item => {
          const isActive = currentPath === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onNavigate}
               className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative overflow-hidden group",
                isActive
                  ? "text-white bg-primary/20 shadow-lg shadow-primary/10"
                  : "text-white/40 hover:bg-white/5 hover:text-white/80"
              )}
            >
              {isActive && (
                <div className="absolute left-0 w-1 h-5 bg-primary rounded-r-full shadow-[0_0_15px_rgba(255,51,102,0.8)]" />
              )}
              <item.icon className={cn("w-[18px] h-[18px] shrink-0 transition-transform group-hover:scale-110", isActive ? "text-primary" : "text-white/30")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-2 py-3 border-t border-white/5">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "hsl(var(--primary))" }}>
            <span className="text-white text-xs font-bold">{cliente.avatar || "?"}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">{cliente.nome || "Cliente"}</p>
            <p className="text-[10px] text-white/40">Cliente</p>
          </div>
        </div>
      </div>

      <div className="py-2 px-4" style={{ background: "hsl(var(--primary))" }}>
        <p className="text-center text-white text-[9px] tracking-[0.1em] font-medium">{branding.nome} © 2025 — v2.4.8 Premium</p>
      </div>
    </div>
  );
}

export default function ClienteLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const cliente = JSON.parse(localStorage.getItem("clienteLogado") || "null");
  const branding = useBranding();

  useEffect(() => {
    if (!cliente) { navigate("/cliente"); return; }
  }, [cliente, navigate]);

  if (!cliente) return null;

  const handleLogout = () => {
    localStorage.removeItem("clienteLogado");
    navigate("/cliente");
  };

  return (
    <div className="flex h-screen overflow-hidden text-[hsl(var(--foreground))] admin-layout-container font-sora">
      <aside className="hidden lg:flex w-[220px] shrink-0 flex-col">
        <ClienteSidebar currentPath={location.pathname} />
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 shrink-0 flex items-center px-4 md:px-6 gap-4 sticky top-0 z-40 bg-transparent">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button className="lg:hidden text-white/50 hover:text-white bg-white/5 p-2 rounded-xl border border-white/10"><Menu className="w-5 h-5" /></button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[260px] border-0 bg-transparent">
              <ClienteSidebar currentPath={location.pathname} onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>

          <div className="flex-1" />

          <div className="flex items-center gap-3 bg-white/5 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 shadow-2xl">
            <NotificationCenter userType="cliente" userId={cliente.id} />
            <div className="h-6 w-px bg-white/10 mx-1" />
            <button onClick={handleLogout} className="h-9 w-9 flex items-center justify-center rounded-xl text-white/50 hover:text-red-400 hover:bg-red-400/10 transition-all">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-3 lg:p-4 max-w-[1100px] mx-auto w-full pb-6">
            {children}
          </div>
          <div className="py-2 px-4 mt-6" style={{ background: "hsl(var(--primary))" }}>
            <p className="text-center text-white text-xs tracking-[0.1em] font-medium">{branding.nome} © 2025 — v2.4.8 Premium</p>
          </div>
        </main>
      </div>
    </div>
  );
}
