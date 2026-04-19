const DEFAULT_PUBLIC_SUPABASE_CONFIG = {
  projectId: "mvxlbvfryzmocrafhfjp",
  url: "https://mvxlbvfryzmocrafhfjp.supabase.co",
  publishableKey: "sb_publishable_Xw4VPjd7bgJXobOqmfL4Gw_lf4IbGC_",
} as const;

function normalizeEnvValue(value: string | undefined) {
  return String(value || "").trim().replace(/^['"]|['"]$/g, "");
}

function deriveProjectId(url: string) {
  try {
    return new URL(url).hostname.split(".")[0] || "";
  } catch {
    return "";
  }
}

const runtimeUrl =
  normalizeEnvValue(import.meta.env.VITE_SUPABASE_URL) || DEFAULT_PUBLIC_SUPABASE_CONFIG.url;
const runtimeProjectId =
  normalizeEnvValue(import.meta.env.VITE_SUPABASE_PROJECT_ID) ||
  deriveProjectId(runtimeUrl) ||
  DEFAULT_PUBLIC_SUPABASE_CONFIG.projectId;
const runtimePublishableKey =
  normalizeEnvValue(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) ||
  DEFAULT_PUBLIC_SUPABASE_CONFIG.publishableKey;

export const PUBLIC_SUPABASE_CONFIG = Object.freeze({
  projectId: runtimeProjectId,
  url: runtimeUrl,
  publishableKey: runtimePublishableKey,
});

export const IS_USING_SUPABASE_FALLBACK =
  !normalizeEnvValue(import.meta.env.VITE_SUPABASE_URL) ||
  !normalizeEnvValue(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);
