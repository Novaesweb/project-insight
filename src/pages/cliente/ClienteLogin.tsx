import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Mail, Lock, User, Eye, EyeOff, ShieldAlert, Timer, Sparkles, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import logoImg from "@/assets/webnovax-logo-premium.png";

export default function ClienteLogin() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockTime, setLockTime] = useState(0);

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (lockTime > 0) {
      const timer = setInterval(() => setLockTime(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [lockTime]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockTime > 0) return;
    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: senha,
    });

    let clienteRecord = null;

    if (!authError && authData.user) {
      const { data } = await supabase
        .from("clientes")
        .select("*")
        .eq("email", email.trim())
        .eq("status", "ativo")
        .maybeSingle();
      clienteRecord = data;
    } else {
      const { data } = await (supabase
        .from("clientes" as any)
        .select("*")
        .eq("email", email.trim())
        .eq("senha", senha)
        .eq("status", "ativo")
        .maybeSingle() as any);
      clienteRecord = data;
    }

    if (clienteRecord) {
      localStorage.setItem("clienteLogado", JSON.stringify(clienteRecord));
      toast({ title: "Login realizado!", description: `Bem-vindo, ${clienteRecord.nome}` });
      navigate("/cliente/dashboard");
    } else {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      if (newAttempts >= 3) {
        setLockTime(30);
        setFailedAttempts(0);
        toast({ title: "Acesso bloqueado temporariamente", description: "Muitas tentativas falhas. Aguarde 30 segundos.", variant: "destructive" });
      } else {
        toast({ title: "Erro no login", description: "E-mail ou senha incorretos.", variant: "destructive" });
      }
    }
    setLoading(false);
  };

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isFormValid = isEmailValid && senha.length >= 6 && lockTime === 0;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #07060a 0%, #1a0a2e 30%, #2d0a1f 60%, #0f0a05 100%)" }}>
      {/* Animated orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-20 blur-[120px]" style={{ background: "radial-gradient(circle, #7b1fa2, transparent 70%)" }} />
      <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full opacity-15 blur-[100px]" style={{ background: "radial-gradient(circle, #e8334a, transparent 70%)" }} />
      <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full opacity-10 blur-[80px]" style={{ background: "radial-gradient(circle, #FFD700, transparent 70%)" }} />

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-[420px] space-y-6 relative z-10"
      >
        {/* Logo & branding */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-full blur-2xl opacity-40" style={{ background: "linear-gradient(135deg, #7b1fa2, #e8334a, #FFD700)" }} />
            <img 
              src={logoImg} 
              alt="webnovax" 
              className="w-28 h-28 rounded-full object-cover relative z-10 border-2 border-white/10 shadow-2xl" 
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="px-4 py-2 rounded-full border border-white/10" style={{ background: "linear-gradient(135deg, rgba(123,31,162,0.15), rgba(232,51,74,0.15))" }}>
              <div className="flex items-center gap-2">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                </motion.div>
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ background: "linear-gradient(90deg, #c084fc, #e8334a, #FFD700)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Portal do Cliente
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Login card */}
        <motion.form
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          onSubmit={handleLogin}
          className="space-y-5 p-8 rounded-3xl border border-white/10 backdrop-blur-2xl shadow-2xl relative overflow-hidden"
          style={{ background: "linear-gradient(160deg, rgba(123,31,162,0.08), rgba(13,11,18,0.9) 40%, rgba(232,51,74,0.05))" }}
        >
          {/* Top gradient line */}
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, #7b1fa2, #c2185b, #e8334a, #FFD700)" }} />

          <AnimatePresence>
            {lockTime > 0 && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
                <Timer className="w-4 h-4 animate-pulse" />
                <span>Bloqueado por segurança: {lockTime}s restantes</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-white/50">E-mail</Label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-purple-400 transition-colors" />
              <Input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com" required disabled={loading || lockTime > 0}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 h-12 rounded-xl focus:border-purple-500/50 focus:ring-purple-500/20"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-white/50">Senha</Label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-purple-400 transition-colors" />
              <Input
                type={showPassword ? "text" : "password"} value={senha} onChange={e => setSenha(e.target.value)}
                placeholder="••••••••" required disabled={loading || lockTime > 0}
                className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 h-12 rounded-xl focus:border-purple-500/50 focus:ring-purple-500/20"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit" disabled={loading || !isFormValid}
            className="w-full h-12 border-0 text-white font-bold text-sm shadow-lg transition-all duration-300 rounded-xl group"
            style={isFormValid ? { background: "linear-gradient(135deg, #7b1fa2, #c2185b, #e8334a)" } : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.3)" }}
          >
            {loading ? "Entrando..." : lockTime > 0 ? "Aguarde..." : (
              <span className="flex items-center gap-2">Acessar minha conta <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></span>
            )}
          </Button>

          {failedAttempts > 0 && lockTime === 0 && (
            <p className="text-[10px] text-center text-red-400/80 font-medium">
              {3 - failedAttempts} tentativa(s) restante(s) antes do bloqueio técnico.
            </p>
          )}
        </motion.form>

        <p className="text-center text-[10px] text-white/30 flex items-center justify-center gap-1.5">
          <ShieldAlert className="w-3 h-3" />
          <span style={{ background: "linear-gradient(90deg, #c084fc, #FFD700)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>webnovax</span> © 2026 · Acesso restrito e criptografado
        </p>
      </motion.div>
    </div>
  );
}
