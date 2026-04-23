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
    <Card className="glass-premium overflow-hidden border-slate-200 transition-all duration-500">
      <CardHeader className="flex flex-row items-center gap-5 border-b border-slate-100 bg-slate-50/50 p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-lg shadow-[#7C3AED]/20">
          <Users className="h-6 w-6" />
        </div>
        <div>
          <CardTitle className="text-2xl font-light text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
            1. Selecionar <span className="text-brand-gradient italic">Ecossistema</span>
          </CardTitle>
          <CardDescription className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Destinatário da Estratégia</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-8">
        <Select value={selectedClientId} onValueChange={onSelect}>
          <SelectTrigger className="h-16 border-slate-200 bg-white text-slate-900 text-lg rounded-2xl hover:border-[#7C3AED]/30 transition-all shadow-sm">
            <SelectValue placeholder="Escolha um cliente na base..." />
          </SelectTrigger>
          <SelectContent className="glass-premium border-slate-200 text-slate-900">
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id} className="focus:bg-[#7C3AED]/10 focus:text-[#7C3AED]">
                {getClientDisplayName(client)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}
