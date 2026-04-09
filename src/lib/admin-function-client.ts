import type { Session } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";
import { PUBLIC_SUPABASE_CONFIG } from "@/integrations/supabase/public-config";

export const ADMIN_SESSION_RECOVERY_EVENT = "novaesweb:admin-session-recovery";
export const ADMIN_SESSION_RESTORED_EVENT = "novaesweb:admin-session-restored";
export const ADMIN_RETURN_TO_STORAGE_KEY = "novaesweb:admin:return-to";
const ADMIN_SESSION_REFRESH_THROTTLE_MS = 45_000;

let lastAdminSessionRefreshAt = 0;

type AdminSessionRecoveryDetail = {
  code: string;
  message: string;
  returnTo: string;
  source?: string;
};

type AdminFunctionErrorPayload = {
  code?: string;
  message: string;
  status?: number;
};

type InvokeAdminFunctionOptions = {
  body?: unknown;
  returnTo?: string;
  source?: string;
  fallbackMessage?: string;
  onInvalidSession?: () => Promise<void> | void;
};

export class AdminFunctionError extends Error {
  code?: string;
  status?: number;

  constructor(message: string, code?: string, status?: number) {
    super(message);
    this.name = "AdminFunctionError";
    this.code = code;
    this.status = status;
  }
}

function getWindowPath() {
  if (typeof window === "undefined") return "/admin";
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

function decodeJwtPayload(token: string) {
  const parts = token.split(".");
  if (parts.length < 2) return null;

  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const json = window.atob(padded);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function getTokenProjectRef(token: string) {
  const payload = decodeJwtPayload(token);

  if (!payload) return null;
  if (typeof payload.ref === "string" && payload.ref.trim()) {
    return payload.ref.trim();
  }

  if (typeof payload.iss === "string" && payload.iss.includes(".supabase.co")) {
    const match = payload.iss.match(/^https:\/\/([a-z0-9-]+)\.supabase\.co\/auth\/v1/i);
    return match?.[1] || null;
  }

  return null;
}

export function isSupabaseAccessTokenCompatible(token?: string | null) {
  if (!token) return false;
  const tokenProjectRef = getTokenProjectRef(token);
  return tokenProjectRef === PUBLIC_SUPABASE_CONFIG.projectId;
}

function isSessionErrorCode(code?: string) {
  return code === "INVALID_SESSION" || code === "MISSING_AUTH" || code === "SESSION_PROJECT_MISMATCH";
}

function isSessionErrorMessage(message: string) {
  const normalized = message.trim().toLowerCase();
  return (
    normalized.includes("invalid jwt") ||
    normalized.includes("jwt expired") ||
    normalized.includes("sessão inválida") ||
    normalized.includes("session expired")
  );
}

function isSessionErrorPayload(payload: AdminFunctionErrorPayload) {
  if (isSessionErrorCode(payload.code)) {
    return true;
  }

  if (payload.status && payload.status !== 401) {
    return false;
  }

  return isSessionErrorMessage(payload.message);
}

function normalizeAdminErrorMessage(payload: AdminFunctionErrorPayload, fallbackMessage: string) {
  if (payload.code === "INTERNAL_USER_FORBIDDEN") {
    return "Seu usuário não está liberado no painel administrativo.";
  }

  if (payload.code === "INTERNAL_USER_VALIDATION_FAILED") {
    return "Falha ao validar seu acesso interno. Tente novamente em instantes.";
  }

  return payload.message || fallbackMessage;
}

async function signOutLocalSession() {
  try {
    await supabase.auth.signOut({ scope: "local" });
  } catch {
    void 0;
  }
}

export function storeAdminReturnTo(path: string) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(ADMIN_RETURN_TO_STORAGE_KEY, path);
}

export function consumeAdminReturnTo() {
  if (typeof window === "undefined") return null;
  const value = sessionStorage.getItem(ADMIN_RETURN_TO_STORAGE_KEY);
  sessionStorage.removeItem(ADMIN_RETURN_TO_STORAGE_KEY);
  return value;
}

export function requestAdminSessionRecovery(detail: Partial<AdminSessionRecoveryDetail> = {}) {
  if (typeof window === "undefined") return;

  const recoveryDetail: AdminSessionRecoveryDetail = {
    code: detail.code || "INVALID_SESSION",
    message: detail.message || "Sua sessão expirou. Entre novamente no painel para continuar.",
    returnTo: detail.returnTo || getWindowPath(),
    source: detail.source,
  };

  storeAdminReturnTo(recoveryDetail.returnTo);
  window.dispatchEvent(
    new CustomEvent(ADMIN_SESSION_RECOVERY_EVENT, {
      detail: recoveryDetail,
    }),
  );
}

export async function getCompatibleAdminSession({
  allowRefresh = true,
  clearInvalidLocalSession = true,
}: {
  allowRefresh?: boolean;
  clearInvalidLocalSession?: boolean;
} = {}): Promise<Session | null> {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    if (clearInvalidLocalSession) {
      await signOutLocalSession();
    }
    return null;
  }

  if (!session?.access_token) {
    return null;
  }

  if (!isSupabaseAccessTokenCompatible(session.access_token)) {
    if (clearInvalidLocalSession) {
      await signOutLocalSession();
    }
    return null;
  }

  if (!allowRefresh) {
    return session;
  }

  const nowInSeconds = Math.floor(Date.now() / 1000);
  if (session.expires_at && session.expires_at <= nowInSeconds + 60) {
    const refreshed = await supabase.auth.refreshSession();
    const refreshedSession = refreshed.data.session;

    if (!refreshed.error && refreshedSession?.access_token && isSupabaseAccessTokenCompatible(refreshedSession.access_token)) {
      lastAdminSessionRefreshAt = Date.now();
      return refreshedSession;
    }

    const currentTokenStillUsable = !session.expires_at || session.expires_at > nowInSeconds;
    if (currentTokenStillUsable) {
      return session;
    }

    if (clearInvalidLocalSession) {
      await signOutLocalSession();
    }
    return null;
  }

  return session;
}

async function readFunctionErrorPayload(error: unknown, fallbackMessage: string): Promise<AdminFunctionErrorPayload> {
  if (
    error &&
    typeof error === "object" &&
    "context" in error &&
    error.context instanceof Response
  ) {
    const response = error.context.clone();
    const status = response.status;
    const contentType = response.headers.get("content-type") || "";

    try {
      if (contentType.includes("application/json")) {
        const payload = await response.json();
        if (payload && typeof payload === "object") {
          const message =
            (typeof payload.message === "string" && payload.message.trim()) ||
            (typeof payload.error === "string" && payload.error.trim()) ||
            fallbackMessage;
          const code = typeof payload.code === "string" ? payload.code : undefined;
          return { code, message, status };
        }
      }

      const text = await response.text();
      if (text.trim()) {
        return { message: text.trim(), status };
      }
    } catch {
      void 0;
    }
  }

  if (error instanceof AdminFunctionError) {
    return { code: error.code, message: error.message, status: error.status };
  }

  if (error instanceof Error && error.message) {
    return { message: error.message };
  }

  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
    return { message: error.message };
  }

  return { message: fallbackMessage };
}

async function ensureSessionForAdminCall(forceRefresh = false) {
  const session = await getCompatibleAdminSession({
    allowRefresh: true,
    clearInvalidLocalSession: false,
  });

  if (!session?.access_token) {
    throw new AdminFunctionError(
      "Sua sessão expirou. Entre novamente no painel para continuar.",
      "INVALID_SESSION",
      401,
    );
  }

  const shouldForceRefresh = forceRefresh;
  const shouldRefreshSilently =
    forceRefresh || Date.now() - lastAdminSessionRefreshAt > ADMIN_SESSION_REFRESH_THROTTLE_MS;

  if (!shouldRefreshSilently) {
    return session;
  }

  const refreshed = await supabase.auth.refreshSession();
  const refreshedSession = refreshed.data.session;

  if (!refreshed.error && refreshedSession?.access_token && isSupabaseAccessTokenCompatible(refreshedSession.access_token)) {
    lastAdminSessionRefreshAt = Date.now();
    return refreshedSession;
  }

  if (!shouldForceRefresh) {
    return session;
  }

  throw new AdminFunctionError(
    "Sua sessão expirou. Entre novamente no painel para continuar.",
    "INVALID_SESSION",
    401,
  );
}

export async function invokeAdminFunction<T>(
  functionName: string,
  options: InvokeAdminFunctionOptions = {},
): Promise<T> {
  const fallbackMessage = options.fallbackMessage || "Falha ao comunicar com o backend administrativo.";
  const returnTo = options.returnTo || getWindowPath();

  const run = async (forceRefresh = false) => {
    const session = await ensureSessionForAdminCall(forceRefresh);

    const { data, error } = await supabase.functions.invoke(functionName, {
      body: options.body,
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) {
      const parsed = await readFunctionErrorPayload(error, fallbackMessage);
      throw new AdminFunctionError(parsed.message, parsed.code, parsed.status);
    }

    return data as T;
  };

  try {
    return await run(false);
  } catch (error) {
    const parsed = await readFunctionErrorPayload(error, fallbackMessage);
    const needsRecovery = isSessionErrorPayload(parsed);

    if (!needsRecovery) {
      throw new AdminFunctionError(
        normalizeAdminErrorMessage(parsed, fallbackMessage),
        parsed.code,
        parsed.status,
      );
    }

    try {
      return await run(true);
    } catch (retryError) {
      const retryParsed = await readFunctionErrorPayload(retryError, fallbackMessage);
      const retryNeedsRecovery = isSessionErrorPayload(retryParsed);

      if (!retryNeedsRecovery) {
        throw new AdminFunctionError(
          normalizeAdminErrorMessage(retryParsed, fallbackMessage),
          retryParsed.code,
          retryParsed.status,
        );
      }

      if (options.onInvalidSession) {
        await options.onInvalidSession();
      }
      requestAdminSessionRecovery({
        code: retryParsed.code || parsed.code || "INVALID_SESSION",
        message: "Sua sessão expirou. Entre novamente no painel para continuar.",
        returnTo,
        source: options.source || functionName,
      });
      throw new AdminFunctionError(
        "Sua sessão expirou. Entre novamente no painel para continuar.",
        retryParsed.code || parsed.code || "INVALID_SESSION",
        401,
      );
    }
  }
}
