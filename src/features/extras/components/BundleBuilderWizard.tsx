import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Package, 
  Plus, 
  Trash2, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Sparkles,
  Zap,
  Star,
  Rocket,
  Search,
  ShoppingCart
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useExtras } from "@/features/extras/hooks/useExtras";
import { cn } from "@/lib/utils";
import { SuccessCelebration } from "@/components/SuccessCelebration";

const steps = [
  { id: "info", title: "Informações", icon: Package },
  { id: "items", title: "Composição", icon: Plus },
  { id: "pricing", title: "Pricing", icon: Rocket },
  { id: "preview", title: "Finalização", icon: Check },
];

export function BundleBuilderWizard({ onComplete }: { onComplete?: () => void }) {
  const { catalog } = useExtras();
  const [step, setStep] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [busca, setBusca] = useState("");
  
  const [bundleData, setBundleData] = useState({
    nome: "",
    descricao: "",
    itens: [] as any[],
    preco_total: 0,
    preco_mensal: 0,
  });

  const nextStep = () => setStep(s => Math.min(s + 1, steps.length - 1));
  const prevStep = () => setStep(s => Math.max(s - 1, 0));

  const toggleItem = (item: any) => {
    setBundleData(prev => {
      const exists = prev.itens.find(i => i.id === item.id);
      if (exists) {
        return { ...prev, itens: prev.itens.filter(i => i.id !== item.id) };
      }
      return { ...prev, itens: [...prev.itens, item] };
    });
  };

  const handleFinish = () => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onComplete?.();
    }, 3000);
  };

  const filteredCatalog = catalog.filter(item => 
    item.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Step Indicator */}
      <div className="flex items-center justify-between px-4">
        {steps.map((s, idx) => (
          <div key={s.id} className="flex flex-col items-center gap-2 relative">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 z-10",
              step >= idx 
                ? "bg-primary text-white shadow-lg shadow-primary/20 scale-110" 
                : "bg-white/5 text-white/20 border border-white/5"
            )}>
              <s.icon size={20} />
            </div>
            <span className={cn(
              "text-[9px] font-black uppercase tracking-widest transition-colors",
              step >= idx ? "text-white" : "text-white/20"
            )}>{s.title}</span>
            
            {idx < steps.length - 1 && (
              <div className={cn(
                "absolute left-[120%] top-6 h-[2px] w-20 transition-colors hidden md:block",
                step > idx ? "bg-primary" : "bg-white/5"
              )} />
            )}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {step === 0 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-white">Defina a identidade do Bundle</h3>
                  <p className="text-sm text-white/40">Como este combo aparecerá para o cliente no portal?</p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Nome do Pacote</label>
                    <Input 
                      placeholder="Ex: Combo Performance 2024"
                      className="h-14 bg-white/5 border-white/10 rounded-2xl text-lg font-bold"
                      value={bundleData.nome}
                      onChange={e => setBundleData({ ...bundleData, nome: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Descrição de Valor</label>
                    <Textarea 
                      placeholder="Descreva os benefícios de contratar este conjunto de módulos..."
                      className="min-h-[120px] bg-white/5 border-white/10 rounded-2xl"
                      value={bundleData.descricao}
                      onChange={e => setBundleData({ ...bundleData, descricao: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-white">Composição do Combo</h3>
                    <p className="text-sm text-white/40">Selecione os módulos que fazem parte deste pacote.</p>
                  </div>
                  <Badge className="bg-primary/20 text-primary border-0 h-8 px-4 rounded-full font-black">
                    {bundleData.itens.length} selecionados
                  </Badge>
                </div>

                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
                  <Input 
                    placeholder="Buscar módulos no catálogo..."
                    className="h-12 pl-11 bg-white/5 border-white/10 rounded-2xl"
                    value={busca}
                    onChange={e => setBusca(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                  {filteredCatalog.map(item => {
                    const isSelected = bundleData.itens.find(i => i.id === item.id);
                    return (
                      <div 
                        key={item.id}
                        onClick={() => toggleItem(item)}
                        className={cn(
                          "p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between",
                          isSelected 
                            ? "bg-primary/10 border-primary/40 shadow-lg shadow-primary/5" 
                            : "bg-white/5 border-white/5 hover:border-white/10"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "p-2 rounded-lg",
                            isSelected ? "bg-primary text-white" : "bg-white/10 text-white/40"
                          )}>
                            <Zap size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{item.nome}</p>
                            <p className="text-[10px] text-white/40">R$ {item.preco_total || 0}</p>
                          </div>
                        </div>
                        {isSelected && <Check size={16} className="text-primary" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-white">Estratégia de Pricing</h3>
                  <p className="text-sm text-white/40">Defina o preço promocional para o pacote completo.</p>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="p-8 rounded-3xl bg-white/5 border border-white/10 space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Valor Original Acumulado</p>
                    <p className="text-4xl font-black text-white/20 line-through">
                      R$ {bundleData.itens.reduce((acc, i) => acc + (i.preco_total || 0), 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-8 rounded-3xl bg-primary/5 border border-primary/20 space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">Preço Especial do Bundle</p>
                    <Input 
                      type="number"
                      className="h-14 bg-transparent border-0 border-b border-primary/20 rounded-none text-4xl font-black text-white focus:ring-0 p-0"
                      value={bundleData.preco_total}
                      onChange={e => setBundleData({ ...bundleData, preco_total: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex gap-4">
                  <div className="p-2 h-fit rounded-lg bg-amber-500/20 text-amber-500">
                    <Star size={20} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white">Desconto Sugerido: 20%</p>
                    <p className="text-xs text-white/40 italic">Bundles com descontos entre 15% e 25% têm maior taxa de conversão no portal.</p>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8">
                <div className="space-y-1 text-center">
                  <div className="inline-flex p-4 rounded-3xl bg-primary/10 text-primary mb-4">
                    <Sparkles size={32} />
                  </div>
                  <h3 className="text-3xl font-black text-white">Pronto para Lançar?</h3>
                  <p className="text-sm text-white/40">Confira o resumo do seu novo bundle premium.</p>
                </div>

                <Card className="glass-card-premium border-primary/20 overflow-hidden max-w-md mx-auto">
                  <CardContent className="p-8 space-y-6">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-primary/20 text-primary border-0">Pacote Premium</Badge>
                      <ShoppingCart className="text-white/20" size={20} />
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-2xl font-black text-white">{bundleData.nome || "Sem Nome"}</h4>
                      <p className="text-xs text-white/40 leading-relaxed">{bundleData.descricao || "Sem descrição..."}</p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Módulos Inclusos</p>
                      <div className="flex flex-wrap gap-2">
                        {bundleData.itens.map(i => (
                          <Badge key={i.id} variant="outline" className="bg-white/5 border-white/10 text-[9px]">{i.nome}</Badge>
                        ))}
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                      <p className="text-sm font-bold text-white/40">Investimento Único</p>
                      <p className="text-3xl font-black text-primary">R$ {bundleData.preco_total.toLocaleString()}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Navigation */}
      <div className="pt-8 border-t border-white/5 flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={prevStep} 
          disabled={step === 0}
          className="text-white/40 hover:text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
        </Button>

        {step < steps.length - 1 ? (
          <Button 
            className="gradient-primary text-white font-black uppercase tracking-widest text-xs px-8 h-12 rounded-2xl shadow-xl shadow-primary/20"
            onClick={nextStep}
          >
            Próximo Passo <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button 
            className="gradient-primary text-white font-black uppercase tracking-widest text-xs px-8 h-12 rounded-2xl shadow-xl shadow-primary/20"
            onClick={handleFinish}
          >
            Publicar no Portal <Sparkles className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      {showSuccess && <SuccessCelebration message="Bundle Criado com Sucesso!" />}
    </div>
  );
}
