import type { ContractBuilderPayload, ContractBuilderStepIndex } from "@/lib/contract-builder";

const CONTRACT_RECOVERY_STORAGE_KEY = "novaesweb:admin:contract-recovery";
const CONTRACT_RECOVERY_PENDING_KEY = "novaesweb:admin:contract-recovery-pending";
const CONTRACT_RECOVERY_TTL_MS = 24 * 60 * 60 * 1000;

export type ContractRecoveryOriginAction =
  | "autosave"
  | "save-cofre"
  | "save-draft"
  | "save-and-exit"
  | "session-recovery";

export type ContractRecoverySnapshot = {
  contractId: string | null;
  builderPayload: ContractBuilderPayload;
  lastStep: ContractBuilderStepIndex;
  savedAt: string;
  originAction: ContractRecoveryOriginAction;
  payloadSignature: string;
};

function readContractRecoverySnapshot() {
  if (typeof window === "undefined") return null;

  const rawSnapshot = localStorage.getItem(CONTRACT_RECOVERY_STORAGE_KEY);
  if (!rawSnapshot) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawSnapshot) as ContractRecoverySnapshot;
    const savedAt = new Date(parsed.savedAt).getTime();

    if (!savedAt || Date.now() - savedAt > CONTRACT_RECOVERY_TTL_MS) {
      clearContractRecoverySnapshot();
      return null;
    }

    return parsed;
  } catch {
    clearContractRecoverySnapshot();
    return null;
  }
}

export function saveContractRecoverySnapshot(
  snapshot: ContractRecoverySnapshot,
  options?: { markPendingRestore?: boolean },
) {
  if (typeof window === "undefined") return;

  localStorage.setItem(CONTRACT_RECOVERY_STORAGE_KEY, JSON.stringify(snapshot));
  if (options?.markPendingRestore) {
    sessionStorage.setItem(CONTRACT_RECOVERY_PENDING_KEY, "1");
  }
}

export function clearContractRecoverySnapshot() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(CONTRACT_RECOVERY_STORAGE_KEY);
  sessionStorage.removeItem(CONTRACT_RECOVERY_PENDING_KEY);
}

export function loadContractRecoverySnapshot() {
  return readContractRecoverySnapshot();
}

export function markContractRecoveryPending() {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(CONTRACT_RECOVERY_PENDING_KEY, "1");
}

export function consumePendingContractRecoverySnapshot() {
  if (typeof window === "undefined") return null;
  if (sessionStorage.getItem(CONTRACT_RECOVERY_PENDING_KEY) !== "1") {
    return null;
  }

  sessionStorage.removeItem(CONTRACT_RECOVERY_PENDING_KEY);
  return readContractRecoverySnapshot();
}
