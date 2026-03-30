import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, DollarSign, Sparkles, Send, FileText, Download, Zap, Star, CalendarDays } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { jsPDF } from "jspdf";
import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel } from "docx";
import { saveAs } from "file-saver";
import { Checkbox } from "@/components/ui/checkbox";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const stagger = { show: { transition: { staggerChildren: 0.06 } } };

const basePlans: Record<string, { nome: string; ativacao: number; mensal: number }> = {
  express: { nome: "Arquitetura Express", ativacao: 180, mensal: 60 },
  gestao: { nome: "Arquitetura de Gestão", ativacao: 0, mensal: 0 },
  sobmedida: { nome: "Arquitetura sob Medida", ativacao: 0, mensal: 0 },
};

export default function Calculadora() {
  const { toast } = useToast();
  const [extras, setExtras] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [buscaGeral, setBuscaGeral] = useState("");
  
  // States
  const [calPlanoBase, setCalPlanoBase] = useState("express");
  const [calExtras, setCalExtras] = useState<string[]>([]);
  const [calDesconto, setCalDesconto] = useState("0");
  const [calClienteId, setCalClienteId] = useState("");
  const [calPrecoBaseAtivacao, setCalPrecoBaseAtivacao] = useState("180");
  const [calPrecoBaseMensal, setCalPrecoBaseMensal] = useState("60");

  useEffect(() => {
    const fetchData = async () => {
      const [extrasRes, clientesRes] = await Promise.all([
        supabase.from("extras_catalogo").select("*").eq("status", "ativo").order("nome"),
        supabase.from("clientes").select("id, nome, email").eq("status", "ativo").order("nome"),
      ]);
      setExtras(extrasRes.data || []);
      setClientes(clientesRes.data || []);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (calPlanoBase === "express") {
      setCalPrecoBaseAtivacao("180");
      setCalPrecoBaseMensal("60");
    }
  }, [calPlanoBase]);

  const filtrados = useMemo(() => {
    let list = [...extras];
    if (buscaGeral) list = list.filter(e => e.nome.toLowerCase().includes(buscaGeral.toLowerCase()));
    return list;
  }, [extras, buscaGeral]);

  const toggleCalExtra = (id: string) => {
    setCalExtras(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const plano = basePlans[calPlanoBase];
    const clienteObj = clientes.find(c => c.id === calClienteId);
    const itensSelecionados = extras.filter(e => calExtras.includes(e.id));
    
    const baseAtiv = Number(calPrecoBaseAtivacao);
    const baseMens = Number(calPrecoBaseMensal);
    const totalAtivacao = baseAtiv + itensSelecionados.reduce((s, e) => s + Number(e.preco_ativacao), 0) - Number(calDesconto);
    const totalMensal = baseMens + itensSelecionados.reduce((s, e) => s + Number(e.preco_mensal), 0);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(232, 51, 74);
    doc.text("NOVAESWEB", 105, 20, { align: "center" });
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("PROPOSTA COMERCIAL", 105, 35, { align: "center" });
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Cliente: ${clienteObj?.nome || "Proposta NovaesWeb"}`, 20, 50);
    doc.text(`Data: ${new Date().toLocaleDateString("pt-BR")}`, 20, 57);
    doc.line(20, 65, 190, 65);
    doc.setFont("helvetica", "bold");
    doc.text("Resumo da Solução:", 20, 75);
    doc.setFont("helvetica", "normal");
    doc.text(`- Plano Base: ${plano.nome}`, 25, 85);
    let y = 92;
    itensSelecionados.forEach(item => {
      doc.text(`- Extra: ${item.nome}`, 25, y);
      y += 7;
    });
    doc.line(20, y + 5, 190, y + 5);
    y += 15;
    doc.setFont("helvetica", "bold");
    doc.text("Investimento:", 20, y);
    y += 10;
    doc.setFont("helvetica", "normal");
    doc.text(`Setup (Ativação Única): R$ ${totalAtivacao.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, 25, y);
    y += 7;
    doc.text(`Manutenção (Mensalidade): R$ ${totalMensal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}/mês`, 25, y);
    if (Number(calDesconto) > 0) {
      y += 7;
      doc.setTextColor(232, 51, 74);
      doc.text(`Desconto aplicado: R$ ${Number(calDesconto).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, 25, y);
    }
    doc.save(`Orçamento_${clienteObj?.nome || "NovaesWeb"}.pdf`);
    toast({ title: "PDF Gerado com sucesso!" });
  };

  const generateWord = async () => {
    const plano = basePlans[calPlanoBase];
    const clienteObj = clientes.find(c => c.id === calClienteId);
    const itensSelecionados = extras.filter(e => calExtras.includes(e.id));
    const baseAtiv = Number(calPrecoBaseAtivacao);
    const baseMens = Number(calPrecoBaseMensal);
    const totalAtivacao = baseAtiv + itensSelecionados.reduce((s, e) => s + Number(e.preco_ativacao), 0) - Number(calDesconto);
    const totalMensal = baseMens + itensSelecionados.reduce((s, e) => s + Number(e.preco_mensal), 0);

    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({ text: "NOVAESWEB", heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER }),
          new Paragraph({ text: "PROPOSTA COMERCIAL", heading: HeadingLevel.HEADING_2, alignment: AlignmentType.CENTER }),
          new Paragraph({ text: "" }),
          new Paragraph({ children: [new TextRun({ text: `Cliente: `, bold: true }), new TextRun(clienteObj?.nome || "Proposta NovaesWeb")] }),
          new Paragraph({ children: [new TextRun({ text: `Data: `, bold: true }), new TextRun(new Date().toLocaleDateString("pt-BR"))] }),
          new Paragraph({ text: "" }),
          new Paragraph({ text: "Resumo da Solução:", heading: HeadingLevel.HEADING_3 }),
          new Paragraph({ text: `• Plano Base: ${plano.nome}`, bullet: { level: 0 } }),
          ...itensSelecionados.map(item => new Paragraph({ text: `• Extra: ${item.nome}`, bullet: { level: 0 } })),
          new Paragraph({ text: "" }),
          new Paragraph({ text: "Investimento:", heading: HeadingLevel.HEADING_3 }),
          new Paragraph({ children: [new TextRun({ text: "Setup (Ativação Única): ", bold: true }), new TextRun(`R$ ${totalAtivacao.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`)] }),
          new Paragraph({ children: [new TextRun({ text: "Manutenção (Mensalidade TOTAL): ", bold: true }), new TextRun(`R$ ${totalMensal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}/mês`)] }),
          ...(totalMensal > 0 ? [new Paragraph({ children: [new TextRun({ text: "*(Este valor recorrente garante a sustentação, segurança e evolução da sua engenharia digital)", italics: true })] })] : []),
          ...(Number(calDesconto) > 0 ? [new Paragraph({ children: [new TextRun({ text: "Desconto aplicado: ", bold: true, color: "E8334A" }), new TextRun(`R$ ${Number(calDesconto).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`)] })] : []),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Orçamento_${clienteObj?.nome || "NovaesWeb"}.docx`);
    toast({ title: "Word (.docx) Gerado com sucesso!" });
  };

  const copyWhatsApp = () => {
    const plano = basePlans[calPlanoBase];
    const clienteObj = clientes.find(c => c.id === calClienteId);
    const itensSelecionados = extras.filter(e => calExtras.includes(e.id));
    const baseAtiv = Number(calPrecoBaseAtivacao);
    const baseMens = Number(calPrecoBaseMensal);
    const totalAtivacao = baseAtiv + itensSelecionados.reduce((s, e) => s + Number(e.preco_ativacao), 0) - Number(calDesconto);
    const totalMensal = baseMens + itensSelecionados.reduce((s, e) => s + Number(e.preco_mensal), 0);

    const text = `*Orçamento NovaesWeb - Transformação Digital* 🚀\n\nOlá, segue o resumo do projeto para *${clienteObj?.nome || "você"}*:\n\n*Arquitetura Base:* ${plano.nome}\n*Opcionais Inclusos:* ${itensSelecionados.length > 0 ? "" : "Nenhum"}\n${itensSelecionados.map(i => `✅ ${i.nome}`).join('\n')}\n\n---\n💰 *Investimento Setup:* R$ ${totalAtivacao.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}\n📊 *Mensalidade Recorrente:* R$ ${totalMensal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}/mês\n---\n\nQualquer dúvida estou à disposição! 👋`;
    navigator.clipboard.writeText(text);
    toast({ title: "Copiado para o WhatsApp!" });
  };

  return (
    <motion.div className="p-1 md:p-4 space-y-6 max-w-7xl mx-auto" initial="hidden" animate="show" variants={stagger}>
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white italic flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-orange-400" /> CALCULADORA DE ORÇAMENTOS
          </h1>
          <p className="text-white/40 text-sm">Gere propostas comerciais profissionais em segundos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="h-10 text-orange-400 hover:bg-orange-500/10" onClick={copyWhatsApp}>
            <Send className="w-4 h-4 mr-2" /> WhatsApp
          </Button>
          <Button variant="ghost" size="sm" className="h-10 text-blue-400 hover:bg-blue-500/10" onClick={generateWord}>
            <FileText className="w-4 h-4 mr-2" /> Word
          </Button>
          <Button variant="ghost" size="sm" className="h-10 text-emerald-400 hover:bg-emerald-500/10" onClick={generatePDF}>
            <Download className="w-4 h-4 mr-2" /> PDF
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Lado Esquerdo - Configuração */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="glass-card border-white/10 bg-white/[0.02]">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] text-white/40 uppercase font-black">Cliente Selecionado</Label>
                  <Select value={calClienteId} onValueChange={setCalClienteId}>
                    <SelectTrigger className="glass-input border-white/10 text-white h-11">
                      <SelectValue placeholder="Selecione o cliente ativo..." />
                    </SelectTrigger>
                    <SelectContent>
                      {clientes.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] text-white/40 uppercase font-black">Plano Estrutural</Label>
                  <Select value={calPlanoBase} onValueChange={setCalPlanoBase}>
                    <SelectTrigger className="glass-input border-white/10 text-white h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="express">Express (Iniciante)</SelectItem>
                      <SelectItem value="gestao">Gestão (Personalizado)</SelectItem>
                      <SelectItem value="sobmedida">Sob Medida (Personalizado)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] text-white/40 uppercase font-black">Valor Setup (R$)</Label>
                  <Input 
                    type="number" 
                    disabled={calPlanoBase === "express"}
                    className="glass-input border-white/10 text-white h-11"
                    value={calPrecoBaseAtivacao}
                    onChange={e => setCalPrecoBaseAtivacao(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] text-white/40 uppercase font-black">Manutenção Mensal (R$)</Label>
                  <Input 
                    type="number" 
                    disabled={calPlanoBase === "express"}
                    className="glass-input border-white/10 text-white h-11"
                    value={calPrecoBaseMensal}
                    onChange={e => setCalPrecoBaseMensal(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white/60 flex items-center gap-2 italic">
                <Sparkles className="w-4 h-4" /> SELECIONE OS EXTRAS
              </h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  placeholder="Buscar funcionalidade..."
                  className="pl-9 glass-input border-white/5 text-white h-9 w-64"
                  value={buscaGeral}
                  onChange={e => setBuscaGeral(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {filtrados.map(extra => {
                const isSelected = calExtras.includes(extra.id);
                return (
                  <Card 
                    key={extra.id} 
                    className={`border-[0.5px] cursor-pointer transition-all hover:border-orange-500/30 ${isSelected ? "border-orange-500/50 bg-orange-500/10" : "border-white/5 bg-white/[0.02]"}`}
                    onClick={() => toggleCalExtra(extra.id)}
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Checkbox checked={isSelected} onCheckedChange={() => toggleCalExtra(extra.id)} className="border-white/20 data-[state=checked]:bg-orange-500" />
                        <div>
                          <p className="text-xs font-bold text-white mb-0.5">{extra.nome}</p>
                          <p className="text-[10px] text-white/30 uppercase tracking-tighter">{extra.categoria}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {Number(extra.preco_ativacao) > 0 && <p className="text-[11px] text-emerald-400 font-bold">+R$ {Number(extra.preco_ativacao).toFixed(0)}</p>}
                        {Number(extra.preco_mensal) > 0 && <p className="text-[11px] text-amber-400 font-bold">+R$ {Number(extra.preco_mensal).toFixed(0)}/mês</p>}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        {/* Lado Direito - Resumo Fixo */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="glass-card border-white/10 bg-white/[0.02] sticky top-4">
            <CardContent className="p-6 space-y-6">
              <h2 className="text-lg font-black text-white italic border-b border-white/10 pb-3">RESUMO DO PROJETO</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] text-white/40 uppercase font-black">Setup (Único)</span>
                  <span className="text-2xl font-black text-white italic">
                    R$ {(Number(calPrecoBaseAtivacao) + extras.filter(e => calExtras.includes(e.id)).reduce((s, e) => s + Number(e.preco_ativacao), 0) - Number(calDesconto)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                
                <div className="flex justify-between items-end border-t border-white/5 pt-4">
                  <span className="text-[10px] text-white/40 uppercase font-black">Recorrência</span>
                  <span className="text-xl font-black text-orange-400 italic">
                    R$ {(Number(calPrecoBaseMensal) + extras.filter(e => calExtras.includes(e.id)).reduce((s, e) => s + Number(e.preco_mensal), 0)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}<span className="text-xs">/mês</span>
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <div className="flex justify-between text-xs text-white/40">
                  <span>Plano Base</span>
                  <span>R$ {Number(calPrecoBaseAtivacao).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-white/40">
                  <span>Adicionais ({calExtras.length})</span>
                  <span>R$ {extras.filter(e => calExtras.includes(e.id)).reduce((s, e) => s + Number(e.preco_ativacao), 0).toFixed(2)}</span>
                </div>
                
                <div className="pt-4 space-y-2">
                  <Label className="text-[10px] text-white/40 uppercase font-black">Desconto Especial (R$)</Label>
                  <Input 
                    type="number"
                    className="glass-input border-white/10 text-white h-10"
                    value={calDesconto}
                    onChange={e => setCalDesconto(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <p className="text-[9px] text-white/30 italic text-center uppercase tracking-widest">
                  novaesweb architect v10.2 pre-release
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
