import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay, addMonths, subMonths, isBefore } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Check, CalendarDays, Clock, Zap, Star, ShieldCheck, Rocket, MessageCircle, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { statusReuniaoLabels, statusReuniaoColors, tipoReuniaoLabels, type StatusReuniao, type TipoReuniao } from "@/lib/constants";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { sendPushToAdmins } from "@/lib/push-notifications";
import { cn } from "@/lib/utils";

const availableSlots = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];

const containerVariants: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: "easeOut" } 
  }
};

const beneficios = [
  { icon: CalendarDays, text: "Agenda flexível e digital" },
  { icon: Clock, text: "Confirmação instantânea" },
  { icon: Star, text: "Reunião estratégica grátis" },
  { icon: Rocket, text: "Impulsione seu projeto" },
];

export default function AgendarPublico() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [formData, setFormData] = useState({ nome: "", email: "", telefone: "", tipo: "" as string, mensagem: "" });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const calDays = eachDayOfInterval({ start: calStart, end: calEnd });
  const weekDays = ["D", "S", "T", "Q", "Q", "S", "S"];

  const isWeekday = (date: Date) => {
    const day = date.getDay();
    return day > 0 && day < 6;
  };

  const handleSubmit = async () => {
    if (!formData.nome || !formData.email || !formData.telefone || !selectedDate || !selectedTime) {
      toast({ title: "Preencha todos os campos obrigatórios", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("reunioes").insert({
      cliente_id: null,
      tipo: formData.tipo || "alinhamento",
      data: format(selectedDate, "yyyy-MM-dd"),
      hora_inicio: selectedTime,
      hora_fim: selectedTime,
      observacoes: `Solicitação via site.\nNome: ${formData.nome}\nEmail: ${formData.email}\nTel: ${formData.telefone}\nMsg: ${formData.mensagem}`,
      status: "agendada",
    });

    if (error) {
      toast({ title: "Erro ao agendar", description: error.message, variant: "destructive" });
      setLoading(false);
    } else {
      await supabase.from("leads").insert({
        nome: formData.nome,
        email: formData.email,
        whatsapp: formData.telefone.replace(/\D/g, ""),
        mensagem: `Agendamento de reunião (${formData.tipo}): ${formData.mensagem}`,
        status: "novo",
      });

      sendPushToAdmins("📅 Nova Reunião Agendada", `${formData.nome} solicitou uma reunião para ${format(selectedDate, "dd/MM")}.`, "/admin/agenda");
      setConfirmed(true);
      setLoading(false);
    }
  };

  const inputClass = "glass-input text-white border-white/5 h-12 rounded-2xl text-sm px-6 placeholder:text-white/20 focus:border-primary/30 transition-all focus:shadow-[0_0_20px_rgba(255,51,102,0.1)]";
  const labelClass = "text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1 mb-2 block";

  if (confirmed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden ambient-glow">
        <div className="ultra-premium-bg" />
        <div className="ambient-rays-unified" />
        
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          className="text-center max-w-lg glass-panel-premium p-12 rounded-[2.5rem] border-white/5 relative z-10 shadow-2xl"
        >
          <motion.div
            initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
            className="w-24 h-24 rounded-3xl gradient-primary mx-auto flex items-center justify-center mb-8 shadow-xl"
          >
            <Check className="w-12 h-12 text-white stroke-[3px]" />
          </motion.div>
          
          <h1 className="text-4xl font-black text-white mb-6 tracking-tighter leading-tight">
            Reunião solicitada <br />
            <span className="gradient-text">com sucesso! 📅</span>
          </h1>
          <div className="space-y-4 text-white/60 mb-10 text-lg font-medium">
            <p>Sua reunião para <strong className="text-white">{selectedDate && format(selectedDate, "dd/MM")} às {selectedTime}</strong> foi agendada.</p>
            <p className="text-primary font-black uppercase tracking-widest text-sm animate-pulse">👉 Entraremos em contato para confirmar!</p>
          </div>
          
          <div className="flex flex-col gap-4">
            <Button className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-2xl h-14 text-base font-black gap-3 shadow-lg uppercase tracking-widest"
              onClick={() => window.open(`https://wa.me/5551981964238?text=${encodeURIComponent(`Olá! Agendei uma reunião para ${format(selectedDate!, "dd/MM")} às ${selectedTime}.`)}`, "_blank")}>
              <MessageCircle className="w-6 h-6" /> Falar agora no WhatsApp
            </Button>
            <Link to="/">
              <Button variant="ghost" className="w-full text-white/40 hover:text-white font-bold h-12">
                Voltar para a página inicial
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex lg:flex-row flex-col relative overflow-hidden ambient-glow">
      <div className="ultra-premium-bg" />
      <div className="ambient-rays-unified" />

      {/* ── LEFT PANEL ── */}
      <div className="relative lg:w-4/12 flex flex-col justify-between p-8 lg:p-16 overflow-hidden lg:min-h-screen z-10">
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3 mb-16 group">
            <motion.div whileHover={{ rotate: 10, scale: 1.1 }} className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
              <Zap className="text-white w-5 h-5 fill-current" />
            </motion.div>
            <span className="text-xl font-black tracking-tighter">
              <span className="gradient-text">novaesweb</span>
              <span className="text-white">Web</span>
            </span>
          </Link>

          <motion.div 
            initial={{ opacity: 0, x: -50 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-4xl lg:text-7xl font-black text-white leading-[0.85] tracking-tighter mb-8">
              Vamos <br />
              <span className="text-white/20">conversar </span> <br />
              <span className="gradient-text">estratégia.</span>
            </h1>
            <p className="text-white/40 text-lg leading-relaxed mb-12 max-w-sm font-medium">
              Escolha o melhor horário para alinharmos seu projeto e transformar suas ideias em tecnologia de alto nível.
            </p>

            <div className="grid grid-cols-1 gap-4">
              {beneficios.map((b, i) => (
                <div key={b.text} className="glass-card rounded-[1.2rem] p-4 flex items-center gap-4 border-white/5 hover:border-white/10 transition-colors group cursor-default">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <b.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-white/70 text-xs font-bold uppercase tracking-wider">{b.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.6 }}
          className="relative z-10 mt-16 lg:mt-0 p-6 rounded-[2rem] glass-panel-premium border-white/5"
        >
          <div className="flex gap-1 mb-3">
            {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-primary text-primary" />)}
          </div>
          <p className="text-white/80 text-sm leading-relaxed italic mb-4 font-medium">
            "Atendimento excepcional e consultoria técnica de ponta desde o primeiro contato."
          </p>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black">LA</div>
            <div>
              <p className="text-white text-[10px] font-black uppercase tracking-widest">Lucas A.</p>
              <p className="text-white/30 text-[8px] uppercase font-bold tracking-widest">CEO Tech Group</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── RIGHT PANEL (Scheduler) ── */}
      <div className="flex-1 flex flex-col justify-center p-6 lg:p-12 xl:p-24 relative z-20">
        <motion.div 
          initial="hidden" 
          animate="visible" 
          variants={containerVariants}
          className="w-full max-w-4xl mx-auto space-y-8"
        >
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Calendar Card */}
            <motion.div variants={itemVariants} className="glass-panel-premium rounded-[2.5rem] p-8 border-white/5 shadow-2xl relative overflow-hidden">
               <div className="flex items-center justify-between mb-8">
                <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="text-white/30 hover:text-white p-2 bg-white/5 rounded-xl transition-colors"><ChevronLeft className="w-5 h-5" /></button>
                <span className="text-sm font-black text-white uppercase tracking-widest">{format(currentDate, "MMMM yyyy", { locale: ptBR })}</span>
                <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="text-white/30 hover:text-white p-2 bg-white/5 rounded-xl transition-colors"><ChevronRight className="w-5 h-5" /></button>
              </div>

              <div className="grid grid-cols-7 gap-2 mb-8">
                {weekDays.map(d => <div key={d} className="text-center text-[10px] font-black text-white/20 uppercase tracking-tighter py-2">{d}</div>)}
                {calDays.map(day => {
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isPast = isBefore(day, new Date()) && !isSameDay(day, new Date());
                  const isAvailable = isCurrentMonth && !isPast && isWeekday(day);
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  return (
                    <button
                      key={day.toISOString()}
                      disabled={!isAvailable}
                      onClick={() => { setSelectedDate(day); setSelectedTime(null); }}
                      className={cn(
                        "aspect-square rounded-2xl text-xs font-bold transition-all flex items-center justify-center",
                        isSelected ? "text-white shadow-lg shadow-primary/30" : isAvailable ? "text-white/80 hover:bg-white/10 hover:text-white" : "text-white/10 cursor-not-allowed"
                      )}
                      style={isSelected ? { background: "linear-gradient(135deg, #ff3366, #ff6699)" } : {}}
                    >
                      {format(day, "d")}
                    </button>
                  );
                })}
              </div>

              <AnimatePresence mode="wait">
                {selectedDate && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <div className="h-px bg-white/5 w-full" />
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Horários em {format(selectedDate, "dd/MM")}</p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {availableSlots.map(slot => (
                        <button
                          key={slot}
                          onClick={() => setSelectedTime(slot)}
                          className={cn(
                            "py-3 rounded-xl text-[10px] font-black tracking-widest transition-all glass-card border-white/5",
                            selectedTime === slot ? "text-white border-primary/50" : "text-white/40 hover:text-white"
                          )}
                          style={selectedTime === slot ? { background: "linear-gradient(135deg, #ff3366, #ff6699)" } : {}}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Form Card */}
            <motion.div variants={itemVariants} className="glass-panel-premium rounded-[2.5rem] p-8 border-white/5 shadow-2xl space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className={labelClass}>Nome Completo *</Label>
                  <Input value={formData.nome} onChange={e => setFormData(p => ({ ...p, nome: e.target.value }))} placeholder="Seu nome" className={inputClass} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className={labelClass}>E-mail *</Label>
                    <Input type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} placeholder="exemplo@vendas.com" className={inputClass} />
                  </div>
                  <div className="space-y-2">
                    <Label className={labelClass}>WhatsApp *</Label>
                    <Input value={formData.telefone} onChange={e => setFormData(p => ({ ...p, telefone: e.target.value }))} placeholder="(00) 00000-0000" className={inputClass} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className={labelClass}>Tipo de Reunião</Label>
                  <Select value={formData.tipo} onValueChange={v => setFormData(p => ({ ...p, tipo: v }))}>
                    <SelectTrigger className={inputClass}>
                      <SelectValue placeholder="Selecione o objetivo" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-white/10 rounded-2xl">
                      {(Object.entries(tipoReuniaoLabels) as [TipoReuniao, string][]).map(([k, v]) => (
                        <SelectItem key={k} value={k} className="text-white/70 hover:text-white rounded-xl mx-2 font-medium">{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className={labelClass}>Observações</Label>
                  <Textarea value={formData.mensagem} onChange={e => setFormData(p => ({ ...p, mensagem: e.target.value }))} placeholder="O que deseja discutir?" className={cn(inputClass, "min-h-[100px] py-4")} />
                </div>
              </div>

              <div className="pt-4">
                <Button
                  className="w-full h-16 rounded-2xl gradient-primary text-white font-black uppercase tracking-[0.2em] shadow-xl text-xs hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3 disabled:opacity-20"
                  disabled={loading || !selectedDate || !selectedTime || !formData.nome || !formData.email || !formData.telefone}
                  onClick={handleSubmit}
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Confirmar Agendamento <ArrowRight className="w-5 h-5" /></>}
                </Button>
                <p className="text-[9px] text-white/20 mt-4 text-center font-bold uppercase tracking-widest">
                  Verificação automática · Resposta prioritária
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}



