import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, FileText, Loader2, Edit, Trash2, Send, ExternalLink, CheckCircle2 } from "lucide-react";
import { formatMes, statusConfig, type ClienteRecorrente, type FaturaMes } from "../types";

interface ClienteHistoricoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente: ClienteRecorrente | null;
  faturas: FaturaMes[];
  enviandoFinanceiro: string | null;
  updatingStatus: string | null;
  deletingFatura: string | null;
  onEdit: (fatura: FaturaMes) => void;
  onDelete: (fatura: FaturaMes) => void;
  onSendFinanceiro: (fatura: FaturaMes) => void;
  onUpdateStatus: (fatura: FaturaMes, status: string) => void;
}

export function ClienteHistoricoDialog({
  open,
  onOpenChange,
  cliente,
  faturas,
  enviandoFinanceiro,
  updatingStatus,
  deletingFatura,
  onEdit,
  onDelete,
  onSendFinanceiro,
  onUpdateStatus,
}: ClienteHistoricoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2 text-sm sm:text-base">
            <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5" />
            {cliente?.cliente_nome} — Faturas Mensais
          </DialogTitle>
        </DialogHeader>

        {cliente && (
          <div className="space-y-4">
            {/* Resumo */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 sm:p-3 rounded-lg bg-secondary">
                <p className="text-[9px] sm:text-xs text-muted-foreground">Valor/mês</p>
                <p className="text-sm sm:text-lg font-bold text-foreground">
                  R$ {cliente.totalMensal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-2 sm:p-3 rounded-lg bg-secondary">
                <p className="text-[9px] sm:text-xs text-muted-foreground">Extras</p>
                <p className="text-sm sm:text-lg font-bold text-foreground">{cliente.extras.length}</p>
              </div>
              <div className="p-2 sm:p-3 rounded-lg bg-secondary">
                <p className="text-[9px] sm:text-xs text-muted-foreground">Faturas</p>
                <p className="text-sm sm:text-lg font-bold text-foreground">{faturas.length}</p>
              </div>
            </div>

            {/* Extras */}
            <div className="flex flex-wrap gap-1">
              {cliente.extras.map(e => (
                <span key={e.id} className="text-[9px] sm:text-xs border border-border rounded-full px-2 py-0.5 text-muted-foreground">
                  {e.nome} — R$ {e.preco_mensal.toFixed(2)}
                </span>
              ))}
            </div>

            {/* Faturas por mês */}
            {faturas.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-xs text-muted-foreground">Nenhuma fatura gerada ainda</p>
                <p className="text-[10px] text-muted-foreground mt-1">Selecione o cliente e clique em "Gerar Fatura"</p>
              </div>
            ) : (
              <div className="space-y-3">
                {faturas.map((f) => {
                  const st = statusConfig[f.status] || statusConfig.pendente;
                  const isRascunho = f.status === "rascunho";
                  const isPendente = f.status === "pendente";
                  const isPago = f.status.includes("pago");

                  return (
                    <Card key={f.id} className={isRascunho ? "border-dashed" : ""}>
                      <CardContent className="p-3 sm:p-4 space-y-3">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm sm:text-base font-bold text-foreground">{formatMes(f.mes)}</span>
                            <Badge variant={st.variant} className="text-[10px]">{st.label}</Badge>
                          </div>
                          <span className="text-sm sm:text-base font-bold text-foreground">
                            R$ {Number(f.valor_total).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </span>
                        </div>

                        {/* Info */}
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] sm:text-xs text-muted-foreground">
                          <span>{f.extras_count} extras</span>
                          {f.vencimento && <span>Venc: {new Date(f.vencimento + "T00:00:00").toLocaleDateString("pt-BR")}</span>}
                          {f.forma_pagamento && <span>Via: {f.forma_pagamento === "asaas" ? "Asaas" : "Manual"}</span>}
                          {f.data_pagamento && <span>Pago: {new Date(f.data_pagamento).toLocaleDateString("pt-BR")}</span>}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2">
                          {(isRascunho || isPendente) && (
                            <Button
                              size="sm" variant="outline" className="text-xs h-8"
                              onClick={() => onEdit(f)}
                            >
                              <Edit className="w-3 h-3 mr-1" /> Editar
                            </Button>
                          )}

                          {isRascunho && (
                            <Button
                              size="sm" variant="destructive" className="text-xs h-8"
                              disabled={deletingFatura === f.id}
                              onClick={() => onDelete(f)}
                            >
                              {deletingFatura === f.id ? (
                                <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Excluindo...</>
                              ) : (
                                <><Trash2 className="w-3 h-3 mr-1" /> Excluir</>
                              )}
                            </Button>
                          )}

                          {isRascunho && (
                            <Button
                              size="sm" className="text-xs h-8 flex-1 sm:flex-none"
                              disabled={enviandoFinanceiro === f.id}
                              onClick={() => onSendFinanceiro(f)}
                            >
                              {enviandoFinanceiro === f.id ? (
                                <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Enviando...</>
                              ) : (
                                <><Send className="w-3 h-3 mr-1" /> Enviar ao Financeiro</>
                              )}
                            </Button>
                          )}

                          {isPendente && (
                            <>
                              <Button size="sm" variant="outline" className="text-xs h-8 flex-1 sm:flex-none"
                                disabled={updatingStatus === f.id}
                                onClick={() => onUpdateStatus(f, "pago_manualmente")}>
                                {updatingStatus === f.id ? "..." : "Pago Manual"}
                              </Button>
                              <Button size="sm" variant="outline" className="text-xs h-8 flex-1 sm:flex-none"
                                disabled={updatingStatus === f.id}
                                onClick={() => onUpdateStatus(f, "pago_asaas")}>
                                {updatingStatus === f.id ? "..." : "Pago Asaas"}
                              </Button>
                            </>
                          )}

                          {f.asaas_invoice_url && (
                            <Button size="sm" variant="outline" className="text-xs h-8"
                              onClick={() => window.open(f.asaas_invoice_url!, "_blank")}>
                              <ExternalLink className="w-3 h-3 mr-1" /> Fatura Asaas
                            </Button>
                          )}

                          {isPago && (
                            <div className="flex items-center gap-1 text-emerald-500 text-xs">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Pago
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
