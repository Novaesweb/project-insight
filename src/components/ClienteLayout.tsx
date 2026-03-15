import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, FolderKanban, Plus, FileText, Receipt,
  CalendarDays, Headphones, User, LogOut, Bell, Menu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import NotificationCenter from "@/components/NotificationCenter";

const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/cliente/dashboard" },
  { label: "Meus Projetos", icon: FolderKanban, path: "/cliente/projetos" },
  { label: "Meus Extras", icon: Plus, path: "/cliente/extras" },
  { label: "Contratos", icon: FileText, path: "/cliente/contratos" },
  { label: "Faturas", icon: Receipt, path: "/cliente/faturas" },
  { label: "Reuniões", icon: CalendarDays, path: "/cliente/reunioes" },
  { label: "Suporte", icon: Headphones, path: "/cliente/suporte" },
  { label: "Meus Dados", icon: User, path: "/cliente/dados" },
];

function ClienteSidebar({ currentPath, onNavigate }: { currentPath: string; onNavigate?: () => void }) {
  const cliente = JSON.parse(localStorage.getItem("clienteLogado") || "{}");

  return (
    <div className="flex flex-col h-full" style={{ background: "#0f172a" }}>
      <div className="px-4 py-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #e8334a, #c2185b, #7b1fa2)" }}>
            <span className="text-white font-bold text-xs">NW</span>
          </div>
          <div>
            <span className="text-sm font-bold">
              <span className="gradient-text">Novaes</span>
              <span className="text-white">Web</span>
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
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                isActive
                  ? "text-white shadow-lg shadow-red-500/20"
                  : "text-white/50 hover:bg-white/5 hover:text-white/80"
              )}
              style={isActive ? { background: "linear-gradient(135deg, #e8334a, #c2185b, #7b1fa2)" } : {}}
            >
              <item.icon className="w-[18px] h-[18px] shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-2 py-3 border-t border-white/5">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, #e8334a, #c2185b, #7b1fa2)" }}>
            <span className="text-white text-xs font-bold">{cliente.avatar || "?"}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">{cliente.nome || "Cliente"}</p>
            <p className="text-[10px] text-white/40">Cliente</p>
          </div>
        </div>
      </div>

      <div className="py-2 px-4" style={{ background: "linear-gradient(135deg, #e8334a, #c2185b, #7b1fa2)" }}>
        <p className="text-center text-white text-[9px] tracking-[0.1em] font-medium">NovaesWeb © 2025</p>
      </div>
    </div>
  );
}

export default function ClienteLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const cliente = JSON.parse(localStorage.getItem("clienteLogado") || "null");

  useEffect(() => {
    if (!cliente) { navigate("/cliente"); return; }
    supabase.from("notificacoes").select("id", { count: "exact", head: true })
      .eq("cliente_id", cliente.id).eq("lida", false)
      .then(({ count }) => setNotifCount(count || 0));
  }, [cliente, navigate]);

  if (!cliente) return null;

  const handleLogout = () => {
    localStorage.removeItem("clienteLogado");
    navigate("/cliente");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[hsl(var(--background))] ambient-glow">
      <aside className="hidden lg:flex w-[200px] shrink-0 flex-col">
        <ClienteSidebar currentPath={location.pathname} />
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 shrink-0 border-b border-white/5 flex items-center px-4 gap-4" style={{ background: "rgba(255,255,255,0.02)" }}>
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button className="lg:hidden text-white/50 hover:text-white"><Menu className="w-5 h-5" /></button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[240px] border-0">
              <ClienteSidebar currentPath={location.pathname} onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>

          <div className="flex-1" />

          <button className="relative text-white/50 hover:text-white transition-colors">
            <Bell className="w-5 h-5" />
            {notifCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[9px] text-white font-bold">
                {notifCount}
              </span>
            )}
          </button>
          <button onClick={handleLogout} className="text-white/50 hover:text-white transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6 max-w-[1200px]">
            {children}
          </div>
          <div className="py-2 px-4 mt-6" style={{ background: "linear-gradient(135deg, #e8334a, #c2185b, #7b1fa2)" }}>
            <p className="text-center text-white text-xs tracking-[0.1em] font-medium">NovaesWeb © 2025</p>
          </div>
        </main>
      </div>
    </div>
  );
}
