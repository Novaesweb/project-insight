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
import { BrowserRouter, Route, Routes, Navigate, useNavigate } from "react-router-dom";
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
import PWAHandler from "@/components/PWAHandler";
import { getQueryClient } from "@/lib/query-client";
import NichePage from "./pages/NichePage";
import Nichos from "./pages/Nichos";
import SobreNos from "./pages/SobreNos";
import CriacaoConteudo from "./pages/CriacaoConteudo";

// Importações críticas em memória (carregados no bundle principal)
// Nenhuma página pesada deve estar aqui agora

// Divisões Assíncronas (Lazy Loaded Chunks)
const Site = React.lazy(() => import("./pages/Site"));
const Index = React.lazy(() => import("./pages/Index"));
const ClientsList = React.lazy(() => import("./pages/admin/clients/ClientsList"));
const ClientDetailsPage = React.lazy(() => import("./pages/admin/clients/ClientDetailsPage"));
const ProjectsDashboard = React.lazy(() => import("./pages/admin/projects/ProjectsDashboard"));
const ProjectsList = React.lazy(() => import("./pages/admin/projects/ProjectsList"));
const ProjectsKanban = React.lazy(() => import("./pages/admin/projects/ProjectsKanban"));
const ProjectDetailsPage = React.lazy(() => import("./pages/admin/projects/ProjectDetailsPage"));
const Pedidos = React.lazy(() => import("./pages/Pedidos"));
const Relatorios = React.lazy(() => import("./pages/Relatorios"));
const ExtrasDashboard = React.lazy(() => import("./pages/admin/extras/ExtrasDashboard"));
const ExtrasList = React.lazy(() => import("./pages/admin/extras/ExtrasList"));
const FinanceDashboard = React.lazy(() => import("./pages/admin/finance/FinanceDashboard"));
const InvoicesList = React.lazy(() => import("./pages/admin/finance/InvoicesList"));
const CustosSistema = React.lazy(() => import("./pages/CustosSistema"));
const Suporte = React.lazy(() => import("./pages/Suporte"));
const Usuarios = React.lazy(() => import("./pages/Usuarios"));
const LeadsDashboard = React.lazy(() => import("./pages/admin/leads/LeadsDashboard"));
const LeadsList = React.lazy(() => import("./pages/admin/leads/LeadsList"));
const LeadDetailsPage = React.lazy(() => import("./pages/admin/leads/LeadDetailsPage"));
const Configuracoes = React.lazy(() => import("./pages/Configuracoes"));
const BriefingsDashboard = React.lazy(() => import("./pages/admin/briefings/BriefingsDashboard"));
const InProgressList = React.lazy(() => import("./pages/admin/briefings/InProgressList"));
const BriefingEditorPage = React.lazy(() => import("./pages/admin/briefings/BriefingEditorPage"));
const SentBriefingsList = React.lazy(() => import("./pages/admin/briefings/SentBriefingsList"));
const SentBriefingDetailPage = React.lazy(() => import("./pages/admin/briefings/SentBriefingDetailPage"));
const BriefingLibraryPage = React.lazy(() => import("./pages/admin/briefings/BriefingLibraryPage"));
const AdminRevenda = React.lazy(() => import("./pages/admin/AdminRevenda"));
const Cadastro = React.lazy(() => import("./pages/Cadastro"));
const Funcionalidades = React.lazy(() => import("./pages/Funcionalidades"));
const LandingPage = React.lazy(() => import("./pages/LandingPage"));
const ClienteLogin = React.lazy(() => import("./pages/cliente/ClienteLogin"));
const ClienteDashboard = React.lazy(() => import("./pages/cliente/ClienteDashboard"));
const ClienteProjetos = React.lazy(() => import("./pages/cliente/ClienteProjetos"));
const ClienteExtras = React.lazy(() => import("./pages/cliente/ClienteExtras"));
const ClienteDados = React.lazy(() => import("./pages/cliente/ClienteDados"));
const ClienteFaturas = React.lazy(() => import("./pages/cliente/ClienteFaturas"));
const ClienteSuporte = React.lazy(() => import("./pages/cliente/ClienteSuporte"));
const ClienteConfiguracoes = React.lazy(() => import("./pages/cliente/ClienteConfiguracoes"));
const ClienteArquivos = React.lazy(() => import("./pages/cliente/ClienteArquivos"));
const ClienteReferral = React.lazy(() => import("./pages/cliente/ClienteReferral"));
const ClienteResetPassword = React.lazy(() => import("./pages/cliente/ClienteResetPassword"));
const ResellerLayout = React.lazy(() => import("@/components/ResellerLayout"));
const ResellerDashboard = React.lazy(() => import("./pages/reseller/ResellerDashboard"));
const ResellerIndicacoes = React.lazy(() => import("./pages/reseller/ResellerIndicacoes"));
const ResellerFinanceiro = React.lazy(() => import("./pages/reseller/ResellerFinanceiro"));
const ResellerMateriais = React.lazy(() => import("./pages/reseller/ResellerMateriais"));
const NotFound = React.lazy(() => import("@/pages/NotFound"));
const AdminMenu = React.lazy(() => import("@/pages/AdminMenu"));
const AdminConfig = React.lazy(() => import("@/pages/admin/AdminConfig"));
const AdminRecurrentExtras = React.lazy(() => import("@/pages/AdminRecurrentExtras"));
const ExtrasAtivos = React.lazy(() => import("@/pages/ExtrasAtivos"));
const AdminResetPassword = React.lazy(() => import("./pages/AdminResetPassword"));

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
            <Route index element={<Index />} />
            <Route path="clientes" element={<ClientsList />} />
            <Route path="clientes/:id" element={<ClientDetailsPage />} />
            <Route path="leads" element={<LeadsDashboard />} />
            <Route path="leads/lista" element={<LeadsList />} />
            <Route path="leads/:id" element={<LeadDetailsPage />} />
            <Route path="projetos" element={<ProjectsDashboard />} />
            <Route path="projetos/lista" element={<ProjectsList />} />
            <Route path="projetos/kanban" element={<ProjectsKanban />} />
            <Route path="projetos/:id" element={<ProjectDetailsPage />} />
            <Route path="pedidos" element={<Pedidos />} />
            <Route path="extras" element={<ExtrasDashboard />} />
            <Route path="extras/lista" element={<ExtrasList />} />
            <Route path="extras-ativos" element={<ExtrasAtivos />} />
            <Route path="relatorios" element={<Relatorios />} />
            <Route path="financeiro" element={<FinanceDashboard />} />
            <Route path="financeiro/lista" element={<InvoicesList />} />
            <Route path="custos-sistema" element={<CustosSistema />} />
            <Route path="suporte" element={<Suporte />} />
            <Route path="usuarios" element={<Usuarios />} />
            <Route path="configuracoes" element={<Configuracoes />} />
            <Route path="revenda" element={<AdminRevenda />} />
            <Route path="contratos" element={<Navigate to="/admin" replace />} />
            <Route path="contratos/novo" element={<Navigate to="/admin" replace />} />
            <Route path="contratos/modelos" element={<Navigate to="/admin" replace />} />
            <Route path="briefings" element={<BriefingsDashboard />} />
            <Route path="briefings/em-andamento" element={<InProgressList />} />
            <Route path="briefings/em-andamento/novo" element={<BriefingEditorPage />} />
            <Route path="briefings/em-andamento/:id" element={<BriefingEditorPage />} />
            <Route path="briefings/enviados" element={<SentBriefingsList />} />
            <Route path="briefings/enviados/:id" element={<SentBriefingDetailPage />} />
            <Route path="briefings/biblioteca" element={<BriefingLibraryPage />} />
            <Route path="menu" element={<AdminMenu />} />
            <Route path="configuracoes-legado" element={<AdminConfig />} />
            <Route path="recurrent-billing" element={<Navigate to="/admin/recurrent-extras" replace />} />
            <Route path="recurrent-history" element={<Navigate to="/admin/recurrent-extras" replace />} />
            <Route path="recurrent-extras" element={<AdminRecurrentExtras />} />
            <Route path="*" element={<React.Suspense fallback={<SplashScreen />}><NotFound /></React.Suspense>} />
          </Routes>
        </React.Suspense>
      </AdminLayout>
    </ThemeProvider>
  );
}


const DesktopNavigationHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (window.electron && window.electron.receive) {
      window.electron.receive("navigate-to", (url: string) => {
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
            <PWAHandler />
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
              <Route path="/nichos" element={<Nichos />} />
              <Route path="/cadastro" element={<Cadastro />} />
              <Route path="/sobre" element={<SobreNos />} />
              <Route path="/criacao-conteudo" element={<CriacaoConteudo />} />
          <Route path="/funcionalidades" element={<Funcionalidades />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/cliente" element={<Navigate to="/cliente/login" replace />} />
          <Route path="/cliente/login" element={<ClienteLogin />} />
          <Route path="/cliente/reset-password" element={<ClienteResetPassword />} />

              {/* Client Portal */}
              <Route path="/cliente/*" element={
                <ClienteLayout>
                  <Routes>
                    <Route path="dashboard" element={<ClienteDashboard />} />
                    <Route path="pedidos" element={<ClientePedidosFome />} />
                    <Route path="projetos" element={<ClienteProjetos />} />
                    <Route path="extras" element={<ClienteExtras />} />
                    <Route path="contratos" element={<Navigate to="/cliente/dashboard" replace />} />
                    <Route path="dados" element={<ClienteDados />} />
                    <Route path="faturas" element={<ClienteFaturas />} />
                    <Route path="suporte" element={<ClienteSuporte />} />
                    <Route path="configuracoes" element={<ClienteConfiguracoes />} />
                    <Route path="indique" element={<ClienteReferral />} />
                    <Route path="arquivos" element={<ClienteArquivos />} />
                  </Routes>
                </ClienteLayout>
              } />

              {/* Admin Login */}
              <Route path="/login" element={<Navigate to="/admin/login" replace />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/reset-password" element={<AdminResetPassword />} />

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



