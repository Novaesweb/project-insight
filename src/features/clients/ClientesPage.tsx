import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  Users, Plus, Search, Mail, Phone, MapPin, 
  Trash2, Pencil, ExternalLink, ArrowLeft,
  DollarSign, Package, Sparkles, FileText,
  AlertCircle, CheckCircle2, Clock, Zap,
  ArrowRight, UserPlus, Copy, RefreshCw, Pause, StickyNote
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Card, CardContent, CardHeader, CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import {
  Tabs, TabsContent, TabsList, TabsTrigger
} from "@/components/ui/tabs";
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DeleteConfirmDialog, useDeleteConfirm } from "@/components/DeleteConfirmDialog";
import { useToast } from "@/hooks/use-toast";
import { invokeAdminFunction } from "@/lib/admin-function-client";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { persistClientProfile, sanitizeClientProfile } from "@/lib/client-portal-auth";
import { notifyAdminPanel, notifyClientPanel } from "@/lib/user-notifications";
import InternalNotes from "@/components/InternalNotes";
import {
  fetchAddressByCep,
  formatCep,
  formatCpfCnpj,
  formatPhone,
  getDocumentoProgressText,
  getPhoneProgressText,
  normalizeEmailSuggestion,
} from "@/lib/client-registration";
import { useRealtimeRefresh } from "@/hooks/useRealtimeRefresh";
import { usePersistentDraftState } from "@/hooks/usePersistentDraftState";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const catLabels: any = {
  vendas: "Vendas / Social",
  estratégia: "Estratégia",
  conteúdo: "Conteúdo",
  desenvolvimento: "Dev",
  design: "Branding",
  gestão: "Gestão"
};

const catColors: any = {
  vendas: "text-blue-400",
  estratégia: "text-purple-400",
  conteúdo: "text-pêssego-400",
  desenvolvimento: "text-emerald-400",
  design: "text-pink-400",
  gestão: "text-amber-400"
};

const StatusBadge = ({ status }: { status: string }) => {
  const configs: any = {
    ativo: { icon: CheckCircle2, color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", label: "Ativo" },
    inativo: { icon: AlertCircle, color: "text-red-400 bg-red-400/10 border-red-400/20", label: "Inativo" },
    pago: { icon: CheckCircle2, color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", label: "Pago" },
    pendente: { icon: Clock, color: "text-amber-400 bg-amber-400/10 border-amber-400/20", label: "Pendente" },
    briefing: { icon: Sparkles, color: "text-purple-400 bg-purple-400/10 border-purple-400/20", label: "Briefing" },
    em_andamento: { icon: RefreshCw, color: "text-blue-400 bg-blue-400/10 border-blue-400/20", label: "Execução" }
  };
  const config = configs[status] || configs.ativo;
  const Icon = config.icon;
  return (
    <Badge variant="outline" className={`${config.color} gap-1.5 py-1 px-3 border-[0.5px] rounded-full`}>
      <Icon className="w-3 h-3" /> {config.label}
    </Badge>
  );
};

const INITIAL_CLIENT_FORM = {
  nome: "",
  nome_empresa: "",
  email: "",
  whatsapp: "",
  telefone: "",
  documento: "",
  instagram: "",
  endereco: "",
  numero_endereco: "",
  complemento: "",
  bairro: "",
  cep: "",
  cidade: "",
  estado: "",
  status: "ativo",
  site_url: "",
  projeto_titulo: "",
  projeto_valor: "",
  projeto_tipo: "site",
  gerar_fatura: true,
};

const INITIAL_NEW_CLIENT_DRAFT = {
  showNew: false,
  criarConta: true,
  senhaCliente: "",
  form: { ...INITIAL_CLIENT_FORM },
};

const CLIENT_REGISTRATION_FIELDS = [
  { key: "nome", label: "Nome completo" },
  { key: "nome_empresa", label: "Empresa / marca" },
  { key: "email", label: "E-mail" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "telefone", label: "Telefone secundário" },
  { key: "documento", label: "CPF / CNPJ" },
  { key: "instagram", label: "Instagram" },
  { key: "site_url", label: "URL do Site" },
] as const;

const CLIENT_ADDRESS_FIELDS = [
  { key: "cep", label: "CEP" },
  { key: "endereco", label: "Endereço", fullWidth: true },
  { key: "numero_endereco", label: "Número" },
  { key: "complemento", label: "Complemento" },
  { key: "bairro", label: "Bairro" },
  { key: "cidade", label: "Cidade" },
  { key: "estado", label: "Estado" },
] as const;

function formatClientFieldValue(key: string, value: string) {
  if (key === "documento") return formatCpfCnpj(value);
  if (key === "whatsapp" || key === "telefone") return formatPhone(value);
  if (key === "cep") return formatCep(value);
  return value;
}

function getClientFieldHelperText(key: string, value: string) {
  if (key === "documento") return getDocumentoProgressText(value);
  if (key === "whatsapp" || key === "telefone") return getPhoneProgressText(value);
  return "";
}

function ClienteDetalhes({ clienteId, onBack }: { clienteId: string; onBack: () => void }) {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAcessarPortal = (cliente: any) => {
    persistClientProfile(sanitizeClientProfile(cliente));
    window.open("/cliente/dashboard", "_blank");
    toast({ title: "Modo Espelhamento", description: `Acessando portal como ${cliente.nome}` });
  };
  const { requestDelete, dialogProps } = useDeleteConfirm();
  const [cliente, setCliente] = useState<any>(null);
  const [extras, setExtras] = useState<any[]>([]);
  const [projetos, setProjetos] = useState<any[]>([]);
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [catalogo, setCatalogo] = useState<any[]>([]);
  const [showAddExtra, setShowAddExtra] = useState(false);
  const [extraSelecionado, setExtraSelecionado] = useState("");
  const [observacao, setObservacao] = useState("");
  const [savingExtra, setSavingExtra] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [
        { data: c, error: errorCliente },
        { data: e, error: errorExtras },
        { data: p, error: errorProjetos },
        { data: ped, error: errorPedidos },
        { data: cat, error: errorCatalogo }
      ] = await Promise.all([
        supabase.from("clientes").select("*").eq("id", clienteId).single(),
        supabase.from("extras_clientes").select("*, extras_catalogo(*)").eq("cliente_id", clienteId),
        supabase.from("projetos").select("*").eq("cliente_id", clienteId).order("created_at", { ascending: false }),
        supabase.from("pedidos").select("*").eq("cliente_id", clienteId).order("created_at", { ascending: false }),
        supabase.from("extras_catalogo").select("*")
      ]);

      if (errorCliente) {
        console.error("Erro ao carregar cliente");
        throw errorCliente;
      }

      if (c) setCliente(c);
      if (e) setExtras(e);
      if (p) setProjetos(p);
      if (ped) setPedidos(ped);
      if (cat) setCatalogo(cat);

      if (errorExtras) console.error("Erro ao carregar extras do cliente");
      if (errorProjetos) console.error("Erro ao carregar projetos do cliente");
      if (errorPedidos) console.error("Erro ao carregar pedidos do cliente");
      if (errorCatalogo) console.error("Erro ao carregar catálogo de extras");
    } catch (error) {
      console.error("Erro ao carregar dados do cliente");
      toast({ 
        title: "Erro ao carregar dados", 
        description: "Não foi possível carregar as informações do cliente", 
        variant: "destructive" 
      });
    }
  }, [clienteId, toast]);

  useEffect(() => { loadData(); }, [loadData]);

  useRealtimeRefresh(
    [
      { table: "clientes", filter: `id=eq.${clienteId}` },
      { table: "extras_clientes", filter: `cliente_id=eq.${clienteId}` },
      { table: "projetos", filter: `cliente_id=eq.${clienteId}` },
      { table: "pedidos", filter: `cliente_id=eq.${clienteId}` },
      { table: "extras_catalogo" },
    ],
    loadData,
    { channelPrefix: `admin-cliente-detalhe-${clienteId}`, debounceMs: 350 },
  );

  const handleClientCepLookup = async (value: string) => {
    const normalizedCep = formatCep(value);

    setCliente((current: any) => ({ ...current, cep: normalizedCep }));

    try {
      const address = await fetchAddressByCep(normalizedCep);
      if (!address) return;

      setCliente((current: any) => ({
        ...current,
        cep: normalizedCep,
        endereco: address.endereco || current.endereco || "",
        bairro: address.bairro || current.bairro || "",
        cidade: address.cidade || current.cidade || "",
        estado: address.estado || current.estado || "",
        complemento: current.complemento || address.complemento || "",
      }));

      toast({
        title: "CEP localizado",
        description: "Endereço preenchido automaticamente no cadastro.",
      });
    } catch (error: any) {
      toast({
        title: "Não foi possível buscar o CEP",
        description: error?.message || "Tente novamente em instantes.",
        variant: "destructive",
      });
    }
  };

  const handleAddExtra = async () => {
    if (!extraSelecionado) return;
    setSavingExtra(true);
    const sel = catalogo.find(c => c.id === extraSelecionado);
    const { error } = await supabase.from("extras_clientes").insert({
      cliente_id: clienteId,
      extra_id: extraSelecionado,
      categoria: sel?.categoria || "fixo",
      preco_ativacao: sel?.preco_ativacao || 0,
      preco_mensal: sel?.preco_mensal || 0,
      observacao,
      status: "pendente"
    });

    if (error) {
      toast({ title: "Erro ao adicionar", description: error.message, variant: "destructive" });
    } else {
      await notifyAdminPanel({
        title: "✨ Extra adicionado ao cliente",
        body: `${sel?.nome || "Extra"} foi vinculado para ${cliente.nome}.`,
        url: "/admin/clientes",
      });
      await notifyClientPanel(clienteId, {
        title: "Novo extra disponível",
        body: `${sel?.nome || "Um novo extra"} foi liberado no seu portal.`,
        url: "/cliente/extras",
      });
      toast({ title: "Extra adicionado!", description: "Recurso vinculado ao cliente." });
      loadData();
      setShowAddExtra(false);
      setExtraSelecionado("");
      setObservacao("");
    }
    setSavingExtra(false);
  };

  if (!cliente) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-white/60">Carregando dados do cliente...</p>
      </div>
    </div>
  );

  const totalMensal = extras.reduce((acc, curr) => acc + (Number(curr.preco_mensal) || 0), 0);
  const totalAtivacoes = extras.reduce((acc, curr) => acc + (Number(curr.preco_ativacao) || 0), 0);
  const avatar = cliente.nome?.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

  const extrasDisponiveis = catalogo.filter(c => !extras.some(e => e.extra_id === c.id));

  return (
    <motion.div className="space-y-4 sm:space-y-6" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }}>
      <motion.div variants={fadeUp}>
        <Button variant="ghost" className="text-[hsl(var(--muted-foreground))] hover:text-white mb-3" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
        <Card className="glass-card border-[0.5px]">
          <CardContent className="p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full gradient-primary flex items-center justify-center shrink-0">
                <span className="text-white text-base sm:text-lg font-bold">{avatar}</span>
              </div>
              <div className="flex-1 min-w-0 w-full">
                <h2 className="text-lg sm:text-xl font-bold text-white truncate">{cliente.nome}</h2>
                <p className="text-xs sm:text-sm text-[hsl(var(--muted-foreground))] truncate">
                  {cliente.email} · {cliente.whatsapp || cliente.telefone || "Sem WhatsApp"}
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-3">
                   <div className="flex-1 max-w-sm">
                      <Label className="text-[10px] text-white/30 uppercase font-bold mb-1 block">URL do Site</Label>
                      <div className="flex gap-2">
                         <Input 
                           value={cliente.site_url || ""} 
                           onChange={e => setCliente({ ...cliente, site_url: e.target.value })}
                           placeholder="https://exemplo.com.br"
                           className="glass-input h-8 text-xs border-white/10"
                         />
                         <Button 
                           size="sm" 
                           className="h-8 gradient-primary border-0 text-[10px] px-3"
                           onClick={async () => {
                             const { error } = await supabase.from("clientes").update({ site_url: cliente.site_url } as any).eq("id", clienteId);
                             if (error) toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
                             else toast({ title: "URL do site salva!" });
                           }}
                         >
                           Salvar
                         </Button>
                      </div>
                   </div>
                   <div className="flex-1 max-w-[200px]">
                      <Label className="text-[10px] text-white/30 uppercase font-bold mb-1 block">Slug (URL Cardápio)</Label>
                      <div className="flex gap-2">
                         <Input 
                           value={cliente.slug || ""} 
                           onChange={e => setCliente({ ...cliente, slug: e.target.value.toLowerCase().replace(/ /g, '-') })}
                           placeholder="pizzaria-joao"
                           className="glass-input h-8 text-xs border-white/10"
                         />
                         <Button 
                           size="sm" 
                           variant="outline"
                           className="h-8 border-white/10 text-[10px] px-3"
                           onClick={async () => {
                             const { error } = await supabase.from("clientes").update({ slug: cliente.slug } as any).eq("id", clienteId);
                             if (error) toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
                             else toast({ title: "Slug atualizado!" });
                           }}
                         >
                           OK
                         </Button>
                      </div>
                   </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 mt-6 p-4 rounded-2xl bg-white/5 border border-white/10">
                   <div className="flex-1">
                      <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Status do Acesso / Trial</p>
                      <div className="flex items-center gap-2">
                        <Input 
                          type="date"
                          value={cliente.trial_ends_at ? new Date(cliente.trial_ends_at).toISOString().split('T')[0] : ""}
                          onChange={e => setCliente({ ...cliente, trial_ends_at: e.target.value })}
                          className="glass-input h-9 text-xs w-40"
                        />
                        {cliente.trial_ends_at && new Date(cliente.trial_ends_at) < new Date() ? (
                          <Badge variant="outline" className="border-red-500/50 text-red-500 bg-red-500/10">EXPIRADO</Badge>
                        ) : (
                          <Badge variant="outline" className="border-emerald-500/50 text-emerald-500 bg-emerald-500/10">ATIVO</Badge>
                        )}
                      </div>
                   </div>
                   <div className="flex items-end gap-2">
                      <Button 
                         size="sm" 
                         variant="outline" 
                         className="h-9 border-white/10 hover:bg-white/5 text-[10px]"
                         onClick={async () => {
                           const newDate = new Date();
                           newDate.setDate(newDate.getDate() + 7);
                           const { error } = await supabase.from("clientes").update({ trial_ends_at: newDate.toISOString() } as any).eq("id", clienteId);
                           if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
                           else { toast({ title: "Trial expandido!", description: "+7 dias concedidos." }); loadData(); }
                         }}
                      >
                         Dar +7 Dias
                      </Button>
                      <Button 
                         size="sm" 
                         variant="outline" 
                         className="h-9 border-red-500/20 text-red-500 hover:bg-red-500/10 text-[10px]"
                         onClick={async () => {
                           const newDate = new Date();
                           newDate.setDate(newDate.getDate() - 1);
                           const { error } = await supabase.from("clientes").update({ trial_ends_at: newDate.toISOString() } as any).eq("id", clienteId);
                           if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
                           else { toast({ title: "Acesso Bloqueado!", variant: "destructive" }); loadData(); }
                         }}
                      >
                         <Pause className="w-3 h-3 mr-1" /> Bloquear Agora
                      </Button>
                      <Button 
                         size="sm" 
                         className="h-9 gradient-primary border-0 text-[10px]"
                         onClick={async () => {
                           const { error } = await supabase.from("clientes").update({ trial_ends_at: cliente.trial_ends_at } as any).eq("id", clienteId);
                           if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
                           else toast({ title: "Data salva!" });
                         }}
                      >
                         Salvar Data
                      </Button>
                   </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end sm:gap-3">
                 <Button
                    className="gradient-primary text-white text-[10px] font-black uppercase tracking-widest h-9 sm:h-10 px-4 sm:px-6 rounded-xl shadow-lg flex items-center gap-2"
                    onClick={() => handleAcessarPortal(cliente)}
                  >
                    <Zap className="w-3.5 h-3.5" /> Portal
                  </Button>
                 <StatusBadge status={cliente.status} />
               </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Tabs defaultValue="cadastro" className="space-y-4">
          <TabsList className="glass-card border-[0.5px] bg-transparent p-1 gap-1">
            <TabsTrigger value="cadastro" className="data-[state=active]:gradient-primary data-[state=active]:text-white text-[hsl(var(--muted-foreground))] text-xs gap-1.5">
              <Users className="w-3.5 h-3.5" /> Cadastro
            </TabsTrigger>
            <TabsTrigger value="extras" className="data-[state=active]:gradient-primary data-[state=active]:text-white text-[hsl(var(--muted-foreground))] text-xs gap-1.5">
              <Package className="w-3.5 h-3.5" /> Extras ({extras.length})
            </TabsTrigger>
            <TabsTrigger value="briefing" className="data-[state=active]:gradient-primary data-[state=active]:text-white text-[hsl(var(--muted-foreground))] text-xs gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Dados do site
            </TabsTrigger>
            <TabsTrigger value="financeiro" className="data-[state=active]:gradient-primary data-[state=active]:text-white text-[hsl(var(--muted-foreground))] text-xs gap-1.5">
              <DollarSign className="w-3.5 h-3.5" /> Financeiro
            </TabsTrigger>
            <TabsTrigger value="projetos" className="data-[state=active]:gradient-primary data-[state=active]:text-white text-[hsl(var(--muted-foreground))] text-xs">Projetos ({projetos.length})</TabsTrigger>
            <TabsTrigger value="notas" className="data-[state=active]:gradient-primary data-[state=active]:text-white text-[hsl(var(--muted-foreground))] text-xs gap-1.5">
              <StickyNote className="w-3.5 h-3.5" /> Notas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cadastro" className="space-y-6">
            <Card className="glass-card border-[0.5px]">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-white uppercase tracking-widest">Ficha Completa do Cliente</CardTitle>
                <CardDescription className="text-xs text-white/40">
                  Tudo que você preencher aqui também pode ser atualizado pelo cliente em Meus Dados.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {CLIENT_REGISTRATION_FIELDS.map((field) => (
                    <div key={field.key} className="space-y-1.5">
                      <Label className="text-[10px] text-white/30 uppercase font-black">{field.label}</Label>
                      <Input
                        className="glass-input h-10"
                        value={(cliente as any)[field.key] || ""}
                        onChange={(e) =>
                          setCliente({
                            ...cliente,
                            [field.key]: formatClientFieldValue(field.key, e.target.value),
                          })
                        }
                        onBlur={(e) => {
                          if (field.key === "email") {
                            setCliente({
                              ...cliente,
                              [field.key]: normalizeEmailSuggestion(e.target.value),
                            });
                          }
                        }}
                      />
                      {getClientFieldHelperText(field.key, (cliente as any)[field.key] || "") && (
                        <p className="text-[10px] text-white/25">
                          {getClientFieldHelperText(field.key, (cliente as any)[field.key] || "")}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {CLIENT_ADDRESS_FIELDS.map((field) => (
                    <div key={field.key} className={`space-y-1.5 ${field.fullWidth ? "md:col-span-2" : ""}`}>
                      <Label className="text-[10px] text-white/30 uppercase font-black">{field.label}</Label>
                      <Input
                        className="glass-input h-10"
                        value={(cliente as any)[field.key] || ""}
                        onChange={(e) =>
                          setCliente({
                            ...cliente,
                            [field.key]: formatClientFieldValue(field.key, e.target.value),
                          })
                        }
                        onBlur={(e) => {
                          if (field.key === "cep") {
                            void handleClientCepLookup(e.target.value);
                          }
                        }}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex justify-end">
                  <Button
                    className="gradient-primary h-10 text-xs"
                    onClick={async () => {
                      const payload = {
                        nome: cliente.nome,
                        nome_empresa: cliente.nome_empresa || null,
                        email: cliente.email?.trim().toLowerCase(),
                        whatsapp: cliente.whatsapp || null,
                        telefone: cliente.telefone || null,
                        documento: cliente.documento || null,
                        instagram: cliente.instagram || null,
                        site_url: cliente.site_url || null,
                        cep: cliente.cep || null,
                        endereco: cliente.endereco || null,
                        numero_endereco: cliente.numero_endereco || null,
                        complemento: cliente.complemento || null,
                        bairro: cliente.bairro || null,
                        cidade: cliente.cidade || null,
                        estado: cliente.estado || null,
                      };

                      const { error } = await supabase.from("clientes").update(payload as any).eq("id", clienteId);
                      if (error) {
                        toast({ title: "Erro ao salvar cadastro", description: error.message, variant: "destructive" });
                        return;
                      }

                      toast({ title: "Cadastro atualizado!", description: "Os dados do cliente foram sincronizados." });
                      loadData();
                    }}
                  >
                    Salvar Cadastro
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="briefing" className="space-y-6">
            <Card className="glass-card border-[0.5px]">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-white uppercase tracking-widest">Briefing operacional do site</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-sm font-semibold text-white">Esse cliente agora usa o módulo central de briefing por cliente.</p>
                  <p className="mt-2 text-xs leading-relaxed text-white/50">
                    Monte o briefing em construção aos poucos, escolha perguntas prontas, adicione perguntas customizadas e só envie tudo quando o pacote estiver fechado para o cliente.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    className="gradient-primary h-10 text-xs"
                    onClick={() => {
                      window.location.href = `/admin/briefings?cliente=${clienteId}`;
                    }}
                  >
                    Abrir módulo de briefing
                  </Button>
                  <Button
                    variant="outline"
                    className="h-10 text-xs border-white/10"
                    onClick={() => {
                      window.location.href = "/admin/projetos";
                    }}
                  >
                    Ver projetos do cliente
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financeiro" className="space-y-4">
             <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                   <DollarSign className="w-4 h-4 text-emerald-400" /> Histórico Financeiro
                </h3>
                <Button 
                  className="gradient-primary text-white text-[10px] font-black uppercase tracking-widest h-9 px-6 rounded-xl shadow-lg"
                  onClick={async () => {
                    const code = `PED-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
                    const { error } = await supabase.from("pedidos").insert({
                      codigo: code,
                      cliente_id: clienteId,
                      tipo: cliente.projeto_titulo || "Serviço Avulso",
                      valor: Number(cliente.projeto_valor || 0),
                      status: "pendente",
                      data: new Date().toISOString().split("T")[0]
                    });
                    if (!error) { toast({ title: "Fatura Gerada!" }); loadData(); }
                  }}
                >
                   <Plus className="w-3 h-3 mr-2" /> Gerar Cobrança
                </Button>
             </div>

             <div className="rounded-xl border border-white/5 overflow-hidden">
                <Table>
                   <TableHeader className="bg-white/5">
                      <TableRow className="border-white/5">
                         <TableHead className="text-[10px] text-white/50 uppercase font-black">Descrição</TableHead>
                         <TableHead className="text-[10px] text-white/50 uppercase font-black text-right">Valor</TableHead>
                         <TableHead className="text-[10px] text-white/50 uppercase font-black text-center">Data</TableHead>
                         <TableHead className="text-[10px] text-white/50 uppercase font-black text-center">Status</TableHead>
                         <TableHead className="text-[10px] text-white/50 uppercase font-black text-right">Ações</TableHead>
                      </TableRow>
                   </TableHeader>
                   <TableBody className="bg-white/[0.02]">
                      {pedidos.length === 0 ? (
                         <TableRow><TableCell colSpan={5} className="text-center py-10 text-xs text-white/20 italic">Sem faturas.</TableCell></TableRow>
                      ) : pedidos.map((p: any) => (
                         <TableRow key={p.id} className="border-white/5 hover:bg-white/[0.02] transition-colors">
                            <TableCell className="py-4">
                               <p className="text-xs font-bold text-white">{p.tipo || "Cobrança"}</p>
                               <span className="text-[9px] text-white/30 font-mono uppercase tracking-tighter">{p.codigo}</span>
                            </TableCell>
                            <TableCell className="text-xs text-white/70 font-bold text-right">
                               {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.valor || 0)}
                            </TableCell>
                            <TableCell className="text-[10px] text-white/40 text-center">
                               {p.data ? new Date(p.data).toLocaleDateString() : "—"}
                            </TableCell>
                            <TableCell className="text-center"><StatusBadge status={p.status} /></TableCell>
                            <TableCell>
                               <div className="flex items-center justify-end gap-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className={`h-7 px-3 text-[9px] font-black uppercase rounded-lg border-white/10 ${p.status === 'pago' ? 'text-amber-400 hover:bg-amber-400/10' : 'text-emerald-400 hover:bg-emerald-400/10'}`}
                                    onClick={async () => {
                                       const next = p.status === "pago" ? "pendente" : "pago";
                                       const { error } = await supabase.from("pedidos").update({ status: next }).eq("id", p.id);
                                       if (!error) { toast({ title: "Status Alterado!" }); loadData(); }
                                    }}
                                  >
                                     {p.status === "pago" ? "Marcar Pendente" : "Marcar Pago"}
                                  </Button>
                                  <Dialog>
                                     <DialogTrigger asChild>
                                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-white/20 hover:text-white hover:bg-white/5 rounded-lg">
                                           <Pencil className="w-3 h-3" />
                                        </Button>
                                     </DialogTrigger>
                                     <DialogContent className="glass-card border-white/10 text-white max-w-sm">
                                        <DialogHeader><DialogTitle className="text-white text-sm">Editar Valor</DialogTitle></DialogHeader>
                                        <div className="space-y-4 mt-4">
                                           <div className="space-y-1.5">
                                              <Label className="text-[10px] text-white/50 uppercase">Valor (R$)</Label>
                                              <Input 
                                                type="number" 
                                                className="glass-input h-10" 
                                                defaultValue={p.valor}
                                                onBlur={async (e) => {
                                                   const val = Number(e.target.value);
                                                   if (val === p.valor) return;
                                                   const { error } = await supabase.from("pedidos").update({ valor: val }).eq("id", p.id);
                                                   if (!error) { toast({ title: "Valor Atualizado!" }); loadData(); }
                                                }}
                                              />
                                           </div>
                                        </div>
                                     </DialogContent>
                                  </Dialog>
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="h-7 w-7 p-0 text-red-500/20 hover:text-red-500 hover:bg-red-500/10 rounded-lg"
                                    onClick={() => {
                                       requestDelete(async () => {
                                         const { error } = await supabase.from("pedidos").delete().eq("id", p.id);
                                         if (!error) { toast({ title: "Fatura Excluída!" }); loadData(); }
                                       }, "Excluir Fatura", "Esta fatura será removida permanentemente.");
                                    }}
                                  >
                                     <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                               </div>
                            </TableCell>
                         </TableRow>
                      ))}
                   </TableBody>
                </Table>
             </div>
          </TabsContent>

          <TabsContent value="extras" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
               <Card className="glass-card bg-blue-500/[0.05] border-blue-500/10">
                  <CardContent className="p-4 flex items-center justify-between">
                     <div>
                        <p className="text-[10px] text-blue-400 uppercase font-black">Recorrência Mensal</p>
                        <p className="text-xl font-black text-white">R$ {totalMensal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                     </div>
                     <RefreshCw className="w-8 h-8 text-blue-500/20" />
                  </CardContent>
               </Card>
               <Card className="glass-card bg-emerald-500/[0.05] border-emerald-500/10">
                  <CardContent className="p-4 flex items-center justify-between">
                     <div>
                        <p className="text-[10px] text-emerald-400 uppercase font-black">Total Ativações</p>
                        <p className="text-xl font-black text-white">R$ {totalAtivacoes.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                     </div>
                     <DollarSign className="w-8 h-8 text-emerald-500/20" />
                  </CardContent>
               </Card>
            </div>
            <div className="flex justify-end">
              <Button className="gradient-primary h-9 text-xs" onClick={() => setShowAddExtra(true)}>
                <Plus className="w-3.5 h-3.5 mr-2" /> Adicionar Extra
              </Button>
            </div>

            {extras.length === 0 ? (
              <div className="text-center py-10 text-xs text-white/20 italic">Nenhum extra vinculado a este cliente.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {extras.map((e: any) => {
                  const isRecorrente = Number(e.preco_mensal) > 0;
                  const statusConfig: any = {
                    pendente: { color: "text-amber-400 bg-amber-400/10 border-amber-400/20", label: "Pendente" },
                    faturado: { color: "text-blue-400 bg-blue-400/10 border-blue-400/20", label: "Faturado" },
                    pago: { color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", label: "Pago" },
                    ativo: { color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", label: "Ativo" },
                    cancelado: { color: "text-red-400 bg-red-400/10 border-red-400/20", label: "Cancelado" },
                  };
                  const sc = statusConfig[e.status] || statusConfig.pendente;

                  return (
                     <Card key={e.id} className="glass-card border-[0.5px] overflow-hidden">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-white truncate">{e.extras_catalogo?.nome || "Extra"}</p>
                            {e.extras_catalogo?.descricao && (
                              <p className="text-[10px] text-white/40 mt-0.5 line-clamp-2">{e.extras_catalogo.descricao}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <Badge variant="outline" className={`${sc.color} text-[9px] uppercase border-[0.5px]`}>
                              {sc.label}
                            </Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-red-500/30 hover:text-red-500 hover:bg-red-500/10 rounded-lg"
                              onClick={() => {
                                requestDelete(async () => {
                                  const { error } = await supabase.from("extras_clientes").delete().eq("id", e.id);
                                  if (error) {
                                    toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
                                  } else {
                                    toast({ title: "Extra removido do cliente!" });
                                    loadData();
                                  }
                                }, "Remover Extra", `O extra "${e.extras_catalogo?.nome || 'Extra'}" será removido deste cliente.`);
                              }}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
                          <Badge variant="outline" className={`text-[9px] uppercase border-[0.5px] ${isRecorrente ? 'text-blue-400 bg-blue-400/10 border-blue-400/20' : 'text-purple-400 bg-purple-400/10 border-purple-400/20'}`}>
                            {isRecorrente ? "Recorrente" : "Avulso"}
                          </Badge>
                          {Number(e.preco_ativacao) > 0 && (
                            <span className="text-[10px] text-white/50">
                              Ativação: <span className="text-white font-bold">R$ {Number(e.preco_ativacao).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                            </span>
                          )}
                          {isRecorrente && (
                            <span className="text-[10px] text-white/50">
                              Mensal: <span className="text-white font-bold">R$ {Number(e.preco_mensal).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                            </span>
                          )}
                        </div>

                        {e.observacao && (
                          <p className="text-[10px] text-white/30 italic border-t border-white/5 pt-2">{e.observacao}</p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="projetos">
               <div className="rounded-xl border border-white/5 overflow-hidden">
                <Table>
                  <TableHeader className="bg-white/5"><TableRow className="border-white/5">{["Projeto", "Status"].map(h => (<TableHead key={h} className="text-[10px] text-white/50 uppercase font-black">{h}</TableHead>))}</TableRow></TableHeader>
                  <TableBody className="bg-white/[0.02]">
                    {projetos.length === 0 ? (<TableRow><TableCell colSpan={2} className="text-center py-10 text-xs text-white/20 italic">Sem projetos.</TableCell></TableRow>) : projetos.map((p: any) => (
                      <TableRow key={p.id} className="border-white/5">
                        <TableCell className="py-3 text-xs font-bold text-white">{p.titulo}</TableCell>
                        <TableCell><StatusBadge status={p.status} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
               </div>
          </TabsContent>

          <TabsContent value="notas">
            <Card className="glass-card border-[0.5px]">
              <CardContent className="p-5">
                <InternalNotes entityType="cliente" entityId={clienteId} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      <Dialog open={showAddExtra} onOpenChange={setShowAddExtra}>
        <DialogContent className="glass-card border-[0.5px] text-white max-w-md">
          <DialogHeader><DialogTitle className="text-white">Vincular Novo Recurso</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-white/50">Cátalogo de Serviços</Label>
              <select
                className="w-full h-10 rounded-xl glass-input border border-white/10 text-white text-xs px-3 bg-transparent outline-none focus:border-primary/50 transition-colors"
                value={extraSelecionado}
                onChange={(e) => setExtraSelecionado(e.target.value)}
              >
                <option value="" className="bg-[#0f1117]">Selecione um item...</option>
                {extrasDisponiveis.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#0f1117]">
                    {c.nome} — {catLabels[c.categoria] || c.categoria}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-white/50">Notas Adicionais</Label>
              <Textarea
                className="glass-input border-white/10 text-white text-xs min-h-[80px]"
                placeholder="Ex: Condições especiais, descontos..."
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
              />
            </div>
            <Button
              className="gradient-primary text-white w-full rounded-xl h-11 font-black uppercase tracking-widest text-xs"
              onClick={handleAddExtra}
              disabled={!extraSelecionado || savingExtra}
            >
              {savingExtra ? "Processando..." : "Ativar Recurso"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <DeleteConfirmDialog {...dialogProps} />
    </motion.div>
  );
}

export default function Clientes() {
  const { toast } = useToast();
  const { requestDelete, dialogProps } = useDeleteConfirm();
  const location = useLocation();
  const navigate = useNavigate();
  const [clientes, setClientes] = useState<any[]>([]);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  
  const { id: routeId } = useParams<{ id: string }>();
  const selectedCliente = routeId || null;
  const setSelectedCliente = useCallback((newId: string | null) => {
    if (newId) navigate(`/admin/clientes/${newId}`);
    else navigate('/admin/clientes');
  }, [navigate]);

  useEffect(() => {
    if (location.state?.selectedId) {
      setSelectedCliente(location.state.selectedId);
    }
  }, [location.state, setSelectedCliente]);
  
  const {
    state: newClientDraft,
    setState: setNewClientDraft,
    markSaved: markNewClientDraftSaved,
    discardDraft: discardNewClientDraft,
  } = usePersistentDraftState({
    storageKey: "novaesweb:admin:clientes:new-client-draft",
    initialState: INITIAL_NEW_CLIENT_DRAFT,
  });
  const [contaCriada, setContaCriada] = useState<{ email: string; senha: string; link: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const showNew = newClientDraft.showNew;
  const criarConta = newClientDraft.criarConta;
  const senhaCliente = newClientDraft.senhaCliente;
  const form = newClientDraft.form;

  const setShowNew = useCallback((value: boolean) => {
    setNewClientDraft((current) => ({
      ...current,
      showNew: value,
    }));
  }, [setNewClientDraft]);

  const setCriarConta = useCallback((value: boolean) => {
    setNewClientDraft((current) => ({
      ...current,
      criarConta: value,
    }));
  }, [setNewClientDraft]);

  const setSenhaCliente = useCallback((value: string) => {
    setNewClientDraft((current) => ({
      ...current,
      senhaCliente: value,
    }));
  }, [setNewClientDraft]);

  const setForm = useCallback((value: typeof INITIAL_CLIENT_FORM | ((current: typeof INITIAL_CLIENT_FORM) => typeof INITIAL_CLIENT_FORM)) => {
    setNewClientDraft((current) => ({
      ...current,
      form: typeof value === "function" ? value(current.form) : value,
    }));
  }, [setNewClientDraft]);

  const updateFormField = (key: string, value: string) => {
    setForm((current) => ({
      ...current,
      [key]: formatClientFieldValue(key, value),
    }));
  };

  const handleFormEmailBlur = (value: string) => {
    setForm((current) => ({
      ...current,
      email: normalizeEmailSuggestion(value),
    }));
  };

  const handleFormCepLookup = async (value: string) => {
    const normalizedCep = formatCep(value);

    setForm((current) => ({
      ...current,
      cep: normalizedCep,
    }));

    try {
      const address = await fetchAddressByCep(normalizedCep);
      if (!address) return;

      setForm((current) => ({
        ...current,
        cep: normalizedCep,
        endereco: address.endereco || current.endereco,
        bairro: address.bairro || current.bairro,
        cidade: address.cidade || current.cidade,
        estado: address.estado || current.estado,
        complemento: current.complemento || address.complemento || "",
      }));

      toast({
        title: "CEP localizado",
        description: "Endereço preenchido automaticamente para acelerar o cadastro.",
      });
    } catch (error: any) {
      toast({
        title: "Não foi possível buscar o CEP",
        description: error?.message || "Tente novamente em instantes.",
        variant: "destructive",
      });
    }
  };

  const fetchClientes = useCallback(async () => {
    const { data } = await supabase.from("clientes").select("*").order("created_at", { ascending: false });
    if (data) setClientes(data);
  }, []);

  useEffect(() => { fetchClientes(); }, [fetchClientes]);

  useRealtimeRefresh(
    [{ table: "clientes" }],
    fetchClientes,
    { channelPrefix: "admin-clientes-lista" },
  );

  const handleToggleNewDialog = useCallback((open: boolean) => {
    if (!open) {
      discardNewClientDraft({ ...INITIAL_NEW_CLIENT_DRAFT });
      return;
    }

    setShowNew(true);
  }, [discardNewClientDraft, setShowNew]);

  if (selectedCliente) {
    return <ClienteDetalhes clienteId={selectedCliente} onBack={() => setSelectedCliente(null)} />;
  }

  const filtrados = clientes.filter((c) => {
    const matchBusca = c.nome.toLowerCase().includes(busca.toLowerCase()) || c.email.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = filtroStatus === "todos" || c.status === filtroStatus;
    return matchBusca && matchStatus;
  });

  const handleSave = async () => {
    if (!form.nome || !form.email) {
      toast({ title: "Preencha nome e e-mail", variant: "destructive" });
      return;
    }

    if (criarConta && senhaCliente.length < 6) {
      toast({ title: "Defina uma senha inicial segura", description: "Para liberar o portal, a senha precisa ter pelo menos 6 caracteres.", variant: "destructive" });
      return;
    }

    setSaving(true);
    const avatar = form.nome.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
    const normalizedEmail = form.email.trim().toLowerCase();
    let authUserId: string | null = null;

      if (criarConta) {
        try {
          const accountData = await invokeAdminFunction<{ user?: { id?: string } }>("create-account", {
            body: {
              email: normalizedEmail,
              password: senhaCliente,
              nome: form.nome,
              tipo: "cliente",
            },
            returnTo: "/admin/clientes",
            source: "clientes-create-account",
            fallbackMessage: "Não foi possível criar a conta segura do cliente.",
          });

          if (!accountData?.user?.id) {
            throw new Error("Não foi possível criar a conta segura do cliente.");
          }

          authUserId = accountData.user.id;
        } catch (error) {
          toast({
            title: "Erro ao provisionar acesso",
            description: error instanceof Error ? error.message : "Não foi possível criar a conta segura do cliente.",
            variant: "destructive"
          });
          setSaving(false);
          return;
        }
    }
    
    // 1. Inserir Cliente
    const { data: novoCliente, error } = await supabase.from("clientes").insert({ 
      nome: form.nome,
      nome_empresa: form.nome_empresa || null,
      email: normalizedEmail,
      whatsapp: form.whatsapp || null,
      telefone: form.telefone || null,
      documento: form.documento || null,
      instagram: form.instagram || null,
      endereco: form.endereco || null,
      numero_endereco: form.numero_endereco || null,
      complemento: form.complemento || null,
      bairro: form.bairro || null,
      cep: form.cep || null,
      cidade: form.cidade || null,
      estado: form.estado || null,
      status: form.status,
      site_url: form.site_url || null,
      avatar,
      auth_user_id: authUserId,
      senha: null
    } as any).select().single();

    if (error) { toast({ title: "Erro ao criar cliente", description: error.message, variant: "destructive" }); setSaving(false); return; }
 
    // 2. Se houver dados de onboarding, criar Pedido + Financeiro
    const valor = Number(form.projeto_valor) || 0;
    const pedidoInicialTitulo = form.projeto_titulo.trim() || "Pedido Inicial";
    const pedidoInicialTipo = form.projeto_tipo || "site";
    const deveCriarOnboarding = Boolean(form.projeto_titulo.trim() || valor > 0);
    const dataLancamento = new Date().toISOString().split("T")[0];

    if (deveCriarOnboarding) {
      const codigoPed = `PED-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

      // Criar Pedido
      const { error: pedidoError } = await supabase.from("pedidos").insert({
        cliente_id: novoCliente.id,
        codigo: codigoPed,
        tipo: pedidoInicialTipo,
        titulo: pedidoInicialTitulo,
        descricao: `Pedido inicial criado no cadastro do cliente ${form.nome}.`,
        observacoes: null,
        valor,
        status: "pendente",
        data: dataLancamento
      });

      if (pedidoError) {
        toast({ title: "Erro ao criar pedido inicial", description: pedidoError.message, variant: "destructive" });
        setSaving(false);
        return;
      }

      // Lançar no Financeiro
      if (form.gerar_fatura && valor > 0) {
        const { error: financeiroError } = await supabase.from("financeiro").insert({
          cliente_id: novoCliente.id,
          tipo: "entrada",
          valor,
          descricao: `Pedido Inicial: ${pedidoInicialTitulo} (${codigoPed})`,
          data: dataLancamento,
          vencimento: dataLancamento,
          status: "pendente",
        });

        if (financeiroError) {
          toast({ title: "Erro ao lançar no financeiro", description: financeiroError.message, variant: "destructive" });
          setSaving(false);
          return;
        }
      }
    }

    if (criarConta && senhaCliente.length >= 6) {
      const link = `${window.location.origin}/cliente/login`;
      setContaCriada({ email: normalizedEmail, senha: senhaCliente, link });
    }

    toast({
      title: deveCriarOnboarding ? "Onboarding Concluído!" : "Cliente criado com sucesso!",
      description: deveCriarOnboarding
        ? form.gerar_fatura && valor > 0
          ? "Cliente, pedido e financeiro configurados."
          : "Cliente e pedido configurados."
        : "Cadastro realizado sem pedido inicial.",
    });

    await notifyAdminPanel({
      title: deveCriarOnboarding ? "🚀 Novo onboarding criado" : "👤 Novo cliente cadastrado",
      body: deveCriarOnboarding ? `${form.nome} entrou com pedido inicial ${pedidoInicialTitulo}.` : `${form.nome} foi adicionado ao painel.`,
      url: deveCriarOnboarding ? "/admin/pedidos" : "/admin/clientes",
      push: true,
    });
    await notifyClientPanel(novoCliente.id, {
      title: "Seu portal NovaesWeb foi liberado",
      body: deveCriarOnboarding
        ? form.gerar_fatura && valor > 0
          ? "Seu acesso está ativo com pedido inicial e cobrança disponível no portal."
          : "Seu acesso está ativo com pedido inicial configurado no portal."
        : "Seu acesso está ativo. Você já pode acompanhar contratos, projetos e financeiro.",
      url: form.gerar_fatura && valor > 0 ? "/cliente/faturas" : "/cliente/dashboard",
    });
    markNewClientDraftSaved({ ...INITIAL_NEW_CLIENT_DRAFT });
    setSaving(false);
    fetchClientes();
  };

  const handleAcessarPortal = (cliente: any) => {
    persistClientProfile(sanitizeClientProfile(cliente));
    window.open("/cliente/dashboard", "_blank");
    toast({ title: "Modo Espelhamento", description: `Acessando portal como ${cliente.nome}` });
  };

  const handleDeleteCliente = (id: string) => {
    requestDelete(async () => {
      try {
        const data = await invokeAdminFunction<{ message?: string }>("delete-client-account", {
          body: { clientId: id },
          returnTo: "/admin/clientes",
          source: "clientes-delete",
          fallbackMessage: "Não foi possível remover o cliente e o acesso do portal.",
        });

        toast({
          title: "Cliente excluído com sucesso!",
          description: data?.message || "Projeto, pedidos e acesso do portal foram removidos. Dívidas em aberto permanecem no financeiro.",
        });
        fetchClientes();
      } catch (error) {
        toast({
          title: "Erro ao excluir",
          description: error instanceof Error ? error.message : "Não foi possível remover o cliente e o acesso do portal.",
          variant: "destructive"
        });
      }
    }, "Excluir Cliente", "Projeto, pedidos, painel e dados operacionais serão removidos. Só permanecem lançamentos em aberto no financeiro, caso existam.");
  };

  return (
    <motion.div className="space-y-6" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }}>
      <motion.div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" variants={fadeUp}>
        <div />
        <div className="flex flex-wrap gap-2">
          <Dialog open={showNew} onOpenChange={handleToggleNewDialog}>
            <DialogTrigger asChild>
              <Button className="gradient-primary border-0 text-white rounded-lg"><Plus className="w-4 h-4 mr-2" /> Novo Cliente</Button>
            </DialogTrigger>
          <DialogContent className="glass-card border-[0.5px] text-white max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="text-white">Novo Cliente</DialogTitle></DialogHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              {CLIENT_REGISTRATION_FIELDS.map((field) => (
                <div key={field.key} className="space-y-1">
                  <Label className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase">{field.label}</Label>
                  <Input
                    className="glass-input border-[rgba(255,255,255,0.1)] text-white text-sm h-9"
                    value={(form as any)[field.key]}
                    onChange={(e) => updateFormField(field.key, e.target.value)}
                    onBlur={(e) => {
                      if (field.key === "email") {
                        handleFormEmailBlur(e.target.value);
                      }
                    }}
                  />
                  {getClientFieldHelperText(field.key, (form as any)[field.key] || "") && (
                    <p className="text-[10px] text-white/25">
                      {getClientFieldHelperText(field.key, (form as any)[field.key] || "")}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              {CLIENT_ADDRESS_FIELDS.map((field) => (
                <div key={field.key} className={`space-y-1 ${field.fullWidth ? "sm:col-span-2" : ""}`}>
                  <Label className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase">{field.label}</Label>
                  <Input
                    className="glass-input border-[rgba(255,255,255,0.1)] text-white text-sm h-9"
                    value={(form as any)[field.key]}
                    onChange={(e) => updateFormField(field.key, e.target.value)}
                    onBlur={(e) => {
                      if (field.key === "cep") {
                        void handleFormCepLookup(e.target.value);
                      }
                    }}
                  />
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 rounded-xl bg-primary/5 border border-primary/20 space-y-3">
               <div className="flex items-center gap-2">
                 <Sparkles className="w-4 h-4 text-primary" />
                 <h3 className="text-[10px] font-black text-white uppercase tracking-wider">🚀 Pedido Inicial</h3>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                 <div className="space-y-1">
                   <Label className="text-[10px] text-white/50 uppercase font-bold">Título do Pedido</Label>
                   <Input className="glass-input h-9 text-xs" placeholder="Ex: Landing Page Premium" value={form.projeto_titulo} onChange={e => setForm({...form, projeto_titulo: e.target.value})} />
                 </div>
                 <div className="space-y-1">
                   <Label className="text-[10px] text-white/50 uppercase font-bold">Serviço Inicial</Label>
                   <Select value={form.projeto_tipo} onValueChange={(value) => setForm({ ...form, projeto_tipo: value })}>
                     <SelectTrigger className="glass-input h-9 text-xs">
                       <SelectValue placeholder="Selecione o serviço" />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="site">Site</SelectItem>
                       <SelectItem value="sistema">Sistema</SelectItem>
                       <SelectItem value="landing_page">Landing Page</SelectItem>
                       <SelectItem value="ecommerce">E-commerce</SelectItem>
                       <SelectItem value="manutencao">Manutenção</SelectItem>
                       <SelectItem value="outro">Outro</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>
                 <div className="space-y-1">
                   <Label className="text-[10px] text-white/50 uppercase font-bold">Valor (R$)</Label>
                   <Input type="number" className="glass-input h-9 text-xs" placeholder="0.00" value={form.projeto_valor} onChange={e => setForm({...form, projeto_valor: e.target.value})} />
                 </div>
               </div>
               <div className="flex items-center gap-2">
                 <input type="checkbox" id="gf" checked={form.gerar_fatura} onChange={e => setForm({...form, gerar_fatura: e.target.checked})} className="rounded accent-primary" />
                 <Label htmlFor="gf" className="text-[10px] text-white/60 cursor-pointer">Lançar financeiro pendente junto com o pedido</Label>
               </div>
            </div>

            <div className="mt-3 p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="cc" checked={criarConta} onChange={e => setCriarConta(e.target.checked)} className="rounded" />
                <Label htmlFor="cc" className="text-xs text-white cursor-pointer">Liberar acesso ao Painel</Label>
              </div>
              {criarConta && (
                <div className="space-y-1">
                  <Label className="text-[10px] text-[hsl(var(--muted-foreground))]">Senha (mín. 6 caracteres)</Label>
                  <Input type="text" className="glass-input border-[rgba(255,255,255,0.1)] text-white text-sm h-9"
                    value={senhaCliente} onChange={e => setSenhaCliente(e.target.value)} placeholder="Senha do cliente" />
                </div>
              )}
            </div>

            <Button className="gradient-primary border-0 text-white w-full mt-3 rounded-lg" onClick={handleSave} disabled={saving}>
              {saving ? "Salvando..." : "Salvar Cliente"}
            </Button>
          </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card className="glass-card border-[0.5px]">
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                <Input placeholder="Buscar por nome ou e-mail..." className="pl-9 glass-input border-0 text-white text-sm" value={busca} onChange={(e) => setBusca(e.target.value)} />
              </div>
              <div className="flex gap-2">
                {["todos", "ativo", "inativo"].map((s) => (
                  <Button key={s} size="sm"
                    className={filtroStatus === s ? "gradient-primary border-0 text-white" : "glass-input border-0 text-[hsl(var(--muted-foreground))] hover:text-white"}
                    onClick={() => setFiltroStatus(s)}>
                    {s === "todos" ? "Todos" : s === "ativo" ? "Ativos" : "Inativos"}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Mobile: Cards */}
            <div className="block sm:hidden space-y-3">
              {filtrados.length === 0 ? (
                <p className="text-center text-sm text-[hsl(var(--muted-foreground))] py-8">Nenhum cliente encontrado</p>
              ) : filtrados.map((c) => {
                const avatar = c.avatar || c.nome?.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
                return (
                  <div key={c.id} className="p-3 rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] space-y-2" onClick={() => setSelectedCliente(c.id)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center shrink-0">
                          <span className="text-white text-[10px] font-bold">{avatar}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white truncate">{c.nome}</p>
                          <p className="text-[10px] text-[hsl(var(--muted-foreground))] truncate">{c.email}</p>
                        </div>
                      </div>
                      <StatusBadge status={c.status} />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-[hsl(var(--muted-foreground))]">
                      <span>{c.whatsapp || c.telefone || "—"}</span>
                      <span>{c.cidade ? `${c.cidade}, ${c.estado}` : "—"}</span>
                    </div>
                    <div className="flex gap-2 pt-1 border-t border-[rgba(255,255,255,0.05)]">
                      <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10 text-[10px] h-7 flex-1"
                        onClick={(e) => { e.stopPropagation(); handleAcessarPortal(c); }}>
                        <Zap className="w-3 h-3 mr-1" /> Portal
                      </Button>
                      <Button variant="ghost" size="sm" className="text-white/50 hover:text-white text-[10px] h-7 flex-1"
                        onClick={(e) => { e.stopPropagation(); setSelectedCliente(c.id); }}>
                        Ver
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-400/50 hover:text-red-400 h-7 w-7 p-0"
                        onClick={(e) => { e.stopPropagation(); handleDeleteCliente(c.id); }}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop: Table */}
            <div className="hidden sm:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-[rgba(255,255,255,0.06)]">
                    {["Cliente", "E-mail", "WhatsApp", "Cidade", "Status", "Ações"].map(h => (
                      <TableHead key={h} className="text-[11px] text-[hsl(var(--muted-foreground))]">{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtrados.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center text-sm text-[hsl(var(--muted-foreground))] py-8">Nenhum cliente encontrado</TableCell></TableRow>
                  ) : filtrados.map((c) => {
                    const avatar = c.avatar || c.nome?.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
                    return (
                      <TableRow key={c.id} className="border-[rgba(255,255,255,0.04)] cursor-pointer hover:bg-[rgba(255,255,255,0.02)]">
                        <TableCell onClick={() => setSelectedCliente(c.id)}>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center shrink-0">
                              <span className="text-white text-[10px] font-bold">{avatar}</span>
                            </div>
                            <span className="text-sm font-medium text-white">{c.nome}</span>
                          </div>
                        </TableCell>
                        <TableCell onClick={() => setSelectedCliente(c.id)} className="text-sm text-[hsl(var(--muted-foreground))]">{c.email}</TableCell>
                        <TableCell onClick={() => setSelectedCliente(c.id)} className="text-sm text-[hsl(var(--muted-foreground))]">{c.whatsapp || c.telefone || "—"}</TableCell>
                        <TableCell onClick={() => setSelectedCliente(c.id)} className="text-sm text-[hsl(var(--muted-foreground))]">{c.cidade}, {c.estado}</TableCell>
                        <TableCell onClick={() => setSelectedCliente(c.id)}><StatusBadge status={c.status} /></TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10 text-xs gap-1"
                              onClick={(e) => { e.stopPropagation(); handleAcessarPortal(c); }}>
                              <Zap className="w-3 h-3" /> Portal
                            </Button>
                            <Button variant="ghost" size="sm" className="text-white/50 hover:text-white text-xs"
                              onClick={(e) => { e.stopPropagation(); setSelectedCliente(c.id); }}>
                              Ver
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-400/50 hover:text-red-400 h-8 w-8 p-0"
                              onClick={(e) => { e.stopPropagation(); handleDeleteCliente(c.id); }}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Dialog Conta Criada */}
      <Dialog open={!!contaCriada} onOpenChange={() => setContaCriada(null)}>
        <DialogContent className="glass-card border-[0.5px] text-white max-w-md">
          <DialogHeader><DialogTitle className="text-white flex items-center gap-2"><UserPlus className="w-5 h-5" /> Conta criada com sucesso!</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <p className="text-xs text-[hsl(var(--muted-foreground))]">Compartilhe os dados abaixo com o cliente para que ele acesse o portal:</p>
            <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] space-y-3">
              <div>
                <p className="text-[10px] text-[hsl(var(--muted-foreground))]">Link do Portal</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-white font-mono flex-1">{contaCriada?.link}</p>
                  <Button size="sm" variant="ghost" className="text-white/50 h-7" onClick={() => { navigator.clipboard.writeText(contaCriada?.link || ""); toast({ title: "Link copiado!" }); }}>
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <div>
                <p className="text-[10px] text-[hsl(var(--muted-foreground))]">E-mail</p>
                <p className="text-sm text-white">{contaCriada?.email}</p>
              </div>
              <div>
                <p className="text-[10px] text-[hsl(var(--muted-foreground))]">Senha</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-white font-mono">{contaCriada?.senha}</p>
                  <Button size="sm" variant="ghost" className="text-white/50 h-7" onClick={() => { navigator.clipboard.writeText(contaCriada?.senha || ""); toast({ title: "Senha copiada!" }); }}>
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
            <Button className="gradient-primary border-0 text-white w-full" onClick={() => setContaCriada(null)}>Entendi</Button>
          </div>
        </DialogContent>
      </Dialog>
      <DeleteConfirmDialog {...dialogProps} />
    </motion.div>
  );
}



