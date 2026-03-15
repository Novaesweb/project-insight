import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const statusColors: Record<string, string> = { aguardando: "#facc15", assinado: "#4ade80", cancelado: "#ef4444" };
const statusLabels: Record<string, string> = { aguardando: "Aguardando assinatura", assinado: "Assinado", cancelado: "Cancelado" };

export default function ClienteContratos() {
  const cliente = JSON.parse(localStorage.getItem("clienteLogado") || "{}");
  const { toast } = useToast();
  const [contratos, setContratos] = useState<any[]>([]);

  useEffect(() => {
    if (!cliente.id) return;
    supabase.from("contratos").select("*").eq("cliente_id", cliente.id).order("created_at", { ascending: false })
      .then(({ data }) => setContratos(data || []));
  }, [cliente.id]);

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-6">
      <h1 className="text-lg font-bold text-white">Meus Contratos</h1>
      <div className="space-y-3">
        {contratos.map(c => (
          <Card key={c.id} className={`border-[0.5px] ${c.status === "aguardando" ? "border-yellow-500/30" : "border-white/[0.08]"}`} style={{ background: "rgba(255,255,255,0.04)" }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-white/40" />
                  <span className="text-sm font-medium text-white">{c.titulo}</span>
                </div>
                <Badge variant="outline" className="text-[10px] border-0 px-2" style={{ backgroundColor: statusColors[c.status] + "22", color: statusColors[c.status] }}>
                  {statusLabels[c.status]}
                </Badge>
              </div>
              <p className="text-xs text-white/40 mb-3">{c.descricao}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-[11px] text-white/40">
                  <span>Valor: R$ {Number(c.valor).toLocaleString("pt-BR")}</span>
                  <span>Enviado: {c.data_envio}</span>
                  {c.data_assinatura && <span>Assinado: {c.data_assinatura}</span>}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" className="text-white/50 text-xs h-7">
                    <Download className="w-3 h-3 mr-1" /> PDF
                  </Button>
                  {c.status === "aguardando" && (
                    <Button size="sm" className="text-[10px] h-7 border-0 text-white" style={{ background: "linear-gradient(135deg, #e8334a, #7b1fa2)" }}
                      onClick={() => toast({ title: "Contrato assinado!", description: `${c.titulo} assinado com sucesso.` })}>
                      Assinar agora
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {contratos.length === 0 && <p className="text-sm text-white/40 text-center py-8">Nenhum contrato encontrado</p>}
      </div>
    </motion.div>
  );
}
