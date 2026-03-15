import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import logoImg from "@/assets/novaesweb-logo.png";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) {
      toast({
        title: "Erro no login",
        description: "E-mail ou senha incorretos.",
        variant: "destructive",
      });
    } else {
      toast({ title: "Login realizado!", description: "Bem-vindo ao painel administrativo." });
      navigate("/admin");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "#0d0d14" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm space-y-8"
      >
        <div className="flex justify-center">
          <img src={logoImg} alt="NovaesWeb" className="w-56 h-auto rounded-xl" />
        </div>

        <form
          onSubmit={handleLogin}
          className="space-y-4 p-6 rounded-2xl"
          style={{ background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.08)" }}
        >
          <div>
            <Label className="text-xs text-white/50">E-mail</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@email.com"
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
              onChange={(e) => setSenha(e.target.value)}
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
            {loading ? "Entrando..." : "Entrar no Painel"}
          </Button>
        </form>

        <p className="text-center text-[10px] text-white/20">Painel Administrativo • NovaesWeb</p>
      </motion.div>
    </div>
  );
}
