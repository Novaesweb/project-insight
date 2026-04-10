import "./styles.css";

export { NovaesFlowBuilder } from "./NovaesFlowBuilder";
export type {
  NovaesFlowConfig,
  NovaesFlowExtra,
  NovaesFlowField,
  NovaesFlowFinishPayload,
  NovaesFlowInitialSelection,
  NovaesFlowPlan,
  NovaesFlowSelection,
} from "./types";
export {
  buildNovaesFlowFinishPayload,
  buildNovaesFlowSelection,
  computeNovaesFlowTotals,
  formatNovaesFlowCurrency,
} from "./utils/finance";
export {
  sanitizeNovaesFlowEmail,
  sanitizeNovaesFlowFieldValue,
  sanitizeNovaesFlowFields,
  sanitizeNovaesFlowPhone,
  sanitizeNovaesFlowText,
} from "./utils/sanitize";
