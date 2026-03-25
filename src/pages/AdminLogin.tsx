import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Lock, Mail, Key, LogIn, ChevronRight, Sparkles, Timer, Eye, EyeOff, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import logoImg from "@/assets/novaesweb-logo-full.jpeg";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockTime, setLockTime] = useState(0);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Countdown timer for brute-force protection
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

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: senha,
    });

    if (error) {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      
      if (newAttempts >= 3) {
        setLockTime(30);
        setFailedAttempts(0);
        toast({
          title: "Acesso bloqueado temporariamente",
          description: "Muitas tentativas falhas. Aguarde 30 segundos.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro no login",
          description: "E-mail ou senha incorretos.",
          variant: "destructive",
        });
      }
    } else {
      toast({ title: "Sessão Iniciada!", description: "Bem-vindo à Cabine de Comando, Arquiteto." });
      navigate("/admin");
    }
    setLoading(false);
  };

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isFormValid = isEmailValid && senha.length >= 6 && lockTime === 0;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[hsl(var(--background))] login-rays">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-[400px] space-y-8 relative z-10"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-col items-center gap-4"
        >
          <img 
            src={logoImg} 
            alt="NovaesWeb" 
            className="w-32 h-32 rounded-full object-cover border-2 border-[hsl(var(--primary))]/20 shadow-[0_0_30px_-5px_hsl(var(--primary))]" 
          />
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[hsl(var(--muted))]">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="relative"
            >
              <Sparkles className="w-4 h-4 text-yellow-400" />
            </motion.div>
            <div className="space-y-2 text-center">
            <h1 className="text-3xl font-black tracking-tighter text-white sm:text-4xl uppercase">
              Cabine de Comando
            </h1>
            <div className="flex justify-center gap-2">
              <Badge variant="outline" className="text-[10px] border-primary/30 text-primary bg-primary/5 font-black uppercase tracking-widest">
                ● Acesso Restrito
              </Badge>
              <Badge variant="outline" className="text-[10px] border-white/10 text-white/40 font-bold">
                v9.0 ARCHITECT PREMIUM
              </Badge>
            </div>
            <p className="text-[hsl(var(--muted-foreground))] text-xs font-medium uppercase tracking-[0.2em] opacity-40">
              Autenticação de Segurança Avançada
            </p>
          </div>
        </div>
        </motion.div>

        {/* Form Card */}
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          onSubmit={handleLogin}
          className="space-y-5 p-8 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]/80 backdrop-blur-xl shadow-2xl shadow-[hsl(var(--primary))]/5"
        >
          <AnimatePresence>
            {lockTime > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium"
              >
                <Timer className="w-4 h-4 animate-pulse" />
                <span>Bloqueado por segurança: {lockTime}s restantes</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-[hsl(var(--muted-foreground))]">E-mail</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@email.com"
                required
                disabled={loading || lockTime > 0}
                className="pl-10 bg-[hsl(var(--muted))] border-[hsl(var(--border))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]/50 h-11"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-[hsl(var(--muted-foreground))]">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
              <Input
                type={showPassword ? "text" : "password"}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading || lockTime > 0}
                className="pl-10 pr-10 bg-[hsl(var(--muted))] border-[hsl(var(--border))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]/50 h-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading || !isFormValid}
            className={`w-full h-11 border-0 text-[hsl(var(--primary-foreground))] font-semibold text-sm shadow-lg transition-all duration-300 ${
              isFormValid 
                ? "bg-gradient-to-r from-[#e8334a] via-[#c2185b] to-[#7b1fa2] shadow-[0_0_20px_rgba(232,51,74,0.3)] hover:shadow-[0_0_30px_rgba(232,51,74,0.4)]" 
                : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] cursor-not-allowed opacity-50"
            }`}
          >
            {loading ? "Sincronizando..." : lockTime > 0 ? "Aguarde..." : "Iniciar Sessão Arquitetural"}
          </Button>

          {failedAttempts > 0 && lockTime === 0 && (
            <p className="text-[10px] text-center text-destructive/80 font-medium">
              {3 - failedAttempts} tentativa(s) restante(s) antes do bloqueio técnico.
            </p>
          )}
        </motion.form>

        <p className="text-center text-[10px] text-[hsl(var(--muted-foreground))]/50 flex items-center justify-center gap-1">
          <ShieldAlert className="w-3 h-3" />
          NovaesWeb © 2025 · Acesso restrito e criptografado
        </p>
      </motion.div>
    </div>
  );
}
