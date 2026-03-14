import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building2, Palette, Shield, Link as LinkIcon, Bell, Check, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

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
                    { label: "Nome da Empresa", value: "NovaesWeb" },
                    { label: "CNPJ", value: "12.345.678/0001-90" },
                    { label: "E-mail", value: "contato@novaesweb.com.br" },
                    { label: "Telefone", value: "(51) 9 9999-9999" },
                    { label: "Endereço", value: "Alvorada, RS" },
                    { label: "Logo", value: "" },
                  ].map((f) => (
                    <div key={f.label} className="space-y-1.5">
                      <Label className="text-xs text-[hsl(var(--muted-foreground))]">{f.label}</Label>
                      <Input defaultValue={f.value} className="glass-input border-[rgba(255,255,255,0.1)] text-white text-sm h-9" />
                    </div>
                  ))}
                </div>
                <Button className="gradient-primary border-0 text-white mt-6 rounded-lg">Salvar</Button>
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
                <Button className="gradient-primary border-0 text-white mt-6 rounded-lg">Salvar Permissões</Button>
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
            <Card className="glass-card border-[0.5px]">
              <CardHeader>
                <CardTitle className="text-sm text-white">Preferências de Notificação</CardTitle>
                <CardDescription>Configure alertas por tipo de evento</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {[
                  { evento: "Novo pedido criado", email: true, push: true },
                  { evento: "Ticket de suporte aberto", email: true, push: true },
                  { evento: "Pagamento recebido", email: true, push: false },
                  { evento: "Pagamento em atraso", email: true, push: true },
                  { evento: "Projeto concluído", email: false, push: true },
                  { evento: "Novo cliente cadastrado", email: true, push: false },
                ].map((n) => (
                  <div key={n.evento} className="flex items-center justify-between">
                    <p className="text-sm text-white">{n.evento}</p>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[hsl(var(--muted-foreground))]">E-mail</span>
                        <Switch defaultChecked={n.email} />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[hsl(var(--muted-foreground))]">Push</span>
                        <Switch defaultChecked={n.push} />
                      </div>
                    </div>
                  </div>
                ))}
                <Button className="gradient-primary border-0 text-white mt-4 rounded-lg">Salvar Preferências</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
