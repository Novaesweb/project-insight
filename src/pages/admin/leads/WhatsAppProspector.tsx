import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Upload, MessageCircle, FileSpreadsheet, Check } from "lucide-react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface LeadRow {
  Empresa: string;
  Categoria: string;
  WhatsApp: string;
  RawPhone: string;
}

function formatWhatsApp(rawNumber: string | number) {
  if (!rawNumber) return "";
  let clean = rawNumber.toString().replace(/\D/g, "");
  if (!clean.startsWith("55") && clean.length >= 10) {
    clean = "55" + clean;
  }
  return clean;
}

export default function WhatsAppProspector() {
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [template, setTemplate] = useState("Olá, tudo bem? Vi o perfil da {empresa} no Google e decidi entrar em contato.");
  const [clicked, setClicked] = useState<Set<number>>(new Set());

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      
      const sheetName = workbook.SheetNames.includes("WhatsApp") 
        ? "WhatsApp" 
        : workbook.SheetNames[workbook.SheetNames.length - 1];
        
      const sheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(sheet);

      const parsedLeads: LeadRow[] = json.map((row: any) => {
        const Empresa = row["Empresa"] || row["Title"] || row["Nome"] || "Empresa";
        const Categoria = row["O que faz"] || row["Categoria"] || row["Category"] || "Sem categoria";
        const RawPhone = row["Numero WhatsApp"] || row["Phone"] || row["Telefone"] || "";
        const WhatsApp = formatWhatsApp(RawPhone);
        return { Empresa, Categoria, RawPhone, WhatsApp };
      }).filter(l => l.WhatsApp);

      setLeads(parsedLeads);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleWhatsAppClick = (index: number, lead: LeadRow) => {
    const message = template.replace(/{empresa}/gi, lead.Empresa);
    const url = `https://wa.me/${lead.WhatsApp}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
    
    setClicked(prev => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  };

  const filteredLeads = leads.filter(l => 
    l.Empresa.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.Categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      className="space-y-8 pb-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.25em] text-emerald-300 mb-4">
            <MessageCircle className="h-3.5 w-3.5" />
            Prospecção Rápida
          </div>
          <h1 className="text-4xl font-light tracking-tight text-[var(--admin-text)] md:text-5xl" style={{ fontFamily: "'Playfair Display', serif" }}>
            Gerador de Links <span className="text-emerald-400 italic">WhatsApp</span>
          </h1>
          <p className="mt-2 text-sm text-[var(--admin-muted)] max-w-2xl">
            Carregue sua planilha de captação (Google Places, Apollo, etc) e dispare mensagens pelo WhatsApp Web rapidamente com templates dinâmicos.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card-admin p-6 rounded-2xl border border-white/5 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--admin-muted)] mb-4">1. Fonte de Dados</h3>
            <div className="relative">
              <Input 
                type="file" 
                accept=".xlsx, .xls, .csv" 
                className="hidden" 
                id="file-upload" 
                onChange={handleFileUpload} 
              />
              <label 
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/10 rounded-xl hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all cursor-pointer text-center px-4"
              >
                <FileSpreadsheet className="h-8 w-8 text-[var(--admin-muted)] mb-2" />
                <span className="text-sm text-[var(--admin-text)] font-medium">Clique para subir a planilha (.xlsx)</span>
                <span className="text-xs text-[var(--admin-muted)] mt-1">
                  {leads.length > 0 ? `${leads.length} leads carregados` : "Nenhum arquivo carregado"}
                </span>
              </label>
            </div>
          </div>

          <div className="glass-card-admin p-6 rounded-2xl border border-white/5 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--admin-muted)] mb-4">2. Mensagem</h3>
            <div className="space-y-2">
              <label className="text-xs text-[var(--admin-muted)]">Template (use <code>{'{empresa}'}</code>)</label>
              <Textarea 
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                className="min-h-[120px] bg-white/5 border-white/10 resize-none text-sm"
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card-admin p-6 rounded-2xl border border-white/5 h-full flex flex-col">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--admin-muted)]">3. Lista de Contatos</h3>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--admin-muted)]" />
                <Input 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar empresa ou ramo..." 
                  className="pl-9 bg-white/5 border-white/10 h-10"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3" style={{ maxHeight: "calc(100vh - 300px)" }}>
              {leads.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-[var(--admin-muted)] space-y-3 py-12">
                  <Upload className="h-12 w-12 opacity-20" />
                  <p className="text-sm">Faça o upload de uma planilha para começar</p>
                </div>
              ) : filteredLeads.length === 0 ? (
                <div className="py-12 text-center text-[var(--admin-muted)]">
                  Nenhum resultado para "{searchTerm}"
                </div>
              ) : (
                <AnimatePresence>
                  {filteredLeads.map((lead, index) => {
                    const isClicked = clicked.has(index);
                    return (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={index} 
                        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black uppercase tracking-wider text-[var(--admin-muted)] bg-white/5 px-2 py-0.5 rounded-full">
                              {lead.Categoria}
                            </span>
                          </div>
                          <h4 className="font-bold text-[var(--admin-text)]">{lead.Empresa}</h4>
                          <p className="text-xs text-[var(--admin-muted)] mt-1">{lead.RawPhone}</p>
                        </div>
                        
                        <Button
                          onClick={() => handleWhatsAppClick(index, lead)}
                          variant={isClicked ? "outline" : "default"}
                          className={isClicked 
                            ? "w-full sm:w-auto border-emerald-500/30 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 hover:text-emerald-300"
                            : "w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20"}
                        >
                          {isClicked ? (
                            <>
                              <Check className="w-4 h-4 mr-2" />
                              Enviado
                            </>
                          ) : (
                            <>
                              <MessageCircle className="w-4 h-4 mr-2" />
                              Conversar
                            </>
                          )}
                        </Button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
