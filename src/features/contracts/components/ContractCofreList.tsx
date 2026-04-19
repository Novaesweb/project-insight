import { motion } from "framer-motion";
import { FileText, Badge, FilePenLine, Lock, Send, Download, MoreHorizontal, Boxes, History, RotateCcw, Archive, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge as UIBadge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Contrato, ContratoVersion } from "@/features/contracts/types";
import { getContractStatusLabel, getContractStatusBadgeClass, getContractStatusInsight } from "@/lib/contract-status";
import { formatContratoValue, formatContractDateTime, generateContractPDF, downloadWordDocument } from "@/lib/contract-utils";
import { ContractLifecycleTimeline } from "@/components/contracts/ContractLifecycleTimeline";
import { normalizeBuilderPayload } from "@/lib/contract-builder";

interface ContractCofreListProps {
  contratos: Contrato[];
  extrasCatalogo: any[];
  onView: (contrato: Contrato) => void;
  onEdit: (contrato: Contrato) => void;
  onSend: (contrato: Contrato) => void;
  onDuplicate: (contrato: Contrato) => void;
  onVersions: (contrato: Contrato) => void;
  onArchive: (contrato: Contrato) => void;
  onUnarchive: (contrato: Contrato) => void;
  onDelete: (contrato: Contrato) => void;
  shouldReduceMotion?: boolean;
}

export function ContractCofreList({
  contratos,
  extrasCatalogo,
  onView,
  onEdit,
  onSend,
  onDuplicate,
  onVersions,
  onArchive,
  onUnarchive,
  onDelete,
  shouldReduceMotion = false,
}: ContractCofreListProps) {
  if (contratos.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-white/40 text-sm">Nenhum contrato encontrado nesta categoria.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {contratos.map((contrato) => {
        const statusInsight = getContractStatusInsight({
          status: contrato.status,
          dataEnvio: contrato.data_envio,
          dataVisualizacao: contrato.data_visualizacao,
          dataAssinatura: contrato.data_assinatura,
          onboardingStartedAt: (contrato as any).onboarding_started_at,
          pedidoId: (contrato as any).pedido_id,
          requiresResign: (contrato as any).requer_reassinatura,
          resignReason: (contrato as any).reassinatura_motivo,
        });

        return (
          <motion.div
            key={contrato.id}
            whileHover={shouldReduceMotion ? undefined : { y: -4, scale: 1.002 }}
            className="group relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.02] p-5 transition-all hover:bg-white/[0.05] hover:border-primary/30"
          >
            {/* Premium Glint Effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500 bg-[radial-gradient(circle_at_var(--mouse-x,50%)_var(--mouse-y,50%),rgba(123,31,162,0.1),transparent_50%)]" />

            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between relative z-10">
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div 
                  className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-primary group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300"
                  onClick={() => onView(contrato)}
                >
                  <FileText className="h-6 w-6" />
                </div>
                
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 
                      className="text-base font-bold text-white truncate cursor-pointer hover:text-primary transition-colors"
                      onClick={() => onView(contrato)}
                    >
                      {contrato.titulo}
                    </h3>
                    <UIBadge variant="outline" className={`${getContractStatusBadgeClass(contrato.status)} rounded-full px-3 py-0.5 text-[10px]`}>
                      {getContractStatusLabel(contrato.status)}
                    </UIBadge>
                  </div>
                  
                  <div className="flex items-center gap-3 text-[11px] text-white/40 font-medium">
                    <span className="text-white/60">{(contrato.clientes as any)?.nome || "Cliente"}</span>
                    <span className="w-1 h-1 rounded-full bg-white/10" />
                    <span>R$ {formatContratoValue(contrato.valor)}</span>
                    <span className="w-1 h-1 rounded-full bg-white/10" />
                    <span>{formatContractDateTime(contrato.updated_at || contrato.created_at)}</span>
                  </div>

                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className={`w-1.5 h-1.5 rounded-full ${contrato.status === 'assinado' ? 'bg-emerald-400' : 'bg-primary'} animate-pulse`} />
                    <p className="text-[10px] text-white/60 font-medium">{statusInsight.title}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap justify-end">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="rounded-xl h-9 text-xs font-bold hover:bg-primary/20 hover:text-primary transition-all"
                  onClick={() => onEdit(contrato)}
                >
                  <FilePenLine className="w-4 h-4 mr-2" /> Editar
                </Button>

                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="rounded-xl h-9 text-xs font-bold hover:bg-white/10"
                  onClick={() => onView(contrato)}
                >
                  <Lock className="w-4 h-4 mr-2" /> Abrir
                </Button>

                {!contrato.archived_at && (
                  <Button 
                    size="sm" 
                    className="rounded-xl h-9 text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                    onClick={() => onSend(contrato)}
                  >
                    <Send className="w-4 h-4 mr-2" /> Enviar
                  </Button>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl hover:bg-white/10">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 rounded-2xl border-white/10 bg-[#120f18]/95 backdrop-blur-xl">
                    <DropdownMenuItem onClick={() => onDuplicate(contrato)} className="rounded-xl focus:bg-primary/20">
                      <Boxes className="w-4 h-4 mr-2" /> Duplicar Proposta
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onVersions(contrato)} className="rounded-xl focus:bg-primary/20">
                      <History className="w-4 h-4 mr-2" /> Histórico
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => generateContractPDF(contrato.titulo, (contrato as any).corpo, { proposal: normalizeBuilderPayload(contrato.builder_payload, extrasCatalogo, contrato.cliente_id) })}
                      className="rounded-xl focus:bg-primary/20"
                    >
                      <Download className="w-4 h-4 mr-2" /> Baixar PDF
                    </DropdownMenuItem>
                    {contrato.archived_at ? (
                      <DropdownMenuItem onClick={() => onUnarchive(contrato)} className="rounded-xl focus:bg-primary/20">
                        <RotateCcw className="w-4 h-4 mr-2" /> Desarquivar
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={() => onArchive(contrato)} className="rounded-xl focus:bg-primary/20">
                        <Archive className="w-4 h-4 mr-2" /> Arquivar
                      </DropdownMenuItem>
                    )}
                    {contrato.status === 'rascunho' && (
                      <DropdownMenuItem onClick={() => onDelete(contrato)} className="rounded-xl focus:bg-red-500/20 text-red-400">
                        <Trash2 className="w-4 h-4 mr-2" /> Excluir
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
