import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Search, UserPlus, Phone, Eye, MessageCircle, X, CheckCircle, Clock, XCircle, Users, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

type Lead = {
  id: string; nome: string; email: string; whatsapp: string; cidade: string | null; estado: string | null;
  documento: string | null; nome_negocio: string | null; segmento: string | null; servicos: string[];
  orcamento: string | null; como_conheceu: string | null; mensagem: string | null; status: string;
  motivo_perda: string | null; visualizado: boolean; created_at: string; updated_at: string;
};

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  novo: { label: "Novo", color: "text-red-400", bg: "bg-red-500/10 border-red-500/30" },
  em_contato: { label: "Em contato", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30" },
  convertido: { label: "Convertido", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30" },
  perdido: { label: "Perdido", color: "text-gray-400", bg: "bg-gray-500/10 border-gray-500/30" },
};

export default function Leads() {
  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [convertModal, setConvertModal] = useState<Lead | null>(null);
  const [convertForm, setConvertForm] = useState({ senha: "", valor: "" });
  const [criarAcesso, setCriarAcesso] = useState(true);
  const [motivoPerda, setMotivoPerda] = useState("");
  const [perdaModal, setPerdaModal] = useState<Lead | null>(null);
  const [converting, setConverting] = useState(false);

  const fetchLeads = async () => {
    const { data } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
    if (data) setLeads(data as Lead[]);
  };

  useEffect(() => {
    fetchLeads();
    const channel = supabase.channel("leads-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "leads" }, () => fetchLeads())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const updateStatus = async (lead: Lead, status: string, extra?: Record<string, unknown>) => {
    await supabase.from("leads").update({ status, visualizado: true, ...extra }).eq("id", lead.id);
    toast({ title: `Lead ${statusConfig[status]?.label || status}` });
    fetchLeads();
    setSelectedLead(null);
  };

  const handleConvert = async () => {
    if (!convertModal) return;
    setConverting(true);
    
    try {
      // 1. Criar o Cliente
      const avatar = convertModal.nome.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
      const { data: cliente, error: cliError } = await supabase.from("clientes").insert({
        nome: convertModal.nome,
        email: convertModal.email,
        telefone: convertModal.whatsapp,
        documento: convertModal.documento,
        cidade: convertModal.cidade,
        estado: convertModal.estado,
        status: "ativo",
        avatar,
        senha: criarAcesso ? convertForm.senha : null
      }).select().single();

      if (cliError) throw cliError;

      // 2. Criar o Pedido Automático (Criação de Site)
      const codigoPed = `PED-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      const { error: pedError } = await supabase.from("pedidos").insert({
        codigo: codigoPed,
        cliente_id: cliente.id,
        tipo: "Criação de Site",
        valor: Number(convertForm.valor) || 0,
        data: new Date().toISOString().split("T")[0]
      });

      if (pedError) throw pedError;

      // 3. Atualizar o Lead
      await updateStatus(convertModal, "convertido");

      toast({ 
        title: "Sucesso!", 
        description: `Lead convertido em cliente. Pedido ${codigoPed} gerado.` 
      });
      
      setConvertModal(null);
      setConvertForm({ senha: "", valor: "" });
      setCriarAcesso(true);
    } catch (error: any) {
      toast({ title: "Erro na conversão", description: error.message, variant: "destructive" });
    } finally {
      setConverting(false);
    }
  };

  const handlePerda = async () => {
    if (!perdaModal) return;
    await updateStatus(perdaModal, "perdido", { motivo_perda: motivoPerda });
    setMotivoPerda("");
  };

  const handleDelete = async (leadId: string) => {
    if (!confirm("Tem certeza que deseja excluir este lead? Esta ação não pode ser desfeita.")) return;
    const { error } = await supabase.from("leads").delete().eq("id", leadId);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Lead excluído com sucesso!" });
      setSelectedLead(null);
      fetchLeads();
    }
  };

  const filtrados = leads.filter(l => {
    const matchBusca = l.nome.toLowerCase().includes(busca.toLowerCase()) || l.email.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = filtroStatus === "todos" || l.status === filtroStatus;
    return matchBusca && matchStatus;
  });

  const novos = leads.filter(l => l.status === "novo").length;
  const emContato = leads.filter(l => l.status === "em_contato").length;
  const convertidos = leads.filter(l => l.status === "convertido").length;

  return (
    <motion.div className="space-y-6" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }}>
      {/* KPIs */}
      <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-4" variants={fadeUp}>
        {[
          { label: "Total de Leads", value: leads.length, icon: Users, color: "text-blue-400" },
          { label: "Novos", value: novos, icon: Clock, color: "text-red-400" },
          { label: "Em Contato", value: emContato, icon: Phone, color: "text-amber-400" },
          { label: "Convertidos", value: convertidos, icon: CheckCircle, color: "text-emerald-400" },
        ].map(k => (
          <Card key={k.label} className="glass-card border-[0.5px]">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${k.color === "text-blue-400" ? "bg-blue-500/10" : k.color === "text-red-400" ? "bg-red-500/10" : k.color === "text-amber-400" ? "bg-amber-500/10" : "bg-emerald-500/10"}`}>
                <k.icon className={`w-4 h-4 ${k.color}`} />
              </div>
              <div>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">{k.label}</p>
                <p className={`text-xl font-bold ${k.color}`}>{k.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Table */}
      <motion.div variants={fadeUp}>
        <Card className="glass-card border-[0.5px]">
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                <Input placeholder="Buscar lead..." className="pl-9 glass-input border-0 text-white text-sm" value={busca} onChange={e => setBusca(e.target.value)} />
              </div>
              <div className="flex gap-2 flex-wrap">
                {["todos", "novo", "em_contato", "convertido", "perdido"].map(s => (
                  <Button key={s} size="sm"
                    className={filtroStatus === s ? "gradient-primary border-0 text-white" : "glass-input border-0 text-[hsl(var(--muted-foreground))] hover:text-white"}
                    onClick={() => setFiltroStatus(s)}>
                    {s === "todos" ? "Todos" : statusConfig[s]?.label || s}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-[rgba(255,255,255,0.06)]">
                  {["Nome", "E-mail", "WhatsApp", "Segmento", "Serviços", "Orçamento", "Status", "Data"].map(h => (
                    <TableHead key={h} className={`text-[11px] text-[hsl(var(--muted-foreground))] ${["Segmento", "Orçamento"].includes(h) ? "hidden lg:table-cell" : ""} ${h === "Serviços" ? "hidden xl:table-cell" : ""}`}>{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtrados.map(l => {
                  const sc = statusConfig[l.status] || statusConfig.novo;
                  return (
                    <TableRow key={l.id} className={`border-[rgba(255,255,255,0.04)] cursor-pointer hover:bg-[rgba(255,255,255,0.02)] ${!l.visualizado ? "bg-red-500/[0.03]" : ""}`}
                      onClick={() => { setSelectedLead(l); if (!l.visualizado) supabase.from("leads").update({ visualizado: true }).eq("id", l.id).then(() => fetchLeads()); }}>
                      <TableCell className="text-sm text-white font-medium">
                        <div className="flex items-center gap-2">
                          {!l.visualizado && <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />}
                          {l.nome}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-[hsl(var(--muted-foreground))]">{l.email}</TableCell>
                      <TableCell className="text-sm text-[hsl(var(--muted-foreground))]">{l.whatsapp}</TableCell>
                      <TableCell className="text-sm text-[hsl(var(--muted-foreground))] hidden lg:table-cell">{l.segmento || "—"}</TableCell>
                      <TableCell className="hidden xl:table-cell">
                        <div className="flex gap-1 flex-wrap">{l.servicos?.slice(0, 2).map(s => <Badge key={s} variant="outline" className="text-[10px] border-[rgba(255,255,255,0.1)]">{s}</Badge>)}{(l.servicos?.length || 0) > 2 && <Badge variant="outline" className="text-[10px]">+{l.servicos.length - 2}</Badge>}</div>
                      </TableCell>
                      <TableCell className="text-sm text-[hsl(var(--muted-foreground))] hidden lg:table-cell">{l.orcamento || "—"}</TableCell>
                      <TableCell><Badge variant="outline" className={`text-[10px] font-medium ${sc.color} ${sc.bg}`}>{sc.label}</Badge></TableCell>
                      <TableCell className="text-sm text-[hsl(var(--muted-foreground))]">{new Date(l.created_at).toLocaleDateString("pt-BR")}</TableCell>
                    </TableRow>
                  );
                })}
                {filtrados.length === 0 && (
                  <TableRow><TableCell colSpan={8} className="text-center text-[hsl(var(--muted-foreground))] py-12">Nenhum lead encontrado</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      {/* Detail Sheet */}
      <Sheet open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <SheetContent className="glass-card border-l-[0.5px] border-l-[rgba(255,255,255,0.08)] w-full sm:max-w-md overflow-y-auto">
          {selectedLead && (
            <>
              <SheetHeader>
                <SheetTitle className="text-white text-lg">{selectedLead.nome}</SheetTitle>
              </SheetHeader>
              <div className="space-y-5 mt-6">
                {[
                  { label: "E-mail", value: selectedLead.email },
                  { label: "WhatsApp", value: selectedLead.whatsapp },
                  { label: "Cidade/Estado", value: [selectedLead.cidade, selectedLead.estado].filter(Boolean).join(", ") || "—" },
                  { label: "CPF/CNPJ", value: selectedLead.documento || "—" },
                  { label: "Negócio", value: selectedLead.nome_negocio || "—" },
                  { label: "Segmento", value: selectedLead.segmento || "—" },
                  { label: "Orçamento", value: selectedLead.orcamento || "—" },
                  { label: "Como conheceu", value: selectedLead.como_conheceu || "—" },
                ].map(item => (
                  <div key={item.label}>
                    <p className="text-[10px] uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-1">{item.label}</p>
                    <p className="text-sm text-white">{item.value}</p>
                  </div>
                ))}
                {selectedLead.servicos?.length > 0 && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-1">Serviços</p>
                    <div className="flex flex-wrap gap-1.5">{selectedLead.servicos.map(s => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}</div>
                  </div>
                )}
                {selectedLead.mensagem && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-1">Mensagem</p>
                    <p className="text-sm text-white bg-[rgba(255,255,255,0.04)] p-3 rounded-lg">{selectedLead.mensagem}</p>
                  </div>
                )}

                <div className="space-y-2 pt-4 border-t border-[rgba(255,255,255,0.06)]">
                  {selectedLead.status !== "convertido" && (
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg gap-2" onClick={() => { setConvertModal(selectedLead); setSelectedLead(null); }}>
                      <UserPlus className="w-4 h-4" /> Converter em cliente
                    </Button>
                  )}
                  {selectedLead.status === "novo" && (
                    <Button className="w-full gradient-primary border-0 text-white rounded-lg gap-2" onClick={() => updateStatus(selectedLead, "em_contato")}>
                      <Phone className="w-4 h-4" /> Marcar em contato
                    </Button>
                  )}
                  {selectedLead.status !== "perdido" && selectedLead.status !== "convertido" && (
                    <Button variant="outline" className="w-full glass-input border-[rgba(255,255,255,0.1)] text-[hsl(var(--muted-foreground))] hover:text-white rounded-lg gap-2"
                      onClick={() => { setPerdaModal(selectedLead); setSelectedLead(null); }}>
                      <XCircle className="w-4 h-4" /> Marcar como perdido
                    </Button>
                  )}
                  <Button variant="ghost" className="w-full text-red-500/60 hover:text-red-500 hover:bg-red-500/10 rounded-lg gap-2 mt-2"
                    onClick={() => handleDelete(selectedLead.id)}>
                    <Trash2 className="w-4 h-4" /> Excluir Lead
                  </Button>
                  <a href={`https://wa.me/${selectedLead.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="block">
                    <Button className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-lg gap-2">
                      <MessageCircle className="w-4 h-4" /> Abrir WhatsApp
                    </Button>
                  </a>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Convert Modal */}
      <Dialog open={!!convertModal} onOpenChange={() => setConvertModal(null)}>
        <DialogContent className="glass-card border-[0.5px] text-white max-w-md">
          <DialogHeader><DialogTitle className="text-white">Converter em Cliente</DialogTitle></DialogHeader>
          {convertModal && (
            <div className="space-y-4 mt-2">
              <div className="bg-[rgba(255,255,255,0.04)] p-4 rounded-lg space-y-2">
                <p className="text-xs"><span className="text-[hsl(var(--muted-foreground))]">Nome:</span> {convertModal.nome}</p>
                <p className="text-xs"><span className="text-[hsl(var(--muted-foreground))]">E-mail:</span> {convertModal.email}</p>
                <p className="text-xs"><span className="text-[hsl(var(--muted-foreground))]">Orçamento:</span> {convertModal.orcamento || "Não informado"}</p>
              </div>

              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label className="text-xs text-[hsl(var(--muted-foreground))]">Valor do Pedido (R$)</Label>
                  <Input 
                    type="number" 
                    className="glass-input h-9 text-sm" 
                    placeholder="Ex: 2500" 
                    value={convertForm.valor}
                    onChange={e => setConvertForm({...convertForm, valor: e.target.value})}
                  />
                </div>

                <div className="p-3 rounded-lg bg-[rgba(255,255,255,0.02)] border border-white/5 space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <Checkbox checked={criarAcesso} onCheckedChange={v => setCriarAcesso(!!v)} />
                    <span className="text-xs text-white">Criar acesso ao portal do cliente</span>
                  </label>
                  
                  {criarAcesso && (
                    <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1">
                      <Label className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase">Senha de Acesso</Label>
                      <Input 
                        type="text" 
                        className="glass-input h-8 text-xs" 
                        placeholder="Mínimo 6 caracteres" 
                        value={convertForm.senha}
                        onChange={e => setConvertForm({...convertForm, senha: e.target.value})}
                      />
                    </div>
                  )}
                </div>
              </div>

              <Button 
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg mt-2" 
                onClick={handleConvert}
                disabled={converting || (criarAcesso && convertForm.senha.length < 6)}
              >
                {converting ? "Convertendo..." : "Confirmar Conversão"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Loss Modal */}
      <Dialog open={!!perdaModal} onOpenChange={() => setPerdaModal(null)}>
        <DialogContent className="glass-card border-[0.5px] text-white max-w-md">
          <DialogHeader><DialogTitle className="text-white">Marcar como Perdido</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-[hsl(var(--muted-foreground))]">Motivo da perda</Label>
              <Input className="glass-input border-[rgba(255,255,255,0.1)] text-white h-10" value={motivoPerda} onChange={e => setMotivoPerda(e.target.value)} placeholder="Ex: sem orçamento, desistiu..." />
            </div>
            <Button variant="outline" className="w-full glass-input border-[rgba(255,255,255,0.1)] text-[hsl(var(--muted-foreground))] hover:text-white rounded-lg" onClick={handlePerda}>
              Confirmar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
