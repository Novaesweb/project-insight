import { useEffect, useState } from "react";
import { Check, Loader2, Send, Sparkles } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { groqService } from "@/services/groq-api";
import { toast } from "sonner";

interface ContractAiAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (text: string) => void;
  context: string;
  currentText: string;
}

export function ContractAiAssistant({
  isOpen,
  onClose,
  onApply,
  context,
  currentText,
}: ContractAiAssistantProps) {
  const [instruction, setInstruction] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setErrorMessage("");
  }, [context, isOpen]);

  const handleGenerate = async () => {
    const finalInstruction =
      instruction.trim() ||
      "Gere uma sugestao profissional e adequada para este campo do contrato, mantendo um tom serio e juridico.";

    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await groqService.helpWithContractField(context, finalInstruction, currentText);
      const normalizedSuggestion = result.trim();

      if (!normalizedSuggestion) {
        throw new Error("A IA nao retornou nenhuma sugestao para este campo.");
      }

      setSuggestion(normalizedSuggestion);
      toast.success("Sugestao gerada com sucesso.");
    } catch (error: any) {
      const message = error?.message || "Erro ao gerar sugestao. Verifique a configuracao da IA.";
      console.error("Erro ao gerar sugestao:", error);
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    onApply(suggestion);
    onClose();
    setInstruction("");
    setSuggestion("");
    setErrorMessage("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] border-white/10 bg-[#120d18] text-white shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-fuchsia-500/20 text-fuchsia-400">
              <Sparkles className="h-5 w-5" />
            </div>
            Assistente de IA
          </DialogTitle>
          <DialogDescription className="text-white/50">
            Ajudando voce a redigir o campo: <span className="font-medium text-fuchsia-400">{context}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-widest text-white/30">
              O que a IA deve fazer?
            </label>
            <Textarea
              placeholder="Ex: Escreva uma clausula de suporte em dias uteis com resposta em 24h."
              value={instruction}
              onChange={(event) => setInstruction(event.target.value)}
              className="min-h-[100px] border-white/10 bg-black/40 text-white placeholder:text-white/20 focus:border-fuchsia-500/50 transition-all"
            />
          </div>

          {errorMessage ? (
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-100">
              {errorMessage}
            </div>
          ) : null}

          {suggestion ? (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="text-xs font-bold uppercase tracking-widest text-white/30">Sugestao da IA</label>
              <div className="custom-scrollbar max-h-[250px] overflow-y-auto rounded-xl border border-fuchsia-500/20 bg-fuchsia-500/5 p-4 text-sm leading-relaxed text-white/80">
                {suggestion}
              </div>
            </div>
          ) : null}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-white/50 hover:bg-white/5 hover:text-white"
          >
            Cancelar
          </Button>

          <div className="flex-1" />

          {!suggestion ? (
            <Button
              onClick={handleGenerate}
              disabled={isLoading}
              className="border-none bg-gradient-to-r from-fuchsia-600 to-rose-600 text-white shadow-lg shadow-fuchsia-500/20 hover:from-fuchsia-500 hover:to-rose-500"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Gerar Sugestao
                </>
              )}
            </Button>
          ) : (
            <div className="flex w-full gap-2 sm:w-auto">
              <Button
                variant="outline"
                onClick={() => {
                  setSuggestion("");
                  setErrorMessage("");
                }}
                className="flex-1 border-white/10 bg-white/5 text-white hover:bg-white/10 sm:flex-none"
              >
                Refazer
              </Button>
              <Button
                onClick={handleApply}
                className="flex-1 bg-emerald-600 text-white shadow-lg shadow-emerald-500/10 hover:bg-emerald-500 sm:flex-none"
              >
                <Check className="mr-2 h-4 w-4" />
                Aplicar
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
