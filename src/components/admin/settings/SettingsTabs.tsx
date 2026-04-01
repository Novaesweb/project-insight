import { Building2, Palette, Shield, Link as LinkIcon, Bell, BellRing, Send, Users, MousePointerClick, Zap, Eye, EyeOff, X, History, KeyRound, RefreshCw, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ADMIN_PERMISSION_MODULES,
  ADMIN_PERMISSION_ROLES,
  type AdminPermissionsConfig,
  type AdminRole,
} from "@/lib/admin-permissions";

export function CompanyForm({ empresa, setEmpresa, onSave, loading }: any) {
  return (
    <Card className="glass-card border-[0.5px]">
      <CardHeader>
        <CardTitle className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
          <Building2 className="w-4 h-4 text-primary" /> Identidade Corporativa
        </CardTitle>
        <CardDescription className="text-[10px] uppercase font-bold text-white/20">Informações estruturais do seu ecossistema</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            { key: "nome", label: "Razão Social / Nome Fantasia" },
            { key: "cnpj", label: "CNPJ / Identificador Fiscal" },
            { key: "email", label: "E-mail de Suporte" },
            { key: "telefone", label: "WhatsApp de Contato" },
            { key: "endereco", label: "Sede Operacional" },
            { key: "logo", label: "URL do Logotipo (Premium)" },
          ].map((f) => (
            <div key={f.key} className="space-y-1.5">
              <Label className="text-[10px] uppercase font-bold text-white/40 tracking-wider font-mono">{f.label}</Label>
              <Input
                value={empresa[f.key] || ""}
                onChange={e => setEmpresa({ ...empresa, [f.key]: e.target.value })}
                className="glass-input border-white/5 text-white text-sm h-10 focus:border-primary/50"
              />
            </div>
          ))}
        </div>
        <Button className="gradient-primary border-0 text-white mt-8 h-10 px-8 rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20" onClick={onSave} disabled={loading}>
          {loading ? "Sincronizando..." : "Gravar Alterações"}
        </Button>
      </CardContent>
    </Card>
  );
}

export function AppearanceSettings({ values, onSave, setValues }: any) {
  const colors = ["#e8334a", "#c2185b", "#7b1fa2", "#1976d2", "#388e3c", "#f59e0b"];
  
  return (
    <Card className="glass-card border-[0.5px]">
      <CardHeader>
        <CardTitle className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
          <Palette className="w-4 h-4 text-primary" /> Estética do Ecossistema
        </CardTitle>
        <CardDescription className="text-[10px] uppercase font-bold text-white/20">Cromatismo e identidade visual do painel</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-4">
          <Label className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Accent Color (Marca Registrada)</Label>
          <div className="flex flex-wrap gap-3">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => onSave("primary_color", color)}
                className={cn(
                  "w-12 h-12 rounded-2xl border-2 transition-all hover:scale-110 shadow-xl",
                  values.primary_color === color ? "border-white scale-105" : "border-transparent opacity-60"
                )}
                style={{ background: color }}
              />
            ))}
            <div className="flex items-center gap-3 ml-2">
              <Input
                type="color"
                className="w-12 h-12 p-1.5 bg-white/5 border-white/10 rounded-2xl cursor-pointer"
                value={values.primary_color || "#e8334a"}
                onChange={e => setValues(prev => ({ ...prev, primary_color: e.target.value }))}
                onBlur={e => onSave("primary_color", e.target.value)}
              />
              <span className="text-[10px] font-mono text-white/40 font-black">{values.primary_color || "#e8334a"}</span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-white uppercase tracking-tighter">Motor Gráfico</p>
            <p className="text-[10px] text-white/30 font-medium italic">O sistema detecta automaticamente a preferência do seu dispositivo.</p>
          </div>
          <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 uppercase text-[9px] font-black tracking-widest px-3 py-1">Arquitetura Dark Ativa</Badge>
        </div>
      </CardContent>
    </Card>
  );
}

interface PermissionsTableProps {
  permissions: AdminPermissionsConfig;
  onChange: (nextPermissions: AdminPermissionsConfig) => void;
  onSave: () => void;
  saving?: boolean;
}

export function PermissionsTable({ permissions, onChange, onSave, saving }: PermissionsTableProps) {
  const header = ["Módulo", "Admin", "Editor", "Visualizador"];

  const roleSummary = useMemo(
    () =>
      ADMIN_PERMISSION_ROLES.map((role) => ({
        role,
        total: ADMIN_PERMISSION_MODULES.filter((module) => permissions[module.key][role]).length,
      })),
    [permissions]
  );

  const handleToggle = (moduleKey: keyof AdminPermissionsConfig, role: AdminRole, checked: boolean) => {
    onChange({
      ...permissions,
      [moduleKey]: {
        ...permissions[moduleKey],
        [role]: checked,
      },
    });
  };

  return (
    <Card className="glass-card border-[0.5px]">
      <CardHeader>
        <CardTitle className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" /> Matriz de Segurança
        </CardTitle>
        <CardDescription className="text-[10px] uppercase font-bold text-white/20">Controle de acesso granular por nível de arquitetura</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          {roleSummary.map(({ role, total }) => (
            <div key={role} className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
              <p className="text-[10px] uppercase font-black tracking-[0.22em] text-white/35">{role}</p>
              <p className="text-2xl font-black text-white mt-2">{total}</p>
              <p className="text-[11px] text-white/45 mt-1">módulos liberados para esse perfil.</p>
            </div>
          ))}
        </div>

        <Table>
          <TableHeader>
            <TableRow className="border-white/5">
              {header.map((h) => (
                <TableHead key={h} className="text-[10px] uppercase font-black text-white/40">{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {ADMIN_PERMISSION_MODULES.map((module) => (
              <TableRow key={module.key} className="border-white/5 hover:bg-white/[0.01] align-top">
                <TableCell className="py-4">
                  <p className="text-sm text-white font-medium">{module.label}</p>
                  <p className="text-[11px] text-white/35 mt-1 leading-relaxed">{module.description}</p>
                </TableCell>
                {ADMIN_PERMISSION_ROLES.map((role) => (
                  <TableCell key={role}>
                    <Checkbox
                      checked={permissions[module.key][role]}
                      onCheckedChange={(checked) => handleToggle(module.key, role, !!checked)}
                      className="border-white/20 data-[state=checked]:gradient-primary data-[state=checked]:border-0"
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Button
          className="gradient-primary border-0 text-white mt-8 h-10 px-8 rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20"
          onClick={onSave}
          disabled={saving}
        >
          {saving ? "Sincronizando..." : "Sincronizar Permissões"}
        </Button>
      </CardContent>
    </Card>
  );
}

export function IntegrationsForm({ items, values, setValues, onSave, saving }: any) {
  const [showValues, setShowValues] = useState<Record<string, boolean>>({});

  const toggleVisibility = (key: string) => {
    setShowValues(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-4">
      {items.map((integ: any) => (
        <Card key={integ.key} className="glass-card border-[0.5px] transition-all hover:bg-white/[0.02]">
          <CardContent className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-xl border border-white/5 shadow-inner">
                {integ.icon}
              </div>
              <div>
                <p className="text-xs font-black text-white uppercase tracking-tighter">{integ.nome}</p>
                <p className="text-[10px] text-white/30 font-medium leading-relaxed">{integ.descricao}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type={integ.type === "password" && !showValues[integ.key] ? "password" : "text"}
                  className={cn(
                    "glass-input border-white/5 text-white text-sm h-10 w-full",
                    integ.type === "password" ? "pr-16" : "pr-10"
                  )}
                  placeholder={integ.placeholder}
                  value={values[integ.key] || ""}
                  onChange={e => setValues((prev: any) => ({ ...prev, [integ.key]: e.target.value }))}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {values[integ.key] && (
                    <button
                      type="button"
                      onClick={() => {
                        setValues((prev: any) => ({ ...prev, [integ.key]: "" }));
                        onSave(integ.key, "");
                      }}
                      className="text-white/20 hover:text-red-400 transition-colors"
                      title="Limpar campo"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {integ.type === "password" && (
                    <button
                      type="button"
                      onClick={() => toggleVisibility(integ.key)}
                      className="text-white/30 hover:text-white/60 transition-colors"
                    >
                      {showValues[integ.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>
              <Button
                size="sm"
                className="gradient-primary border-0 text-white h-10 px-6 rounded-xl font-bold uppercase text-[9px] tracking-widest"
                onClick={() => onSave(integ.key, values[integ.key])}
                disabled={saving === integ.key}
              >
                {saving === integ.key ? "Gravando..." : "Salvar"}
              </Button>
            </div>
            {values[integ.key] && (
              <div className="mt-3 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[9px] uppercase font-black text-emerald-400/60 tracking-widest font-mono">Status: Operacional</span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function NotificationSettings({ 
  pushSupported, pushEnabled, pushLoading, testLoading, subCount, 
  onToggle, onTest 
}: any) {
  return (
    <Card className="glass-card border-[0.5px]">
      <CardHeader>
        <CardTitle className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
          <BellRing className="w-4 h-4 text-primary" /> Notificações Reais (VAPID)
        </CardTitle>
        <CardDescription className="text-[10px] uppercase font-bold text-white/20">
          Arquitetura de alerta instantâneo em tempo real
          {subCount > 0 && <span className="ml-2 text-primary font-black">• {subCount} Terminais Registrados</span>}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!pushSupported ? (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <p className="text-xs font-bold text-amber-500/80 leading-relaxed italic">Este terminal (navegador) não possui os protocolos necessários para a tecnologia Push Architect.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between p-4 rounded-[1.5rem] bg-white/[0.02] border border-white/5">
              <div>
                <p className="text-sm font-black text-white uppercase tracking-tighter">Frequência de Escuta</p>
                <p className="text-[10px] text-white/30 font-medium">
                  {pushEnabled ? "Status: Transmitindo Alertas" : "Status: Dormência Digitial"}
                </p>
              </div>
              <Switch checked={pushEnabled} onCheckedChange={onToggle} disabled={pushLoading} className="data-[state=checked]:bg-primary" />
            </div>
            <div className="pt-2">
              <Button
                className="bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest h-10 px-6 rounded-xl hover:bg-white/10 transition-colors"
                onClick={onTest}
                disabled={testLoading || !pushEnabled}
              >
                <Send className="w-3.5 h-3.5 mr-2" />
                {testLoading ? "Transmitindo Canal..." : "Disparar Pulso de Teste"}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

type AuditItem = {
  id: string;
  title: string;
  body: string;
  created_at: string;
  read: boolean;
  url: string | null;
};

const auditCategories = [
  { value: "todos", label: "Tudo" },
  { value: "login", label: "Login" },
  { value: "usuarios", label: "Usuários" },
  { value: "permissoes", label: "Permissões" },
];

function getAuditCategory(entry: AuditItem) {
  const content = `${entry.title} ${entry.body}`.toLowerCase();

  if (content.includes("login")) return "login";
  if (content.includes("permiss")) return "permissoes";
  return "usuarios";
}

function getAuditIcon(entry: AuditItem) {
  const category = getAuditCategory(entry);

  if (category === "login") return <KeyRound className="w-4 h-4 text-emerald-400" />;
  if (category === "permissoes") return <Shield className="w-4 h-4 text-primary" />;
  return <Users className="w-4 h-4 text-amber-400" />;
}

export function AuditTrailPanel() {
  const [items, setItems] = useState<AuditItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("todos");

  const loadItems = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    const { data } = await supabase
      .from("notifications")
      .select("id, title, body, created_at, read, url")
      .eq("user_type", "admin_audit")
      .order("created_at", { ascending: false })
      .limit(40);

    setItems((data as AuditItem[]) || []);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    void loadItems();
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory = category === "todos" || getAuditCategory(item) === category;
      const haystack = `${item.title} ${item.body}`.toLowerCase();
      const matchesSearch = !search.trim() || haystack.includes(search.trim().toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [category, items, search]);

  return (
    <Card className="glass-card border-[0.5px]">
      <CardHeader>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
              <History className="w-4 h-4 text-primary" /> Auditoria do Painel
            </CardTitle>
            <CardDescription className="text-[10px] uppercase font-bold text-white/20">
              Linha do tempo de permissões, acessos e ações sensíveis da equipe
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            className="h-10 rounded-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/5"
            onClick={() => loadItems(true)}
            disabled={refreshing}
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", refreshing && "animate-spin")} />
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por ação, usuário ou detalhe"
              className="glass-input border-white/5 text-white text-sm h-10 pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {auditCategories.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setCategory(option.value)}
                className={cn(
                  "px-3 py-2 rounded-xl text-[10px] uppercase font-black tracking-[0.18em] border transition-colors",
                  category === option.value
                    ? "border-primary/30 text-primary bg-primary/10"
                    : "border-white/10 text-white/35 bg-white/[0.02] hover:text-white/70"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-10 text-center text-white/40 text-xs">Carregando trilha de auditoria...</div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center">
            <p className="text-sm font-semibold text-white">Nenhum evento encontrado</p>
            <p className="text-xs text-white/35 mt-2">
              Quando alguém atualizar permissões, acessar o painel ou mexer em usuários, o histórico aparece aqui.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <div key={item.id} className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl border border-white/5 bg-white/[0.03] flex items-center justify-center shrink-0">
                    {getAuditIcon(item)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-1 lg:flex-row lg:items-center lg:justify-between">
                      <p className="text-sm font-bold text-white">{item.title}</p>
                      <span className="text-[10px] uppercase tracking-[0.18em] text-white/30">
                        {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: ptBR })}
                      </span>
                    </div>
                    <p className="text-xs text-white/45 mt-2 leading-relaxed">{item.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}



