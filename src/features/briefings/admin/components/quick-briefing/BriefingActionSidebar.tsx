import { motion } from "framer-motion";
import { Send, ShieldCheck, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getClientDisplayName } from "../../types";

interface Props {
  selectedClient: any;
  selectedTemplateCount: number;
  isSending: boolean;
  onSend: () => void;
}

export function BriefingActionSidebar({ selectedClient, selectedTemplateCount, isSending, onSend }: Props) {
  return (
    <div className="space-y-8">
      <Card className="sticky top-6 overflow-hidden glass-premium border-[#7C3AED]/20 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]">
        <div className="absolute inset-x-0 top-0 h-[2px] bg-brand-gradient opacity-50" />
        <CardHeader className="p-8 pb-4">
          <CardTitle className="text-xl font-light text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
            Protocolo de <span className="text-brand-gradient italic">Envio</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 pt-0 space-y-8">
          <div className="space-y-6 rounded-3xl bg-black/40 p-6 border border-white/5 relative overflow-hidden">
            <div className="absolute inset-0 bg-brand-gradient opacity-[0.02] pointer-events-none" />
            <div className="flex flex-col gap-2 relative z-10">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20">Ecossistema Alvo</span>
              <span className={`text-base font-medium ${selectedClient ? 'text-white' : 'text-white/10 italic'}`}>
                {selectedClient ? getClientDisplayName(selectedClient) : "Aguardando seleção..."}
              </span>
            </div>
            <div className="h-px bg-white/5" />
            <div className="flex flex-col gap-2 relative z-10">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20">Complexidade</span>
              <span className={`text-base font-medium ${selectedTemplateCount > 0 ? 'text-[#EC4899]' : 'text-white/10 italic'}`}>
                {selectedTemplateCount > 0 ? `${selectedTemplateCount} Diretrizes Ativas` : "Nenhuma selecionada"}
              </span>
            </div>
          </div>

          <Button
            size="lg"
            className="w-full h-16 bg-brand-gradient font-black text-white shadow-[0_10px_30px_rgba(124,58,237,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-20 disabled:grayscale rounded-2xl"
            disabled={!selectedClient || selectedTemplateCount === 0 || isSending}
            onClick={onSend}
          >
            {isSending ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              >
                <Send className="h-5 w-5" />
              </motion.div>
            ) : (
              <>
                <Send className="mr-3 h-5 w-5" />
                DISPARAR PROTOCOLO
              </>
            )}
          </Button>
          
          <div className="flex items-center gap-3 justify-center py-2 px-4 rounded-xl bg-white/[0.02] border border-white/5">
            <ShieldCheck className="h-4 w-4 text-[#7C3AED]/40" />
            <p className="text-[9px] text-white/30 uppercase font-black tracking-[0.15em] leading-tight text-center">
              Notificações automáticas via <span className="text-white/60">Omni-Channel</span> ativadas
            </p>
          </div>
        </CardContent>
      </Card>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[32px] border border-[#7C3AED]/10 bg-[#7C3AED]/5 p-8 space-y-4"
      >
         <div className="flex items-center gap-3 text-[#7C3AED]">
           <div className="p-2.5 rounded-xl bg-[#7C3AED]/10">
             <Zap className="h-4 w-4" />
           </div>
           <span className="text-xs font-black uppercase tracking-[0.3em]">Modo Turbo</span>
         </div>
         <p className="text-[11px] text-[#7C3AED]/60 leading-relaxed font-medium">
            Este protocolo é otimizado para **máxima conversão**. Ao disparar, o ecossistema é notificado instantaneamente e os dados são persistidos no painel Alpha do cliente.
         </p>
      </motion.div>
    </div>
  );
}
