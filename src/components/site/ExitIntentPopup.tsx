import { useState, useEffect, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gift, Clock, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePublicContact } from "@/hooks/usePublicContact";

const ExitIntentPopup = memo(function ExitIntentPopup() {
  const [show, setShow] = useState(false);
  const { whatsappNumber } = usePublicContact();

  useEffect(() => {
    const alreadyShown = sessionStorage.getItem("nw-exit-popup-shown");
    if (alreadyShown) return;

    const timer = setTimeout(() => {
      sessionStorage.setItem("nw-exit-popup-shown", "1");
      setShow(true);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const close = useCallback(() => setShow(false), []);

  const handleCTA = useCallback(() => {
    const phone = whatsappNumber?.replace(/\D/g, "") || "5551991189293";
    const msg = encodeURIComponent(
      "Olá! Vi a promoção de *demonstração grátis por 7 dias* no site e quero aproveitar! 🚀"
    );
    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
    setShow(false);
  }, [whatsappNumber]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={close} />

          <motion.div
            className="relative w-full max-w-md rounded-2xl border border-primary/20 bg-card p-6 shadow-2xl"
            initial={{ scale: 0.8, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: 40, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
          >
            <button
              onClick={close}
              className="absolute top-3 right-3 rounded-full p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="text-center space-y-4">
              <motion.div
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Gift className="h-8 w-8 text-primary" />
              </motion.div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-foreground">
                  🎁 Demonstração Grátis!
                </h3>
                <p className="text-sm text-muted-foreground">
                  Teste seu site profissional por <strong className="text-primary">7 dias grátis</strong>, sem compromisso.
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 rounded-lg bg-primary/5 border border-primary/10 px-4 py-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">
                  Oferta por tempo limitado
                </span>
              </div>

              <div className="space-y-2 pt-2">
                <Button
                  onClick={handleCTA}
                  className="w-full gap-2 bg-[hsl(142,70%,45%)] hover:bg-[hsl(142,70%,38%)] text-white font-semibold text-base py-5"
                  size="lg"
                >
                  <MessageCircle className="h-5 w-5" />
                  Quero minha demonstração grátis
                </Button>
                <button
                  onClick={close}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Não, obrigado
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default ExitIntentPopup;
