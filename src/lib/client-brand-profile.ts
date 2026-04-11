export type BrandStyleOption =
  | "premium"
  | "moderno"
  | "minimalista"
  | "vibrante"
  | "sofisticado"
  | "tecnologico"
  | "editorial";

export type ClientBrandProfileDraft = {
  id?: string;
  cliente_id: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  font_heading: string;
  font_body: string;
  style_tags: BrandStyleOption[];
  references: string;
  inspiration_links: string;
  notes: string;
  logo_url: string;
  logo_storage_bucket: string;
  logo_storage_path: string;
};

export const BRAND_STYLE_OPTIONS: { value: BrandStyleOption; label: string }[] = [
  { value: "premium", label: "Premium" },
  { value: "moderno", label: "Moderno" },
  { value: "minimalista", label: "Minimalista" },
  { value: "vibrante", label: "Vibrante" },
  { value: "sofisticado", label: "Sofisticado" },
  { value: "tecnologico", label: "Tecnológico" },
  { value: "editorial", label: "Editorial" },
];

export const BRAND_FONT_OPTIONS = [
  "Poppins",
  "Inter",
  "Manrope",
  "Space Grotesk",
  "Montserrat",
  "DM Sans",
  "Urbanist",
  "Sora",
] as const;

export function createEmptyBrandProfile(clienteId = ""): ClientBrandProfileDraft {
  return {
    cliente_id: clienteId,
    primary_color: "#8A2BE2",
    secondary_color: "#FF0000",
    accent_color: "#FF007F",
    font_heading: "Poppins",
    font_body: "Inter",
    style_tags: [],
    references: "",
    inspiration_links: "",
    notes: "",
    logo_url: "",
    logo_storage_bucket: "projeto-arquivos",
    logo_storage_path: "",
  };
}

export function sanitizeBrandProfile(
  profile: ClientBrandProfileDraft,
  clienteId = profile.cliente_id,
): ClientBrandProfileDraft {
  return {
    ...profile,
    cliente_id: clienteId,
    primary_color: profile.primary_color.trim() || "#8A2BE2",
    secondary_color: profile.secondary_color.trim() || "#FF0000",
    accent_color: profile.accent_color.trim() || "#FF007F",
    font_heading: profile.font_heading.trim() || "Poppins",
    font_body: profile.font_body.trim() || "Inter",
    style_tags: [...new Set(profile.style_tags)].filter(Boolean),
    references: profile.references.trim(),
    inspiration_links: profile.inspiration_links.trim(),
    notes: profile.notes.trim(),
    logo_url: profile.logo_url.trim(),
    logo_storage_bucket: profile.logo_storage_bucket.trim() || "projeto-arquivos",
    logo_storage_path: profile.logo_storage_path.trim(),
  };
}

export function parseBrandStyleTags(value: unknown): BrandStyleOption[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is BrandStyleOption => typeof item === "string") as BrandStyleOption[];
}

