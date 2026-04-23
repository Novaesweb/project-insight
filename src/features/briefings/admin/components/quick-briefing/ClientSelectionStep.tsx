import { Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getClientDisplayName } from "../../types";

interface Props {
  clients: any[];
  selectedClientId: string;
  onSelect: (id: string) => void;
}

export function ClientSelectionStep({ clients, selectedClientId, onSelect }: Props) {
  return (
    <Card className="glass-premium overflow-hidden border-[#D4AF37]/10 transition-all duration-500">
      <CardHeader className="flex flex-row items-center gap-5 border-b border-[#D4AF37]/5 bg-white/[0.01] p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-gradient text-black shadow-lg shadow-[#D4AF37]/20">
          <Users className="h-6 w-6" />
        </div>
        <div>
          <CardTitle className="text-2xl font-light text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
            1. Selecionar <span className="text-gold-gradient italic">Ecossistema</span>
          </CardTitle>
          <CardDescription className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Destinatário da Estratégia</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-8">
        <Select value={selectedClientId} onValueChange={onSelect}>
          <SelectTrigger className="h-16 border-white/5 bg-black/40 text-white text-lg rounded-2xl hover:border-[#D4AF37]/30 transition-all">
            <SelectValue placeholder="Escolha um cliente na base..." />
          </SelectTrigger>
          <SelectContent className="glass-premium border-[#D4AF37]/20 text-white">
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id} className="focus:bg-[#D4AF37]/10 focus:text-[#D4AF37]">
                {getClientDisplayName(client)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}
