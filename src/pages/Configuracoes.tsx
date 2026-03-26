import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Palette, Shield, Link as LinkIcon, Bell, MousePointerClick, Users } from "lucide-react";

// Saneamento Architect v9.0 Imports
import { useSettings } from "@/hooks/useSettings";
import { 
  CompanyForm, AppearanceSettings, PermissionsTable, 
  IntegrationsForm, NotificationSettings 
} from "@/components/admin/settings/SettingsTabs";
import { UserManagement } from "@/components/admin/settings/UserManagement";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const permissoesMock = [
  { modulo: "Dashboard", admin: true, editor: true, visualizador: true },
  { modulo: "Clientes", admin: true, editor: true, visualizador: true },
  { modulo: "Projetos", admin: true, editor: true, visualizador: false },
  { modulo: "Pedidos", admin: true, editor: true, visualizador: false },
  { modulo: "Financeiro", admin: true, editor: false, visualizador: false },
  { modulo: "Relatórios", admin: true, editor: true, visualizador: true },
  { modulo: "Suporte", admin: true, editor: true, visualizador: false },
  { modulo: "Usuários", admin: true, editor: false, visualizador: false },
  { modulo: "Configurações", admin: true, editor: false, visualizador: false },
];

export default function Configuracoes() {
  const { 
    empresa, setEmpresa, integValues, setIntegValues, loading, integSaving,
    pushSupported, pushEnabled, pushLoading, testLoading, subCount,
    handleSaveEmpresa, handleSaveInteg, handleTogglePush, handleTestPush 
  } = useSettings();

  const integrationItems = [
    { key: "whatsapp_webhook", nome: "WhatsApp / n8n Webhook", descricao: "URL n8n para automação de mensagens.", placeholder: "https://...", icon: "💬" },
    { key: "pix_key", nome: "Chave Pix", descricao: "Exibida em faturas no portal.", placeholder: "Sua chave...", icon: "💰" },
    { key: "google_analytics_id", nome: "GA4 ID", descricao: "Rastreamento de métricas (ex: G-XXX).", placeholder: "G-XXXXXXXXXX", icon: "📊" },
  ];

  return (
    <motion.div className="space-y-6 pb-12" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }}>
      <motion.div variants={fadeUp}>
        <Tabs defaultValue="empresa" className="space-y-6">
          <TabsList className="glass-card border-white/5 bg-transparent p-1 gap-1 flex-wrap h-auto shadow-2xl">
            {[
              { value: "empresa", label: "Empresa", icon: Building2 },
              { value: "aparencia", label: "Aparência", icon: Palette },
              { value: "usuarios", label: "Usuários", icon: Users },
              { value: "permissoes", label: "Permissões", icon: Shield },
              { value: "integracoes", label: "Integrações", icon: LinkIcon },
              { value: "notificacoes", label: "Notificações", icon: Bell },
            ].map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="data-[state=active]:gradient-primary data-[state=active]:text-white text-white/40 text-[10px] font-black uppercase tracking-widest gap-2 flex-1 min-w-[120px] h-10 rounded-xl">
                <tab.icon className="w-3.5 h-3.5" /> {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="empresa" className="mt-6">
            <CompanyForm empresa={empresa} setEmpresa={setEmpresa} onSave={handleSaveEmpresa} loading={loading} />
          </TabsContent>

          <TabsContent value="aparencia" className="mt-6">
            <AppearanceSettings values={integValues} setValues={setIntegValues} onSave={handleSaveInteg} />
          </TabsContent>

          <TabsContent value="usuarios" className="mt-6 shadow-2xl">
            <UserManagement />
          </TabsContent>

          <TabsContent value="permissoes" className="mt-6">
            <PermissionsTable data={permissoesMock} onSave={() => {}} />
          </TabsContent>

          <TabsContent value="integracoes" className="mt-6">
            <IntegrationsForm items={integrationItems} values={integValues} setValues={setIntegValues} onSave={handleSaveInteg} saving={integSaving} />
          </TabsContent>

          <TabsContent value="notificacoes" className="mt-6">
            <NotificationSettings pushSupported={pushSupported} pushEnabled={pushEnabled} pushLoading={pushLoading} testLoading={testLoading} subCount={subCount} onToggle={handleTogglePush} onTest={handleTestPush} />
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}


