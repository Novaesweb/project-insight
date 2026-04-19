import React from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ExtraFilterBarProps {
  busca: string;
  setBusca: (v: string) => void;
  filtro: string;
  setFiltro: (v: string) => void;
}

export function ExtraFilterBar({ busca, setBusca, filtro, setFiltro }: ExtraFilterBarProps) {
  const filters = [
    { id: "todos", label: "Todos Itens" },
    { id: "fixo", label: "Únicos" },
    { id: "intermediario", label: "Pro" },
    { id: "mensal", label: "Assinaturas" },
    { id: "pacotes", label: "Pacotes Premium" }
  ];

  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between glass-card-premium p-4 rounded-3xl">
      <div className="relative w-full md:w-96 group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
        <Input
          placeholder="Buscar no catálogo..."
          className="h-11 pl-11 bg-white/5 border-white/5 rounded-2xl text-white focus:ring-1 focus:ring-primary/20"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-hide">
        {filters.map(f => (
          <button
            key={f.id}
            onClick={() => setFiltro(f.id)}
            className={cn(
              "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border",
              filtro === f.id
                ? "bg-primary/10 border-primary/30 text-white shadow-[0_0_20px_rgba(194,24,91,0.2)]"
                : "bg-white/5 border-white/5 text-white/30 hover:text-white/60 hover:bg-white/10"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}
