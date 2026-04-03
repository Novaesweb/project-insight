import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export interface ClientPortalProfile {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  site_url: string | null;
  trial_ends_at: string | null;
  avatar: string | null;
  referral_code: string | null;
  status: string;
  documento: string | null;
  bloqueado: boolean | null;
}

type StoredClientPortalProfile = Pick<
  ClientPortalProfile,
  "id" | "nome" | "email" | "trial_ends_at" | "status" | "bloqueado"
>;

const CLIENT_PORTAL_SELECT = [
  "id",
  "nome",
  "email",
  "telefone",
  "endereco",
  "cidade",
  "estado",
  "site_url",
  "trial_ends_at",
  "avatar",
  "referral_code",
  "status",
  "documento",
  "bloqueado",
].join(",");

export function sanitizeClientProfile(profile: Partial<ClientPortalProfile> | null | undefined): ClientPortalProfile | null {
  if (!profile?.id || !profile?.email || !profile?.nome) return null;

  return {
    id: profile.id,
    nome: profile.nome,
    email: profile.email.trim().toLowerCase(),
    telefone: profile.telefone ?? null,
    endereco: profile.endereco ?? null,
    cidade: profile.cidade ?? null,
    estado: profile.estado ?? null,
    site_url: profile.site_url ?? null,
    trial_ends_at: profile.trial_ends_at ?? null,
    avatar: profile.avatar ?? null,
    referral_code: profile.referral_code ?? null,
    status: profile.status ?? "ativo",
    documento: profile.documento ?? null,
    bloqueado: profile.bloqueado ?? null,
  };
}

export function getStoredClientProfile() {
  if (typeof window === "undefined") return null;

  try {
    return sanitizeClientProfile(JSON.parse(localStorage.getItem("clienteLogado") || "null"));
  } catch {
    return null;
  }
}

export function persistClientProfile(profile: ClientPortalProfile | null) {
  if (typeof window === "undefined") return;

  if (!profile) {
    localStorage.removeItem("clienteLogado");
    return;
  }

  const storedProfile: StoredClientPortalProfile = {
    id: profile.id,
    nome: profile.nome,
    email: profile.email.trim().toLowerCase(),
    trial_ends_at: profile.trial_ends_at ?? null,
    status: profile.status ?? "ativo",
    bloqueado: profile.bloqueado ?? null,
  };

  localStorage.setItem("clienteLogado", JSON.stringify(storedProfile));
}

export function clearClientProfile() {
  if (typeof window === "undefined") return;

  localStorage.removeItem("clienteLogado");
  localStorage.removeItem("onboarding_done");
}

export async function loadClientProfileFromSession(session: Session | null) {
  if (!session?.user?.id || !session.user.email) return null;

  const normalizedEmail = session.user.email.trim().toLowerCase();

  const { data: byAuthId, error: authIdError } = await supabase
    .from("clientes")
    .select(CLIENT_PORTAL_SELECT)
    .eq("auth_user_id", session.user.id)
    .eq("status", "ativo")
    .maybeSingle();

  if (authIdError) throw authIdError;
  if (byAuthId) return sanitizeClientProfile(byAuthId as Partial<ClientPortalProfile>);

  const { data: byEmail, error: emailError } = await supabase
    .from("clientes")
    .select(CLIENT_PORTAL_SELECT)
    .ilike("email", normalizedEmail)
    .eq("status", "ativo")
    .maybeSingle();

  if (emailError) throw emailError;
  return sanitizeClientProfile(byEmail as Partial<ClientPortalProfile> | null);
}
