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
          className="fixed bottom-4 right-4 z-[9999] w-[calc(100vw-2rem)] max-w-sm sm:bottom-6 sm:right-6"
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.96 }}
          transition={{ duration: 0.25 }}
        >
          <motion.div
            className="relative rounded-2xl border border-primary/20 bg-card p-5 shadow-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              onClick={close}
              className="absolute top-3 right-3 rounded-full p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="space-y-4">
              <div className="flex items-start gap-3 pr-8">
                <motion.div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10"
                  animate={{ scale: [1, 1.06, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Gift className="h-6 w-6 text-primary" />
                </motion.div>

                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-foreground">
                    🎁 Demonstração Grátis!
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Teste seu site profissional por <strong className="text-primary">7 dias grátis</strong>, sem compromisso.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/10 px-4 py-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">
                  Oferta por tempo limitado
                </span>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={handleCTA}
                  className="w-full gap-2 font-semibold text-base py-5"
                  size="lg"
                >
                  <MessageCircle className="h-5 w-5" />
                  Quero minha demonstração grátis
                </Button>
                <button
                  onClick={close}
                  className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
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
