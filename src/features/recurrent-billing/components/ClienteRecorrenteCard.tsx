import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { CalendarDays } from "lucide-react";
import type { ClienteRecorrente } from "../types";

interface ClienteRecorrenteCardProps {
  cliente: ClienteRecorrente;
  isSelected: boolean;
  onToggle: (id: string) => void;
  onOpenHistory: (cliente: ClienteRecorrente) => void;
}

export function ClienteRecorrenteCard({
  cliente,
  isSelected,
  onToggle,
  onOpenHistory,
}: ClienteRecorrenteCardProps) {
  return (
    <div
      className={`p-3 sm:p-4 rounded-lg border transition-all cursor-pointer ${
        isSelected ? "bg-primary/5 border-primary/30" : "bg-secondary/30 border-border hover:bg-secondary/60"
      }`}
      onClick={() => onToggle(cliente.cliente_id)}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggle(cliente.cliente_id)}
          className="mt-0.5 shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4">
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-foreground truncate">{cliente.cliente_nome}</h3>
              <p className="text-[10px] text-muted-foreground truncate">{cliente.cliente_email}</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div className="text-right">
                <p className="text-sm font-bold text-foreground">
                  R$ {cliente.totalMensal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[10px] text-muted-foreground">{cliente.extras.length} extras</p>
              </div>
              <Button
                size="sm" variant="outline" className="h-7 text-xs shrink-0"
                onClick={(e) => { e.stopPropagation(); onOpenHistory(cliente); }}
              >
                <CalendarDays className="w-3 h-3 mr-1" /> Meses
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {cliente.extras.map(e => (
              <span key={e.id} className="text-[9px] border border-border rounded-full px-1.5 py-0.5 text-muted-foreground">
                {e.nome} • R$ {e.preco_mensal.toFixed(2)}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
