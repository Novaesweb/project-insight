declare global {
  interface Window {
    electron: {
      send: (channel: string, data: any) => void;
      receive: (channel: string, func: (...args: any[]) => void) => void;
    };
  }
}

import React, { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HelmetProvider } from "react-helmet-async";
import AdminLayout from "@/components/AdminLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import SplashScreen from "@/components/SplashScreen";
import { ThemeProvider } from "@/hooks/useTheme";
import SEOHead from "@/components/SEOHead";
import NativeNotificationManager from "@/components/NativeNotificationManager";
import HttpsRedirect from "@/components/HttpsRedirect";
import { getQueryClient } from "@/lib/query-client";

// Importações críticas em memória (carregados no bundle principal)
// Nenhuma página pesada deve estar aqui agora

// Divisões Assíncronas (Lazy Loaded Chunks)
const Site = React.lazy(() => import("./pages/Site"));
const Index = React.lazy(() => import("./pages/Index"));
const Clientes = React.lazy(() => import("./pages/Clientes"));
const Projetos = React.lazy(() => import("./pages/Projetos"));
const Pedidos = React.lazy(() => import("./pages/Pedidos"));
const Extras = React.lazy(() => import("./pages/Extras"));
const Calculadora = React.lazy(() => import("./pages/Calculadora"));
const Relatorios = React.lazy(() => import("./pages/Relatorios"));
const Financeiro = React.lazy(() => import("./pages/Financeiro"));
const Suporte = React.lazy(() => import("./pages/Suporte"));
const Usuarios = React.lazy(() => import("./pages/Usuarios"));
const Leads = React.lazy(() => import("./pages/Leads"));
const Configuracoes = React.lazy(() => import("./pages/Configuracoes"));
const Agenda = React.lazy(() => import("./pages/Agenda"));
const Contratos = React.lazy(() => import("./pages/Contratos"));
const AdminRevenda = React.lazy(() => import("./pages/admin/AdminRevenda"));
const AgendarPublico = React.lazy(() => import("./pages/AgendarPublico"));
const Cadastro = React.lazy(() => import("./pages/Cadastro"));
const Funcionalidades = React.lazy(() => import("./pages/Funcionalidades"));
const NichePage = React.lazy(() => import("./pages/NichePage"));
const Instalar = React.lazy(() => import("./pages/Instalar"));
const LandingPage = React.lazy(() => import("./pages/LandingPage"));
const ClienteLogin = React.lazy(() => import("./pages/cliente/ClienteLogin"));
const ClienteDashboard = React.lazy(() => import("./pages/cliente/ClienteDashboard"));
const ClienteProjetos = React.lazy(() => import("./pages/cliente/ClienteProjetos"));
const ClienteExtras = React.lazy(() => import("./pages/cliente/ClienteExtras"));
const ClienteContratos = React.lazy(() => import("./pages/cliente/ClienteContratos"));
const ClienteFaturas = React.lazy(() => import("./pages/cliente/ClienteFaturas"));
const ClienteReunioes = React.lazy(() => import("./pages/cliente/ClienteReunioes"));
const ClienteSuporte = React.lazy(() => import("./pages/cliente/ClienteSuporte"));
const ClienteDados = React.lazy(() => import("./pages/cliente/ClienteDados"));
const ClienteArquivos = React.lazy(() => import("./pages/cliente/ClienteArquivos"));
const ClienteReferral = React.lazy(() => import("./pages/cliente/ClienteReferral"));
const ResellerLayout = React.lazy(() => import("@/components/ResellerLayout"));
const ResellerDashboard = React.lazy(() => import("./pages/reseller/ResellerDashboard"));
const ResellerIndicacoes = React.lazy(() => import("./pages/reseller/ResellerIndicacoes"));
const ResellerFinanceiro = React.lazy(() => import("./pages/reseller/ResellerFinanceiro"));
const ResellerMateriais = React.lazy(() => import("./pages/reseller/ResellerMateriais"));
const NotFound = React.lazy(() => import("@/pages/NotFound"));
const AdminMenu = React.lazy(() => import("@/pages/AdminMenu"));
const AdminDepoimentos = React.lazy(() => import("@/pages/AdminDepoimentos"));
const AdminConfig = React.lazy(() => import("@/pages/admin/AdminConfig"));
const AdminRecurrentBilling = React.lazy(() => import("@/pages/AdminRecurrentBilling"));
const ExtrasAtivos = React.lazy(() => import("@/pages/ExtrasAtivos"));
const ClientePedidosFome = React.lazy(() => import("./pages/cliente/ClientePedidosFome"));
const AdminLogin = React.lazy(() => import("./pages/AdminLogin"));
const ClienteLayout = React.lazy(() => import("@/components/ClienteLayout"));

import { useLocation } from "react-router-dom";

const queryClient = getQueryClient();

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
        <React.Suspense fallback={<SplashScreen />}>
          <Routes>
            <Route path="/" element={<Index />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/projetos" element={<Projetos />} />
          <Route path="/pedidos" element={<Pedidos />} />
          <Route path="/extras" element={<Extras />} />
          <Route path="/calculadora" element={<Calculadora />} />
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
          <Route path="/configuracoes" element={<AdminConfig />} />
          <Route path="/recurrent-billing" element={<AdminRecurrentBilling />} />
          <Route path="/extras-ativos" element={<ExtrasAtivos />} />
            <Route path="*" element={<React.Suspense fallback={<SplashScreen />}><NotFound /></React.Suspense>} />
          </Routes>
        </React.Suspense>
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
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <HttpsRedirect>
          <NativeNotificationManager />
          <BrowserRouter>
            <SEOHead />
            <Toaster />
            <Sonner />
            <DesktopNavigationHandler />
            <ReferralTracker />
            <React.Suspense fallback={<SplashScreen />}>
              <Routes>
                {/* Public Site */}
              <Route path="/" element={<Site />} />
              <Route path="/site" element={<Site />} />
              <Route path="/nicho/:slug" element={<NichePage />} />
              <Route path="/agendar" element={<AgendarPublico />} />
              <Route path="/cadastro" element={<Cadastro />} />
              <Route path="/funcionalidades" element={<Funcionalidades />} />
              <Route path="/cardapio/:slug" element={<AdminMenu />} />
              <Route path="/instalar" element={<Instalar />} />
              <Route path="/landing" element={<LandingPage />} />
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

                <Route path="*" element={<React.Suspense fallback={<SplashScreen />}><NotFound /></React.Suspense>} />
              </Routes>
            </React.Suspense>
          </BrowserRouter>
        </HttpsRedirect>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;



