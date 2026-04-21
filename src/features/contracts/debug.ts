import { getContractErrorMessage } from "./utils";

export type ContractAdminErrorReason = "auth" | "permission" | "network" | "data" | "unknown";

export type ContractAdminDebugEntry = {
  context: string;
  reason: ContractAdminErrorReason;
  reference: string;
  safeMessage: string;
  technicalMessage: string;
};

function buildReference(context: string) {
  const stamp = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
  const scope = context
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 18);
  const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();

  return `CTR-${scope || "ADMIN"}-${stamp}-${suffix}`;
}

function extractErrorField(error: unknown, field: string) {
  if (!error || typeof error !== "object" || !(field in error)) return undefined;

  const value = (error as Record<string, unknown>)[field];
  if (typeof value === "string" || typeof value === "number") return value;

  return undefined;
}

function sanitizeMetaValue(value: unknown, depth = 0): unknown {
  if (value == null) return value;
  if (typeof value === "string") return value.length > 160 ? `${value.slice(0, 157)}...` : value;
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (Array.isArray(value)) return `Array(${value.length})`;
  if (depth >= 1 || typeof value !== "object") return "[complex]";

  const next = Object.entries(value as Record<string, unknown>)
    .slice(0, 10)
    .reduce<Record<string, unknown>>((acc, [key, entryValue]) => {
      acc[key] = sanitizeMetaValue(entryValue, depth + 1);
      return acc;
    }, {});

  return next;
}

function detectReason(error: unknown): ContractAdminErrorReason {
  const parts = [
    getContractErrorMessage(error, ""),
    extractErrorField(error, "code"),
    extractErrorField(error, "details"),
    extractErrorField(error, "hint"),
    extractErrorField(error, "status"),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (!parts) return "unknown";
  if (/(401|jwt|token|session|auth|unauthenticated|login)/.test(parts)) return "auth";
  if (/(403|forbidden|permission|policy|not allowed|unauthorized role|insufficient privilege)/.test(parts)) {
    return "permission";
  }
  if (/(network|fetch|offline|timed out|timeout|gateway|connection|dns)/.test(parts)) return "network";
  if (/(invalid|undefined|null|schema|payload|parse|format|malformed|unexpected)/.test(parts)) return "data";

  return "unknown";
}

export function getContractAdminSafeMessage(reason: ContractAdminErrorReason) {
  switch (reason) {
    case "auth":
      return "Sua sessao administrativa parece ter expirado. Recarregue a pagina e faca login novamente.";
    case "permission":
      return "Sua conta nao tem permissao suficiente para abrir ou sincronizar contratos neste painel.";
    case "network":
      return "Nao foi possivel falar com o servidor de contratos agora. Confira a conexao e tente novamente.";
    case "data":
      return "O sistema recebeu dados de contrato em formato inesperado. Revise o registro ou abra outro contrato.";
    default:
      return "O painel de contratos encontrou uma falha inesperada, mas o erro foi registrado para diagnostico.";
  }
}

export function logContractAdminError(
  context: string,
  error: unknown,
  meta?: Record<string, unknown>,
): ContractAdminDebugEntry {
  const reference = buildReference(context);
  const reason = detectReason(error);
  const technicalMessage = getContractErrorMessage(error, "Falha inesperada no painel de contratos.");
  const safeMessage = getContractAdminSafeMessage(reason);

  console.error(`[contracts-admin] ${context} ${reference}`, {
    context,
    reference,
    reason,
    technicalMessage,
    errorCode: extractErrorField(error, "code"),
    errorStatus: extractErrorField(error, "status"),
    meta: sanitizeMetaValue(meta),
  });

  return {
    context,
    reason,
    reference,
    safeMessage,
    technicalMessage,
  };
}
