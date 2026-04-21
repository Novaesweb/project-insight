import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Lock, Mail, Eye, EyeOff, ShieldAlert, Timer, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import logoImg from "@/assets/novaesweb-logo-admin.png";
import { consumeAdminReturnTo } from "@/lib/admin-function-client";
import { logAdminAudit, updateAdminUserMetadata } from "@/lib/admin-audit";
import { setCachedAdminUser } from "@/lib/admin-cache";
import { isOwnerAdminEmail } from "@/lib/admin-permissions";

export default function AdminLogin() {
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

    const normalizedEmail = email.trim().toLowerCase();
    
    try {
      console.log("Starting authentication attempt...");
      
      // Use a timeout to prevent infinite hang if Supabase is slow/down
      const authPromise = supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: senha,
      });

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("TIMEOUT")), 12000)
      );

      const { data, error } = await Promise.race([authPromise, timeoutPromise]) as any;

      if (error) {
        console.error("Auth error:", error);
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);
        if (newAttempts >= 3) {
          setLockTime(30);
          setFailedAttempts(0);
          toast({ title: "Acesso bloqueado temporariamente", description: "Muitas tentativas falhas. Aguarde 30 segundos.", variant: "destructive" });
        } else {
          toast({ title: "Erro no login", description: "E-mail ou senha incorretos.", variant: "destructive" });
        }
      } else {
      console.log("Login successful, checking admin status...");
      const ownerOverride = isOwnerAdminEmail(normalizedEmail);
      const { data: adminUser, error: adminUserCheckError } = await supabase
        .from("usuarios")
        .select("*")
        .eq("email", normalizedEmail)
        .maybeSingle();

      if (adminUserCheckError) {
        console.error("Admin user check error:", adminUserCheckError);
      }

      if (!adminUser && !ownerOverride) {
        console.warn("User not found in 'usuarios' table");
        await supabase.auth.signOut();
        toast({
          title: "Acesso negado",
          description: "Esse login não está cadastrado como usuário ativo do painel administrativo.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if ((adminUser?.bloqueado || adminUser?.status === "inativo") && !ownerOverride) {
        console.warn("User is blocked or inactive");
        await supabase.auth.signOut();
        toast({
          title: "Acesso indisponível",
          description: "Esse usuário está bloqueado ou inativo no painel administrativo.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      console.log("Admin user validated, clearing failed attempts...");
      setCachedAdminUser(normalizedEmail, adminUser as any);
      await supabase.from("usuarios").update({ tentativas_login: 0 }).eq("email", normalizedEmail);

      // Run audit in background to avoid blocking login
      (async () => {
        try {
          console.log("Updating metadata and logging audit...");
          await updateAdminUserMetadata(normalizedEmail, {
            lastLoginAt: new Date().toISOString(),
            lastLoginBy: normalizedEmail,
          });
          await logAdminAudit(
            "Login administrativo realizado",
            `${adminUser?.nome || normalizedEmail} entrou no painel administrativo.`,
            "/admin"
          );
        } catch (auditError) {
          console.warn("Non-blocking audit failed:", auditError);
        }
      })();

      const returnTo = consumeAdminReturnTo();
      toast({ title: "Sessão Iniciada!", description: "Bem-vindo à Cabine de Comando, Arquiteto." });
      console.log("Navigating to dashboard...", returnTo || "/admin");
      navigate(returnTo && returnTo.startsWith("/admin") ? returnTo : "/admin");
    }
    } catch (err: any) {
      if (err.message === "TIMEOUT") {
        toast({ 
          title: "Erro de Conexão", 
          description: "O servidor de autenticação demorou muito para responder. Verifique sua internet ou o status do Supabase.", 
          variant: "destructive" 
        });
      } else {
        toast({ 
          title: "Erro inesperado", 
          description: "Ocorreu uma falha ao tentar processar o login.", 
          variant: "destructive" 
        });
      }
      console.error("Login try/catch error:", err);
    }
    setLoading(false);
  };

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isFormValid = isEmailValid && senha.length >= 6 && lockTime === 0;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 login-rays relative" style={{ background: 'hsl(var(--background))' }}>
      {/* Floating orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: [0, -30, 0], x: [0, 15, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[15%] left-[10%] w-64 h-64 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)' }}
        />
        <motion.div
          animate={{ y: [0, 20, 0], x: [0, -20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[20%] right-[8%] w-80 h-80 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, hsl(var(--accent)) 0%, transparent 70%)' }}
        />
        <motion.div
          animate={{ y: [0, 25, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          className="absolute top-[60%] left-[60%] w-48 h-48 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)' }}
        />
      </div>

      {/* Noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '128px 128px',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[420px] relative z-10"
      >
        {/* Logo & Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center gap-5 mb-8"
        >
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-3 rounded-full opacity-60"
              style={{
                background: 'conic-gradient(from 0deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--primary)))',
                filter: 'blur(8px)',
              }}
            />
            <img
              src={logoImg}
              alt="novaesweb"
              className="relative w-28 h-28 rounded-full object-cover border-2 border-[hsl(var(--background))]"
              style={{ boxShadow: '0 0 40px -8px hsl(var(--primary))' }}
            />
          </div>

          <div className="text-center space-y-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              Cabine de Comando
            </h1>
            <div className="flex justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-primary/20 text-primary bg-primary/5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Acesso Restrito
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border border-border text-muted-foreground">
                v10.0
              </span>
            </div>
          </div>
        </motion.div>

        {/* Form Card */}
        <motion.form
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          onSubmit={handleLogin}
          className="relative p-7 rounded-2xl border border-border/50 backdrop-blur-2xl overflow-hidden"
          style={{
            background: 'hsl(var(--card))',
            boxShadow: '0 25px 50px -12px hsl(var(--primary) / 0.08), 0 0 0 1px hsl(var(--border) / 0.3)',
          }}
        >
          {/* Card inner glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px" style={{
            background: 'linear-gradient(90deg, transparent, hsl(var(--primary) / 0.4), transparent)',
          }} />

          <div className="space-y-5">
            <AnimatePresence>
              {lockTime > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium"
                >
                  <Timer className="w-4 h-4 animate-pulse shrink-0" />
                  <span>Bloqueado por segurança: <strong>{lockTime}s</strong> restantes</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">E-mail</Label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@email.com"
                  required
                  disabled={loading || lockTime > 0}
                  className="pl-11 h-12 bg-muted/50 border-border/50 text-foreground placeholder:text-muted-foreground/40 rounded-xl transition-all focus:bg-muted/80 focus:border-primary/30"
                />
              </div>
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Senha</Label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading || lockTime > 0}
                  className="pl-11 pr-11 h-12 bg-muted/50 border-border/50 text-foreground placeholder:text-muted-foreground/40 rounded-xl transition-all focus:bg-muted/80 focus:border-primary/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <motion.div whileTap={{ scale: isFormValid ? 0.98 : 1 }}>
              <Button
                type="submit"
                disabled={loading || !isFormValid}
                className={`w-full h-12 rounded-xl border-0 font-bold text-sm tracking-wide transition-all duration-500 ${
                  isFormValid
                    ? "text-primary-foreground shadow-lg hover:shadow-xl"
                    : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                }`}
                style={isFormValid ? {
                  background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
                  boxShadow: '0 8px 32px -8px hsl(var(--primary) / 0.4)',
                } : undefined}
              >
                {loading ? (
                  <motion.div className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-4 h-4" />
                    </motion.div>
                    Sincronizando...
                  </motion.div>
                ) : lockTime > 0 ? "Aguarde..." : "Iniciar Sessão"}
              </Button>
            </motion.div>

            {failedAttempts > 0 && lockTime === 0 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[10px] text-center text-destructive/80 font-medium"
              >
                {3 - failedAttempts} tentativa(s) restante(s) antes do bloqueio.
              </motion.p>
            )}
          </div>
        </motion.form>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-[10px] text-muted-foreground/40 flex items-center justify-center gap-1.5 mt-6"
        >
          <ShieldAlert className="w-3 h-3" />
          novaesweb © 2025 · Acesso criptografado
        </motion.p>
      </motion.div>
    </div>
  );
}
