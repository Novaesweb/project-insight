import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AdminLayout from "@/components/AdminLayout";
import ClienteLayout from "@/components/ClienteLayout";
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
import AgendarPublico from "./pages/AgendarPublico";
import Cadastro from "./pages/Cadastro";
import ClienteLogin from "./pages/cliente/ClienteLogin";
import ClienteDashboard from "./pages/cliente/ClienteDashboard";
import ClienteProjetos from "./pages/cliente/ClienteProjetos";
import ClienteExtras from "./pages/cliente/ClienteExtras";
import ClienteContratos from "./pages/cliente/ClienteContratos";
import ClienteFaturas from "./pages/cliente/ClienteFaturas";
import ClienteReunioes from "./pages/cliente/ClienteReunioes";
import ClienteSuporte from "./pages/cliente/ClienteSuporte";
import ClienteDados from "./pages/cliente/ClienteDados";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/agendar" element={<AgendarPublico />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/cliente" element={<ClienteLogin />} />

          {/* Client Portal */}
          <Route path="/cliente/*" element={
            <ClienteLayout>
              <Routes>
                <Route path="dashboard" element={<ClienteDashboard />} />
                <Route path="projetos" element={<ClienteProjetos />} />
                <Route path="extras" element={<ClienteExtras />} />
                <Route path="contratos" element={<ClienteContratos />} />
                <Route path="faturas" element={<ClienteFaturas />} />
                <Route path="reunioes" element={<ClienteReunioes />} />
                <Route path="suporte" element={<ClienteSuporte />} />
                <Route path="dados" element={<ClienteDados />} />
              </Routes>
            </ClienteLayout>
          } />

          {/* Admin */}
          <Route path="*" element={
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
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AdminLayout>
          } />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
