import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, Users, UserPlus, DollarSign, Wallet, 
  Settings, LogOut, Menu, X, ChevronRight, 
  Bell, Search, HelpCircle, Package, Share2, ClipboardList
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useBranding } from "@/hooks/useBranding";
import { cn } from "@/lib/utils";
import GlobalSearch from "./GlobalSearch";
import { motion } from "framer-motion";
import { ReloadPrompt } from "./ReloadPrompt";

interface NavItem {
  label: string;
  icon: any;
  path: string;
  badge?: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/revenda/dashboard" },
  { label: "Minhas Indicações", icon: Users, path: "/revenda/indicacoes" },
  { label: "Comissões", icon: DollarSign, path: "/revenda/comissoes" },
  { label: "Materiais", icon: Package, path: "/revenda/materiais" },
  { label: "Financeiro", icon: Wallet, path: "/revenda/financeiro" },
  { label: "Suporte", icon: HelpCircle, path: "/revenda/suporte" },
];

export default function ResellerLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const branding = useBranding();
  
  // Simular usuário logado (seria via context/localStorage no real)
  const reseller = JSON.parse(localStorage.getItem("revendedorLogado") || "{}");

  useEffect(() => {
    // Se não houver revendedor logado, redirecionar (exemplo)
    if (!reseller.id && !location.pathname.includes("login")) {
      // navigate("/revenda/login");
    }
  }, [location, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("revendedorLogado");
    navigate("/revenda/login");
  };

  return (
    <div className="min-h-screen bg-[#08080f] text-white flex overflow-hidden">
      {/* Sidebar Desktop */}
      <aside 
        className={cn(
          "hidden lg:flex flex-col bg-black/20 backdrop-blur-2xl border-r border-white/5 transition-all duration-300 relative z-50",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        <div className="p-4 flex items-center gap-3">
          <Link to="/revenda/dashboard" className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-500/20">
              <span className="text-white font-bold text-xs">NW</span>
            </div>
            {isSidebarOpen && (
              <span className="font-bold text-base tracking-tight whitespace-nowrap">
                <span className="bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">webnovax</span>
                <span className="text-white">Web</span>
              </span>
            )}
          </Link>
        </div>

        <nav className="flex-1 px-4 py-1 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
               <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-1.5 rounded-xl transition-all group relative overflow-hidden",
                  isActive 
                    ? "bg-primary/10 text-primary shadow-lg shadow-primary/5" 
                    : "text-white/40 hover:bg-white/5 hover:text-white"
                )}
              >
                {isActive && (
                  <div className="absolute left-0 w-1 h-4 bg-primary rounded-r-full shadow-[0_0_15px_rgba(255,51,102,0.8)]" />
                )}
                <Icon className={cn("w-4 h-4 transition-transform duration-300 group-hover:scale-110", isActive ? "text-primary" : "text-white/20 group-hover:text-white/50")} />
                {isSidebarOpen && <span className="text-xs font-medium">{item.label}</span>}
                {isSidebarOpen && item.badge && (
                  <Badge variant="destructive" className="ml-auto h-4 px-1.5 text-[9px] bg-primary/10 text-primary border-primary/20 animate-pulse">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <Button 
            variant="ghost" 
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-1.5 rounded-xl text-white/40 hover:bg-red-500/10 hover:text-red-500 transition-all",
              !isSidebarOpen && "justify-center"
            )}
          >
            <LogOut className="w-4 h-4" />
            {isSidebarOpen && <span className="text-xs font-medium">Sair</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative font-sora">
        {/* Header */}
        <header className="h-14 bg-transparent sticky top-0 z-40 px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setSidebarOpen(!isSidebarOpen)} 
              className="hidden lg:flex text-white/40 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setMobileMenuOpen(true)} 
              className="lg:hidden text-white/40 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </Button>
            
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-medium text-white/40 uppercase tracking-wider">
               <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
               Painel de Revenda
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/5 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 shadow-2xl">
             <GlobalSearch />
             <div className="h-6 w-px bg-white/10 mx-1" />
            <Button variant="ghost" size="icon" className="h-9 w-9 text-white/50 relative hover:text-white hover:bg-white/10 rounded-xl transition-all">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-[#03040b]" />
            </Button>

            <div className="h-8 w-px bg-white/5 mx-1" />

            <div className="flex items-center gap-3 pl-2">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-white">{reseller.nome || "Revendedor"}</p>
                <p className="text-[10px] text-white/40">Status: <span className="text-emerald-400 font-bold">Ativo</span></p>
              </div>
              <Avatar className="h-10 w-10 border-2 border-white/10 shadow-xl ring-2 ring-primary/20 transition-transform hover:scale-110">
                <AvatarImage src={reseller.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-bold">
                  {(reseller.nome || "R").charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar bg-[#08080f] p-3 lg:p-4">
           <div className="max-w-[1100px] mx-auto space-y-4 animate-in fade-in duration-500 pb-6">
             {children}
           </div>
        </main>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm lg:hidden" onClick={() => setMobileMenuOpen(false)}>
          <motion.div 
            initial={{ x: "-100%" }} 
            animate={{ x: 0 }} 
            className="w-72 h-full bg-[#0c0c14] p-6 shadow-2xl" 
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center font-bold text-white">NW</div>
                  <span className="font-bold text-white">WebNovaX</span>
               </div>
               <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                 <X className="w-5 h-5" />
               </Button>
            </div>
            
            <nav className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                    location.pathname === item.path ? "bg-red-500 text-white" : "text-white/60 hover:bg-white/5"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>
          </motion.div>
        </div>
      )}
    </div>
  );
}


