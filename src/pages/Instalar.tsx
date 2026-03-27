import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, Smartphone, CheckCircle, Share, PlusSquare, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function Instalar() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua));

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center space-y-8"
      >
        <div className="w-24 h-24 mx-auto rounded-3xl overflow-hidden shadow-2xl shadow-[hsl(var(--primary))]/30">
          <img src="/pwa-192x192.png" alt="novaesweb Web" className="w-full h-full object-cover" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">novaesweb Web</h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            Instale o painel direto no seu celular. Acesse tudo sem abrir o navegador.
          </p>
        </div>

        {installed ? (
          <div className="flex flex-col items-center gap-3">
            <CheckCircle className="w-16 h-16 text-emerald-500" />
            <p className="text-lg font-semibold text-[hsl(var(--foreground))]">App instalado com sucesso!</p>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Procure o ícone na sua tela inicial.</p>
          </div>
        ) : isIOS ? (
          <div className="glass-card rounded-2xl p-6 space-y-4 text-left">
            <p className="text-sm font-semibold text-[hsl(var(--foreground))]">Como instalar no iPhone / iPad:</p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold shrink-0">1</div>
                <p className="text-sm text-[hsl(var(--muted-foreground))] pt-1">
                  Toque no ícone <Share className="w-4 h-4 inline text-[hsl(var(--primary))]" /> <strong>Compartilhar</strong> na barra do Safari
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold shrink-0">2</div>
                <p className="text-sm text-[hsl(var(--muted-foreground))] pt-1">
                  Role para baixo e toque em <PlusSquare className="w-4 h-4 inline text-[hsl(var(--primary))]" /> <strong>Adicionar à Tela de Início</strong>
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold shrink-0">3</div>
                <p className="text-sm text-[hsl(var(--muted-foreground))] pt-1">
                  Toque em <strong>Adicionar</strong> e pronto!
                </p>
              </div>
            </div>
          </div>
        ) : deferredPrompt ? (
          <Button onClick={handleInstall} size="lg" className="w-full gradient-primary text-white text-lg py-6 rounded-2xl shadow-lg shadow-[hsl(var(--primary))]/30">
            <Download className="w-5 h-5 mr-2" />
            Instalar App
          </Button>
        ) : (
          <div className="glass-card rounded-2xl p-6 space-y-4 text-left">
            <p className="text-sm font-semibold text-[hsl(var(--foreground))]">Como instalar no Android:</p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold shrink-0">1</div>
                <p className="text-sm text-[hsl(var(--muted-foreground))] pt-1">
                  Toque no menu <MoreVertical className="w-4 h-4 inline text-[hsl(var(--primary))]" /> do navegador
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold shrink-0">2</div>
                <p className="text-sm text-[hsl(var(--muted-foreground))] pt-1">
                  Toque em <Smartphone className="w-4 h-4 inline text-[hsl(var(--primary))]" /> <strong>Instalar app</strong> ou <strong>Adicionar à tela inicial</strong>
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 pt-4">
          {[
            { label: "Offline", desc: "Funciona sem internet" },
            { label: "Rápido", desc: "Carrega em 1 segundo" },
            { label: "Leve", desc: "Ocupa pouco espaço" },
          ].map((f) => (
            <div key={f.label} className="glass-card rounded-xl p-3 text-center">
              <p className="text-sm font-semibold text-[hsl(var(--foreground))]">{f.label}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">{f.desc}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}



