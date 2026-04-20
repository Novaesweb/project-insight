import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { briefingStatusMeta } from "@/lib/project-briefings";
import { getClientDisplayName, type ClientLite } from "../types";

export function BriefingsFiltersBar({
  clients,
  selectedClientId,
  onClientChange,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: {
  clients: ClientLite[];
  selectedClientId: string;
  onClientChange: (value: string) => void;
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-[260px_1fr_220px]">
      <Select value={selectedClientId} onValueChange={onClientChange}>
        <SelectTrigger className="border-white/10 bg-white/[0.03] text-white">
          <SelectValue placeholder="Selecione um cliente" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos os clientes</SelectItem>
          {clients.map((client) => (
            <SelectItem key={client.id} value={client.id}>
              {getClientDisplayName(client)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar briefing por cliente ou título"
          className="border-white/10 bg-white/[0.03] pl-9 text-white"
        />
      </div>

      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="border-white/10 bg-white/[0.03] text-white">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos os status</SelectItem>
          {Object.entries(briefingStatusMeta).map(([value, meta]) => (
            <SelectItem key={value} value={value}>
              {value === "em_preenchimento"
                ? "Parcial"
                : value === "enviado"
                  ? "Aguardando resposta"
                  : meta.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
