import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay, addMonths, subMonths, isBefore } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Check, CalendarDays, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { tipoReuniaoLabels, type TipoReuniao } from "@/lib/mock-data";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

const availableSlots = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];

export default function AgendarPublico() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [formData, setFormData] = useState({ nome: "", email: "", telefone: "", tipo: "" as string, mensagem: "" });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const calDays = eachDayOfInterval({ start: calStart, end: calEnd });
  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const isWeekday = (date: Date) => {
    const day = date.getDay();
    return day > 0 && day < 6;
  };

  const handleSubmit = () => {
    if (formData.nome && formData.email && formData.telefone && selectedDate && selectedTime) {
      setConfirmed(true);
    }
  };

  if (confirmed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "#0d0d14" }}>
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center" style={{ background: "linear-gradient(135deg, #e8334a, #c2185b, #7b1fa2)" }}>
            <Check className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Solicitação enviada!</h1>
          <p className="text-sm text-white/50">
            Sua reunião foi solicitada para <strong className="text-white">{selectedDate && format(selectedDate, "dd/MM/yyyy")}</strong> às <strong className="text-white">{selectedTime}</strong>.
          </p>
          <p className="text-sm text-white/50">Aguarde a confirmação da equipe NovaesWeb. Você receberá um e-mail com os detalhes.</p>
          <div className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.08)" }}>
            <p className="text-xs text-white/50">Dados da reunião</p>
            <p className="text-sm text-white font-medium mt-1">{formData.nome}</p>
            <p className="text-xs text-white/50">{formData.email} · {formData.telefone}</p>
            <p className="text-xs text-white/50 mt-1">
              {formData.tipo && tipoReuniaoLabels[formData.tipo as TipoReuniao]}
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: "#0d0d14" }}>
      <motion.div variants={fadeUp} initial="hidden" animate="show" className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #e8334a, #c2185b, #7b1fa2)" }}>
              <span className="text-white font-bold text-sm">NW</span>
            </div>
            <div>
              <span className="text-lg font-bold">
                <span style={{ background: "linear-gradient(135deg, #e8334a, #c2185b, #7b1fa2)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Novaes</span>
                <span className="text-white">Web</span>
              </span>
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Agendar Reunião</h1>
          <p className="text-sm text-white/50 max-w-md mx-auto">Escolha um horário disponível e preencha seus dados para solicitar uma reunião com nossa equipe.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Calendar */}
          <div className="rounded-2xl p-5 space-y-4" style={{ background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.08)" }}>
            <div className="flex items-center justify-between">
              <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="text-white/50 hover:text-white p-1"><ChevronLeft className="w-5 h-5" /></button>
              <span className="text-sm font-medium text-white capitalize">{format(currentDate, "MMMM yyyy", { locale: ptBR })}</span>
              <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="text-white/50 hover:text-white p-1"><ChevronRight className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {weekDays.map(d => (
                <div key={d} className="text-center text-[11px] font-medium text-white/40 py-1">{d}</div>
              ))}
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
                    className={`aspect-square rounded-lg text-sm flex items-center justify-center transition-all ${
                      isSelected ? "text-white font-bold" : isAvailable ? "text-white hover:bg-white/10" : "text-white/15 cursor-not-allowed"
                    }`}
                    style={isSelected ? { background: "linear-gradient(135deg, #e8334a, #c2185b, #7b1fa2)" } : {}}
                  >
                    {format(day, "d")}
                  </button>
                );
              })}
            </div>

            {selectedDate && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-white/50">Horários disponíveis — {format(selectedDate, "dd/MM")}</p>
                <div className="grid grid-cols-3 gap-2">
                  {availableSlots.map(slot => (
                    <button
                      key={slot}
                      onClick={() => setSelectedTime(slot)}
                      className={`py-2 rounded-lg text-xs font-medium transition-all ${
                        selectedTime === slot ? "text-white" : "text-white/70 hover:bg-white/10"
                      }`}
                      style={selectedTime === slot ? { background: "linear-gradient(135deg, #e8334a, #c2185b, #7b1fa2)" } : { background: "rgba(255,255,255,0.06)" }}
                    >
                      <Clock className="w-3 h-3 inline mr-1" />{slot}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Form */}
          <div className="rounded-2xl p-5 space-y-4" style={{ background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.08)" }}>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <CalendarDays className="w-4 h-4" /> Seus dados
            </h2>
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-white/50">Nome completo *</Label>
                <Input
                  value={formData.nome}
                  onChange={e => setFormData(p => ({ ...p, nome: e.target.value }))}
                  placeholder="Seu nome"
                  className="border-0 text-white placeholder:text-white/30"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                />
              </div>
              <div>
                <Label className="text-xs text-white/50">E-mail *</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                  placeholder="email@exemplo.com"
                  className="border-0 text-white placeholder:text-white/30"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                />
              </div>
              <div>
                <Label className="text-xs text-white/50">Telefone / WhatsApp *</Label>
                <Input
                  value={formData.telefone}
                  onChange={e => setFormData(p => ({ ...p, telefone: e.target.value }))}
                  placeholder="(00) 00000-0000"
                  className="border-0 text-white placeholder:text-white/30"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                />
              </div>
              <div>
                <Label className="text-xs text-white/50">Tipo de reunião</Label>
                <Select value={formData.tipo} onValueChange={v => setFormData(p => ({ ...p, tipo: v }))}>
                  <SelectTrigger className="border-0 text-white" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.entries(tipoReuniaoLabels) as [TipoReuniao, string][]).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-white/50">Mensagem (opcional)</Label>
                <Textarea
                  value={formData.mensagem}
                  onChange={e => setFormData(p => ({ ...p, mensagem: e.target.value }))}
                  placeholder="Descreva o assunto da reunião..."
                  className="border-0 text-white placeholder:text-white/30 min-h-[80px]"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                />
              </div>
            </div>

            {selectedDate && selectedTime && (
              <div className="p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.06)" }}>
                <p className="text-[10px] text-white/40 uppercase tracking-wider">Resumo</p>
                <p className="text-sm text-white font-medium mt-1">
                  {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} às {selectedTime}
                </p>
              </div>
            )}

            <Button
              className="w-full border-0 text-white font-semibold"
              style={{ background: "linear-gradient(135deg, #e8334a, #c2185b, #7b1fa2)" }}
              disabled={!selectedDate || !selectedTime || !formData.nome || !formData.email || !formData.telefone}
              onClick={handleSubmit}
            >
              Solicitar agendamento
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-4">
          <p className="text-[11px] text-white/30">NovaesWeb © 2025 — Todos os direitos reservados</p>
        </div>
      </motion.div>
    </div>
  );
}
