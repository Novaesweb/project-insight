import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { extrasClientes, extrasCatalogo } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const catColors: Record<string, string> = { fixo: "#4ade80", intermediario: "#facc15", mensal: "#60a5fa" };
const catLabels: Record<string, string> = { fixo: "Fixo", intermediario: "Intermediário", mensal: "Mensal" };

export default function ClienteExtras() {
  const cliente = JSON.parse(localStorage.getItem("clienteLogado") || "{}");
  const { toast } = useToast();
  const [showCatalogo, setShowCatalogo] = useState(false);

  const meusExtras = extrasClientes.filter(e => e.clienteId === cliente.id);
  const ativos = meusExtras.filter(e => e.status === "ativo");
  const totalMensal = ativos.reduce((acc, e) => acc + e.precoMensal, 0);
  const totalAtivacao = ativos.reduce((acc, e) => acc + e.precoAtivacao, 0);

  const handleSolicitar = (nome: string) => {
    toast({ title: "Solicitação enviada!", description: `Extra "${nome}" solicitado. Aguarde aprovação do admin.` });
    setShowCatalogo(false);
  };

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-white">Meus Extras</h1>
        <Button className="border-0 text-white text-xs" style={{ background: "linear-gradient(135deg, #e8334a, #c2185b, #7b1fa2)" }} onClick={() => setShowCatalogo(true)}>
          Ver catálogo
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="border-[0.5px] border-white/[0.08]" style={{ background: "rgba(255,255,255,0.04)" }}>
          <CardContent className="p-4">
            <p className="text-[10px] text-white/40">Total mensal recorrente</p>
            <p className="text-lg font-bold text-green-400">R$ {totalMensal.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="border-[0.5px] border-white/[0.08]" style={{ background: "rgba(255,255,255,0.04)" }}>
          <CardContent className="p-4">
            <p className="text-[10px] text-white/40">Total pago em ativações</p>
            <p className="text-lg font-bold text-blue-400">R$ {totalAtivacao.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        {meusExtras.map(e => (
          <Card key={e.id} className="border-[0.5px] border-white/[0.08]" style={{ background: "rgba(255,255,255,0.04)" }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-white">{e.extraNome}</span>
                <Badge variant="outline" className="text-[10px] border-0 px-2" style={{ backgroundColor: (e.status === "ativo" ? "#4ade80" : e.status === "pausado" ? "#facc15" : "#ef4444") + "22", color: e.status === "ativo" ? "#4ade80" : e.status === "pausado" ? "#facc15" : "#ef4444" }}>
                  {e.status}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-[11px] text-white/40">
                <Badge variant="outline" className="text-[9px] border-0 px-1.5" style={{ backgroundColor: catColors[e.categoria] + "22", color: catColors[e.categoria] }}>{catLabels[e.categoria]}</Badge>
                <span>Ativação: R$ {e.precoAtivacao.toFixed(2)}</span>
                {e.precoMensal > 0 && <span>Mensal: R$ {e.precoMensal.toFixed(2)}</span>}
                <span>Desde: {e.dataAtivacao}</span>
              </div>
            </CardContent>
          </Card>
        ))}
        {meusExtras.length === 0 && <p className="text-sm text-white/40 text-center py-8">Nenhum extra contratado</p>}
      </div>

      <Dialog open={showCatalogo} onOpenChange={setShowCatalogo}>
        <DialogContent className="text-white max-w-2xl max-h-[80vh] overflow-y-auto" style={{ background: "#0d0d14", border: "0.5px solid rgba(255,255,255,0.08)" }}>
          <DialogHeader><DialogTitle>Catálogo de Extras</DialogTitle></DialogHeader>
          <div className="space-y-2">
            {extrasCatalogo.filter(e => e.status === "ativo").map(e => (
              <div key={e.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.06)" }}>
                <div>
                  <p className="text-sm text-white font-medium">{e.nome}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[9px] border-0 px-1.5" style={{ backgroundColor: catColors[e.categoria] + "22", color: catColors[e.categoria] }}>{catLabels[e.categoria]}</Badge>
                    <span className="text-[10px] text-white/40">
                      {e.precoAtivacao > 0 && `R$ ${e.precoAtivacao.toFixed(2)}`}
                      {e.precoAtivacao > 0 && e.precoMensal > 0 && " + "}
                      {e.precoMensal > 0 && `R$ ${e.precoMensal.toFixed(2)}/mês`}
                    </span>
                  </div>
                </div>
                <Button size="sm" className="text-[10px] h-7 border-0 text-white" style={{ background: "linear-gradient(135deg, #e8334a, #7b1fa2)" }} onClick={() => handleSolicitar(e.nome)}>
                  Solicitar
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
