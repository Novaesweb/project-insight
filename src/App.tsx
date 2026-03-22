declare global {
  interface Window {
    electron: {
      send: (channel: string, data: any) => void;
      receive: (channel: string, func: (...args: any[]) => void) => void;
    };
  }
}

import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AdminLayout from "@/components/AdminLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminLogin from "@/pages/AdminLogin";
import ClienteLayout from "@/components/ClienteLayout";
import SplashScreen from "@/components/SplashScreen";
import { ThemeProvider } from "@/hooks/useTheme";
import Site from "./pages/Site";
import Index from "./pages/Index";
import Clientes from "./pages/Clientes";
import Projetos from "./pages/Projetos";
import Pedidos from "./pages/Pedidos";
import Extras from "./pages/Extras";
import Relatorios from "./pages/Relatorios";
import Financeiro from "./pages/Financeiro";
import Suporte from "./pages/Suporte";
import Usuarios from "./pages/Usuarios";
import Leads from "./pages/Leads";
import Configuracoes from "./pages/Configuracoes";
import Agenda from "./pages/Agenda";
import Contratos from "./pages/Contratos";
import AdminRevenda from "./pages/admin/AdminRevenda";
import AgendarPublico from "./pages/AgendarPublico";
import Cadastro from "./pages/Cadastro";
import Funcionalidades from "./pages/Funcionalidades";
import NichePage from "./pages/NichePage";
import Instalar from "./pages/Instalar";
import ClienteLogin from "./pages/cliente/ClienteLogin";
import ClienteDashboard from "./pages/cliente/ClienteDashboard";
import ClienteProjetos from "./pages/cliente/ClienteProjetos";
import ClienteExtras from "./pages/cliente/ClienteExtras";
import ClienteContratos from "./pages/cliente/ClienteContratos";
import ClienteFaturas from "./pages/cliente/ClienteFaturas";
import ClienteReunioes from "./pages/cliente/ClienteReunioes";
import ClienteSuporte from "./pages/cliente/ClienteSuporte";
import ClienteDados from "./pages/cliente/ClienteDados";
import ClienteArquivos from "./pages/cliente/ClienteArquivos";
import ClienteReferral from "./pages/cliente/ClienteReferral";
import ResellerLayout from "@/components/ResellerLayout";
import ResellerDashboard from "./pages/reseller/ResellerDashboard";
import ResellerIndicacoes from "./pages/reseller/ResellerIndicacoes";
import ResellerFinanceiro from "./pages/reseller/ResellerFinanceiro";
import ResellerMateriais from "./pages/reseller/ResellerMateriais";
import NotFound from "@/pages/NotFound";
import AdminMenu from "@/pages/AdminMenu";
import MenuInterativo from "@/pages/MenuInterativo";
import ClientePedidosFome from "@/pages/cliente/ClientePedidosFome";
import AdminDepoimentos from "@/pages/AdminDepoimentos";
import { NativeNotificationManager } from "@/components/NativeNotificationManager";
import { ReloadPrompt } from "@/components/ReloadPrompt";

import { useLocation } from "react-router-dom";

const queryClient = new QueryClient();

function ReferralTracker() {
  const { search } = useLocation();
  
  useEffect(() => {
    const params = new URLSearchParams(search);
    const ref = params.get("ref");
    if (ref) {
      localStorage.setItem("nv_referral_code", ref);
      console.log("Referral code captured:", ref);
    }
  }, [search]);

  return null;
}

function AdminWithSplash() {
  const [splashDone, setSplashDone] = useState(false);

  if (!splashDone) {
    return <SplashScreen onComplete={() => setSplashDone(true)} />;
  }

  return (
    <ThemeProvider>
      <AdminLayout>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/projetos" element={<Projetos />} />
          <Route path="/pedidos" element={<Pedidos />} />
          <Route path="/extras" element={<Extras />} />
          <Route path="/relatorios" element={<Relatorios />} />
          <Route path="/financeiro" element={<Financeiro />} />
          <Route path="/suporte" element={<Suporte />} />
          <Route path="/usuarios" element={<Usuarios />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/revenda" element={<AdminRevenda />} />
          <Route path="/contratos" element={<Contratos />} />
          <Route path="/menu" element={<AdminMenu />} />
          <Route path="/depoimentos" element={<AdminDepoimentos />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AdminLayout>
    </ThemeProvider>
  );
}

import { useNavigate } from "react-router-dom";

const DesktopNavigationHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (window.electron && window.electron.receive) {
      window.electron.receive("navigate-to", (url: string) => {
        console.log("Navigating to:", url);
        navigate(url);
      });
    }
  }, [navigate]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <NativeNotificationManager />
      <ReloadPrompt />
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <DesktopNavigationHandler />
        <ReferralTracker />
        <Routes>
          {/* Public Site */}
          <Route path="/" element={<Site />} />
          <Route path="/site" element={<Site />} />
          <Route path="/nicho/:slug" element={<NichePage />} />
          <Route path="/agendar" element={<AgendarPublico />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/funcionalidades" element={<Funcionalidades />} />
          <Route path="/cardapio/:slug" element={<MenuInterativo />} />
          <Route path="/instalar" element={<Instalar />} />
          <Route path="/cliente" element={<ClienteLogin />} />

          {/* Client Portal */}
          <Route path="/cliente/*" element={
            <ClienteLayout>
              <Routes>
                <Route path="dashboard" element={<ClienteDashboard />} />
                <Route path="pedidos" element={<ClientePedidosFome />} />
                <Route path="projetos" element={<ClienteProjetos />} />
                <Route path="extras" element={<ClienteExtras />} />
                <Route path="contratos" element={<ClienteContratos />} />
                <Route path="faturas" element={<ClienteFaturas />} />
                <Route path="reunioes" element={<ClienteReunioes />} />
                <Route path="suporte" element={<ClienteSuporte />} />
                <Route path="indique" element={<ClienteReferral />} />
                <Route path="dados" element={<ClienteDados />} />
                <Route path="arquivos" element={<ClienteArquivos />} />
              </Routes>
            </ClienteLayout>
          } />

          {/* Admin Login */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Admin */}
          <Route path="/admin/*" element={
            <ProtectedRoute>
              <AdminWithSplash />
            </ProtectedRoute>
          } />

          {/* Reseller Portal */}
          <Route path="/revenda/*" element={
            <ResellerLayout>
              <Routes>
                <Route path="dashboard" element={<ResellerDashboard />} />
                <Route path="indicacoes" element={<ResellerIndicacoes />} />
                <Route path="financeiro" element={<ResellerFinanceiro />} />
                <Route path="materiais" element={<ResellerMateriais />} />
                <Route path="suporte" element={<ClienteSuporte />} />
                <Route path="*" element={<ResellerDashboard />} />
              </Routes>
            </ResellerLayout>
          } />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
