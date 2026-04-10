import React, { useState, useEffect, useCallback } from "react";
import { 
  Users, DollarSign, Wallet, ArrowUpRight, 
  Search, Plus, Filter, MoreHorizontal, 
  Check, X, Eye, UserPlus, TrendingUp,
  Clock, ShieldCheck
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogFooter, DialogHeader, DialogTitle 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { useRealtimeRefresh } from "@/hooks/useRealtimeRefresh";

export default function AdminRevenda() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [resellers, setResellers] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReseller, setEditingReseller] = useState<any>(null);
  const [formData, setFormData] = useState({
    nome: "", email: "", whatsapp: "", 
    referral_code: "", tipo_comissao: "porcentagem", 
    valor_comissao: 10, metodo_pagamento: "unico",
    senha: ""
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    // Buscar revendedores
    const { data: revs } = await supabase.from("revendedores" as any).select("*") as any;
    if (revs) setResellers(revs);

    // Buscar solicitações de saque (fictício)
    const { data: saques } = await supabase.from("saques_revenda" as any).select("*, revendedor:revendedores(nome, avatar)") as any;
    if (saques) setPayouts(saques);

    setLoading(false);
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useRealtimeRefresh(
    [
      { table: "revendedores" },
      { table: "saques_revenda" },
    ],
    loadData,
    { channelPrefix: "admin-revenda" },
  );

  const approvePayout = async (id: string) => {
    const { error } = await supabase.from("saques_revenda" as any).update({ status: "pago", data_pagamento: new Date().toISOString() }).eq("id", id);
    if (!error) {
      toast({ title: "Saque Aprovado", description: "O status foi atualizado para pago." });
      loadData();
    }
  };

  const handleOpenModal = (reseller: any = null) => {
    if (reseller) {
      setEditingReseller(reseller);
      setFormData({
        nome: reseller.nome || "",
        email: reseller.email || "",
        whatsapp: reseller.whatsapp || "",
        referral_code: reseller.referral_code || "",
        tipo_comissao: reseller.tipo_comissao || "porcentagem",
        valor_comissao: reseller.valor_comissao || 10,
        metodo_pagamento: reseller.metodo_pagamento || "unico",
        senha: reseller.senha || ""
      });
    } else {
      setEditingReseller(null);
      setFormData({
        nome: "", email: "", whatsapp: "", 
        referral_code: "", tipo_comissao: "porcentagem", 
        valor_comissao: 10, metodo_pagamento: "unico",
        senha: ""
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.nome || !formData.email || !formData.referral_code) {
      toast({ title: "Erro", description: "Preencha os campos obrigatórios.", variant: "destructive" });
      return;
    }

    setLoading(true);
    const data = { ...formData };
    
    let error;
    if (editingReseller) {
      const { error: err } = await supabase.from("revendedores" as any).update(data).eq("id", editingReseller.id);
      error = err;
    } else {
      const { error: err } = await supabase.from("revendedores" as any).insert([data]);
      error = err;
    }

    setLoading(false);
    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Sucesso!", description: "Revendedor salvo com sucesso." });
      setIsModalOpen(false);
      loadData();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Gestão de Revendas</h1>
          <p className="text-white/40">Controle seus parceiros, comissões e pagamentos em um só lugar.</p>
        </div>
        <div className="flex items-center gap-3">
           <Button className="bg-white/5 border border-white/10 hover:bg-white/10 text-white gap-2 rounded-2xl h-12 px-6">
              <Filter className="w-4 h-4" /> Filtros
           </Button>
           <Button 
             onClick={() => handleOpenModal()}
             className="bg-red-500 hover:bg-red-600 text-white gap-2 rounded-2xl h-12 px-6 shadow-lg shadow-red-500/20"
           >
              <UserPlus className="w-4 h-4" /> Novo Revendedor
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="bg-[#0c0c14] border-white/5">
            <CardHeader className="pb-2">
               <CardDescription className="text-white/40">Revendedores Ativos</CardDescription>
               <CardTitle className="text-3xl font-bold text-white">{resellers.length}</CardTitle>
            </CardHeader>
         </Card>
         <Card className="bg-[#0c0c14] border-white/5">
            <CardHeader className="pb-2">
               <CardDescription className="text-white/40">Total em Comissões (Mês)</CardDescription>
               <CardTitle className="text-3xl font-bold text-green-500">R$ 2.450,00</CardTitle>
            </CardHeader>
         </Card>
         <Card className="bg-[#0c0c14] border-white/5">
            <CardHeader className="pb-2">
               <CardDescription className="text-white/40">Saques Pendentes</CardDescription>
               <CardTitle className="text-3xl font-bold text-yellow-500">{payouts.filter(p => p.status === 'pendente').length}</CardTitle>
            </CardHeader>
         </Card>
      </div>

      <Tabs defaultValue="partners" className="space-y-6">
        <TabsList className="bg-white/5 border border-white/5 p-1 rounded-2xl w-fit">
          <TabsTrigger value="partners" className="rounded-xl px-6 data-[state=active]:bg-red-500 data-[state=active]:text-white">Parceiros</TabsTrigger>
          <TabsTrigger value="payouts" className="rounded-xl px-6 data-[state=active]:bg-red-500 data-[state=active]:text-white relative">
             Saques {payouts.some(p => p.status === 'pendente') && <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />}
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-xl px-6 data-[state=active]:bg-red-500 data-[state=active]:text-white">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="partners" className="mt-0">
          <Card className="bg-[#0c0c14] border-white/5 overflow-hidden">
             <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                   <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/30" />
                   <Input placeholder="Buscar revendedor..." className="pl-9 bg-white/5 border-white/10 text-xs h-9" />
                </div>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5 text-[10px] uppercase tracking-widest text-white/30">
                      <th className="px-6 py-4 font-bold">Parceiro</th>
                      <th className="px-6 py-4 font-bold">Código</th>
                      <th className="px-6 py-4 font-bold text-center">Indicações</th>
                      <th className="px-6 py-4 font-bold text-center">Ganhos</th>
                      <th className="px-6 py-4 font-bold">Comissão</th>
                      <th className="px-6 py-4 font-bold">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {resellers.map((res) => (
                      <tr key={res.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                 <AvatarImage src={res.avatar} />
                                 <AvatarFallback className="bg-red-500/20 text-red-500 text-xs font-bold">{(res.nome || "R").charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                 <p className="font-bold text-white text-sm">{res.nome}</p>
                                 <p className="text-[10px] text-white/30">{res.email}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <Badge variant="outline" className="font-mono text-[10px] bg-white/5 border-white/10 text-white/70 tracking-wider font-bold">
                              {res.referral_code}
                           </Badge>
                        </td>
                        <td className="px-6 py-4 text-center font-medium text-white/70 text-sm">
                           12
                        </td>
                        <td className="px-6 py-4 text-center font-bold text-green-500 text-sm">
                           R$ {res.saldo_comissao?.toFixed(2) || "0,00"}
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex flex-col gap-1">
                              <span className="text-[10px] text-white/50">{res.metodo_pagamento === 'recorrente' ? 'MENSAL' : 'ÚNICO'}</span>
                              <span className="text-xs font-bold text-white">
                                {res.tipo_comissao === 'fixo' ? `R$ ${res.valor_comissao}` : `${res.valor_comissao}%`}
                              </span>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                 <Button variant="ghost" size="icon" className="h-8 w-8 text-white/30 hover:text-white">
                                    <MoreHorizontal className="w-4 h-4" />
                                 </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-[#0c0c14] border-white/10 text-white">
                                 <DropdownMenuItem onClick={() => handleOpenModal(res)} className="gap-2 focus:bg-white/5 focus:text-white"><Eye className="w-4 h-4" /> Editar</DropdownMenuItem>
                                 <DropdownMenuItem className="gap-2 focus:bg-white/5 focus:text-white"><DollarSign className="w-4 h-4" /> Ajustar Saldo</DropdownMenuItem>
                                 <DropdownMenuItem className="gap-2 text-red-400 focus:bg-red-500/10 focus:text-red-400"><X className="w-4 h-4" /> Desativar</DropdownMenuItem>
                              </DropdownMenuContent>
                           </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </Card>
        </TabsContent>

        <TabsContent value="payouts" className="mt-0">
          <Card className="bg-[#0c0c14] border-white/5">
            <div className="p-8 text-center space-y-4">
               {payouts.length === 0 ? (
                 <>
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto text-white/20">
                       <Clock className="w-8 h-8" />
                    </div>
                    <div>
                       <h3 className="text-white font-bold">Nenhum saque pendente</h3>
                       <p className="text-white/40 text-sm">As solicitações dos parceiros aparecerão aqui.</p>
                    </div>
                 </>
               ) : (
                 <div className="overflow-x-auto text-left -mx-8">
                    <table className="w-full">
                       <thead className="border-b border-white/5 text-[10px] text-white/30 uppercase tracking-widest">
                          <tr>
                             <th className="px-8 py-4">Revendedor</th>
                             <th className="px-8 py-4">Valor</th>
                             <th className="px-8 py-4">Status</th>
                             <th className="px-8 py-4 text-right">Ação</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-white/5">
                          {payouts.map(p => (
                            <tr key={p.id} className="hover:bg-white/[0.01]">
                               <td className="px-8 py-4">
                                  <p className="font-bold text-white text-sm">{p.revendedor?.nome}</p>
                                  <p className="text-[10px] text-white/30">PIX: {p.chave_pix || "Não informada"}</p>
                               </td>
                               <td className="px-8 py-4 font-black text-white">R$ {p.valor.toFixed(2)}</td>
                               <td className="px-8 py-4">
                                  <Badge className={p.status === 'pendente' ? "bg-yellow-500/10 text-yellow-500" : "bg-green-500/10 text-green-500"}>
                                     {p.status}
                                  </Badge>
                               </td>
                               <td className="px-8 py-4 text-right">
                                  {p.status === 'pendente' && (
                                    <Button size="sm" onClick={() => approvePayout(p.id)} className="bg-green-600 hover:bg-green-700 text-white font-bold h-8 rounded-lg px-4 gap-1">
                                       <Check className="w-3 h-3" /> Pagar
                                    </Button>
                                  )}
                               </td>
                            </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
               )}
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
           <Card className="bg-[#0c0c14] border-white/5 p-8 text-center text-white/20">
              <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>O histórico consolidado de todas as revendas aparecerá aqui.</p>
           </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-[#0c0c14] border-white/10 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingReseller ? "Editar Revendedor" : "Novo Revendedor"}</DialogTitle>
            <DialogDescription className="text-white/40">
              Configure os detalhes da conta e os parâmetros de comissão do parceiro.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div className="space-y-4">
               <div>
                  <Label className="text-white/60 text-xs mb-1.5 block">Nome Completo</Label>
                  <Input 
                    value={formData.nome} 
                    onChange={e => setFormData({ ...formData, nome: e.target.value })}
                    className="bg-white/5 border-white/10" placeholder="Ex: João Silva" 
                  />
               </div>
               <div>
                  <Label className="text-white/60 text-xs mb-1.5 block">Email / Login</Label>
                  <Input 
                    value={formData.email} 
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="bg-white/5 border-white/10" placeholder="contato@exemplo.com" 
                  />
               </div>
               <div>
                  <Label className="text-white/60 text-xs mb-1.5 block">WhatsApp</Label>
                  <Input 
                    value={formData.whatsapp} 
                    onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="bg-white/5 border-white/10" placeholder="(11) 99999-9999" 
                  />
               </div>
               <div>
                  <Label className="text-white/60 text-xs mb-1.5 block">Senha de Acesso</Label>
                  <Input 
                    type="password"
                    value={formData.senha} 
                    onChange={e => setFormData({ ...formData, senha: e.target.value })}
                    className="bg-white/5 border-white/10" placeholder="••••••••" 
                  />
               </div>
            </div>

            <div className="space-y-4 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
               <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-500" /> Parâmetros de Ganho
               </h4>
               
               <div>
                  <Label className="text-white/60 text-xs mb-1.5 block">Código de Indicação (Cupom)</Label>
                  <Input 
                    value={formData.referral_code} 
                    onChange={e => setFormData({ ...formData, referral_code: e.target.value.toUpperCase() })}
                    className="bg-white/5 border-white/10 font-mono uppercase" placeholder="JOAO10" 
                  />
               </div>

               <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-white/60 text-xs mb-1.5 block">Tipo</Label>
                    <Select 
                      value={formData.tipo_comissao} 
                      onValueChange={v => setFormData({ ...formData, tipo_comissao: v as any })}
                    >
                       <SelectTrigger className="bg-white/5 border-white/10">
                          <SelectValue />
                       </SelectTrigger>
                       <SelectContent className="bg-[#0c0c14] border-white/10 text-white">
                          <SelectItem value="porcentagem">Porcentagem</SelectItem>
                          <SelectItem value="fixo">Valor Fixo</SelectItem>
                       </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-white/60 text-xs mb-1.5 block">Valor ({formData.tipo_comissao === 'fixo' ? 'R$' : '%'})</Label>
                    <Input 
                      type="number"
                      value={formData.valor_comissao} 
                      onChange={e => setFormData({ ...formData, valor_comissao: parseFloat(e.target.value) })}
                      className="bg-white/5 border-white/10 text-center" 
                    />
                  </div>
               </div>

               <div>
                  <Label className="text-white/60 text-xs mb-1.5 block">Frequência da Comissão</Label>
                  <Select 
                    value={formData.metodo_pagamento} 
                    onValueChange={v => setFormData({ ...formData, metodo_pagamento: v as any })}
                  >
                     <SelectTrigger className="bg-white/5 border-white/10">
                        <SelectValue />
                     </SelectTrigger>
                     <SelectContent className="bg-[#0c0c14] border-white/10 text-white">
                        <SelectItem value="unico">Pagamento Único (no fechamento)</SelectItem>
                        <SelectItem value="recorrente">Recorrente Mensal (mensalidades)</SelectItem>
                     </SelectContent>
                  </Select>
               </div>
            </div>
          </div>

          <DialogFooter className="mt-4 gap-2">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="text-white/40 hover:text-white">Cancelar</Button>
            <Button onClick={handleSave} className="bg-red-500 hover:bg-red-600 text-white px-8 h-12 rounded-xl font-bold">
              Salvar Revendedor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function History({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" 
      viewBox="0 0 24 24" fill="none" 
      stroke="currentColor" strokeWidth="2" 
      strokeLinecap="round" strokeLinejoin="round" 
      className={className}
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
      <path d="M3 3v5h5"/>
      <path d="M12 7v5l4 2"/>
    </svg>
  );
}



