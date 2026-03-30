import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Search, Plus, Zap, Star, CalendarDays, Pencil, UserPlus, Package, DollarSign, TrendingUp, Trash2, Rocket, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

type CategoriaExtra = "fixo" | "intermediario" | "mensal";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const stagger = { show: { transition: { staggerChildren: 0.06 } } };

const catConfig: Record<CategoriaExtra, { label: string; plural: string; subtitle: string; color: string; border: string; bg: string; icon: typeof Zap }> = {
  fixo: { label: "Único", plural: "Extras Únicos", subtitle: "Pagamento único, sem mensalidade", color: "text-emerald-400", border: "border-emerald-500/30", bg: "bg-emerald-500/10", icon: Zap },
  intermediario: { label: "Pro", plural: "Extras Pro", subtitle: "Ativação + mensalidade recorrente", color: "text-amber-400", border: "border-amber-500/30", bg: "bg-amber-500/10", icon: Star },
  mensal: { label: "Assinatura", plural: "Assinaturas", subtitle: "Mensalidade de serviço fixo", color: "text-blue-400", border: "border-blue-500/30", bg: "bg-blue-500/10", icon: CalendarDays },
};

const subcategorias: Record<CategoriaExtra, string[]> = {
  fixo: ["Comunicação", "Páginas e conteúdo", "Vendas e produtos", "Sistema e gestão", "Integrações", "Vendas e UI", "Produtos", "Pedidos", "Localização", "Sistema"],
  intermediario: ["Promoções", "Fidelização", "Avaliações", "Pedidos e vendas", "Comunicação avançada", "Relatórios", "Marketing", "Vendas", "Cliente", "Automação", "Gestão"],
  mensal: ["Manutenção", "Crescimento", "Infraestrutura"],
};

export default function Extras() {
  const { toast } = useToast();
  const [extras, setExtras] = useState<any[]>([]);
  const [pacotes, setPacotes] = useState<any[]>([]);
  const [pacoteItens, setPacoteItens] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [extrasClientes, setExtrasClientes] = useState<any[]>([]);
  const [categoriaSel, setCategoriaSel] = useState<CategoriaExtra | "pacotes">("fixo");
  const [buscaGeral, setBuscaGeral] = useState("");
  const [buscaCategoria, setBuscaCategoria] = useState("");

  const [showNewPacote, setShowNewPacote] = useState(false);
  const [pacoteForm, setPacoteForm] = useState({ nome: "", descricao: "", preco_total: "", itens: [] as string[] });

  const [showNew, setShowNew] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showAtribuir, setShowAtribuir] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [extraSel, setExtraSel] = useState<any>(null);
  const [clienteSel, setClienteSel] = useState("");
  const [observacao, setObservacao] = useState("");
  const [saving, setSaving] = useState(false);

  const emptyForm = { nome: "", descricao: "", categoria: "fixo" as CategoriaExtra, subcategoria: "", preco_ativacao: "", preco_mensal: "", status: "ativo" };
  const [form, setForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState({ ...emptyForm, id: "" });

  const fetchData = async () => {
    const [extrasRes, pacotesRes, piRes, clientesRes, ecRes] = await Promise.all([
      supabase.from("extras_catalogo").select("*").order("nome"),
      (supabase.from as any)("pacotes").select("*").order("nome"),
      (supabase.from as any)("pacote_itens").select("*"),
      supabase.from("clientes").select("id, nome, email").eq("status", "ativo").order("nome"),
      supabase.from("extras_clientes").select("extra_id").eq("status", "ativo"),
    ]);
    setExtras(extrasRes.data || []);
    setPacotes(pacotesRes.data || []);
    setPacoteItens(piRes.data || []);
    setClientes(clientesRes.data || []);
    setExtrasClientes(ecRes.data || []);
  };

  useEffect(() => { fetchData(); }, []);

  const countByExtra = useMemo(() => {
    const map: Record<string, number> = {};
    extrasClientes.forEach(ec => { map[ec.extra_id] = (map[ec.extra_id] || 0) + 1; });
    return map;
  }, [extrasClientes]);

  const countByCat = useMemo(() => ({
    fixo: extras.filter(e => e.categoria === "fixo").length,
    intermediario: extras.filter(e => e.categoria === "intermediario").length,
    mensal: extras.filter(e => e.categoria === "mensal").length,
  }), [extras]);

  const receitaFixos = useMemo(() => extras.filter(e => e.categoria === "fixo").reduce((s, e) => s + Number(e.preco_ativacao || 0), 0), [extras]);
  const receitaMensal = useMemo(() => extras.filter(e => e.categoria === "mensal" || e.categoria === "intermediario").reduce((s, e) => s + Number(e.preco_mensal || 0), 0), [extras]);

  const filtrados = useMemo(() => {
    if (categoriaSel === "pacotes") {
      let list = [...pacotes];
      if (buscaGeral) list = list.filter(p => p.nome.toLowerCase().includes(buscaGeral.toLowerCase()));
      if (buscaCategoria) list = list.filter(p => p.nome.toLowerCase().includes(buscaCategoria.toLowerCase()));
      return list;
    }
    let list = extras.filter(e => e.categoria === categoriaSel);
    if (buscaGeral) list = list.filter(e => e.nome.toLowerCase().includes(buscaGeral.toLowerCase()));
    if (buscaCategoria) list = list.filter(e => e.nome.toLowerCase().includes(buscaCategoria.toLowerCase()));
    return list;
  }, [extras, pacotes, categoriaSel, buscaGeral, buscaCategoria]);

  const handleSave = async () => {
    if (!form.nome) return;
    setSaving(true);
    const { error } = await supabase.from("extras_catalogo").insert({
      nome: form.nome, descricao: form.descricao || null, categoria: form.categoria,
      preco_ativacao: Number(form.preco_ativacao) || 0, preco_mensal: Number(form.preco_mensal) || 0, status: form.status,
    });
    setSaving(false);
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Extra criado!" });
    setShowNew(false);
    setForm(emptyForm);
    fetchData();
  };

  const handleEdit = async () => {
    setSaving(true);
    const { error } = await supabase.from("extras_catalogo").update({
      nome: editForm.nome, descricao: editForm.descricao || null, categoria: editForm.categoria,
      preco_ativacao: Number(editForm.preco_ativacao) || 0, preco_mensal: Number(editForm.preco_mensal) || 0, status: editForm.status,
    }).eq("id", editForm.id);
    setSaving(false);
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Extra atualizado!" });
    setShowEdit(false);
    fetchData();
  };

  const toggleStatus = async (extra: any) => {
    const newStatus = extra.status === "ativo" ? "inativo" : "ativo";
    await supabase.from("extras_catalogo").update({ status: newStatus }).eq("id", extra.id);
    fetchData();
  };

  const abrirEditar = (extra: any) => {
    setEditForm({ id: extra.id, nome: extra.nome, descricao: extra.descricao || "", categoria: extra.categoria, subcategoria: "", preco_ativacao: String(extra.preco_ativacao || 0), preco_mensal: String(extra.preco_mensal || 0), status: extra.status });
    setShowEdit(true);
  };

  const abrirAtribuir = (extra: any) => {
    setExtraSel(extra);
    setClienteSel("");
    setObservacao("");
    setShowAtribuir(true);
  };

  const handleSavePacote = async () => {
    if (!pacoteForm.nome) return;
    setSaving(true);
    const { data: pkg, error } = await (supabase.from as any)("pacotes").insert({
      nome: pacoteForm.nome, descricao: pacoteForm.descricao, preco_total: Number(pacoteForm.preco_total) || 0
    }).select().single();

    if (!error && pkg && pacoteForm.itens.length > 0) {
      const links = pacoteForm.itens.map(id => ({ pacote_id: (pkg as any).id, extra_id: id }));
      await (supabase.from as any)("pacote_itens").insert(links);
    }

    setSaving(false);
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Pacote criado!" });
    setShowNewPacote(false);
    setPacoteForm({ nome: "", descricao: "", preco_total: "", itens: [] });
    fetchData();
  };

  const deletePacote = async (id: string) => {
    setSaving(true);
    await (supabase.from as any)("pacotes").delete().eq("id", id);
    setSaving(false);
    fetchData();
    toast({ title: "Pacote excluído" });
  };

  const handleDelete = async () => {
    if (!extraSel) return;
    setSaving(true);
    await supabase.from("extras_clientes").delete().eq("extra_id", extraSel.id);
    const { error } = await supabase.from("extras_catalogo").delete().eq("id", extraSel.id);
    setSaving(false);
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Extra excluído!" });
    setShowDelete(false);
    setExtraSel(null);
    fetchData();
  };

  const handleAtribuir = async () => {
    if (!clienteSel || !extraSel) return;
    setSaving(true);

    try {
      // 1. Buscar dados completos do cliente
      const { data: clienteData } = await supabase.from("clientes").select("*").eq("id", clienteSel).single();
      
      if (!clienteData) {
        toast({ title: "Erro", description: "Cliente não encontrado", variant: "destructive" });
        return;
      }

      // 2. Adicionar extra ao cliente
      let extraData;
      if (extraSel.preco_total !== undefined) {
        const items = pacoteItens.filter(pi => pi.pacote_id === extraSel.id);
        const batch = items.map(pi => {
          const fullExtra = extras.find(e => e.id === pi.extra_id);
          return {
            cliente_id: clienteSel, extra_id: pi.extra_id, pacote_id: extraSel.id,
            categoria: (fullExtra?.categoria as any) || 'fixo',
            preco_ativacao: fullExtra?.preco_ativacao || 0,
            preco_mensal: fullExtra?.preco_mensal || 0,
            observacao: observacao || null,
            status: "ativo"
          } as any;
        });
        await supabase.from("extras_clientes").insert(batch);
        extraData = batch[0]; // Pegar primeiro item para financeiro
      } else {
        const extraInsert = {
          cliente_id: clienteSel, extra_id: extraSel.id, categoria: extraSel.categoria,
          preco_ativacao: Number(extraSel.preco_ativacao) || 0, preco_mensal: Number(extraSel.preco_mensal) || 0, 
          observacao: observacao || null, status: "ativo"
        };
        await supabase.from("extras_clientes").insert(extraInsert);
        extraData = extraInsert;
      }

      // 3. Criar registro financeiro automaticamente (só na ativação)
      const valorTotal = extraData.preco_ativacao + extraData.preco_mensal;
      if (valorTotal > 0) {
        const financeiroData = {
          cliente_id: clienteSel,
          descricao: `Extra: ${extraSel.nome} - ${extraSel.categoria === 'fixo' ? 'Ativação' : extraSel.categoria === 'mensal' ? 'Mensalidade' : 'Pro'}`,
          tipo: "entrada",
          valor: valorTotal,
          vencimento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 dias
          status: "pendente"
        };

        const { data: financeiroRecord } = await supabase.from("financeiro").insert(financeiroData).select().single();

        // 4. Gerar fatura no Asaas automaticamente (só na ativação)
        if (financeiroRecord) {
          const { AsaasService } = await import("@/lib/asaas-service");
          
          try {
            // Criar cliente no Asaas
            const asaasCustomer = await AsaasService.getOrCreateCustomer({
              name: clienteData.nome,
              email: clienteData.email,
              cpfCnpj: clienteData.documento || undefined,
              mobilePhone: clienteData.whatsapp || undefined,
              externalReference: clienteData.id
            });

            // Gerar cobrança
            const payment = await AsaasService.createPayment({
              customer: asaasCustomer.id,
              billingType: "UNDEFINED",
              value: valorTotal,
              dueDate: financeiroData.vencimento,
              description: `Extra: ${extraSel.nome} (${extraSel.categoria})`
            });

            // Atualizar descrição com link do Asaas
            const novaDescricao = `${financeiroData.descricao} (Asaas: ${payment.invoiceUrl})`;
            await supabase.from("financeiro").update({ descricao: novaDescricao }).eq("id", financeiroRecord.id);

            toast({ 
              title: "✅ Extra ativado e fatura gerada!", 
              description: `Valor: R$ ${valorTotal.toFixed(2)} - Fatura Asaas criada automaticamente` 
            });
          } catch (asaasError) {
            console.error("Erro ao gerar fatura Asaas:", asaasError);
            toast({ 
              title: "⚠️ Extra ativado!", 
              description: "Extra adicionado, mas houve erro ao gerar fatura Asaas. Verifique o financeiro." 
            });
          }
        }
      }

      // 5. Se for recorrente, informar sobre cobranças futuras
      if (extraData.categoria === 'mensal' || extraData.categoria === 'intermediario') {
        toast({ 
          title: "🔄 Extra Recorrente Ativado!", 
          description: `Este extra será cobrado automaticamente todo mês. Use "Cobranças Recorrentes" no menu para gerar as faturas mensais.` 
        });
      }

      setSaving(false);
      fetchData();
      setShowAtribuir(false);
      toast({ title: "Extra(s) atribuídos com sucesso!" });
      
    } catch (error) {
      console.error("Erro em handleAtribuir:", error);
      toast({ title: "Erro", description: "Não foi possível atribuir o extra", variant: "destructive" });
      setSaving(false);
    }
  };

  const handleGerarFaturaConsolidada = async () => {
    if (!clienteSel) {
      toast({ title: "Selecione um cliente", description: "Escolha um cliente para faturar os extras.", variant: "destructive" });
      return;
    }

    const extrasDoCliente = (await supabase.from("extras_clientes").select("*, extras_catalogo(nome, categoria)").eq("cliente_id", clienteSel).eq("status", "ativo")).data || [];
    
    if (extrasDoCliente.length === 0) {
      toast({ title: "Nenhum extra", description: "Este cliente não possui extras ativos para faturar.", variant: "destructive" });
      return;
    }

    // Calcular valor total (ativação + mensalidades)
    const valorTotalAtivacao = extrasDoCliente.reduce((acc, e) => acc + Number(e.preco_ativacao || 0), 0);
    const valorTotalMensal = extrasDoCliente.reduce((acc, e) => acc + Number(e.preco_mensal || 0), 0);
    const valorTotal = valorTotalAtivacao + valorTotalMensal;
    
    const nomes = extrasDoCliente.map(e => (e as any).extras_catalogo?.nome).join(", ");
    const detalhes = extrasDoCliente.map(e => 
      `• ${(e as any).extras_catalogo?.nome}: R$ ${Number(e.preco_ativacao || 0).toFixed(2)}${e.preco_mensal > 0 ? ` + R$ ${Number(e.preco_mensal || 0).toFixed(2)}/mês` : ''}`
    ).join('\n');

    try {
      setSaving(true);

      // 1. Buscar dados completos do cliente
      const { data: clienteData } = await supabase.from("clientes").select("*").eq("id", clienteSel).single();
      
      if (!clienteData) {
        toast({ title: "Erro", description: "Cliente não encontrado", variant: "destructive" });
        return;
      }

      // 2. Criar fatura consolidada no financeiro
      const financeiroData = {
        cliente_id: clienteSel,
        descricao: `Fatura Consolidada - ${extrasDoCliente.length} Extras\n${detalhes}`,
        tipo: "entrada",
        valor: valorTotal,
        vencimento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 dias
        status: "pendente"
      };

      const { data: financeiroRecord } = await supabase.from("financeiro").insert(financeiroData).select().single();

      // 3. Gerar fatura no Asaas automaticamente
      if (financeiroRecord) {
        const { AsaasService } = await import("@/lib/asaas-service");
        
        try {
          // Criar cliente no Asaas
          const asaasCustomer = await AsaasService.getOrCreateCustomer({
            name: clienteData.nome,
            email: clienteData.email,
            cpfCnpj: clienteData.documento || undefined,
            mobilePhone: (clienteData as any).whatsapp || undefined,
            externalReference: clienteData.id
          });

          // Gerar cobrança consolidada
          const payment = await AsaasService.createPayment({
            customer: asaasCustomer.id,
            billingType: "UNDEFINED",
            value: valorTotal,
            dueDate: financeiroData.vencimento,
            description: `Fatura Consolidada - ${extrasDoCliente.length} Extras (${nomes})`
          });

          // Atualizar descrição com link do Asaas
          const novaDescricao = `${financeiroData.descricao}\n(Asaas: ${payment.invoiceUrl})`;
          await supabase.from("financeiro").update({ descricao: novaDescricao }).eq("id", financeiroRecord.id);

          toast({ 
            title: "✅ Fatura Consolidada Gerada!", 
            description: `${extrasDoCliente.length} extras - Valor: R$ ${valorTotal.toFixed(2)} - Fatura Asaas criada` 
          });
        } catch (asaasError) {
          console.error("Erro ao gerar fatura Asaas:", asaasError);
          toast({ 
            title: "⚠️ Fatura Consolidada Criada!", 
            description: `${extrasDoCliente.length} extras - Valor: R$ ${valorTotal.toFixed(2)} - Erro ao gerar link Asaas. Verifique o financeiro.` 
          });
        }
      }

      setSaving(false);
      
    } catch (error) {
      console.error("Erro ao gerar fatura consolidada:", error);
      toast({ title: "Erro", description: "Não foi possível gerar fatura consolidada", variant: "destructive" });
      setSaving(false);
    }
  };

  const config = categoriaSel === "pacotes"
    ? { label: "Pacote", plural: "Pacotes Premium", color: "text-purple-400", border: "border-purple-500/30", bg: "bg-purple-500/10", icon: Rocket }
    : catConfig[categoriaSel as CategoriaExtra];

  return (
    <motion.div className="space-y-0 h-full" initial="hidden" animate="show" variants={stagger}>
      <div className="flex flex-col lg:flex-row gap-6">
        <motion.div className="w-full lg:w-[40%] space-y-4" variants={fadeUp}>
          {(["fixo", "intermediario", "mensal"] as const).map(cat => {
            const c = catConfig[cat];
            const isActive = categoriaSel === cat;
            return (
              <Card
                key={cat}
                className={`cursor-pointer transition-all border-[0.5px] ${isActive ? "border-[rgba(232,51,74,0.5)] shadow-lg shadow-[rgba(232,51,74,0.1)]" : c.border} hover:border-white/20`}
                style={{ background: isActive ? "rgba(232,51,74,0.08)" : "rgba(255,255,255,0.04)" }}
                onClick={() => { setCategoriaSel(cat); setBuscaCategoria(""); }}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${c.bg}`}>
                    <c.icon className={`w-5 h-5 ${c.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-sm font-semibold ${c.color}`}>{c.plural}</h3>
                    <p className="text-[11px] text-white/40">{c.subtitle}</p>
                  </div>
                  <span className={`text-xl font-bold ${c.color}`}>{countByCat[cat]}</span>
                </CardContent>
              </Card>
            );
          })}

          <Card
            className={`cursor-pointer transition-all border-[0.5px] ${categoriaSel === "pacotes" ? "border-purple-500/50 shadow-lg" : "border-purple-500/10"} hover:border-purple-500/30`}
            style={{ background: categoriaSel === "pacotes" ? "rgba(168,85,247,0.08)" : "rgba(255,255,255,0.04)" }}
            onClick={() => setCategoriaSel("pacotes")}
          >
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-500/10">
                <Rocket className="w-5 h-5 text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-purple-400">Pacotes Premium</h3>
                <p className="text-[11px] text-white/40">Combos de funcionalidades</p>
              </div>
              <span className="text-xl font-bold text-purple-400">{pacotes.length}</span>
            </CardContent>
          </Card>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <Input
              placeholder="Buscar em todas categorias..."
              className="pl-9 glass-input border-0 text-white text-sm"
              value={buscaGeral}
              onChange={e => setBuscaGeral(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-3">
            {/* Seção de Gestão por Cliente */}
            <Card className="border-[0.5px] border-[rgba(232,51,74,0.3)] shadow-lg" style={{ background: "rgba(232,51,74,0.05)" }}>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-red-500/10"><DollarSign className="w-4 h-4 text-primary" /></div>
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">Faturar Extras</h3>
                </div>
                
                <div className="space-y-3">
                  <Select value={clienteSel} onValueChange={setClienteSel}>
                    <SelectTrigger className="border-white/10 text-white h-10 bg-black/40"><SelectValue placeholder="Escolha o cliente..." /></SelectTrigger>
                    <SelectContent>{clientes.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent>
                  </Select>
                  
                  <Button 
                    className="w-full h-10 gradient-primary border-0 text-white font-bold text-xs" 
                    onClick={handleGerarFaturaConsolidada}
                    disabled={saving || !clienteSel}
                  >
                    {saving ? "Processando..." : (
                      <span className="flex items-center gap-2 italic"><Zap className="w-3.5 h-3.5 fill-current" /> Gerar Fatura Consolidada</span>
                    )}
                  </Button>
                  <p className="text-[9px] text-center text-white/30 italic">Lote de extras ativos serão somados e lançados no financeiro.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[0.5px] border-white/[0.08]" style={{ background: "rgba(255,255,255,0.04)" }}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/5"><Package className="w-4 h-4 text-white/60" /></div>
                <div>
                  <p className="text-[10px] text-white/40 uppercase tracking-wider">Total cadastrados</p>
                  <p className="text-lg font-bold text-white">{extras.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-[0.5px] border-white/[0.08]" style={{ background: "rgba(255,255,255,0.04)" }}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10"><DollarSign className="w-4 h-4 text-emerald-400" /></div>
                <div>
                  <p className="text-[10px] text-white/40 uppercase tracking-wider">Receita potencial fixos</p>
                  <p className="text-lg font-bold text-emerald-400">R$ {receitaFixos.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-[0.5px] border-white/[0.08]" style={{ background: "rgba(255,255,255,0.04)" }}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10"><TrendingUp className="w-4 h-4 text-blue-400" /></div>
                <div>
                  <p className="text-[10px] text-white/40 uppercase tracking-wider">Receita mensal recorrente</p>
                  <p className="text-lg font-bold text-blue-400">R$ {receitaMensal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}/mês</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        <motion.div className="w-full lg:w-[60%] space-y-4" variants={fadeUp}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h2 className={`text-lg font-bold ${config.color}`}>{config.plural}</h2>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                <Input
                  placeholder="Buscar nesta categoria..."
                  className="pl-8 glass-input border-0 text-white text-xs h-9 w-52"
                  value={buscaCategoria}
                  onChange={e => setBuscaCategoria(e.target.value)}
                />
              </div>
              <Button className="gradient-primary border-0 text-white text-xs h-9" onClick={() => {
                if (categoriaSel === "pacotes") {
                  setShowNewPacote(true);
                } else {
                  setForm({ ...emptyForm, categoria: categoriaSel });
                  setShowNew(true);
                }
              }}>
                <Plus className="w-3.5 h-3.5 mr-1.5" /> {categoriaSel === "pacotes" ? "Novo pacote" : "Novo extra"}
              </Button>
            </div>
          </div>

          {filtrados.length === 0 ? (
            <p className="text-center text-sm text-white/40 py-16">Nenhum {categoriaSel === "pacotes" ? "pacote" : "extra"} encontrado</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-1 custom-scrollbar">
              {filtrados.map(item => {
                if (categoriaSel === "pacotes") {
                  const itensPkg = pacoteItens.filter(pi => pi.pacote_id === item.id);
                  return (
                    <Card key={item.id} className="border-[0.5px] border-purple-500/30 hover:border-purple-500/50 transition-all bg-white/[0.04]">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-sm font-bold text-purple-400 leading-tight flex-1 pr-2">{item.nome}</h4>
                          <Rocket className="w-4 h-4 text-purple-400/40" />
                        </div>
                        <p className="text-[11px] text-white/40 mb-3 line-clamp-2">{item.descricao}</p>
                        <div className="space-y-1 mb-4">
                          <p className="text-[10px] text-white/20 uppercase font-semibold">Itens inclusos:</p>
                          <ul className="text-[10px] text-white/60 list-disc list-inside">
                            {itensPkg.map(pi => {
                              const ex = extras.find(e => e.id === pi.extra_id);
                              return <li key={pi.id}>{ex?.nome}</li>;
                            })}
                          </ul>
                        </div>
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-sm font-bold text-purple-400">R$ {Number(item.preco_total).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                          <Badge variant="outline" className="text-[9px] border-purple-500/20 text-purple-400 bg-purple-500/5">Pacote Econômico</Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" className="flex-1 h-8 text-xs gradient-primary border-0 text-white" onClick={() => abrirAtribuir(item)}>
                            <UserPlus className="w-3 h-3 mr-1.5" /> Adicionar a Cliente
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-400/60 hover:text-red-400 hover:bg-red-500/10" onClick={() => deletePacote(item.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                } else {
                  const clientesCount = countByExtra[item.id] || 0;
                  return (
                    <Card key={item.id} className={`border-[0.5px] transition-all ${item.status === "inativo" ? "opacity-50" : ""} ${config.border} hover:border-white/20`} style={{ background: "rgba(255,255,255,0.04)" }}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-sm font-medium text-white leading-tight flex-1 pr-2">{item.nome}</h4>
                          <Switch checked={item.status === "ativo"} onCheckedChange={() => toggleStatus(item)} className="scale-75" />
                        </div>
                        {item.descricao && <p className="text-[11px] text-white/40 mb-2 line-clamp-2">{item.descricao}</p>}
                        <div className="space-y-1 mb-3">
                          {Number(item.preco_ativacao) > 0 && <p className="text-sm"><span className="text-white/40 text-xs">Ativação: </span><span className="text-emerald-400 font-semibold">R$ {Number(item.preco_ativacao).toFixed(2).replace(".", ",")}</span></p>}
                          {Number(item.preco_mensal) > 0 && <p className="text-sm"><span className="text-white/40 text-xs">Mensal: </span><span className="text-amber-400 font-semibold">R$ {Number(item.preco_mensal).toFixed(2).replace(".", ",")}/mês</span></p>}
                        </div>
                        <div className="flex items-center justify-between mb-3">
                          <Badge variant="outline" className={`text-[9px] ${config.color} ${config.border}`}>{config.label}</Badge>
                          <span className="text-[10px] text-white/30">{clientesCount} {clientesCount === 1 ? "cliente" : "clientes"}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" className="flex-1 h-8 text-xs text-white/60 hover:text-white border border-white/10 hover:border-white/20" onClick={() => abrirEditar(item)}>
                            <Pencil className="w-3 h-3 mr-1.5" /> Editar
                          </Button>
                          <Button size="sm" className="flex-1 h-8 text-xs gradient-primary border-0 text-white" onClick={() => abrirAtribuir(item)}>
                            <UserPlus className="w-3 h-3 mr-1.5" /> Adicionar
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-400/60 hover:text-red-400 hover:bg-red-500/10" onClick={() => { setExtraSel(item); setShowDelete(true); }}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                }
              })}
            </div>
          )}
        </motion.div>
      </div>

      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="glass-card border-[0.5px] text-white max-w-md">
          <DialogHeader><DialogTitle className="text-white">Novo Extra</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-white/50">Nome</Label>
              <Input className="glass-input border-white/10 text-white h-9" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-white/50">Categoria</Label>
              <Select value={form.categoria} onValueChange={v => setForm({ ...form, categoria: v as CategoriaExtra })}>
                <SelectTrigger className="glass-input border-white/10 text-white"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="fixo">Fixo</SelectItem><SelectItem value="intermediario">Intermediário</SelectItem><SelectItem value="mensal">Mensal</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-white/50">Descrição</Label>
              <Textarea className="glass-input border-white/10 text-white min-h-[50px]" value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-white/50">Ativação (R$)</Label>
              <Input type="number" className="glass-input border-white/10 text-white h-9" value={form.preco_ativacao} onChange={e => setForm({ ...form, preco_ativacao: e.target.value })} />
            </div>
            {(form.categoria === "intermediario" || form.categoria === "mensal") && (
              <div className="space-y-1.5">
                <Label className="text-xs text-white/50">Mensal (R$)</Label>
                <Input type="number" className="glass-input border-white/10 text-white h-9" value={form.preco_mensal} onChange={e => setForm({ ...form, preco_mensal: e.target.value })} />
              </div>
            )}
            <Button className="gradient-primary border-0 text-white w-full" onClick={handleSave} disabled={saving || !form.nome}>{saving ? "Salvando..." : "Salvar Extra"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="glass-card border-[0.5px] text-white max-w-md">
          <DialogHeader><DialogTitle className="text-white">Editar Extra</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-white/50">Nome</Label>
              <Input className="glass-input border-white/10 text-white h-9" value={editForm.nome} onChange={e => setEditForm({ ...editForm, nome: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-white/50">Categoria</Label>
              <Select value={editForm.categoria} onValueChange={v => setEditForm({ ...editForm, categoria: v as CategoriaExtra })}>
                <SelectTrigger className="glass-input border-white/10 text-white"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="fixo">Fixo</SelectItem><SelectItem value="intermediario">Intermediário</SelectItem><SelectItem value="mensal">Mensal</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-white/50">Descrição</Label>
              <Textarea className="glass-input border-white/10 text-white min-h-[50px]" value={editForm.descricao} onChange={e => setEditForm({ ...editForm, descricao: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-white/50">Ativação (R$)</Label>
              <Input type="number" className="glass-input border-white/10 text-white h-9" value={editForm.preco_ativacao} onChange={e => setEditForm({ ...editForm, preco_ativacao: e.target.value })} />
            </div>
            {(editForm.categoria === "intermediario" || editForm.categoria === "mensal") && (
              <div className="space-y-1.5">
                <Label className="text-xs text-white/50">Mensal (R$)</Label>
                <Input type="number" className="glass-input border-white/10 text-white h-9" value={editForm.preco_mensal} onChange={e => setEditForm({ ...editForm, preco_mensal: e.target.value })} />
              </div>
            )}
            <Button className="gradient-primary border-0 text-white w-full" onClick={handleEdit} disabled={saving}>{saving ? "Salvando..." : "Salvar alterações"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAtribuir} onOpenChange={setShowAtribuir}>
        <DialogContent className="glass-card border-[0.5px] text-white max-w-md">
          <DialogHeader><DialogTitle className="text-white">Adicionar a Cliente</DialogTitle></DialogHeader>
          {extraSel && (
            <div className="space-y-4 mt-2">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <p className="text-sm font-medium text-white">{extraSel.nome}</p>
                <div className="flex gap-3 mt-1 text-xs text-white/40">
                  <span className={catConfig[extraSel.categoria as CategoriaExtra]?.color || "text-purple-400"}>
                    {catConfig[extraSel.categoria as CategoriaExtra]?.label || "Pacote"}
                  </span>
                  {Number(extraSel.preco_ativacao || extraSel.preco_total) > 0 && <span>Valor: R$ {Number(extraSel.preco_ativacao || extraSel.preco_total).toFixed(2)}</span>}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-white/50">Cliente</Label>
                <Select value={clienteSel} onValueChange={setClienteSel}>
                  <SelectTrigger className="glass-input border-white/10 text-white"><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
                  <SelectContent>{clientes.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-white/50">Observação</Label>
                <Textarea className="glass-input border-white/10 text-white text-sm" value={observacao} onChange={e => setObservacao(e.target.value)} />
              </div>
              <Button className="gradient-primary border-0 text-white w-full" onClick={handleAtribuir} disabled={!clienteSel || saving}>{saving ? "Salvando..." : "Confirmar"}</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent className="glass-card border-[0.5px] text-white max-w-sm">
          <DialogHeader><DialogTitle className="text-white">Excluir Extra</DialogTitle><DialogDescription className="text-white/50">Tem certeza que deseja excluir este item?</DialogDescription></DialogHeader>
          <DialogFooter className="gap-2"><Button variant="ghost" onClick={() => setShowDelete(false)}>Cancelar</Button><Button className="bg-red-600 border-0" onClick={handleDelete} disabled={saving}>Excluir</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showNewPacote} onOpenChange={setShowNewPacote}>
        <DialogContent className="glass-card border-[0.5px] text-white max-w-lg">
          <DialogHeader><DialogTitle className="text-white">Criar Novo Pacote</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5"><Label className="text-xs text-white/50">Nome</Label><Input className="glass-input border-white/10 text-white h-9" value={pacoteForm.nome} onChange={e => setPacoteForm({ ...pacoteForm, nome: e.target.value })} /></div>
            <div className="space-y-1.5"><Label className="text-xs text-white/50">Preço Total (R$)</Label><Input type="number" className="glass-input border-white/10 text-white h-9" value={pacoteForm.preco_total} onChange={e => setPacoteForm({ ...pacoteForm, preco_total: e.target.value })} /></div>
            <div className="space-y-2">
              <Label className="text-xs text-white/50">Itens Inclusos</Label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-black/20 rounded border border-white/10">
                {extras.map(ex => (
                  <label key={ex.id} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox checked={pacoteForm.itens.includes(ex.id)} onCheckedChange={(checked) => {
                      const newItens = checked ? [...pacoteForm.itens, ex.id] : pacoteForm.itens.filter(id => id !== ex.id);
                      setPacoteForm({ ...pacoteForm, itens: newItens });
                    }} />
                    <span className="text-[10px] text-white/70 truncate">{ex.nome}</span>
                  </label>
                ))}
              </div>
            </div>
            <Button className="gradient-primary border-0 text-white w-full" onClick={handleSavePacote} disabled={saving || !pacoteForm.nome}>Criar Pacote</Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
