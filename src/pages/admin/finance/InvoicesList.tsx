import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Download, 
  Plus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  DollarSign,
  FileText,
  Trash2,
  Pencil,
  ArrowRight
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useFinance } from "@/features/finance/hooks/useFinance";
import StatusBadge from "@/components/StatusBadge";
import { cn } from "@/lib/utils";
import { DeleteConfirmDialog, useDeleteConfirm } from "@/components/DeleteConfirmDialog";

export default function InvoicesList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtro, setFiltro] = useState(searchParams.get("status") || "todos");
  const [busca, setBusca] = useState("");
  
  const { entries, loading, updateStatus, deleteEntry } = useFinance({
    status: filtro !== "todos" ? filtro : undefined
  });

  const { requestDelete, dialogProps } = useDeleteConfirm();

  const filtrados = useMemo(() => {
    return entries.filter(f => 
      f.descricao.toLowerCase().includes(busca.toLowerCase()) ||
      f.clientes?.nome.toLowerCase().includes(busca.toLowerCase())
    );
  }, [entries, busca]);

  return (
    <div className="space-y-8 pb-20">
      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between glass-card-premium p-4 rounded-3xl">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Buscar faturas ou clientes..."
            className="h-11 pl-11 bg-white/5 border-white/5 rounded-2xl text-white focus:ring-1 focus:ring-primary/20"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
          {["todos", "pago", "pendente", "em_atraso"].map(s => (
            <button
              key={s}
              onClick={() => setFiltro(s)}
              className={cn(
                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border",
                filtro === s
                  ? "bg-primary/10 border-primary/30 text-white"
                  : "bg-white/5 border-white/5 text-white/30 hover:text-white/60"
              )}
            >
              {s === "todos" ? "Todas" : s === "em_atraso" ? "Atrasadas" : s}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela de Lançamentos */}
      <Card className="glass-card-premium overflow-hidden border-white/5">
        <Table>
          <TableHeader className="bg-white/[0.02]">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-white/30 py-6 pl-8">Descrição</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-white/30 py-6">Valor</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-white/30 py-6">Vencimento</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-white/30 py-6">Cliente</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-white/30 py-6">Status</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-white/30 py-6 pr-8 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="popLayout">
              {filtrados.map((f) => (
                <TableRow 
                  key={f.id} 
                  className="border-white/5 hover:bg-white/[0.01] transition-colors group"
                >
                  <TableCell className="py-6 pl-8">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white group-hover:text-primary transition-colors">{f.descricao}</span>
                      <span className="text-[10px] text-white/20 uppercase font-bold tracking-widest mt-0.5">Ref: {f.id.split("-")[0]}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      "text-sm font-black",
                      f.tipo === "entrada" ? "text-emerald-400" : "text-rose-400"
                    )}>
                      {f.tipo === "saida" ? "- " : ""}R$ {f.valor.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-white/60 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-white/20" />
                      {f.vencimento ? new Date(f.vencimento).toLocaleDateString() : "—"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-bold text-white/40">{f.clientes?.nome || "Lançamento Avulso"}</span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={f.status} />
                  </TableCell>
                  <TableCell className="pr-8 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <Button 
                         size="sm" 
                         variant="outline"
                         className={cn(
                           "h-8 px-3 text-[9px] font-black uppercase tracking-widest border-0 transition-all",
                           f.status === "pago" 
                             ? "bg-emerald-500/10 text-emerald-400" 
                             : "bg-white/5 text-white/20 hover:bg-emerald-500/20 hover:text-emerald-400"
                         )}
                         onClick={() => updateStatus({ id: f.id, status: f.status === "pago" ? "pendente" : "pago" })}
                       >
                         {f.status === "pago" ? "✓ Pago" : "Pagar"}
                       </Button>

                       <DropdownMenu>
                         <DropdownMenuTrigger asChild>
                           <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white/20 hover:text-white">
                             <MoreVertical className="h-4 w-4" />
                           </Button>
                         </DropdownMenuTrigger>
                         <DropdownMenuContent align="end" className="bg-[#0f0f1a] border-white/10 text-white shadow-2xl">
                           <DropdownMenuItem className="text-[10px] font-bold uppercase tracking-widest gap-2 cursor-pointer py-3">
                             <Pencil className="w-3.5 h-3.5 text-blue-400" /> Editar Registro
                           </DropdownMenuItem>
                           <DropdownMenuItem className="text-[10px] font-bold uppercase tracking-widest gap-2 cursor-pointer py-3">
                             <Download className="w-3.5 h-3.5 text-emerald-400" /> Baixar Recibo (PDF)
                           </DropdownMenuItem>
                           <DropdownMenuSeparator className="bg-white/5" />
                           <DropdownMenuItem 
                             className="text-[10px] font-bold uppercase tracking-widest gap-2 cursor-pointer py-3 text-rose-400 focus:text-rose-400 focus:bg-rose-500/10"
                             onClick={() => requestDelete(async () => deleteEntry(f.id), "Excluir Fatura", "Deseja remover este registro financeiro permanentemente?")}
                           >
                             <Trash2 className="w-3.5 h-3.5" /> Excluir permanentemente
                           </DropdownMenuItem>
                         </DropdownMenuContent>
                       </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </AnimatePresence>
          </TableBody>
        </Table>
      </Card>

      <DeleteConfirmDialog {...dialogProps} />
    </div>
  );
}

function Calendar(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  );
}
