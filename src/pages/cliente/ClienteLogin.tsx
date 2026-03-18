import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Mail, Lock, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import logoImg from "@/assets/novaesweb-logo-full.jpeg";

export default function ClienteLogin() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Login with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (authError) {
      toast({ title: "Erro", description: "E-mail ou senha incorretos", variant: "destructive" });
      setLoading(false);
      return;
    }

    // Fetch client record by email
    const { data: clienteData } = await supabase
      .from("clientes")
      .select("*")
      .eq("email", email)
      .eq("status", "ativo")
      .maybeSingle();

    if (clienteData) {
      localStorage.setItem("clienteLogado", JSON.stringify(clienteData));
      toast({ title: "Login realizado!", description: `Bem-vindo, ${clienteData.nome}` });
      navigate("/cliente/dashboard");
    } else {
      toast({ title: "Erro", description: "Conta de cliente não encontrada ou inativa", variant: "destructive" });
      await supabase.auth.signOut();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[hsl(var(--background))] login-rays">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-[400px] space-y-8 relative z-10"
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-col items-center gap-4"
        >
          <img src={logoImg} alt="NovaesWeb" className="w-48 h-auto rounded-xl" />
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className="px-3 py-1.5 rounded-full bg-[hsl(var(--muted))]">
              <div className="flex items-center gap-1.5">
                <User className="w-3 h-3 text-[hsl(var(--primary))]" />
                <span className="text-[10px] font-semibold tracking-widest uppercase text-[hsl(var(--muted-foreground))]">
                  Portal do Cliente
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          onSubmit={handleLogin}
          className="space-y-5 p-8 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]/80 backdrop-blur-xl shadow-2xl shadow-[hsl(var(--primary))]/5"
        >
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-[hsl(var(--muted-foreground))]">E-mail</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="pl-10 bg-[hsl(var(--muted))] border-[hsl(var(--border))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]/50 h-11"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-[hsl(var(--muted-foreground))]">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
              <Input
                type="password"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                placeholder="••••••••"
                required
                className="pl-10 bg-[hsl(var(--muted))] border-[hsl(var(--border))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]/50 h-11"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 border-0 text-[hsl(var(--primary-foreground))] font-semibold text-sm gradient-primary shadow-lg shadow-[hsl(var(--primary))]/25 hover:shadow-[hsl(var(--primary))]/40 transition-shadow"
          >
            {loading ? "Entrando..." : "Acessar minha conta"}
          </Button>
        </motion.form>

        <p className="text-center text-[10px] text-[hsl(var(--muted-foreground))]/50">
          NovaesWeb © 2025 · Área exclusiva para clientes
        </p>
      </motion.div>
    </div>
  );
}
