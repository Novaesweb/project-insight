import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { BellRing } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { subscribeToPush, unsubscribeFromPush, isSubscribed, isPushSupported } from "@/lib/push-notifications";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function ClienteDados() {
  const cliente = JSON.parse(localStorage.getItem("clienteLogado") || "{}");
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushSupported, setPushSupportedState] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [dados, setDados] = useState({
    nome: cliente.nome || "",
    email: cliente.email || "",
    telefone: cliente.telefone || "",
    endereco: cliente.endereco || "",
    cidade: cliente.cidade || "",
    estado: cliente.estado || "",
    senha: cliente.senha || "",
  });

  useEffect(() => {
    isPushSupported().then(setPushSupportedState);
    isSubscribed().then(setPushEnabled);
  }, []);

  const handleSave = async () => {
    setLoading(true);
    const { error } = await supabase.from("clientes").update(dados as any).eq("id", cliente.id);
    if (!error) {
      localStorage.setItem("clienteLogado", JSON.stringify({ ...cliente, ...dados }));
      toast({ title: "Dados atualizados!", description: "Suas informações foram salvas com sucesso." });
    } else {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    }
    setLoading(false);
  };

  const handleTogglePush = async () => {
    setPushLoading(true);
    try {
      if (pushEnabled) {
        await unsubscribeFromPush();
        setPushEnabled(false);
        toast({ title: "Notificações desativadas" });
      } else {
        const success = await subscribeToPush("cliente", cliente.id);
        if (success) {
          setPushEnabled(true);
          toast({ title: "Notificações ativadas!", description: "Você receberá alertas sobre seus projetos." });
        } else {
          toast({ title: "Não foi possível ativar", description: "Verifique se permitiu notificações no navegador.", variant: "destructive" });
        }
      }
    } catch {
      toast({ title: "Erro ao configurar notificações", variant: "destructive" });
    }
    setPushLoading(false);
  };

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-6 pb-10">
      <h1 className="text-lg font-bold text-white">Meus Dados</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6">
        <div className="space-y-6">
          <Card className="border-[0.5px] border-white/[0.08]" style={{ background: "rgba(255,255,255,0.04)" }}>
            <CardContent className="p-5 space-y-4">
              <h2 className="text-sm font-bold text-white mb-2">Informações Pessoais</h2>
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
                      className="border-0 text-white mt-1 h-9 text-sm"
                      style={{ background: "rgba(255,255,255,0.06)" }}
                    />
                  </div>
                ))}
              </div>
              <Button disabled={loading} className="gradient-primary border-0 text-white" onClick={handleSave}>
                {loading ? "Salvando..." : "Salvar alterações"}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-[0.5px] border-white/[0.08]" style={{ background: "rgba(255,255,255,0.04)" }}>
            <CardContent className="p-5 space-y-4">
              <h2 className="text-sm font-bold text-white mb-2">Acesso ao Portal</h2>
              <div className="space-y-1.5 max-w-sm">
                <Label className="text-xs text-white/50">Sua Senha Atual / Nova Senha</Label>
                <Input
                  type="text"
                  value={dados.senha}
                  onChange={e => setDados(prev => ({ ...prev, senha: e.target.value }))}
                  className="border-0 text-white mt-1 h-9 text-sm font-mono"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                />
                <p className="text-[10px] text-white/30 italic">Use uma senha segura que você lembre facilmente.</p>
              </div>
              <Button disabled={loading} className="gradient-primary border-0 text-white" onClick={handleSave}>
                {loading ? "Atualizar Senha" : "Salvar Senha"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-[0.5px] border-white/[0.08]" style={{ background: "rgba(255,255,255,0.04)" }}>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <BellRing className="w-4 h-4 text-white" />
                <h2 className="text-sm font-bold text-white">Notificações Push</h2>
              </div>
              <p className="text-xs text-white/40 leading-relaxed">Receba alertas sobre atualizações de projetos e contratos — mesmo com o site fechado.</p>
              
              {!pushSupported ? (
                <p className="text-xs text-yellow-400">Seu navegador não suporta notificações push.</p>
              ) : (
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 mt-4">
                  <div>
                    <p className="text-xs font-medium text-white">
                      {pushEnabled ? "Ativadas" : "Desativadas"}
                    </p>
                  </div>
                  <Switch checked={pushEnabled} onCheckedChange={handleTogglePush} disabled={pushLoading} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}


