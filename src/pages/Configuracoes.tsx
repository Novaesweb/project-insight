import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Building2, Palette, Shield, Link, Bell } from "lucide-react";

const sections = [
  {
    titulo: "Dados da Empresa",
    descricao: "Informações gerais do seu negócio",
    icon: Building2,
    content: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Nome da Empresa</Label>
          <Input defaultValue="Minha Empresa Ltda" />
        </div>
        <div className="space-y-2">
          <Label>CNPJ</Label>
          <Input defaultValue="12.345.678/0001-90" />
        </div>
        <div className="space-y-2">
          <Label>E-mail</Label>
          <Input defaultValue="contato@empresa.com" />
        </div>
        <div className="space-y-2">
          <Label>Telefone</Label>
          <Input defaultValue="(11) 3456-7890" />
        </div>
      </div>
    ),
  },
  {
    titulo: "Personalização",
    descricao: "Aparência do painel",
    icon: Palette,
    content: (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-sm">Modo Escuro</p>
            <p className="text-xs text-muted-foreground">Ativar tema escuro no painel</p>
          </div>
          <Switch />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-sm">Menu Compacto</p>
            <p className="text-xs text-muted-foreground">Reduzir tamanho do menu lateral</p>
          </div>
          <Switch />
        </div>
      </div>
    ),
  },
  {
    titulo: "Notificações",
    descricao: "Preferências de alertas",
    icon: Bell,
    content: (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-sm">Novos pedidos</p>
            <p className="text-xs text-muted-foreground">Receber alerta ao criar pedido</p>
          </div>
          <Switch defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-sm">Tickets de suporte</p>
            <p className="text-xs text-muted-foreground">Alerta de novos tickets</p>
          </div>
          <Switch defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-sm">Pagamentos em atraso</p>
            <p className="text-xs text-muted-foreground">Notificar sobre atrasos</p>
          </div>
          <Switch defaultChecked />
        </div>
      </div>
    ),
  },
];

export default function Configuracoes() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground mt-1">Painel de configurações do sistema</p>
      </div>

      <div className="space-y-4">
        {sections.map((s) => (
          <Card key={s.titulo}>
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10">
                  <s.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">{s.titulo}</CardTitle>
                  <CardDescription>{s.descricao}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>{s.content}</CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Button>Salvar Configurações</Button>
      </div>
    </div>
  );
}
