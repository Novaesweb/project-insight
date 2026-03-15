import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function ClienteDados() {
  const cliente = JSON.parse(localStorage.getItem("clienteLogado") || "{}");
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [dados, setDados] = useState({
    nome: cliente.nome || "",
    email: cliente.email || "",
    telefone: cliente.telefone || "",
    endereco: cliente.endereco || "",
    cidade: cliente.cidade || "",
    estado: cliente.estado || "",
  });

  const handleSave = async () => {
    setLoading(true);
    const { error } = await supabase.from("clientes").update(dados).eq("id", cliente.id);
    if (!error) {
      localStorage.setItem("clienteLogado", JSON.stringify({ ...cliente, ...dados }));
      toast({ title: "Dados atualizados!", description: "Suas informações foram salvas com sucesso." });
    } else {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-6">
      <h1 className="text-lg font-bold text-white">Meus Dados</h1>

      <Card className="border-[0.5px] border-white/[0.08]" style={{ background: "rgba(255,255,255,0.04)" }}>
        <CardContent className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "Nome completo", key: "nome" },
              { label: "E-mail", key: "email" },
              { label: "Telefone", key: "telefone" },
              { label: "Endereço", key: "endereco" },
              { label: "Cidade", key: "cidade" },
              { label: "Estado", key: "estado" },
            ].map(field => (
              <div key={field.key}>
                <Label className="text-xs text-white/50">{field.label}</Label>
                <Input
                  value={dados[field.key as keyof typeof dados]}
                  onChange={e => setDados(prev => ({ ...prev, [field.key]: e.target.value }))}
                  className="border-0 text-white mt-1"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                />
              </div>
            ))}
          </div>
          <Button disabled={loading} className="border-0 text-white" style={{ background: "linear-gradient(135deg, #e8334a, #c2185b, #7b1fa2)" }} onClick={handleSave}>
            {loading ? "Salvando..." : "Salvar alterações"}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
