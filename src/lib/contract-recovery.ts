import type { ContractBuilderPayload, ContractBuilderStepIndex } from "@/lib/contract-builder";
import { readDraftStorage, removeDraftStorage, writeDraftStorage } from "@/lib/draft-storage";

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
  const envelope = readDraftStorage<ContractRecoverySnapshot>({
    storageKey: CONTRACT_RECOVERY_STORAGE_KEY,
    ttlMs: CONTRACT_RECOVERY_TTL_MS,
    version: "v1",
  });

  return envelope?.state ?? null;
}

export function saveContractRecoverySnapshot(
  snapshot: ContractRecoverySnapshot,
  options?: { markPendingRestore?: boolean },
) {
  if (typeof window === "undefined") return;

  writeDraftStorage({
    storageKey: CONTRACT_RECOVERY_STORAGE_KEY,
    version: "v1",
    state: snapshot,
  });
  if (options?.markPendingRestore) {
    sessionStorage.setItem(CONTRACT_RECOVERY_PENDING_KEY, "1");
  }
}

export function clearContractRecoverySnapshot() {
  if (typeof window === "undefined") return;

  removeDraftStorage(CONTRACT_RECOVERY_STORAGE_KEY);
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
