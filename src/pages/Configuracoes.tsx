import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building2, Palette, Shield, Link as LinkIcon, Bell, BellRing, Send, Users, MousePointerClick } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
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
  const [integSaving, setIntegSaving] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [integValues, setIntegValues] = useState({
    whatsapp_webhook: "",
    pix_key: "",
    google_analytics_id: "",
    primary_color: "#e8334a",
    urgency_active: "true",
    urgency_text: "Oferta Especial por Tempo Limitado",
    urgency_hours: "2",
    social_proof_active: "true",
  });

  useEffect(() => {
    isPushSupported().then(setPushSupported);
    isSubscribed().then(setPushEnabled);

    supabase.from("push_subscriptions").select("id", { count: "exact", head: true })
      .then(({ count }) => setSubCount(count || 0));

    // Carregar tudo do Supabase app_config
    const keys = [
      "nome", "cnpj", "email", "telefone", "endereco", "logo",
      "whatsapp_webhook", "pix_key", "google_analytics_id", "primary_color",
      "urgency_active", "urgency_text", "urgency_hours", "social_proof_active"
    ];
    supabase.from("app_config").select("key, value")
      .in("key", keys)
      .then(({ data }) => {
        if (data) {
          const newEmpresa = { ...empresa };
          const newIntegs = { ...integValues };
          data.forEach(row => {
            if ((newEmpresa as any)[row.key] !== undefined) (newEmpresa as any)[row.key] = row.value;
            if ((newIntegs as any)[row.key] !== undefined) (newIntegs as any)[row.key] = row.value;
          });
          setEmpresa(newEmpresa);
          setIntegValues(newIntegs);
        }
        setLoading(false);
      });
  }, []);

  const handleSaveEmpresa = async () => {
    setLoading(true);
    const updates = Object.entries(empresa).map(([key, value]) => ({ key, value }));
    const { error } = await supabase.from("app_config").upsert(updates, { onConflict: "key" });
    setLoading(false);
    if (error) { toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Dados salvos!", description: "Informações da empresa foram sincronizadas no banco de dados." });
  };

  const handleSaveInteg = async (key: string, value: string) => {
    setIntegSaving(key);
    await supabase.from("app_config").upsert({ key, value }, { onConflict: "key" });
    setIntegSaving(null);
    toast({ title: "Integração salva!" });
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
          toast({ title: "Notificações ativadas!", description: "Dispositivo registrado com sucesso para receber alertas." });
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

  const integracoes = [
    {
      key: "whatsapp_webhook",
      nome: "WhatsApp / n8n Webhook",
      descricao: "URL do webhook n8n para envio de mensagens automáticas via WhatsApp.",
      placeholder: "https://lucasalencar.app.n8n.cloud/webhook/...",
      icon: "💬",
    },
    {
      key: "pix_key",
      nome: "Chave Pix",
      descricao: "Chave Pix exibida para clientes na tela de faturas para facilitar o pagamento.",
      placeholder: "CPF, CNPJ, e-mail, celular ou chave aleatória",
      icon: "💰",
    },
    {
      key: "google_analytics_id",
      nome: "Google Analytics ID",
      descricao: "ID de medição do GA4 para rastreamento do site (ex: G-XXXXXXXXXX).",
      placeholder: "G-XXXXXXXXXX",
      icon: "📊",
    },
  ];

  return (
    <motion.div className="space-y-6" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }}>
      <motion.div variants={fadeUp}>
        <Tabs defaultValue="empresa" className="space-y-6">
          <TabsList className="glass-card border-[0.5px] bg-transparent p-1 gap-1 flex-wrap h-auto">
            {[
              { value: "empresa", label: "Empresa", icon: Building2 },
              { value: "aparencia", label: "Aparência", icon: Palette },
              { value: "usuarios", label: "Usuários", icon: Users },
              { value: "permissoes", label: "Permissões", icon: Shield },
              { value: "integracoes", label: "Integrações", icon: LinkIcon },
              { value: "gatilhos", label: "Gatilhos", icon: MousePointerClick },
              { value: "notificacoes", label: "Notificações", icon: Bell },
            ].map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="data-[state=active]:gradient-primary data-[state=active]:text-white text-[hsl(var(--muted-foreground))] text-xs gap-1.5 flex-1 min-w-[100px]">
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
                <CardTitle className="text-sm text-white">Aparência & Identidade</CardTitle>
                <CardDescription>Personalize o visual e as cores do seu painel</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-xs text-[hsl(var(--muted-foreground))]">Cor Primária do Sistema</Label>
                  <div className="flex flex-wrap gap-3">
                    {["#e8334a", "#c2185b", "#7b1fa2", "#1976d2", "#388e3c", "#f59e0b"].map((color) => (
                      <button
                        key={color}
                        onClick={() => handleSaveInteg("primary_color", color)}
                        className={cn(
                          "w-10 h-10 rounded-xl border-2 transition-all hover:scale-110",
                          integValues.primary_color === color ? "border-white shadow-lg shadow-white/20" : "border-transparent"
                        )}
                        style={{ background: color }}
                      />
                    ))}
                    <div className="flex items-center gap-2 ml-2">
                      <Input
                        type="color"
                        className="w-10 h-10 p-1 bg-white/5 border-white/10 rounded-xl cursor-pointer"
                        value={integValues.primary_color || "#e8334a"}
                        onChange={e => setIntegValues(prev => ({ ...prev, primary_color: e.target.value }))}
                        onBlur={e => handleSaveInteg("primary_color", e.target.value)}
                      />
                      <span className="text-[10px] text-white/40 font-monouppercase">{integValues.primary_color || "#e8334a"}</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-white/30 italic">Esta cor será aplicada a botões, links e elementos de destaque em todo o sistema.</p>
                </div>

                <div className="pt-6 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">Tema do Sistema</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">Ativar tema escuro/claro (Configuração do navegador)</p>
                    </div>
                    <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/5">Dark Mode Ativo</Badge>
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
                <Card key={integ.key} className="glass-card border-[0.5px]">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">{integ.icon}</span>
                      <div>
                        <p className="text-sm font-semibold text-white">{integ.nome}</p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{integ.descricao}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        className="glass-input border-[rgba(255,255,255,0.1)] text-white text-sm h-9 flex-1"
                        placeholder={integ.placeholder}
                        value={(integValues as any)[integ.key]}
                        onChange={e => setIntegValues(prev => ({ ...prev, [integ.key]: e.target.value }))}
                      />
                      <Button
                        size="sm"
                        className="gradient-primary border-0 text-white h-9 px-4 rounded-lg"
                        onClick={() => handleSaveInteg(integ.key, (integValues as any)[integ.key])}
                        disabled={integSaving === integ.key}
                      >
                        {integSaving === integ.key ? "Salvando..." : "Salvar"}
                      </Button>
                    </div>
                    {(integValues as any)[integ.key] && (
                      <p className="text-[10px] text-emerald-400 mt-2 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" /> Configurado
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="gatilhos">
            <div className="space-y-4">
              <Card className="glass-card border-[0.5px]">
                <CardHeader>
                  <CardTitle className="text-sm text-white">Banner de Urgência (Topo do Site)</CardTitle>
                  <CardDescription>Configure a barra de escassez com contagem regressiva</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between border-b border-white/5 pb-6">
                    <div>
                      <p className="text-sm font-medium text-white">Exibir Banner de Urgência</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">Ative ou desative o banner no topo do site público.</p>
                    </div>
                    <Switch
                      checked={integValues.urgency_active === "true"}
                      onCheckedChange={(c) => {
                        setIntegValues(prev => ({ ...prev, urgency_active: c ? "true" : "false" }));
                        handleSaveInteg("urgency_active", c ? "true" : "false");
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-[hsl(var(--muted-foreground))]">Texto Principal</Label>
                      <div className="flex gap-2">
                        <Input
                          value={integValues.urgency_text || ""}
                          onChange={(e) => setIntegValues(prev => ({ ...prev, urgency_text: e.target.value }))}
                          placeholder="Oferta Especial por Tempo Limitado"
                          className="glass-input h-9 text-sm text-white min-w-0"
                        />
                        <Button size="sm" onClick={() => handleSaveInteg("urgency_text", integValues.urgency_text)} className="gradient-primary h-9 whitespace-nowrap">Salvar</Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-[hsl(var(--muted-foreground))]">Duração Inicial (Horas)</Label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          value={integValues.urgency_hours || "2"}
                          onChange={(e) => setIntegValues(prev => ({ ...prev, urgency_hours: e.target.value }))}
                          className="glass-input h-9 text-sm text-white min-w-0"
                        />
                        <Button size="sm" onClick={() => handleSaveInteg("urgency_hours", integValues.urgency_hours)} className="gradient-primary h-9 whitespace-nowrap">Salvar</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-[0.5px]">
                <CardHeader>
                  <CardTitle className="text-sm text-white">Pop-ups de Prova Social</CardTitle>
                  <CardDescription>Notificações flutuantes simulando compras recentes no canto da tela</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">Ativar Pop-ups Rotativos</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">Começa a exibir compras estratégicas a cada 25 segundos.</p>
                    </div>
                    <Switch
                      checked={integValues.social_proof_active === "true"}
                      onCheckedChange={(c) => {
                        setIntegValues(prev => ({ ...prev, social_proof_active: c ? "true" : "false" }));
                        handleSaveInteg("social_proof_active", c ? "true" : "false");
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="notificacoes">
            <div className="space-y-4">
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

          <TabsContent value="usuarios">
            <Card className="glass-card border-[0.5px]">
              <CardHeader>
                <CardTitle className="text-sm text-white">Gestão de Usuários e Clientes</CardTitle>
                <CardDescription>Gerencie acessos, edite perfis e altere senhas</CardDescription>
              </CardHeader>
              <CardContent>
                <UserManagementList />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}

function UserManagementList() {
  const [users, setUsers] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [newPass, setNewPass] = useState("");
  const { toast } = useToast();

  const loadAll = async () => {
    setLoading(true);
    const [u, c] = await Promise.all([
      supabase.from("usuarios").select("*").order("nome"),
      supabase.from("clientes").select("*").order("nome")
    ]);
    setUsers(u.data || []);
    setClients(c.data || []);
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  const handleUpdate = async (type: 'usuarios' | 'clientes', id: string, data: any) => {
    const { error } = await supabase.from(type).update(data).eq("id", id);
    if (error) {
      toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Atualizado com sucesso!" });
      setEditingItem(null);
      setNewPass("");
      loadAll();
    }
  };

  if (loading) return <div className="py-10 text-center text-white/40 text-xs">Carregando usuários...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 px-1">Administradores e Equipe</h3>
        <Table>
          <TableHeader>
            <TableRow className="border-white/5">
              <TableHead className="text-[10px] uppercase">Nome</TableHead>
              <TableHead className="text-[10px] uppercase">E-mail</TableHead>
              <TableHead className="text-[10px] uppercase">Cargo</TableHead>
              <TableHead className="text-[10px] uppercase">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map(u => (
              <TableRow key={u.id} className="border-white/5">
                <TableCell className="text-sm text-white font-medium">{u.nome}</TableCell>
                <TableCell className="text-sm text-white/50">{u.email}</TableCell>
                <TableCell><Badge variant="outline" className="text-[9px] uppercase border-primary/20 text-primary">{u.cargo}</Badge></TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" className="text-xs text-white/40 hover:text-white" onClick={() => setEditingItem({ ...u, _type: 'usuarios' })}>Editar</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div>
        <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 px-1">Clientes (Portal)</h3>
        <Table>
          <TableHeader>
            <TableRow className="border-white/5">
              <TableHead className="text-[10px] uppercase">Cliente</TableHead>
              <TableHead className="text-[10px] uppercase">E-mail</TableHead>
              <TableHead className="text-[10px] uppercase">Senha</TableHead>
              <TableHead className="text-[10px] uppercase">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map(c => (
              <TableRow key={c.id} className="border-white/5">
                <TableCell className="text-sm text-white font-medium">{c.nome}</TableCell>
                <TableCell className="text-sm text-white/50">{c.email}</TableCell>
                <TableCell className="text-xs font-mono text-white/30">{c.senha || "—"}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" className="text-xs text-white/40 hover:text-white" onClick={() => setEditingItem({ ...c, _type: 'clientes' })}>Editar</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card border-white/10 w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Editar {editingItem._type === 'usuarios' ? 'Usuário' : 'Cliente'}</h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-white/40">Nome</Label>
                <Input value={editingItem.nome} onChange={e => setEditingItem({ ...editingItem, nome: e.target.value })} className="glass-input h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-white/40">E-mail</Label>
                <Input value={editingItem.email} onChange={e => setEditingItem({ ...editingItem, email: e.target.value })} className="glass-input h-9 text-sm" />
              </div>
              {editingItem._type === 'clientes' && (
                <div className="space-y-1.5">
                  <Label className="text-xs text-white/40">URL do Site</Label>
                  <Input value={editingItem.site_url || ""} onChange={e => setEditingItem({ ...editingItem, site_url: e.target.value })} placeholder="https://..." className="glass-input h-9 text-sm" />
                </div>
              )}
              <div className="space-y-1.5 pt-2 border-t border-white/5">
                <Label className="text-xs text-white/40">Trocar Senha</Label>
                <div className="flex gap-2">
                  <Input value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="Nova senha..." className="glass-input h-9 text-sm" />
                  <Button size="sm" className="gradient-primary h-9" onClick={() => handleUpdate(editingItem._type, editingItem.id, { ...editingItem, senha: newPass, _type: undefined })}>Salvar</Button>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button variant="ghost" className="text-white/40 hover:text-white" onClick={() => setEditingItem(null)}>Cancelar</Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
