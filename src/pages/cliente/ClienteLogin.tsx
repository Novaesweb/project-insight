import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { clientes } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";

export default function ClienteLogin() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const cliente = clientes.find(c => c.email === email && c.status === "ativo");
      if (cliente) {
        localStorage.setItem("clienteLogado", JSON.stringify(cliente));
        toast({ title: "Login realizado!", description: `Bem-vindo, ${cliente.nome}` });
        navigate("/cliente/dashboard");
      } else {
        toast({ title: "Erro", description: "E-mail ou senha incorretos", variant: "destructive" });
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "#0d0d14" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm space-y-8"
      >
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #e8334a, #c2185b, #7b1fa2)" }}>
              <span className="text-white font-bold text-lg">NW</span>
            </div>
          </div>
          <div>
            <span className="text-xl font-bold">
              <span style={{ background: "linear-gradient(135deg, #e8334a, #c2185b, #7b1fa2)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Novaes</span>
              <span className="text-white">Web</span>
            </span>
            <p className="text-xs text-white/40 tracking-widest uppercase mt-1">Portal do Cliente</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4 p-6 rounded-2xl" style={{ background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.08)" }}>
          <div>
            <Label className="text-xs text-white/50">E-mail</Label>
            <Input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              className="border-0 text-white placeholder:text-white/30 mt-1"
              style={{ background: "rgba(255,255,255,0.06)" }}
            />
          </div>
          <div>
            <Label className="text-xs text-white/50">Senha</Label>
            <Input
              type="password"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              placeholder="••••••••"
              required
              className="border-0 text-white placeholder:text-white/30 mt-1"
              style={{ background: "rgba(255,255,255,0.06)" }}
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full border-0 text-white font-semibold"
            style={{ background: "linear-gradient(135deg, #e8334a, #c2185b, #7b1fa2)" }}
          >
            {loading ? "Entrando..." : "Entrar"}
          </Button>
          <button type="button" className="w-full text-xs text-white/40 hover:text-white/60 transition-colors">
            Esqueci minha senha
          </button>
        </form>

        <p className="text-center text-[10px] text-white/20">
          Use o e-mail de um cliente ativo para testar (ex: contato@techsolutions.com)
        </p>
      </motion.div>
    </div>
  );
}
