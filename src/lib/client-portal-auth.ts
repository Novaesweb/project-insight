import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export interface ClientPortalProfile {
  id: string;
  nome: string;
  nome_empresa: string | null;
  email: string;
  whatsapp: string | null;
  telefone: string | null;
  instagram: string | null;
  cep: string | null;
  bairro: string | null;
  endereco: string | null;
  numero_endereco: string | null;
  complemento: string | null;
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

const CLIENT_PORTAL_SELECT = [
  "id",
  "nome",
  "nome_empresa",
  "email",
  "whatsapp",
  "telefone",
  "instagram",
  "cep",
  "bairro",
  "endereco",
  "numero_endereco",
  "complemento",
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
    nome_empresa: profile.nome_empresa ?? null,
    email: profile.email.trim().toLowerCase(),
    whatsapp: profile.whatsapp ?? null,
    telefone: profile.telefone ?? null,
    instagram: profile.instagram ?? null,
    cep: profile.cep ?? null,
    bairro: profile.bairro ?? null,
    endereco: profile.endereco ?? null,
    numero_endereco: profile.numero_endereco ?? null,
    complemento: profile.complemento ?? null,
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

  const storedProfile = sanitizeClientProfile(profile);
  if (!storedProfile) {
    localStorage.removeItem("clienteLogado");
    return;
  }

  localStorage.setItem("clienteLogado", JSON.stringify(storedProfile));
}

export function clearClientProfile() {
  if (typeof window === "undefined") return;

  localStorage.removeItem("clienteLogado");
  localStorage.removeItem("onboarding_done");
  Object.keys(localStorage)
    .filter((key) => key.startsWith("onboarding_done:"))
    .forEach((key) => localStorage.removeItem(key));
}

export async function loadClientProfileFromSession(session: Session | null) {
  if (!session?.user?.id || !session.user.email) return null;

  const { data: byAuthId, error: authIdError } = await supabase
    .from("clientes")
    .select(CLIENT_PORTAL_SELECT)
    .eq("auth_user_id", session.user.id)
    .eq("status", "ativo")
    .maybeSingle();

  if (authIdError) throw authIdError;
  if (byAuthId) return sanitizeClientProfile(byAuthId as Partial<ClientPortalProfile>);

  const { data: bootstrappedProfile, error: bootstrapError } = await supabase.rpc(
    "bootstrap_client_portal_profile",
  );

  if (bootstrapError) throw bootstrapError;
  return sanitizeClientProfile(bootstrappedProfile as Partial<ClientPortalProfile> | null);
}

export async function loadClientProfileById(clientId: string) {
  if (!clientId) return null;

  const { data, error } = await supabase
    .from("clientes")
    .select(CLIENT_PORTAL_SELECT)
    .eq("id", clientId)
    .maybeSingle();

  if (error) throw error;
  return sanitizeClientProfile(data as Partial<ClientPortalProfile> | null);
}
