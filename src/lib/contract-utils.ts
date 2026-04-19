export { formatCurrencyBRL, parseMoneyInput } from "@/lib/contract-builder";

export {
  buildItemMoneyDraftKey,
  buildBuilderDirtySignature,
  buildBuilderSavePayload,
  buildPricingMoneyDraftKey,
  formatContractClock,
  formatContractDateTime,
  formatContratoValue,
  formatMoneyInputValue,
  getContractErrorMessage,
  hasMeaningfulBuilderState,
  normalizeBuilderPayload,
  normalizeBuilderStep,
} from "@/features/contracts/utils";

export { downloadWordDocument, generateContractPDF } from "@/features/contracts/documents";
