import { useState } from "react";
import { Sparkles, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ContractAiAssistant } from "@/features/contracts/components/ContractAiAssistant";
import { ContractClausePickerDialog } from "@/features/contracts/components/ContractClausePickerDialog";
import {
  CONTRACT_STATUS_OPTIONS,
} from "@/features/contracts/types";
import type { ContractClauseSelection } from "@/lib/contract-clauses";
import type { ContractBuilderPayload } from "@/lib/contract-builder";
import {
  FieldGrid,
  FieldShell,
  StepPanel,
  SummaryPill,
} from "@/features/contracts/components/ContractBuilderSteps";

type ContractStepDadosLibraryProps = {
  payload: ContractBuilderPayload;
  error?: string | null;
  onUpdateTextField: (field: string, value: string) => void;
  onClauseSelectionChange: (selection: ContractClauseSelection) => void;
};

export function ContractStepDadosLibrary({
  payload,
  error,
  onUpdateTextField,
  onClauseSelectionChange,
}: ContractStepDadosLibraryProps) {
  const [aiState, setAiState] = useState<{
    isOpen: boolean;
    context: string;
    field: string;
    currentText: string;
  }>({
    isOpen: false,
    context: "",
    field: "",
    currentText: "",
  });
  const [clausePickerOpen, setClausePickerOpen] = useState(false);

  const openAi = (field: string, label: string, currentText: string) => {
    setAiState({
      isOpen: true,
      context: label,
      field,
      currentText,
    });
  };

  return (
    <StepPanel
      title="Dados do contrato"
      description="Aqui ficam os dados operacionais do documento, o status atual e as observacoes comerciais."
      stepLabel="Etapa 2"
      error={error}
    >
      <FieldGrid>
        <FieldShell label="Numero do contrato">
          <Input
            value={payload.contractNumber}
            onChange={(event) => onUpdateTextField("contractNumber", event.target.value)}
            className="border-white/10 bg-black/30 text-white"
          />
        </FieldShell>
        <FieldShell label="Status">
          <select
            value={payload.status}
            onChange={(event) => onUpdateTextField("status", event.target.value)}
            className="h-11 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-sm text-white outline-none transition focus:border-fuchsia-300/30"
          >
            {CONTRACT_STATUS_OPTIONS.map((status) => (
              <option key={status.value} value={status.value} className="bg-[#120d18] text-white">
                {status.label}
              </option>
            ))}
          </select>
        </FieldShell>
        <FieldShell label="Data de emissao">
          <Input
            type="date"
            value={payload.issueDate}
            onChange={(event) => onUpdateTextField("issueDate", event.target.value)}
            className="border-white/10 bg-black/30 text-white"
          />
        </FieldShell>
        <FieldShell label="Data de inicio">
          <Input
            type="date"
            value={payload.startDate}
            onChange={(event) => onUpdateTextField("startDate", event.target.value)}
            className="border-white/10 bg-black/30 text-white"
          />
        </FieldShell>
        <FieldShell label="Vencimento">
          <Input
            type="date"
            value={payload.dueDate}
            onChange={(event) => onUpdateTextField("dueDate", event.target.value)}
            className="border-white/10 bg-black/30 text-white"
          />
        </FieldShell>
        <FieldShell label="Prazo (dias)">
          <Input
            value={payload.prazoDias}
            onChange={(event) => onUpdateTextField("prazoDias", event.target.value)}
            className="border-white/10 bg-black/30 text-white"
          />
        </FieldShell>
        <FieldShell label="Forma de pagamento" full>
          <Input
            value={payload.formaPagamento}
            onChange={(event) => onUpdateTextField("formaPagamento", event.target.value)}
            className="border-white/10 bg-black/30 text-white"
          />
        </FieldShell>
        <FieldShell label="Numero de revisoes">
          <Input
            value={payload.numeroRevisoes}
            onChange={(event) => onUpdateTextField("numeroRevisoes", event.target.value)}
            className="border-white/10 bg-black/30 text-white"
          />
        </FieldShell>
        <FieldShell label="Valor de revisao">
          <Input
            value={payload.valorRevisao}
            onChange={(event) => onUpdateTextField("valorRevisao", event.target.value)}
            className="border-white/10 bg-black/30 text-white"
          />
        </FieldShell>
        <FieldShell label="Prazo de suporte" full>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/45">Prazo de suporte</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-[10px] text-fuchsia-400 hover:text-fuchsia-300 hover:bg-fuchsia-400/10"
              onClick={() => openAi("prazoSuporte", "Prazo de Suporte", payload.prazoSuporte)}
            >
              <Wand2 className="mr-1 h-3 w-3" />
              IA
            </Button>
          </div>
          <Textarea
            value={payload.prazoSuporte}
            onChange={(event) => onUpdateTextField("prazoSuporte", event.target.value)}
            className="min-h-[96px] border-white/10 bg-black/30 text-white"
          />
        </FieldShell>
        <FieldShell label="Escopo principal" full>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/45">Escopo principal</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-[10px] text-fuchsia-400 hover:text-fuchsia-300 hover:bg-fuchsia-400/10"
              onClick={() => openAi("customScope", "Escopo Principal", payload.customScope)}
            >
              <Wand2 className="mr-1 h-3 w-3" />
              IA
            </Button>
          </div>
          <Textarea
            value={payload.customScope}
            onChange={(event) => onUpdateTextField("customScope", event.target.value)}
            className="min-h-[100px] border-white/10 bg-black/30 text-white"
            placeholder="Descreva o escopo principal do contrato."
          />
        </FieldShell>
        <FieldShell label="Observacoes comerciais" full>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/45">Observacoes comerciais</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-[10px] text-fuchsia-400 hover:text-fuchsia-300 hover:bg-fuchsia-400/10"
              onClick={() => openAi("observacoesComerciais", "Observacoes Comerciais", payload.observacoesComerciais)}
            >
              <Wand2 className="mr-1 h-3 w-3" />
              IA
            </Button>
          </div>
          <Textarea
            value={payload.observacoesComerciais}
            onChange={(event) => onUpdateTextField("observacoesComerciais", event.target.value)}
            className="min-h-[120px] border-white/10 bg-black/30 text-white"
          />
        </FieldShell>
        <FieldShell label="Escopo e exclusoes" full>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/45">Escopo e exclusoes</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-[10px] text-fuchsia-400 hover:text-fuchsia-300 hover:bg-fuchsia-400/10"
              onClick={() => openAi("escopoExclusoes", "Escopo e Exclusoes", payload.escopoExclusoes)}
            >
              <Wand2 className="mr-1 h-3 w-3" />
              IA
            </Button>
          </div>
          <Textarea
            value={payload.escopoExclusoes}
            onChange={(event) => onUpdateTextField("escopoExclusoes", event.target.value)}
            className="min-h-[120px] border-white/10 bg-black/30 text-white"
          />
        </FieldShell>
        <FieldShell label="Clausulas da biblioteca" full>
          <div className="rounded-[26px] border border-white/10 bg-black/20 p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-sm font-semibold text-white">Biblioteca global aplicada ao contrato</p>
                <p className="mt-1 text-sm leading-relaxed text-white/55">
                  Escolha quais clausulas cadastradas entram neste contrato. Se voce nao selecionar nenhuma, o documento sera salvo sem clausulas adicionais.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                  onClick={() => setClausePickerOpen(true)}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Selecionar clausulas salvas
                </Button>
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <SummaryPill label="Selecionadas" value={`${payload.clauseSelection.items.length} clausula(s)`} />
              <SummaryPill
                label="Modo"
                value="Selecao manual"
              />
              <SummaryPill
                label="Bloco final"
                value={payload.customClauses ? "Atualizado" : "Vazio"}
                accent={Boolean(payload.customClauses)}
              />
            </div>

            <Textarea
              readOnly
              value={payload.customClauses}
              className="mt-4 min-h-[150px] border-white/10 bg-black/30 text-white"
              placeholder="As clausulas selecionadas aparecerao aqui. Se nada for escolhido, o contrato ficara sem clausulas adicionais."
            />
          </div>
        </FieldShell>

        <ContractAiAssistant
          isOpen={aiState.isOpen}
          onClose={() => setAiState((prev) => ({ ...prev, isOpen: false }))}
          context={aiState.context}
          currentText={aiState.currentText}
          onApply={(text) => onUpdateTextField(aiState.field, text)}
        />
        <ContractClausePickerDialog
          open={clausePickerOpen}
          onOpenChange={setClausePickerOpen}
          payload={payload}
          selection={payload.clauseSelection}
          onApply={onClauseSelectionChange}
        />
      </FieldGrid>
    </StepPanel>
  );
}
