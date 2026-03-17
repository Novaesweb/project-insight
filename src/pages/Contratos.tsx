import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { FileText, Plus, Eye, Save, Send, Download, ChevronLeft, Search, PenTool } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import { contractTemplates, fillTemplate, type ContractTemplate } from "@/lib/contract-templates";
import SignaturePad from "@/components/SignaturePad";
import jsPDF from "jspdf";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const statusColors: Record<string, string> = { aguardando: "#facc15", assinado: "#4ade80", cancelado: "#ef4444", rascunho: "#94a3b8" };
const statusLabels: Record<string, string> = { aguardando: "Aguardando", assinado: "Assinado", cancelado: "Cancelado", rascunho: "Rascunho" };

interface Cliente {
  id: string;
  nome_empresa: string;
  email: string | null;
  nome_responsavel: string;
}

function generatePDF(titulo: string, corpo: string, assinaturaAdmin?: string, assinaturaCliente?: string) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxWidth = pageWidth - margin * 2;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(titulo, margin, 25);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const lines = doc.splitTextToSize(corpo, maxWidth);
  let y = 40;
  for (const line of lines) {
    if (y > 270) { doc.addPage(); y = 20; }
    doc.text(line, margin, y);
    y += 5;
  }

  if (assinaturaAdmin) {
    if (y > 230) { doc.addPage(); y = 20; }
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.text("Assinatura CONTRATADA (NovaesWeb):", margin, y);
    y += 5;
    doc.addImage(assinaturaAdmin, "PNG", margin, y, 60, 25);
    y += 30;
  }

  if (assinaturaCliente) {
    doc.setFont("helvetica", "bold");
    doc.text("Assinatura CONTRATANTE:", margin, y);
    y += 5;
    doc.addImage(assinaturaCliente, "PNG", margin, y, 60, 25);
  }

  doc.save(`${titulo.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`);
}

export default function Contratos() {
  const { toast } = useToast();
  const [contratos, setContratos] = useState<any[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [tab, setTab] = useState("lista");
  const [searchTerm, setSearchTerm] = useState("");

  // Form state
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null);
  const [selectedClienteId, setSelectedClienteId] = useState("");
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewText, setPreviewText] = useState("");
  const [previewContrato, setPreviewContrato] = useState<any>(null);

  // Signature state
  const [signOpen, setSignOpen] = useState(false);
  const [adminSignature, setAdminSignature] = useState<string>("");

  const loadContratos = useCallback(() => {
    supabase.from("contratos").select("*, clientes(nome)").order("created_at", { ascending: false })
      .then(({ data }) => setContratos(data || []));
  }, []);

  const loadClientes = useCallback(() => {
    supabase.from("clientes").select("id, nome_empresa, email, nome_responsavel").eq("ativo", true)
      .then(({ data }) => setClientes((data || []) as unknown as Cliente[]));
  }, []);

  useEffect(() => { loadContratos(); loadClientes(); }, [loadContratos, loadClientes]);
  useRealtimeSubscription("contratos", loadContratos);

  useEffect(() => {
    if (!selectedClienteId || !selectedTemplate) return;
    const cliente = clientes.find(c => c.id === selectedClienteId);
    if (!cliente) return;
    setFormValues(prev => ({
      ...prev,
      nome_cliente: cliente.nome_empresa,
      cpf_cnpj: "",
      endereco: "",
    }));
  }, [selectedClienteId, clientes, selectedTemplate]);

  useEffect(() => {
    if (!selectedTemplate) return;
    const defaults: Record<string, string> = {};
    selectedTemplate.variaveis.forEach(v => {
      if (v.defaultValue) defaults[v.key] = v.defaultValue;
      if (v.autoFill === "data") defaults[v.key] = new Date().toLocaleDateString("pt-BR");
    });
    const config = localStorage.getItem("config_empresa");
    if (config) {
      const parsed = JSON.parse(config);
      if (parsed.cnpj) defaults.cnpj_novaes = parsed.cnpj;
    }
    setFormValues(prev => ({ ...defaults, ...prev }));
  }, [selectedTemplate]);

  const handleSelectTemplate = (templateId: string) => {
    const tpl = contractTemplates.find(t => t.id === templateId);
    if (tpl) {
      setSelectedTemplate(tpl);
      setFormValues({});
      setSelectedClienteId("");
      setAdminSignature("");
      setTab("criar");
    }
  };

  const handlePreview = () => {
    if (!selectedTemplate) return;
    const filled = fillTemplate(selectedTemplate.corpo, formValues);
    setPreviewText(filled);
    setPreviewContrato(null);
    setPreviewOpen(true);
  };

  const handleViewContrato = (contrato: any) => {
    setPreviewText((contrato as any).corpo || contrato.descricao || "Conteúdo não disponível");
    setPreviewContrato(contrato);
    setPreviewOpen(true);
  };

  const getValorFromForm = (): number => {
    const val = formValues.valor_total || formValues.valor_mensal || "0";
    return parseFloat(val) || 0;
  };

  const handleSave = async (status: "rascunho" | "aguardando") => {
    if (!selectedTemplate || !selectedClienteId) {
      toast({ title: "Selecione um cliente", variant: "destructive" });
      return;
    }
    if (status === "aguardando" && !adminSignature) {
      toast({ title: "Assine o contrato antes de enviar", description: "Clique em 'Assinar' para adicionar sua assinatura.", variant: "destructive" });
      return;
    }
    const corpo = fillTemplate(selectedTemplate.corpo, formValues);
    const { error } = await supabase.from("contratos").insert({
      cliente_id: selectedClienteId,
      titulo: `${selectedTemplate.nome} — ${formValues.nome_cliente || ""}`,
      descricao: `Modelo: ${selectedTemplate.nome}`,
      valor: getValorFromForm(),
      status,
      corpo,
      modelo: selectedTemplate.id,
      assinatura_admin: adminSignature || null,
    } as any);
    if (error) {
      toast({ title: "Erro ao salvar contrato", description: error.message, variant: "destructive" });
    } else {
      toast({ title: status === "rascunho" ? "Rascunho salvo!" : "Contrato enviado para assinatura!" });
      setTab("lista");
      setSelectedTemplate(null);
      setFormValues({});
      setAdminSignature("");
      loadContratos();
    }
  };

  const handleDownloadPDF = (contrato: any) => {
    generatePDF(
      contrato.titulo,
      (contrato as any).corpo || contrato.descricao || "",
      (contrato as any).assinatura_admin,
      (contrato as any).assinatura_cliente
    );
  };

  const filteredContratos = contratos.filter(c =>
    c.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.clientes as any)?.nome?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div className="space-y-6" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }}>
      <motion.div variants={fadeUp}>
        <Tabs value={tab} onValueChange={setTab} className="space-y-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <TabsList className="glass-card border-[0.5px] bg-transparent p-1 gap-1">
              <TabsTrigger value="lista" className="data-[state=active]:gradient-primary data-[state=active]:text-white text-[hsl(var(--muted-foreground))] text-xs gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Contratos
              </TabsTrigger>
              <TabsTrigger value="modelos" className="data-[state=active]:gradient-primary data-[state=active]:text-white text-[hsl(var(--muted-foreground))] text-xs gap-1.5">
                <Plus className="w-3.5 h-3.5" /> Novo Contrato
              </TabsTrigger>
              {selectedTemplate && (
                <TabsTrigger value="criar" className="data-[state=active]:gradient-primary data-[state=active]:text-white text-[hsl(var(--muted-foreground))] text-xs gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> {selectedTemplate.nome}
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          {/* LISTA DE CONTRATOS */}
          <TabsContent value="lista">
            <Card className="glass-card border-[0.5px]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm text-[hsl(var(--foreground))]">Contratos</CardTitle>
                    <CardDescription>{contratos.length} contrato(s)</CardDescription>
                  </div>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" />
                    <Input placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                      className="pl-9 glass-input border-[rgba(255,255,255,0.1)] text-[hsl(var(--foreground))] text-xs h-8" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {filteredContratos.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.04)" }}>
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleViewContrato(c)}>
                      <FileText className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                      <div>
                        <p className="text-sm font-medium text-[hsl(var(--foreground))]">{c.titulo}</p>
                        <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
                          {(c.clientes as any)?.nome} • R$ {Number(c.valor).toLocaleString("pt-BR")} • {c.data_envio}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" className="text-[hsl(var(--muted-foreground))] text-xs h-7 px-2" title="Ver contrato" onClick={() => handleViewContrato(c)}>
                        <Eye className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-[hsl(var(--muted-foreground))] text-xs h-7 px-2" title="Baixar PDF" onClick={() => handleDownloadPDF(c)}>
                        <Download className="w-3 h-3" />
                      </Button>
                      <Badge variant="outline" className="text-[10px] border-0 px-2"
                        style={{ backgroundColor: (statusColors[c.status] || "#94a3b8") + "22", color: statusColors[c.status] || "#94a3b8" }}>
                        {statusLabels[c.status] || c.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                {filteredContratos.length === 0 && (
                  <p className="text-sm text-[hsl(var(--muted-foreground))] text-center py-8">Nenhum contrato encontrado</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* SELEÇÃO DE MODELO */}
          <TabsContent value="modelos">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contractTemplates.map(tpl => (
                <Card key={tpl.id} className="glass-card border-[0.5px] cursor-pointer hover:border-[hsl(var(--primary))]/50 transition-all"
                  onClick={() => handleSelectTemplate(tpl.id)}>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.6))" }}>
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[hsl(var(--foreground))]">{tpl.nome}</p>
                        <Badge variant="outline" className="text-[9px] border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]">
                          {tpl.tipo === "projeto_unico" ? "Projeto Único" : "Recorrente Mensal"}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      {tpl.variaveis.length} variáveis configuráveis
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* FORMULÁRIO DE CRIAÇÃO */}
          <TabsContent value="criar">
            {selectedTemplate && (
              <div className="space-y-6">
                <Button variant="ghost" size="sm" className="text-[hsl(var(--muted-foreground))] text-xs" onClick={() => { setTab("modelos"); setSelectedTemplate(null); }}>
                  <ChevronLeft className="w-3 h-3 mr-1" /> Voltar aos modelos
                </Button>

                <Card className="glass-card border-[0.5px]">
                  <CardHeader>
                    <CardTitle className="text-sm text-[hsl(var(--foreground))]">{selectedTemplate.nome}</CardTitle>
                    <CardDescription>Preencha os campos para gerar o contrato</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Cliente selection */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-[hsl(var(--muted-foreground))]">Cliente</Label>
                      <Select value={selectedClienteId} onValueChange={setSelectedClienteId}>
                        <SelectTrigger className="glass-input border-[rgba(255,255,255,0.1)] text-[hsl(var(--foreground))] text-sm h-9">
                          <SelectValue placeholder="Selecione o cliente..." />
                        </SelectTrigger>
                        <SelectContent>
                          {clientes.map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.nome} — {c.email}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Template variables */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedTemplate.variaveis.map(v => (
                        <div key={v.key} className={`space-y-1.5 ${v.type === "textarea" ? "md:col-span-2" : ""}`}>
                          <Label className="text-xs text-[hsl(var(--muted-foreground))]">{v.label}</Label>
                          {v.type === "textarea" ? (
                            <Textarea
                              value={formValues[v.key] || ""}
                              onChange={e => setFormValues(prev => ({ ...prev, [v.key]: e.target.value }))}
                              className="glass-input border-[rgba(255,255,255,0.1)] text-[hsl(var(--foreground))] text-sm min-h-[80px]"
                            />
                          ) : (
                            <Input
                              type={v.type === "number" ? "number" : v.type === "date" ? "date" : "text"}
                              value={formValues[v.key] || ""}
                              onChange={e => setFormValues(prev => ({ ...prev, [v.key]: e.target.value }))}
                              className="glass-input border-[rgba(255,255,255,0.1)] text-[hsl(var(--foreground))] text-sm h-9"
                            />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Admin Signature */}
                    <div className="pt-4 border-t border-[hsl(var(--border))]">
                      {adminSignature ? (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                            <PenTool className="w-3 h-3" /> Assinatura da CONTRATADA adicionada
                          </p>
                          <div className="bg-white rounded-lg p-2 inline-block">
                            <img src={adminSignature} alt="Assinatura Admin" className="h-12" />
                          </div>
                          <Button size="sm" variant="ghost" className="text-xs text-[hsl(var(--muted-foreground))]" onClick={() => setSignOpen(true)}>
                            Refazer assinatura
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="outline" className="text-xs gap-1.5" onClick={() => setSignOpen(true)}>
                          <PenTool className="w-3 h-3" /> Assinar como CONTRATADA
                        </Button>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t border-[hsl(var(--border))]">
                      <Button size="sm" variant="outline" className="text-xs gap-1.5" onClick={handlePreview}>
                        <Eye className="w-3 h-3" /> Pré-visualizar
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs gap-1.5" onClick={() => handleSave("rascunho")}>
                        <Save className="w-3 h-3" /> Salvar Rascunho
                      </Button>
                      <Button size="sm" className="gradient-primary border-0 text-white text-xs gap-1.5" onClick={() => handleSave("aguardando")}>
                        <Send className="w-3 h-3" /> Enviar para Assinatura
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Admin Signature Dialog */}
      <Dialog open={signOpen} onOpenChange={setSignOpen}>
        <DialogContent className="glass-card border-[0.5px] max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[hsl(var(--foreground))] text-sm">Assinatura da CONTRATADA</DialogTitle>
          </DialogHeader>
          <SignaturePad
            label="Assine abaixo como representante da NovaesWeb"
            onSave={(dataUrl) => { setAdminSignature(dataUrl); setSignOpen(false); toast({ title: "Assinatura adicionada!" }); }}
            onCancel={() => setSignOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto glass-card border-[0.5px]">
          <DialogHeader>
            <DialogTitle className="text-[hsl(var(--foreground))] text-sm flex items-center justify-between">
              Pré-visualização do Contrato
              {previewContrato && (
                <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => handleDownloadPDF(previewContrato)}>
                  <Download className="w-3 h-3" /> Baixar PDF
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="bg-white text-black p-8 rounded-lg font-serif text-sm leading-relaxed whitespace-pre-wrap">
            {previewText}
          </div>
          {previewContrato && (
            <div className="bg-white p-4 rounded-lg space-y-4">
              {(previewContrato as any).assinatura_admin && (
                <div>
                  <p className="text-xs font-bold text-gray-600 mb-1">Assinatura CONTRATADA:</p>
                  <img src={(previewContrato as any).assinatura_admin} alt="Assinatura Admin" className="h-16" />
                </div>
              )}
              {(previewContrato as any).assinatura_cliente && (
                <div>
                  <p className="text-xs font-bold text-gray-600 mb-1">Assinatura CONTRATANTE:</p>
                  <img src={(previewContrato as any).assinatura_cliente} alt="Assinatura Cliente" className="h-16" />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
