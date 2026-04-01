import { supabase } from "@/integrations/supabase/client";

export const ADMIN_USER_METADATA_KEY = "admin_user_metadata";

export interface AdminUserMetadataEntry {
  createdAt?: string;
  createdBy?: string;
  lastLoginAt?: string;
  lastLoginBy?: string;
  lastUpdatedAt?: string;
  lastUpdatedBy?: string;
  blockedAt?: string;
  blockedBy?: string;
  reactivatedAt?: string;
  reactivatedBy?: string;
  passwordResetAt?: string;
  passwordResetBy?: string;
}

export type AdminUserMetadataMap = Record<string, AdminUserMetadataEntry>;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function parseAdminUserMetadata(value?: string | null): AdminUserMetadataMap {
  if (!value) return {};

  try {
    const parsed = JSON.parse(value) as Record<string, AdminUserMetadataEntry>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export async function loadAdminUserMetadata() {
  const { data, error } = await supabase
    .from("app_config")
    .select("value")
    .eq("key", ADMIN_USER_METADATA_KEY)
    .maybeSingle();

  if (error) throw error;

  return parseAdminUserMetadata(data?.value);
}

export async function saveAdminUserMetadata(metadata: AdminUserMetadataMap) {
  const { error } = await supabase.from("app_config").upsert(
    { key: ADMIN_USER_METADATA_KEY, value: JSON.stringify(metadata) },
    { onConflict: "key" }
  );

  if (error) throw error;
}

export async function updateAdminUserMetadata(email: string, patch: AdminUserMetadataEntry) {
  const metadata = await loadAdminUserMetadata();
  const key = normalizeEmail(email);

  metadata[key] = {
    ...(metadata[key] || {}),
    ...patch,
  };

  await saveAdminUserMetadata(metadata);
  return metadata;
}

export async function moveAdminUserMetadata(previousEmail: string, nextEmail: string, patch?: AdminUserMetadataEntry) {
  const metadata = await loadAdminUserMetadata();
  const oldKey = normalizeEmail(previousEmail);
  const newKey = normalizeEmail(nextEmail);

  const current = {
    ...(metadata[oldKey] || {}),
    ...(metadata[newKey] || {}),
    ...(patch || {}),
  };

  if (oldKey !== newKey) {
    delete metadata[oldKey];
  }

  metadata[newKey] = current;
  await saveAdminUserMetadata(metadata);

  return metadata;
}

export async function logAdminAudit(title: string, body: string, url = "/admin/configuracoes?tab=auditoria") {
  const { error } = await supabase.from("notifications").insert({
    title,
    body,
    url,
    read: false,
    user_id: "admin",
    user_type: "admin_audit",
  } as never);

  if (error) throw error;
}
