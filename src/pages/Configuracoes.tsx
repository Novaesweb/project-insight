import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building2, Palette, Shield, Link as LinkIcon, Bell, BellRing, Send } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { subscribeToPush, unsubscribeFromPush, isSubscribed, sendTestNotification, isPushSupported } from "@/lib/push-notifications";
import { supabase } from "@/integrations/supabase/client";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const defaultEmpresa = {
  nome: "NovaesWeb",
  cnpj: "",
  email: "contato@novaesweb.com.br",
  telefone: "",
  endereco: "",
  logo: "",
};

const permissoes = [
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

const integracoes = [
  { nome: "WhatsApp Business", descricao: "Envie notificações via WhatsApp", ativo: true },
  { nome: "Stripe", descricao: "Processe pagamentos online", ativo: false },
  { nome: "Google Analytics", descricao: "Acompanhe métricas do site", ativo: true },
];

export default function Configuracoes() {
  const { toast } = useToast();
  const [empresa, setEmpresa] = useState(defaultEmpresa);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [subCount, setSubCount] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem("config_empresa");
    if (saved) setEmpresa(JSON.parse(saved));

    isPushSupported().then(setPushSupported);
    isSubscribed().then(setPushEnabled);

    // Count subscriptions
    supabase.from("push_subscriptions").select("id", { count: "exact", head: true })
      .then(({ count }) => setSubCount(count || 0));
  }, []);

  const handleSaveEmpresa = () => {
    localStorage.setItem("config_empresa", JSON.stringify(empresa));
    toast({ title: "Dados salvos!", description: "Informações da empresa foram atualizadas." });
  };

  const handleTogglePush = async () => {
    setPushLoading(true);
    try {
      if (pushEnabled) {
        await unsubscribeFromPush();
        setPushEnabled(false);
        toast({ title: "Notificações desativadas" });
      } else {
        const session = await supabase.auth.getSession();
        const userId = session.data.session?.user?.id || "admin";
        const success = await subscribeToPush("admin", userId);
        if (success) {
          setPushEnabled(true);
          toast({ title: "Notificações ativadas!", description: "Você receberá alertas mesmo com o site fechado." });
        } else {
          toast({ title: "Não foi possível ativar", description: "Verifique se permitiu notificações no navegador.", variant: "destructive" });
        }
      }
    } catch {
      toast({ title: "Erro ao configurar notificações", variant: "destructive" });
    }
    setPushLoading(false);
  };

  const handleTestPush = async () => {
    setTestLoading(true);
    const result = await sendTestNotification();

    if (result.ok) {
      toast({
        title: "Notificação de teste enviada!",
        description: `Entregue para ${result.sent} de ${result.total} dispositivo(s).`,
      });
    } else {
      const fallback = "Ative novamente o push neste navegador e teste de novo.";
      const reason = result.errors?.[0] || result.message || fallback;
      toast({
        title: "Falha no envio de teste",
        description: reason,
        variant: "destructive",
      });
    }

    setTestLoading(false);
  };

  return (
    <motion.div className="space-y-6" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }}>
      <motion.div variants={fadeUp}>
        <Tabs defaultValue="empresa" className="space-y-6">
          <TabsList className="glass-card border-[0.5px] bg-transparent p-1 gap-1">
            {[
              { value: "empresa", label: "Empresa", icon: Building2 },
              { value: "aparencia", label: "Aparência", icon: Palette },
              { value: "permissoes", label: "Permissões", icon: Shield },
              { value: "integracoes", label: "Integrações", icon: LinkIcon },
              { value: "notificacoes", label: "Notificações", icon: Bell },
            ].map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="data-[state=active]:gradient-primary data-[state=active]:text-white text-[hsl(var(--muted-foreground))] text-xs gap-1.5">
                <tab.icon className="w-3.5 h-3.5" /> {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="empresa">
            <Card className="glass-card border-[0.5px]">
              <CardHeader>
                <CardTitle className="text-sm text-white">Dados da Empresa</CardTitle>
                <CardDescription>Informações gerais do seu negócio</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: "nome", label: "Nome da Empresa" },
                    { key: "cnpj", label: "CNPJ" },
                    { key: "email", label: "E-mail" },
                    { key: "telefone", label: "Telefone" },
                    { key: "endereco", label: "Endereço" },
                    { key: "logo", label: "URL do Logo" },
                  ].map((f) => (
                    <div key={f.key} className="space-y-1.5">
                      <Label className="text-xs text-[hsl(var(--muted-foreground))]">{f.label}</Label>
                      <Input
                        value={(empresa as any)[f.key]}
                        onChange={e => setEmpresa({ ...empresa, [f.key]: e.target.value })}
                        className="glass-input border-[rgba(255,255,255,0.1)] text-white text-sm h-9"
                      />
                    </div>
                  ))}
                </div>
                <Button className="gradient-primary border-0 text-white mt-6 rounded-lg" onClick={handleSaveEmpresa}>Salvar</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="aparencia">
            <Card className="glass-card border-[0.5px]">
              <CardHeader>
                <CardTitle className="text-sm text-white">Aparência</CardTitle>
                <CardDescription>Personalize o visual do painel</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Tema Escuro</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">Ativar tema escuro no painel</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-[hsl(var(--muted-foreground))]">Cor Primária</Label>
                  <div className="flex gap-3">
                    {["#e8334a", "#c2185b", "#7b1fa2", "#1976d2", "#388e3c"].map((color) => (
                      <button key={color} className="w-8 h-8 rounded-lg border-2 border-transparent hover:border-white/50 transition-all" style={{ background: color }} />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="permissoes">
            <Card className="glass-card border-[0.5px]">
              <CardHeader>
                <CardTitle className="text-sm text-white">Permissões por Perfil</CardTitle>
                <CardDescription>Gerencie o acesso de cada nível</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-[rgba(255,255,255,0.06)]">
                      {["Módulo", "Admin", "Editor", "Visualizador"].map((h) => (
                        <TableHead key={h} className="text-[11px] text-[hsl(var(--muted-foreground))]">{h}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {permissoes.map((p) => (
                      <TableRow key={p.modulo} className="border-[rgba(255,255,255,0.04)]">
                        <TableCell className="text-sm text-white">{p.modulo}</TableCell>
                        {["admin", "editor", "visualizador"].map((role) => (
                          <TableCell key={role}>
                            <Checkbox defaultChecked={(p as any)[role]} className="border-[rgba(255,255,255,0.2)] data-[state=checked]:gradient-primary data-[state=checked]:border-0" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Button className="gradient-primary border-0 text-white mt-6 rounded-lg" onClick={() => toast({ title: "Permissões salvas!" })}>Salvar Permissões</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integracoes">
            <div className="space-y-4">
              {integracoes.map((integ) => (
                <Card key={integ.nome} className="glass-card border-[0.5px]">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-white">{integ.nome}</p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{integ.descricao}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-semibold ${integ.ativo ? "text-emerald-400" : "text-[hsl(var(--muted-foreground))]"}`}>
                          {integ.ativo ? "Conectado" : "Desconectado"}
                        </span>
                        <Switch defaultChecked={integ.ativo} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="notificacoes">
            <div className="space-y-4">
              {/* Push Notification Control */}
              <Card className="glass-card border-[0.5px]">
                <CardHeader>
                  <CardTitle className="text-sm text-white flex items-center gap-2">
                    <BellRing className="w-4 h-4" /> Notificações Push (VAPID)
                  </CardTitle>
                  <CardDescription>
                    Receba notificações mesmo com o site fechado.
                    {subCount > 0 && <span className="ml-2 text-emerald-400">• {subCount} dispositivo(s) registrado(s)</span>}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!pushSupported ? (
                    <p className="text-sm text-yellow-400">Seu navegador não suporta notificações push.</p>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-white">Ativar notificações push</p>
                          <p className="text-xs text-[hsl(var(--muted-foreground))]">
                            {pushEnabled ? "Notificações ativas neste dispositivo" : "Clique para ativar neste dispositivo"}
                          </p>
                        </div>
                        <Switch checked={pushEnabled} onCheckedChange={handleTogglePush} disabled={pushLoading} />
                      </div>
                      <Button
                        className="gradient-primary border-0 text-white text-xs rounded-lg"
                        size="sm"
                        onClick={handleTestPush}
                        disabled={testLoading || !pushEnabled}
                      >
                        <Send className="w-3 h-3 mr-1" />
                        {testLoading ? "Enviando..." : "Enviar notificação de teste"}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
