import { Building2, Palette, Shield, Link as LinkIcon, Bell, BellRing, Send, Users, MousePointerClick, Zap, Eye, EyeOff, X } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

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

export function PermissionsTable({ data, onSave }: any) {
  const header = ["Módulo", "Admin", "Editor", "Visualizador"];
  const roles = ["admin", "editor", "visualizador"];

  return (
    <Card className="glass-card border-[0.5px]">
      <CardHeader>
        <CardTitle className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" /> Matriz de Segurança
        </CardTitle>
        <CardDescription className="text-[10px] uppercase font-bold text-white/20">Controle de acesso granular por nível de arquitetura</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-white/5">
              {header.map((h) => (
                <TableHead key={h} className="text-[10px] uppercase font-black text-white/40">{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((p: any) => (
              <TableRow key={p.modulo} className="border-white/5 hover:bg-white/[0.01]">
                <TableCell className="text-sm text-white font-medium">{p.modulo}</TableCell>
                {roles.map((role) => (
                  <TableCell key={role}>
                    <Checkbox defaultChecked={p[role]} className="border-white/20 data-[state=checked]:gradient-primary data-[state=checked]:border-0" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Button className="gradient-primary border-0 text-white mt-8 h-10 px-8 rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20" onClick={onSave}>
          Sincronizar Permissões
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
                  className="glass-input border-white/5 text-white text-sm h-10 w-full pr-10"
                  placeholder={integ.placeholder}
                  value={values[integ.key] || ""}
                  onChange={e => setValues((prev: any) => ({ ...prev, [integ.key]: e.target.value }))}
                />
                {integ.type === "password" && (
                  <button
                    type="button"
                    onClick={() => toggleVisibility(integ.key)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  >
                    {showValues[integ.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                )}
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



