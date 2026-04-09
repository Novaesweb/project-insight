import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, FolderKanban, Plus, FileText, Receipt,
  CalendarDays, Headphones, User, LogOut, Bell, Menu, Share2, ShoppingCart, ShieldCheck, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import NotificationCenter from "@/components/NotificationCenter";
import { ReloadPrompt } from "./ReloadPrompt";
import nwLogo from "@/assets/novaesweb-logo-premium.png";
import { useBranding } from "@/hooks/useBranding";
import {
  clearClientProfile,
  getStoredClientProfile,
  loadClientProfileFromSession,
  persistClientProfile,
  type ClientPortalProfile,
} from "@/lib/client-portal-auth";

const menuItems = [
  { label: "Painel de Ativos", icon: LayoutDashboard, path: "/cliente/dashboard" },
  { label: "Meus Projetos", icon: FolderKanban, path: "/cliente/projetos" },
  { label: "Contratos", icon: FileText, path: "/cliente/contratos" },
  { label: "Meus Extras", icon: Zap, path: "/cliente/extras" },
  { label: "Financeiro", icon: Receipt, path: "/cliente/faturas" },
];

const menuColors = [
  "from-purple-500 to-pink-500",
  "from-pink-500 to-red-500",
  "from-yellow-500 to-amber-500",
  "from-purple-600 to-indigo-500",
  "from-red-500 to-pink-500",
  "from-amber-500 to-yellow-500",
  "from-pink-500 to-purple-500",
  "from-indigo-500 to-purple-500",
];

function ClienteSidebar({ currentPath, onNavigate }: { currentPath: string; onNavigate?: () => void }) {
  const cliente = getStoredClientProfile();
  const branding = useBranding();

  return (
    <div className="flex flex-col h-full relative z-50" style={{ background: "linear-gradient(180deg, #0d0b12 0%, #1a0a2e 50%, #0f0a05 100%)" }}>
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, #7b1fa2, #c2185b, #e8334a, #FFD700)" }} />
      
      {/* Subtle side glow */}
      <div className="absolute top-0 left-0 w-1 h-full" style={{ background: "linear-gradient(180deg, #7b1fa2, #c2185b, #FFD700, transparent)" }} />

      <div className="px-4 py-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          {branding.logo ? (
            <img src={branding.logo} alt={branding.nome} className="w-8 h-8 rounded-lg object-cover" />
          ) : (
            <img src={nwLogo} alt="novaesweb" className="w-8 h-8 rounded-lg object-cover" />
          )}
          <div>
            <span className="text-sm font-bold" style={{ background: "linear-gradient(90deg, #c084fc, #e8334a, #FFD700)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {branding.nome || "novaesweb"}
            </span>
            <p className="text-[9px] text-white/40 tracking-widest uppercase">Portal Cliente</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {menuItems.map((item, idx) => {
          const isActive = currentPath === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-all relative overflow-hidden group",
                isActive
                  ? "text-white shadow-lg"
                  : "text-white/40 hover:bg-white/5 hover:text-white/80"
              )}
              style={isActive ? { background: "linear-gradient(135deg, rgba(123,31,162,0.25), rgba(232,51,74,0.15))" } : {}}
            >
              {isActive && (
                <div className="absolute left-0 w-1 h-5 rounded-r-full" style={{ background: "linear-gradient(180deg, #7b1fa2, #e8334a, #FFD700)", boxShadow: "0 0 12px rgba(123,31,162,0.6)" }} />
              )}
              <div className={cn(
                "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all",
                isActive ? `bg-gradient-to-br ${menuColors[idx]} shadow-lg` : "bg-white/5"
              )}>
                <item.icon className={cn("w-3.5 h-3.5", isActive ? "text-white" : "text-white/30")} />
              </div>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-2 py-3 border-t border-white/5">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl" style={{ background: "linear-gradient(135deg, rgba(123,31,162,0.1), rgba(232,51,74,0.05))" }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, #7b1fa2, #c2185b)" }}>
            <span className="text-white text-xs font-bold">{cliente?.avatar || "?"}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">{cliente?.nome || "Cliente"}</p>
            <p className="text-[10px] text-white/40">Cliente</p>
          </div>
        </div>
      </div>

    </div>
  );
}

export default function ClienteLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cliente, setCliente] = useState<ClientPortalProfile | null>(() => getStoredClientProfile());
  const [ready, setReady] = useState(false);
  const [adminMirrorMode, setAdminMirrorMode] = useState(false);
  const branding = useBranding();

  useEffect(() => {
    let active = true;

    const syncPortalAccess = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        clearClientProfile();
        if (active) {
          setCliente(null);
          setAdminMirrorMode(false);
          setReady(true);
          navigate("/cliente/login", { replace: true });
        }
        return;
      }

      const normalizedEmail = session.user.email?.trim().toLowerCase();
      let adminData: { id: string } | null = null;

      if (normalizedEmail) {
        const { data } = await supabase
          .from("usuarios")
          .select("id")
          .eq("email", normalizedEmail)
          .eq("status", "ativo")
          .eq("bloqueado", false)
          .maybeSingle();
        adminData = data;
      }

      if (adminData) {
        const mirroredClient = getStoredClientProfile();
        if (!mirroredClient) {
          if (active) {
            setCliente(null);
            setAdminMirrorMode(false);
            setReady(true);
            navigate("/admin", { replace: true });
          }
          return;
        }

        if (active) {
          setCliente(mirroredClient);
          setAdminMirrorMode(true);
          setReady(true);
        }
        return;
      }

      try {
        const profile = await loadClientProfileFromSession(session);

        if (!profile || profile.bloqueado) {
          clearClientProfile();
          await supabase.auth.signOut();
          if (active) {
            setCliente(null);
            setAdminMirrorMode(false);
            setReady(true);
            navigate("/cliente/login", { replace: true });
          }
          return;
        }

        persistClientProfile(profile);
        if (active) {
          setCliente(profile);
          setAdminMirrorMode(false);
          setReady(true);
        }
      } catch (error) {
        console.error("Client portal session sync error");
        clearClientProfile();
        await supabase.auth.signOut();
        if (active) {
          setCliente(null);
          setAdminMirrorMode(false);
          setReady(true);
          navigate("/cliente/login", { replace: true });
        }
      }
    };

    void syncPortalAccess();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        clearClientProfile();
        setCliente(null);
        setAdminMirrorMode(false);
        setReady(true);
        navigate("/cliente/login", { replace: true });
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  useEffect(() => {
    if (!cliente?.id) return;

    const channel = supabase
      .channel("cliente-deleted")
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "clientes",
          filter: `id=eq.${cliente.id}`
        },
        () => {
          clearClientProfile();

          if (adminMirrorMode) {
            navigate("/admin/clientes", { replace: true });
            return;
          }

          void supabase.auth.signOut();
          alert("⚠️ Acesso Revogado\n\nSeu acesso foi desativado pelo administrador. Você será redirecionado para a página de login.");
          navigate("/cliente/login", { replace: true });
          window.location.reload();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [adminMirrorMode, cliente?.id, navigate]);

  if (!ready || !cliente) return null;

  const handleLogout = () => {
    clearClientProfile();

    if (adminMirrorMode) {
      navigate("/admin/clientes", { replace: true });
      return;
    }

    void supabase.auth.signOut();
    navigate("/cliente/login", { replace: true });
  };

  return (
    <div className="flex h-screen overflow-hidden text-[hsl(var(--foreground))] admin-layout-container font-sora">
      <aside className="hidden lg:flex w-[220px] shrink-0 flex-col">
        <ClienteSidebar currentPath={location.pathname} />
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 shrink-0 flex items-center px-4 md:px-6 gap-4 sticky top-0 z-40 bg-transparent">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button className="lg:hidden text-white/50 hover:text-white p-2 rounded-xl border border-white/10" style={{ background: "linear-gradient(135deg, rgba(123,31,162,0.15), rgba(232,51,74,0.1))" }}>
                <Menu className="w-5 h-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[260px] border-0 bg-transparent">
              <ClienteSidebar currentPath={location.pathname} onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>

          <div className="flex-1" />

          <div className="flex items-center gap-3 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 shadow-2xl" style={{ background: "linear-gradient(135deg, rgba(123,31,162,0.1), rgba(13,11,18,0.8))" }}>
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
        </main>
      </div>
    </div>
  );
}
