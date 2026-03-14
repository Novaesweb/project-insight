import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Plus, Pencil, Package, Zap, RefreshCw, UserPlus } from "lucide-react";
import { extrasCatalogo, type CategoriaExtra } from "@/lib/mock-data";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const stagger = { show: { transition: { staggerChildren: 0.06 } } };

const catConfig: Record<CategoriaExtra, { label: string; color: string; bgColor: string; borderColor: string; icon: typeof Package }> = {
  fixo: { label: "Fixo", color: "text-emerald-400", bgColor: "bg-emerald-500/10", borderColor: "border-emerald-500/30", icon: Package },
  intermediario: { label: "Intermediário", color: "text-amber-400", bgColor: "bg-amber-500/10", borderColor: "border-amber-500/30", icon: Zap },
  mensal: { label: "Mensal", color: "text-blue-400", bgColor: "bg-blue-500/10", borderColor: "border-blue-500/30", icon: RefreshCw },
};

export default function Extras() {
  const [busca, setBusca] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todos");
  const [categoria, setCategoria] = useState<CategoriaExtra>("fixo");

  const filtrados = extrasCatalogo.filter((e) => {
    const matchBusca = e.nome.toLowerCase().includes(busca.toLowerCase());
    const matchCat = filtroCategoria === "todos" || e.categoria === filtroCategoria;
    return matchBusca && matchCat;
  });

  const totalFixos = extrasCatalogo.filter(e => e.categoria === "fixo").length;
  const totalInter = extrasCatalogo.filter(e => e.categoria === "intermediario").length;
  const totalMensais = extrasCatalogo.filter(e => e.categoria === "mensal").length;

  const groupedExtras = {
    fixo: filtrados.filter(e => e.categoria === "fixo"),
    intermediario: filtrados.filter(e => e.categoria === "intermediario"),
    mensal: filtrados.filter(e => e.categoria === "mensal"),
  };

  return (
    <motion.div className="space-y-6" initial="hidden" animate="show" variants={stagger}>
      {/* Summary Cards */}
      <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-4" variants={fadeUp}>
        <Card className="glass-card border-[0.5px]">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-[hsl(var(--muted-foreground))]">Total de Extras</p>
            <p className="text-2xl font-bold text-white mt-1">{extrasCatalogo.length}</p>
          </CardContent>
        </Card>
        {([["fixo", totalFixos, "emerald"], ["intermediario", totalInter, "amber"], ["mensal", totalMensais, "blue"]] as const).map(([cat, count, color]) => (
          <Card key={cat} className="glass-card border-[0.5px]">
            <CardContent className="p-4 text-center">
              <p className="text-xs text-[hsl(var(--muted-foreground))]">{catConfig[cat].label}</p>
              <p className={`text-2xl font-bold mt-1 text-${color}-400`}>{count}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Search & Filters */}
      <motion.div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between" variants={fadeUp}>
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
            <Input placeholder="Buscar extra..." className="pl-9 glass-input border-0 text-white text-sm" value={busca} onChange={(e) => setBusca(e.target.value)} />
          </div>
          <div className="flex gap-2">
            {[{ key: "todos", label: "Todos" }, { key: "fixo", label: "Fixos" }, { key: "intermediario", label: "Intermediários" }, { key: "mensal", label: "Mensais" }].map((f) => (
              <Button key={f.key} size="sm"
                className={filtroCategoria === f.key ? "gradient-primary border-0 text-white text-xs" : "glass-input border-0 text-[hsl(var(--muted-foreground))] hover:text-white text-xs"}
                onClick={() => setFiltroCategoria(f.key)}>
                {f.label}
              </Button>
            ))}
          </div>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="gradient-primary border-0 text-white rounded-lg">
              <Plus className="w-4 h-4 mr-2" /> Cadastrar novo extra
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-[0.5px] text-white max-w-md">
            <DialogHeader><DialogTitle className="text-white">Novo Extra</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-[hsl(var(--muted-foreground))]">Nome do extra</Label>
                <Input className="glass-input border-[rgba(255,255,255,0.1)] text-white text-sm h-9" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-[hsl(var(--muted-foreground))]">Descrição curta</Label>
                <Input className="glass-input border-[rgba(255,255,255,0.1)] text-white text-sm h-9" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-[hsl(var(--muted-foreground))]">Categoria</Label>
                <select className="w-full h-9 rounded-lg glass-input border border-[rgba(255,255,255,0.1)] text-white text-sm px-3 bg-transparent"
                  value={categoria} onChange={(e) => setCategoria(e.target.value as CategoriaExtra)}>
                  <option value="fixo">Fixo (paga uma vez)</option>
                  <option value="intermediario">Intermediário (ativação + mensal)</option>
                  <option value="mensal">Mensal (recorrente)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-[hsl(var(--muted-foreground))]">Preço de ativação (R$)</Label>
                <Input type="number" className="glass-input border-[rgba(255,255,255,0.1)] text-white text-sm h-9" />
              </div>
              {(categoria === "intermediario" || categoria === "mensal") && (
                <div className="space-y-1.5">
                  <Label className="text-xs text-[hsl(var(--muted-foreground))]">Preço mensal (R$)</Label>
                  <Input type="number" className="glass-input border-[rgba(255,255,255,0.1)] text-white text-sm h-9" />
                </div>
              )}
              <div className="space-y-1.5">
                <Label className="text-xs text-[hsl(var(--muted-foreground))]">Status</Label>
                <select className="w-full h-9 rounded-lg glass-input border border-[rgba(255,255,255,0.1)] text-white text-sm px-3 bg-transparent">
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>
            </div>
            <Button className="gradient-primary border-0 text-white w-full mt-4 rounded-lg">Salvar Extra</Button>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Grouped Sections */}
      {(["fixo", "intermediario", "mensal"] as const).map((cat) => {
        const items = groupedExtras[cat];
        if (items.length === 0) return null;
        const config = catConfig[cat];

        return (
          <motion.div key={cat} className="space-y-3" variants={fadeUp}>
            <div className={`flex items-center gap-2 border-l-2 pl-3 ${config.borderColor}`}>
              <config.icon className={`w-4 h-4 ${config.color}`} />
              <h3 className={`text-sm font-semibold ${config.color} uppercase tracking-wider`}>
                {cat === "fixo" ? "Extras Fixos" : cat === "intermediario" ? "Extras Intermediários" : "Extras Mensais"}
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full glass-card text-[hsl(var(--muted-foreground))]">{items.length}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {items.map((extra) => (
                <Card key={extra.id} className={`glass-card border-[0.5px] hover:${config.borderColor} transition-all group`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-medium text-white leading-tight">{extra.nome}</h4>
                      <Badge variant="outline" className={`text-[9px] ${config.color} ${config.borderColor} shrink-0 ml-2`}>
                        {config.label}
                      </Badge>
                    </div>

                    <div className="space-y-1 mb-3">
                      {extra.precoAtivacao > 0 && (
                        <p className="text-sm">
                          <span className="text-[hsl(var(--muted-foreground))] text-xs">Ativação: </span>
                          <span className="text-white font-semibold">R$ {extra.precoAtivacao.toFixed(2).replace(".", ",")}</span>
                        </p>
                      )}
                      {extra.precoMensal > 0 && (
                        <p className="text-sm">
                          <span className="text-[hsl(var(--muted-foreground))] text-xs">Mensal: </span>
                          <span className={`font-semibold ${config.color}`}>R$ {extra.precoMensal.toFixed(2).replace(".", ",")}/mês</span>
                        </p>
                      )}
                      {extra.precoAtivacao === 0 && extra.precoMensal === 0 && (
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">Consultar valor</p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1 glass-input border-0 text-[hsl(var(--muted-foreground))] hover:text-white text-[10px] h-7">
                        <Pencil className="w-3 h-3 mr-1" /> Editar
                      </Button>
                      <Button size="sm" className="flex-1 gradient-primary border-0 text-white text-[10px] h-7">
                        <UserPlus className="w-3 h-3 mr-1" /> Adicionar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
