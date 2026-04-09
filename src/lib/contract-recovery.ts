import type { ContractBuilderPayload, ContractBuilderStepIndex } from "@/lib/contract-builder";

const CONTRACT_RECOVERY_STORAGE_KEY = "novaesweb:admin:contract-recovery";
const CONTRACT_RECOVERY_PENDING_KEY = "novaesweb:admin:contract-recovery-pending";
const CONTRACT_RECOVERY_TTL_MS = 24 * 60 * 60 * 1000;

export type ContractRecoverySnapshot = {
  contractId: string | null;
  builderPayload: ContractBuilderPayload;
  lastStep: ContractBuilderStepIndex;
  savedAt: string;
};

export function saveContractRecoverySnapshot(snapshot: ContractRecoverySnapshot) {
  if (typeof window === "undefined") return;

  localStorage.setItem(CONTRACT_RECOVERY_STORAGE_KEY, JSON.stringify(snapshot));
  sessionStorage.setItem(CONTRACT_RECOVERY_PENDING_KEY, "1");
}

export function clearContractRecoverySnapshot() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(CONTRACT_RECOVERY_STORAGE_KEY);
  sessionStorage.removeItem(CONTRACT_RECOVERY_PENDING_KEY);
}

export function consumePendingContractRecoverySnapshot() {
  if (typeof window === "undefined") return null;
  if (sessionStorage.getItem(CONTRACT_RECOVERY_PENDING_KEY) !== "1") {
    return null;
  }

  const rawSnapshot = localStorage.getItem(CONTRACT_RECOVERY_STORAGE_KEY);
  clearContractRecoverySnapshot();

  if (!rawSnapshot) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawSnapshot) as ContractRecoverySnapshot;
    const savedAt = new Date(parsed.savedAt).getTime();

    if (!savedAt || Date.now() - savedAt > CONTRACT_RECOVERY_TTL_MS) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}
