import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles, FolderKanban, Receipt, Headphones, ArrowRight, Check } from "lucide-react";

interface OnboardingWizardProps {
  clienteName: string;
  onComplete: () => void;
  storageKey?: string;
}

const steps = [
  {
    icon: Sparkles,
    title: "Bem-vindo ao seu Painel!",
    desc: "Aqui você acompanha tudo sobre seu projeto: status, briefing, faturas e suporte.",
    color: "hsl(var(--primary))",
  },
  {
    icon: FolderKanban,
    title: "Acompanhe seu Projeto",
    desc: "Na aba Projetos, você vê o progresso em tempo real e pode enviar briefings e referências.",
    color: "hsl(var(--accent))",
  },
  {
    icon: Receipt,
    title: "Faturas e Pagamentos",
    desc: "Veja todas as suas faturas, pague online e acompanhe o histórico financeiro.",
    color: "hsl(142 71% 45%)",
  },
  {
    icon: Headphones,
    title: "Suporte Direto",
    desc: "Abra tickets de suporte e converse diretamente com nossa equipe técnica.",
    color: "hsl(38 92% 50%)",
  },
];

export function OnboardingWizard({ clienteName, onComplete, storageKey = "onboarding_done" }: OnboardingWizardProps) {
  const [step, setStep] = useState(0);

  const finishOnboarding = () => {
    localStorage.setItem(storageKey, "true");
    onComplete();
  };

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      finishOnboarding();
    }
  };

  const current = steps[step];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'hsl(var(--background) / 0.95)', backdropFilter: 'blur(12px)' }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md rounded-3xl p-8 text-center space-y-6"
        style={{
          background: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))',
          boxShadow: '0 25px 50px -12px hsl(var(--background) / 0.5)',
        }}
      >
        {/* Step indicators */}
        <div className="flex justify-center gap-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === step ? 32 : 8,
                background: i <= step ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground) / 0.2)',
              }}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
              style={{ background: `${current.color} / 0.1)`.replace(')', ''), border: `1px solid ${current.color}30` }}
            >
              <current.icon className="w-8 h-8" style={{ color: current.color }} />
            </div>

            {step === 0 && (
              <p className="text-sm text-muted-foreground">
                Olá, <span className="font-bold text-foreground">{clienteName}</span>!
              </p>
            )}

            <h2 className="text-xl font-bold text-foreground">{current.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{current.desc}</p>
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-3">
          {step > 0 && (
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              className="flex-1 h-12 rounded-xl"
            >
              Voltar
            </Button>
          )}
          <Button
            onClick={handleNext}
            className="flex-1 h-12 rounded-xl font-bold text-white border-0"
            style={{ background: 'var(--gradient-primary)' }}
          >
            {step < steps.length - 1 ? (
              <>Próximo <ArrowRight className="w-4 h-4 ml-1" /></>
            ) : (
              <>Começar <Check className="w-4 h-4 ml-1" /></>
            )}
          </Button>
        </div>

        <button
          onClick={finishOnboarding}
          className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
        >
          Pular introdução
        </button>
      </motion.div>
    </motion.div>
  );
}
