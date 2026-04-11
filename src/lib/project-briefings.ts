import type { Json } from "@/integrations/supabase/types";

export const PROJECT_BRIEFING_STATUSES = [
  "rascunho",
  "enviado",
  "em_preenchimento",
  "respondido",
  "concluido",
] as const;

export type ProjectBriefingStatus = (typeof PROJECT_BRIEFING_STATUSES)[number];

export const PROJECT_BRIEFING_FIELD_TYPES = [
  "short_text",
  "long_text",
  "single_choice",
  "multi_choice",
  "url",
  "file_upload",
] as const;

export type ProjectBriefingFieldType = (typeof PROJECT_BRIEFING_FIELD_TYPES)[number];

export type ProjectBriefingOption = {
  label: string;
  value: string;
};

export type BriefingFieldDraft = {
  id: string;
  section_name: string;
  label: string;
  help_text: string;
  field_type: ProjectBriefingFieldType;
  required: boolean;
  placeholder: string;
  options: ProjectBriefingOption[];
  sort_order: number;
};

export type BriefingAnswerMap = Record<string, string | string[]>;

export type BriefingAttachmentLike = {
  briefing_field_id?: string | null;
  nome: string;
  url: string;
};

const SENSITIVE_KEYWORDS = /(senha|password|secret|segredo|token|api key|chave privada|private key)/i;

export const briefingStatusMeta: Record<
  ProjectBriefingStatus,
  { label: string; tone: string; helper: string }
> = {
  rascunho: {
    label: "Rascunho",
    tone: "border-white/10 bg-white/5 text-white/70",
    helper: "Ainda não foi enviado ao cliente.",
  },
  enviado: {
    label: "Enviado",
    tone: "border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-200",
    helper: "Aguardando o cliente iniciar o preenchimento.",
  },
  em_preenchimento: {
    label: "Em preenchimento",
    tone: "border-amber-500/30 bg-amber-500/10 text-amber-200",
    helper: "O cliente já começou a responder.",
  },
  respondido: {
    label: "Respondido",
    tone: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
    helper: "Tudo foi enviado pelo cliente e aguarda revisão interna.",
  },
  concluido: {
    label: "Concluído",
    tone: "border-cyan-500/30 bg-cyan-500/10 text-cyan-200",
    helper: "Briefing finalizado e consolidado no projeto.",
  },
};

export const briefingFieldTypeMeta: Array<{
  value: ProjectBriefingFieldType;
  label: string;
  helper: string;
}> = [
  { value: "short_text", label: "Texto curto", helper: "Resposta curta, como nome ou slogan." },
  { value: "long_text", label: "Texto longo", helper: "Blocos maiores, como descrição da empresa." },
  { value: "single_choice", label: "Escolha única", helper: "Cliente escolhe uma opção." },
  { value: "multi_choice", label: "Múltipla escolha", helper: "Cliente pode marcar várias opções." },
  { value: "url", label: "Link / URL", helper: "Para sites, referências ou perfis públicos." },
  { value: "file_upload", label: "Upload de arquivo", helper: "Para logo, fotos, PDFs e materiais." },
];

export function createEmptyBriefingField(sortOrder = 0): BriefingFieldDraft {
  return {
    id: crypto.randomUUID(),
    section_name: "Geral",
    label: "",
    help_text: "",
    field_type: "short_text",
    required: false,
    placeholder: "",
    options: [],
    sort_order: sortOrder,
  };
}

export function parseBriefingOptions(raw: Json | null | undefined): ProjectBriefingOption[] {
  if (!raw) return [];
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item) => {
      if (typeof item === "string") {
        const normalized = item.trim();
        return normalized ? { label: normalized, value: normalized } : null;
      }

      if (item && typeof item === "object") {
        const label = typeof item.label === "string" ? item.label.trim() : "";
        const value =
          typeof item.value === "string" ? item.value.trim() : label;

        if (!label && !value) return null;

        return {
          label: label || value,
          value: value || label,
        };
      }

      return null;
    })
    .filter((item): item is ProjectBriefingOption => Boolean(item));
}

export function serializeBriefingOptions(options: ProjectBriefingOption[]): Json {
  return options.map((option) => ({
    label: option.label,
    value: option.value,
  }));
}

export function parseOptionsInput(input: string): ProjectBriefingOption[] {
  return input
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => ({ label: item, value: item }));
}

export function stringifyOptions(options: ProjectBriefingOption[]) {
  return options.map((option) => option.label).join(", ");
}

export function sanitizeBriefingField(field: BriefingFieldDraft, sortOrder: number): BriefingFieldDraft {
  return {
    ...field,
    section_name: field.section_name.trim() || "Geral",
    label: field.label.trim(),
    help_text: field.help_text.trim(),
    placeholder: field.placeholder.trim(),
    options: field.options
      .map((option) => ({
        label: option.label.trim(),
        value: option.value.trim() || option.label.trim(),
      }))
      .filter((option) => option.label && option.value),
    sort_order: sortOrder,
  };
}

export function validateBriefingFields(fields: BriefingFieldDraft[]) {
  if (fields.length === 0) {
    throw new Error("Adicione pelo menos uma pergunta ao briefing.");
  }

  fields.forEach((field, index) => {
    const label = field.label.trim();
    if (!label) {
      throw new Error(`A pergunta ${index + 1} precisa ter um título.`);
    }

    const combinedText = [label, field.help_text, field.placeholder].join(" ");
    if (SENSITIVE_KEYWORDS.test(combinedText)) {
      throw new Error(
        `A pergunta "${label}" parece pedir senha ou segredo. Use apenas URL, login ou instruções.`,
      );
    }

    if (
      (field.field_type === "single_choice" || field.field_type === "multi_choice") &&
      field.options.length === 0
    ) {
      throw new Error(`A pergunta "${label}" precisa de opções separadas por vírgula.`);
    }
  });
}

export function canClientEditBriefing(status: string | null | undefined) {
  return status === "enviado" || status === "em_preenchimento";
}

export function getAnswerValueDisplay(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value.join(", ");
  }

  return value?.trim() || "";
}

export function buildProjectBriefingSnapshot(
  fields: BriefingFieldDraft[],
  answers: BriefingAnswerMap,
  attachments: BriefingAttachmentLike[],
) {
  const orderedFields = [...fields].sort((left, right) => left.sort_order - right.sort_order);
  const sections = new Map<string, string[]>();
  const references: string[] = [];

  orderedFields.forEach((field) => {
    const sectionName = field.section_name || "Geral";
    const answerValue = answers[field.id];
    const displayValue = getAnswerValueDisplay(answerValue);
    const sectionLines = sections.get(sectionName) || [];

    if (field.field_type === "url") {
      if (displayValue) {
        references.push(`${field.label}: ${displayValue}`);
      }
      return;
    }

    if (field.field_type === "file_upload") {
      const fieldFiles = attachments.filter(
        (attachment) => attachment.briefing_field_id === field.id,
      );
      if (fieldFiles.length > 0) {
        sectionLines.push(`${field.label}: ${fieldFiles.map((file) => file.nome).join(", ")}`);
        references.push(
          ...fieldFiles.map((file) => `${field.label}: ${file.url}`),
        );
      }
      sections.set(sectionName, sectionLines);
      return;
    }

    if (displayValue) {
      sectionLines.push(`${field.label}: ${displayValue}`);
      sections.set(sectionName, sectionLines);
    }
  });

  const briefing = Array.from(sections.entries())
    .filter(([, entries]) => entries.length > 0)
    .map(([section, entries]) => `${section}\n${entries.map((entry) => `- ${entry}`).join("\n")}`)
    .join("\n\n");

  return {
    briefing: briefing || null,
    referencias: references.join("\n") || null,
  };
}

