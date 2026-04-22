import { useState } from "react";
import { Sparkles, Send, Check, Loader2 } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
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
  currentText
}: ContractAiAssistantProps) {
  const [instruction, setInstruction] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!instruction.trim()) {
      toast.error("Por favor, digite uma instrução para a IA.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await groqService.helpWithContractField(context, instruction, currentText);
      setSuggestion(result);
      toast.success("Sugestão gerada com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar sugestão:", error);
      toast.error("Erro ao gerar sugestão. Verifique sua conexão ou chave de API.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    onApply(suggestion);
    onClose();
    setInstruction("");
    setSuggestion("");
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
            Ajudando você a redigir o campo: <span className="text-fuchsia-400 font-medium">{context}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-widest text-white/30">O que a IA deve fazer?</label>
            <Textarea 
              placeholder="Ex: 'Escreva uma cláusula de suporte em dias úteis com resposta em 24h' ou 'Ajuste este texto para ser mais formal'"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              className="min-h-[100px] border-white/10 bg-black/40 text-white placeholder:text-white/20 focus:border-fuchsia-500/50 transition-all"
            />
          </div>

          {suggestion && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="text-xs font-bold uppercase tracking-widest text-white/30">Sugestão da IA</label>
              <div className="rounded-xl border border-fuchsia-500/20 bg-fuchsia-500/5 p-4 text-sm leading-relaxed text-white/80 max-h-[250px] overflow-y-auto custom-scrollbar">
                {suggestion}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button 
            variant="ghost" 
            onClick={onClose} 
            className="text-white/50 hover:text-white hover:bg-white/5"
          >
            Cancelar
          </Button>
          
          <div className="flex-1" />

          {!suggestion ? (
            <Button 
              onClick={handleGenerate} 
              disabled={isLoading || !instruction.trim()}
              className="bg-gradient-to-r from-fuchsia-600 to-rose-600 text-white hover:from-fuchsia-500 hover:to-rose-500 border-none shadow-lg shadow-fuchsia-500/20"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Gerar Sugestão
                </>
              )}
            </Button>
          ) : (
            <div className="flex gap-2 w-full sm:w-auto">
               <Button 
                variant="outline" 
                onClick={() => setSuggestion("")} 
                className="flex-1 sm:flex-none border-white/10 bg-white/5 text-white hover:bg-white/10"
              >
                Refazer
              </Button>
              <Button 
                onClick={handleApply} 
                className="flex-1 sm:flex-none bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-500/10"
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
