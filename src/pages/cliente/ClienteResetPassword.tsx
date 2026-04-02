import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { KeyRound, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ClienteResetPassword() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setReady(!!session);
    }, 250);

    return () => clearTimeout(timer);
  }, []);

  const validationMessage = useMemo(() => {
    if (!password && !confirmPassword) return "";
    if (password.length < 6) return "A nova senha precisa ter pelo menos 6 caracteres.";
    if (password !== confirmPassword) return "As senhas precisam ser idênticas.";
    return "";
  }, [confirmPassword, password]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (validationMessage) {
      toast({ title: "Senha inválida", description: validationMessage, variant: "destructive" });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      toast({ title: "Não foi possível atualizar a senha", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Senha atualizada", description: "Você já pode entrar no portal com a nova senha." });
    await supabase.auth.signOut();
    navigate("/cliente", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #07060a 0%, #1a0a2e 30%, #2d0a1f 60%, #0f0a05 100%)" }}>
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-20 blur-[120px]" style={{ background: "radial-gradient(circle, #7b1fa2, transparent 70%)" }} />
      <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full opacity-15 blur-[100px]" style={{ background: "radial-gradient(circle, #e8334a, transparent 70%)" }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md rounded-[1.75rem] border border-white/10 bg-black/40 backdrop-blur-2xl p-7 shadow-2xl"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg, #7b1fa2, #c2185b, #e8334a)" }}>
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] font-black text-purple-300">Portal do Cliente</p>
            <h1 className="text-xl font-black tracking-tight text-white">Definir nova senha</h1>
          </div>
        </div>

        {!ready ? (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
            <p className="text-sm font-semibold text-white">Link de recuperação em preparação</p>
            <p className="text-xs text-white/50 mt-2">
              Se você abriu a página direto, use o link enviado por e-mail para ativar a redefinição.
            </p>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-white">Sessão de recuperação validada</p>
                <p className="text-xs text-white/50 mt-1">
                  Escolha uma senha forte para voltar ao portal com segurança.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest text-white/50">Nova senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/35" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="pl-10 pr-11 h-12 rounded-xl bg-white/5 border-white/10 text-white"
                  placeholder="Nova senha"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/35 hover:text-white"
                  onClick={() => setShowPassword((current) => !current)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest text-white/50">Confirmar senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/35" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="pl-10 h-12 rounded-xl bg-white/5 border-white/10 text-white"
                  placeholder="Confirme a senha"
                />
              </div>
            </div>

            {validationMessage ? (
              <p className="text-xs text-red-400">{validationMessage}</p>
            ) : (
              <p className="text-xs text-white/45">Use pelo menos 6 caracteres e evite repetir senhas antigas.</p>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                className="flex-1 h-11 rounded-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/5"
                onClick={() => navigate("/cliente")}
              >
                Voltar
              </Button>
              <Button
                type="submit"
                className="flex-1 h-11 rounded-xl border-0 text-white"
                style={{ background: "linear-gradient(135deg, #7b1fa2, #c2185b, #e8334a)" }}
                disabled={loading || !!validationMessage}
              >
                {loading ? "Salvando..." : "Atualizar senha"}
              </Button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
