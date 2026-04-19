import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { BuilderPreviewDocument } from "@/components/contracts/BuilderPreviewDocument";
import { ContractActivityFeed } from "@/components/contracts/ContractActivityFeed";
import { ContractSignedStatusBadge } from "@/components/contracts/ContractSignaturePanel";
import { Card, CardContent } from "@/components/ui/card";
import { PreviewState, Contrato } from "@/features/contracts/types";
import { buildProposalSummary, buildContractSignatureSummary, buildContractClauseExplanations } from "@/lib/contract-builder";
import { ContractEventRow } from "@/lib/contract-activity";

interface ContractPreviewDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  previewState: PreviewState | null;
  events: ContractEventRow[];
  eventsLoading: boolean;
}

export function ContractPreviewDrawer({
  open,
  onOpenChange,
  previewState,
  events,
  eventsLoading,
}: ContractPreviewDrawerProps) {
  if (!previewState) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-4xl overflow-y-auto border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(123,31,162,0.15),transparent_24%),rgba(17,15,24,0.98)] backdrop-blur-3xl shadow-[-20px_0_80px_rgba(0,0,0,0.6)]"
      >
        <SheetHeader className="mb-6">
          <SheetTitle className="text-white text-xl font-bold flex items-center gap-3">
            <span className="w-2 h-8 bg-gradient-to-b from-primary to-fuchsia-600 rounded-full" />
            {previewState.title || "Visualização do Contrato"}
          </SheetTitle>
        </SheetHeader>

        <div className="grid gap-8 xl:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <BuilderPreviewDocument
              title={previewState.title}
              body={previewState.body}
              summary={previewState.proposal ? buildProposalSummary(previewState.proposal) : null}
              signatureSummary={buildContractSignatureSummary(previewState.proposal, {
                contractanteSignedName: previewState.contract?.assinatura_cliente_nome,
                signedAt: previewState.contract?.data_assinatura,
              })}
              explanations={previewState.proposal ? buildContractClauseExplanations(previewState.proposal) : []}
            />
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold">Painel de Controle</p>
              <p className="text-xs text-white/50 leading-relaxed">
                Status em tempo real e histórico de atividades deste documento.
              </p>
            </div>

            {previewState.contract && (
              <Card className="overflow-hidden border-white/10 bg-white/[0.03] shadow-xl">
                <CardContent className="p-5 space-y-4">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-[0.15em] text-white/40">Status Atual</p>
                    <p className="text-sm font-medium text-white">
                      {previewState.contract.status === "assinado"
                        ? "✅ Contrato Assinado"
                        : (previewState.contract as any).requer_reassinatura
                          ? "⚠️ Reassinatura Solicitada"
                          : "📝 Em Acompanhamento"}
                    </p>
                  </div>
                  
                  <ContractSignedStatusBadge
                    signedName={previewState.contract.assinatura_cliente_nome}
                    signedAt={previewState.contract.data_assinatura}
                    variant="dark"
                  />
                </CardContent>
              </Card>
            )}

            <div className="rounded-3xl border border-white/10 bg-black/20 p-1">
               <ContractActivityFeed
                  events={events}
                  loading={eventsLoading}
                  emptyLabel="Nenhuma atividade registrada."
                />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
