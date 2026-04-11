import type { BriefingAnswerMap, BriefingAttachmentLike, BriefingFieldDraft } from "@/lib/project-briefings";
import type { ClientBrandProfileDraft } from "@/lib/client-brand-profile";

type ValidationCategory = "contato" | "conteudo" | "visual" | "conversao";
type ValidationSeverity = "alta" | "media";

export type ValidationIssue = {
  id: string;
  label: string;
  description: string;
  category: ValidationCategory;
  severity: ValidationSeverity;
};

export type ValidationResult = {
  score: number;
  completed: number;
  total: number;
  missing: ValidationIssue[];
  grouped: Record<ValidationCategory, ValidationIssue[]>;
};

type ClientValidationInput = {
  nome_empresa?: string | null;
  telefone?: string | null;
  whatsapp?: string | null;
  endereco?: string | null;
  cidade?: string | null;
  estado?: string | null;
  instagram?: string | null;
  site_url?: string | null;
};

type ValidationContext = {
  client?: ClientValidationInput | null;
  fields?: BriefingFieldDraft[];
  answers?: BriefingAnswerMap;
  attachments?: BriefingAttachmentLike[];
  summaryText?: string | null;
  referenceText?: string | null;
  brandProfile?: Partial<ClientBrandProfileDraft> | null;
};

const CATEGORY_LABELS: ValidationCategory[] = ["contato", "conteudo", "visual", "conversao"];

function normalizeText(value?: string | null) {
  return (value || "").trim().toLowerCase();
}

function hasMeaningfulText(value?: string | null, minLength = 4) {
  return normalizeText(value).length >= minLength;
}

function findAnsweredField(
  fields: BriefingFieldDraft[],
  answers: BriefingAnswerMap,
  patterns: RegExp[],
) {
  return fields.some((field) => {
    const haystack = `${field.label} ${field.help_text}`.toLowerCase();
    if (!patterns.some((pattern) => pattern.test(haystack))) return false;

    const answer = answers[field.id];
    if (Array.isArray(answer)) return answer.length > 0;
    return hasMeaningfulText(answer);
  });
}

function summaryIncludes(text: string | null | undefined, patterns: RegExp[]) {
  const normalized = normalizeText(text);
  if (!normalized) return false;
  return patterns.some((pattern) => pattern.test(normalized));
}

export function evaluateContentReadiness({
  client,
  fields = [],
  answers = {},
  attachments = [],
  summaryText,
  referenceText,
  brandProfile,
}: ValidationContext): ValidationResult {
  const checks = [
    {
      id: "phone",
      ok: hasMeaningfulText(client?.whatsapp) || hasMeaningfulText(client?.telefone),
      issue: {
        id: "phone",
        label: "Telefone ou WhatsApp",
        description: "Informe um contato direto para conversão e retorno rápido.",
        category: "contato" as const,
        severity: "alta" as const,
      },
    },
    {
      id: "address",
      ok:
        hasMeaningfulText(client?.endereco) ||
        (hasMeaningfulText(client?.cidade) && hasMeaningfulText(client?.estado)),
      issue: {
        id: "address",
        label: "Endereço da operação",
        description: "Defina o endereço ou ao menos cidade e estado para contexto comercial e SEO local.",
        category: "contato" as const,
        severity: "media" as const,
      },
    },
    {
      id: "social",
      ok: hasMeaningfulText(client?.instagram),
      issue: {
        id: "social",
        label: "Rede principal",
        description: "Informe Instagram ou principal rede social para reforço de marca e prova social.",
        category: "contato" as const,
        severity: "media" as const,
      },
    },
    {
      id: "offer",
      ok:
        findAnsweredField(fields, answers, [/o que você vende/, /o que você oferece/, /sobre o negócio/]) ||
        summaryIncludes(summaryText, [/vende/, /oferece/, /negócio/, /serviço/, /produto/]),
      issue: {
        id: "offer",
        label: "Oferta principal",
        description: "Explique claramente o que a empresa vende ou entrega.",
        category: "conteudo" as const,
        severity: "alta" as const,
      },
    },
    {
      id: "differential",
      ok:
        findAnsweredField(fields, answers, [/diferencial/, /por que o cliente deve escolher/]) ||
        summaryIncludes(summaryText, [/diferencial/, /concorr/]),
      issue: {
        id: "differential",
        label: "Diferencial competitivo",
        description: "Mostre por que o cliente final deve escolher a marca em vez do concorrente.",
        category: "conteudo" as const,
        severity: "alta" as const,
      },
    },
    {
      id: "audience",
      ok:
        findAnsweredField(fields, answers, [/cliente ideal/, /público/, /faixa de idade/]) ||
        summaryIncludes(summaryText, [/cliente ideal/, /público/, /faixa de idade/]),
      issue: {
        id: "audience",
        label: "Público-alvo",
        description: "Defina quem é o cliente ideal para orientar copy, layout e estrutura.",
        category: "conteudo" as const,
        severity: "alta" as const,
      },
    },
    {
      id: "cta",
      ok:
        findAnsweredField(fields, answers, [/o que você mais quer alcançar/, /resultado/, /aumentar vendas/, /pedidos/, /clientes recorrentes/, /fortalecer a marca/]) ||
        summaryIncludes(summaryText, [/aumentar vendas/, /pedidos/, /clientes recorrentes/, /fortalecer a marca/]),
      issue: {
        id: "cta",
        label: "Objetivo / CTA principal",
        description: "Defina a ação principal esperada do visitante: vender, pedir orçamento, chamar no WhatsApp ou outra.",
        category: "conversao" as const,
        severity: "alta" as const,
      },
    },
    {
      id: "references",
      ok:
        hasMeaningfulText(referenceText) ||
        hasMeaningfulText(brandProfile?.references) ||
        hasMeaningfulText(brandProfile?.inspiration_links) ||
        hasMeaningfulText(client?.site_url),
      issue: {
        id: "references",
        label: "Referências visuais",
        description: "Envie links de referência, site atual ou inspirações de layout.",
        category: "visual" as const,
        severity: "media" as const,
      },
    },
    {
      id: "media",
      ok: attachments.length > 0,
      issue: {
        id: "media",
        label: "Arquivos e materiais",
        description: "Envie fotos, materiais, PDFs ou outros ativos úteis para produção.",
        category: "visual" as const,
        severity: "media" as const,
      },
    },
    {
      id: "logo",
      ok: hasMeaningfulText(brandProfile?.logo_url),
      issue: {
        id: "logo",
        label: "Logo principal",
        description: "Envie a logo para o time manter consistência visual no projeto.",
        category: "visual" as const,
        severity: "alta" as const,
      },
    },
    {
      id: "palette",
      ok:
        hasMeaningfulText(brandProfile?.primary_color) &&
        hasMeaningfulText(brandProfile?.secondary_color),
      issue: {
        id: "palette",
        label: "Paleta da marca",
        description: "Defina as cores principais da identidade visual.",
        category: "visual" as const,
        severity: "media" as const,
      },
    },
    {
      id: "style",
      ok:
        Array.isArray(brandProfile?.style_tags) && brandProfile.style_tags.length > 0 &&
        hasMeaningfulText(brandProfile?.font_heading) &&
        hasMeaningfulText(brandProfile?.font_body),
      issue: {
        id: "style",
        label: "Direção visual",
        description: "Escolha estilo e tipografia para acelerar a fase de design.",
        category: "visual" as const,
        severity: "media" as const,
      },
    },
  ];

  const completed = checks.filter((item) => item.ok).length;
  const total = checks.length;
  const missing = checks.filter((item) => !item.ok).map((item) => item.issue);
  const grouped = CATEGORY_LABELS.reduce<Record<ValidationCategory, ValidationIssue[]>>(
    (accumulator, category) => {
      accumulator[category] = missing.filter((issue) => issue.category === category);
      return accumulator;
    },
    {} as Record<ValidationCategory, ValidationIssue[]>,
  );

  return {
    score: Math.round((completed / total) * 100),
    completed,
    total,
    missing,
    grouped,
  };
}

