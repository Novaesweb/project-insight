import type { Json } from "@/integrations/supabase/types";

export const CLIENT_BRIEFING_STATUSES = [
  "em_construcao",
  "enviado",
  "em_preenchimento",
  "respondido",
  "concluido",
] as const;

export type ClientBriefingStatus = (typeof CLIENT_BRIEFING_STATUSES)[number];

export const BRIEFING_FIELD_TYPES = [
  "short_text",
  "long_text",
  "single_choice",
  "multi_choice",
  "url",
  "file_upload",
] as const;

export type BriefingFieldType = (typeof BRIEFING_FIELD_TYPES)[number];

export type BriefingOption = {
  label: string;
  value: string;
};

export type BriefingTemplate = {
  slug: string;
  section_name: string;
  label: string;
  help_text: string;
  field_type: BriefingFieldType;
  required_default: boolean;
  placeholder: string;
  options: BriefingOption[];
  sort_order: number;
};

export type BriefingFieldDraft = {
  id: string;
  template_id: string | null;
  section_name: string;
  label: string;
  help_text: string;
  field_type: BriefingFieldType;
  required: boolean;
  placeholder: string;
  options: BriefingOption[];
  sort_order: number;
  is_custom: boolean;
};

export type BriefingAnswerMap = Record<string, string | string[]>;

export type BriefingAttachmentLike = {
  field_id?: string | null;
  nome: string;
  url: string;
};

const SENSITIVE_KEYWORDS = /(senha|password|secret|segredo|token|api key|chave privada|private key|access key|credencial)/i;

export const activeClientBriefingStatuses: ClientBriefingStatus[] = [
  "em_construcao",
  "enviado",
  "em_preenchimento",
  "respondido",
];

export const briefingStatusMeta: Record<
  ClientBriefingStatus,
  { label: string; tone: string; helper: string }
> = {
  em_construcao: {
    label: "Em construção",
    tone: "border-white/10 bg-white/5 text-white/70",
    helper: "Você ainda está montando o briefing antes do envio.",
  },
  enviado: {
    label: "Enviado",
    tone: "border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-200",
    helper: "O cliente recebeu o briefing completo no portal.",
  },
  em_preenchimento: {
    label: "Em preenchimento",
    tone: "border-amber-500/30 bg-amber-500/10 text-amber-200",
    helper: "O cliente já começou a responder o briefing.",
  },
  respondido: {
    label: "Respondido",
    tone: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
    helper: "O cliente finalizou o briefing e aguarda análise interna.",
  },
  concluido: {
    label: "Concluído",
    tone: "border-cyan-500/30 bg-cyan-500/10 text-cyan-200",
    helper: "O briefing foi encerrado e pode originar um projeto.",
  },
};

export const briefingFieldTypeMeta: Array<{
  value: BriefingFieldType;
  label: string;
  helper: string;
}> = [
  { value: "short_text", label: "Texto curto", helper: "Campos curtos, como nome, telefone ou slogan." },
  { value: "long_text", label: "Texto longo", helper: "Blocos maiores, como descrição do negócio." },
  { value: "single_choice", label: "Escolha única", helper: "O cliente escolhe apenas uma opção." },
  { value: "multi_choice", label: "Múltipla escolha", helper: "O cliente pode marcar várias opções." },
  { value: "url", label: "Link / URL", helper: "Links públicos, referências ou perfis sociais." },
  { value: "file_upload", label: "Upload de arquivo", helper: "Logo, fotos, PDFs e materiais visuais." },
];

export const defaultBriefingTemplates: BriefingTemplate[] = [
  { slug: "empresa-nome", section_name: "Informações Básicas", label: "Nome da empresa", help_text: "", field_type: "short_text", required_default: true, placeholder: "Ex: Pizzaria Imperial", options: [], sort_order: 0 },
  { slug: "responsavel-nome", section_name: "Informações Básicas", label: "Nome do responsável", help_text: "", field_type: "short_text", required_default: true, placeholder: "Ex: Lucas Novaes", options: [], sort_order: 1 },
  { slug: "whatsapp", section_name: "Informações Básicas", label: "WhatsApp", help_text: "", field_type: "short_text", required_default: true, placeholder: "(11) 99999-9999", options: [], sort_order: 2 },
  { slug: "instagram", section_name: "Informações Básicas", label: "Instagram", help_text: "Pode ser o @ ou o link completo do perfil.", field_type: "url", required_default: false, placeholder: "https://instagram.com/suaempresa", options: [], sort_order: 3 },
  { slug: "site-atual", section_name: "Informações Básicas", label: "Já possui site? Se sim, qual?", help_text: "", field_type: "url", required_default: false, placeholder: "https://seusite.com.br", options: [], sort_order: 4 },

  { slug: "oferta-principal", section_name: "Sobre o Negócio", label: "O que você vende ou oferece?", help_text: "", field_type: "long_text", required_default: true, placeholder: "Descreva os produtos ou serviços principais.", options: [], sort_order: 10 },
  { slug: "diferencial", section_name: "Sobre o Negócio", label: "Qual seu principal diferencial hoje?", help_text: "", field_type: "long_text", required_default: false, placeholder: "O que faz seu negócio se destacar?", options: [], sort_order: 11 },
  { slug: "motivo-escolha", section_name: "Sobre o Negócio", label: "Por que o cliente deve escolher você e não o concorrente?", help_text: "", field_type: "long_text", required_default: false, placeholder: "Explique o valor percebido do seu negócio.", options: [], sort_order: 12 },
  { slug: "concorrentes", section_name: "Sobre o Negócio", label: "Quais são seus principais concorrentes?", help_text: "Se não souber todos, cite os mais fortes.", field_type: "long_text", required_default: false, placeholder: "Liste nomes, perfis ou links.", options: [], sort_order: 13 },

  { slug: "cliente-ideal", section_name: "Público-Alvo", label: "Quem é seu cliente ideal?", help_text: "", field_type: "long_text", required_default: true, placeholder: "Descreva perfil, comportamento e necessidades.", options: [], sort_order: 20 },
  { slug: "faixa-etaria", section_name: "Público-Alvo", label: "Faixa de idade do seu público", help_text: "", field_type: "short_text", required_default: false, placeholder: "Ex: 25 a 45 anos", options: [], sort_order: 21 },
  { slug: "compra-impulso-ou-necessidade", section_name: "Público-Alvo", label: "Seu público compra mais por impulso ou necessidade?", help_text: "", field_type: "single_choice", required_default: false, placeholder: "", options: [{ label: "Impulso", value: "impulso" }, { label: "Necessidade", value: "necessidade" }, { label: "Misto", value: "misto" }], sort_order: 22 },
  { slug: "origem-clientes", section_name: "Público-Alvo", label: "Seu cliente costuma vir por", help_text: "Marque os canais mais comuns hoje.", field_type: "multi_choice", required_default: false, placeholder: "", options: [{ label: "Instagram", value: "instagram" }, { label: "Indicação", value: "indicacao" }, { label: "Rua / local", value: "rua_local" }, { label: "iFood / apps", value: "ifood_apps" }, { label: "Outro", value: "outro" }], sort_order: 23 },

  { slug: "divulgacao-atual", section_name: "Situação Atual", label: "Hoje você faz divulgação? Como?", help_text: "", field_type: "long_text", required_default: false, placeholder: "Explique os canais e a frequência.", options: [], sort_order: 30 },
  { slug: "anuncios-pagos", section_name: "Situação Atual", label: "Você já investe em anúncios pagos?", help_text: "", field_type: "single_choice", required_default: false, placeholder: "", options: [{ label: "Sim", value: "sim" }, { label: "Não", value: "nao" }, { label: "Às vezes", value: "as_vezes" }], sort_order: 31 },
  { slug: "dificuldade-vender-mais", section_name: "Situação Atual", label: "Qual sua maior dificuldade hoje para vender mais?", help_text: "", field_type: "long_text", required_default: false, placeholder: "Ex: tráfego, atendimento, apresentação, processo comercial.", options: [], sort_order: 32 },
  { slug: "perde-clientes-concorrencia", section_name: "Situação Atual", label: "Você sente que está perdendo clientes para concorrentes?", help_text: "", field_type: "long_text", required_default: false, placeholder: "Conte o que você percebe no dia a dia.", options: [], sort_order: 33 },

  { slug: "objetivo-site", section_name: "Objetivo com o Projeto", label: "O que você mais quer alcançar com o site?", help_text: "Pode marcar mais de uma meta.", field_type: "multi_choice", required_default: true, placeholder: "", options: [{ label: "Aumentar vendas", value: "aumentar_vendas" }, { label: "Ter mais pedidos", value: "mais_pedidos" }, { label: "Ter mais clientes recorrentes", value: "clientes_recorrentes" }, { label: "Fortalecer a marca", value: "fortalecer_marca" }], sort_order: 40 },
  { slug: "resultado-proximos-meses", section_name: "Objetivo com o Projeto", label: "Qual resultado você espera nos próximos meses?", help_text: "", field_type: "long_text", required_default: false, placeholder: "Ex: aumentar pedidos, ganhar autoridade, captar contatos.", options: [], sort_order: 41 },

  { slug: "como-faz-pedido-hoje", section_name: "Vendas e Conversão", label: "Como o cliente faz pedido hoje?", help_text: "", field_type: "long_text", required_default: false, placeholder: "WhatsApp, app, Instagram, balcão, ligação...", options: [], sort_order: 50 },
  { slug: "facilidade-para-comprar", section_name: "Vendas e Conversão", label: "Você acha fácil ou complicado para o cliente comprar de você?", help_text: "", field_type: "single_choice", required_default: false, placeholder: "", options: [{ label: "Fácil", value: "facil" }, { label: "Complicado", value: "complicado" }, { label: "Mais ou menos", value: "mais_ou_menos" }], sort_order: 51 },
  { slug: "perde-vendas-por-demora", section_name: "Vendas e Conversão", label: "Já perdeu vendas por demora ou dificuldade no atendimento?", help_text: "", field_type: "single_choice", required_default: false, placeholder: "", options: [{ label: "Sim", value: "sim" }, { label: "Não", value: "nao" }, { label: "Às vezes", value: "as_vezes" }], sort_order: 52 },
  { slug: "automatizar-pedidos-atendimento", section_name: "Vendas e Conversão", label: "Você gostaria de automatizar pedidos ou atendimento?", help_text: "", field_type: "single_choice", required_default: false, placeholder: "", options: [{ label: "Sim", value: "sim" }, { label: "Não", value: "nao" }, { label: "Talvez", value: "talvez" }], sort_order: 53 },

  { slug: "depender-menos-apps", section_name: "Estratégia de Crescimento", label: "Você quer depender menos de aplicativos como iFood?", help_text: "", field_type: "single_choice", required_default: false, placeholder: "", options: [{ label: "Sim", value: "sim" }, { label: "Não", value: "nao" }, { label: "Ainda não sei", value: "ainda_nao_sei" }], sort_order: 60 },
  { slug: "controle-dos-clientes", section_name: "Estratégia de Crescimento", label: "Quer ter mais controle dos seus próprios clientes?", help_text: "", field_type: "single_choice", required_default: false, placeholder: "", options: [{ label: "Sim", value: "sim" }, { label: "Não", value: "nao" }], sort_order: 61 },
  { slug: "lista-de-clientes", section_name: "Estratégia de Crescimento", label: "Gostaria de ter lista de clientes para divulgar promoções?", help_text: "", field_type: "single_choice", required_default: false, placeholder: "", options: [{ label: "Sim", value: "sim" }, { label: "Não", value: "nao" }, { label: "Talvez", value: "talvez" }], sort_order: 62 },

  { slug: "faz-promocoes", section_name: "Promoções e Ofertas", label: "Você costuma fazer promoções?", help_text: "", field_type: "single_choice", required_default: false, placeholder: "", options: [{ label: "Sim", value: "sim" }, { label: "Não", value: "nao" }, { label: "Só em datas específicas", value: "datas_especificas" }], sort_order: 70 },
  { slug: "promocao-mais-funciona", section_name: "Promoções e Ofertas", label: "Qual tipo de promoção funciona mais para você?", help_text: "", field_type: "long_text", required_default: false, placeholder: "Ex: combo, desconto, frete, brinde.", options: [], sort_order: 71 },
  { slug: "destacar-promocoes-no-site", section_name: "Promoções e Ofertas", label: "Quer destacar promoções no site?", help_text: "", field_type: "single_choice", required_default: false, placeholder: "", options: [{ label: "Sim", value: "sim" }, { label: "Não", value: "nao" }], sort_order: 72 },
  { slug: "combos-ofertas", section_name: "Promoções e Ofertas", label: "Quer criar combos ou ofertas especiais?", help_text: "", field_type: "single_choice", required_default: false, placeholder: "", options: [{ label: "Sim", value: "sim" }, { label: "Não", value: "nao" }, { label: "Talvez", value: "talvez" }], sort_order: 73 },

  { slug: "fotos-produtos", section_name: "Conteúdo e Imagem", label: "Você tem fotos boas dos produtos?", help_text: "", field_type: "single_choice", required_default: false, placeholder: "", options: [{ label: "Sim", value: "sim" }, { label: "Não", value: "nao" }, { label: "Parcialmente", value: "parcialmente" }], sort_order: 80 },
  { slug: "apresentacao-atrai-clientes", section_name: "Conteúdo e Imagem", label: "Você acredita que sua apresentação hoje atrai clientes?", help_text: "", field_type: "single_choice", required_default: false, placeholder: "", options: [{ label: "Sim", value: "sim" }, { label: "Não", value: "nao" }, { label: "Poderia melhorar", value: "poderia_melhorar" }], sort_order: 81 },
  { slug: "melhorar-aparencia-online", section_name: "Conteúdo e Imagem", label: "Quer melhorar a aparência do seu negócio online?", help_text: "", field_type: "single_choice", required_default: false, placeholder: "", options: [{ label: "Sim", value: "sim" }, { label: "Não", value: "nao" }], sort_order: 82 },
  { slug: "enviar-fotos-materiais", section_name: "Conteúdo e Imagem", label: "Envie fotos, logos ou materiais que ajudam na apresentação", help_text: "Use este campo para anexar arquivos visuais do negócio.", field_type: "file_upload", required_default: false, placeholder: "", options: [], sort_order: 83 },

  { slug: "posicionamento-marca", section_name: "Posicionamento", label: "Você quer que sua marca seja vista como", help_text: "", field_type: "single_choice", required_default: false, placeholder: "", options: [{ label: "Barata", value: "barata" }, { label: "Premium", value: "premium" }, { label: "Equilibrada", value: "equilibrada" }], sort_order: 90 },
  { slug: "quantidade-ou-valor", section_name: "Posicionamento", label: "Você prefere vender mais quantidade ou mais valor?", help_text: "", field_type: "single_choice", required_default: false, placeholder: "", options: [{ label: "Mais quantidade", value: "mais_quantidade" }, { label: "Mais valor", value: "mais_valor" }, { label: "Equilíbrio entre os dois", value: "equilibrio" }], sort_order: 91 },

  { slug: "irrita-clientes", section_name: "Experiência do Cliente", label: "O que mais irrita seus clientes hoje?", help_text: "", field_type: "long_text", required_default: false, placeholder: "Liste as principais fricções.", options: [], sort_order: 100 },
  { slug: "melhorar-atendimento", section_name: "Experiência do Cliente", label: "O que você acha que poderia melhorar no atendimento?", help_text: "", field_type: "long_text", required_default: false, placeholder: "Descreva o que mais pesa no dia a dia.", options: [], sort_order: 101 },
  { slug: "reclamacoes-frequentes", section_name: "Experiência do Cliente", label: "Já recebeu reclamações frequentes? Quais?", help_text: "", field_type: "long_text", required_default: false, placeholder: "Se houver padrões, descreva.", options: [], sort_order: 102 },

  { slug: "botao-whatsapp", section_name: "Funcionalidades", label: "Quer botão direto para WhatsApp?", help_text: "", field_type: "single_choice", required_default: false, placeholder: "", options: [{ label: "Sim", value: "sim" }, { label: "Não", value: "nao" }], sort_order: 110 },
  { slug: "sistema-pedidos", section_name: "Funcionalidades", label: "Quer sistema de pedidos automático?", help_text: "", field_type: "single_choice", required_default: false, placeholder: "", options: [{ label: "Sim", value: "sim" }, { label: "Não", value: "nao" }, { label: "Talvez", value: "talvez" }], sort_order: 111 },
  { slug: "pagamento-online", section_name: "Funcionalidades", label: "Quer pagamento online?", help_text: "", field_type: "single_choice", required_default: false, placeholder: "", options: [{ label: "Sim", value: "sim" }, { label: "Não", value: "nao" }, { label: "Talvez", value: "talvez" }], sort_order: 112 },
  { slug: "painel-gerenciar-pedidos", section_name: "Funcionalidades", label: "Quer painel para gerenciar pedidos?", help_text: "", field_type: "single_choice", required_default: false, placeholder: "", options: [{ label: "Sim", value: "sim" }, { label: "Não", value: "nao" }], sort_order: 113 },

  { slug: "site-referencia", section_name: "Design", label: "Tem algum site que você goste?", help_text: "Pode enviar links de referência visual.", field_type: "url", required_default: false, placeholder: "https://site-de-referencia.com", options: [], sort_order: 120 },
  { slug: "estilo-site", section_name: "Design", label: "Como quer o estilo do seu site?", help_text: "", field_type: "long_text", required_default: true, placeholder: "Ex: moderno, premium, minimalista, agressivo em vendas.", options: [], sort_order: 121 },
  { slug: "cores-desejadas", section_name: "Design", label: "Cores que deseja usar", help_text: "", field_type: "short_text", required_default: false, placeholder: "Ex: preto, dourado e vermelho", options: [], sort_order: 122 },
  { slug: "logo-principal", section_name: "Design", label: "Envie sua logo principal", help_text: "Anexe a logo atual da marca em boa qualidade.", field_type: "file_upload", required_default: false, placeholder: "", options: [], sort_order: 123 },
  { slug: "fontes-preferidas", section_name: "Design", label: "Tem alguma fonte ou estilo tipográfico preferido?", help_text: "", field_type: "short_text", required_default: false, placeholder: "Ex: serifada elegante, sem serifa moderna, parecida com Poppins", options: [], sort_order: 124 },
  { slug: "links-inspiracao-design", section_name: "Design", label: "Quais links ou referências visuais você quer que a equipe use como inspiração?", help_text: "Cole links de sites, perfis, Behance, Dribbble ou concorrentes.", field_type: "long_text", required_default: false, placeholder: "Cole aqui seus links e descreva o que gostou em cada referência.", options: [], sort_order: 125 },

  { slug: "dobrar-clientes", section_name: "Perguntas Estratégicas", label: "Se seu negócio dobrasse de clientes hoje, você daria conta?", help_text: "", field_type: "single_choice", required_default: false, placeholder: "", options: [{ label: "Sim", value: "sim" }, { label: "Não", value: "nao" }, { label: "Parcialmente", value: "parcialmente" }], sort_order: 130 },
  { slug: "maior-trava-crescimento", section_name: "Perguntas Estratégicas", label: "Qual é o maior problema que te impede de crescer hoje?", help_text: "", field_type: "long_text", required_default: false, placeholder: "Ex: equipe, processo, tráfego, posicionamento.", options: [], sort_order: 131 },
  { slug: "site-ou-estrutura-vendas", section_name: "Perguntas Estratégicas", label: "Você quer apenas um site ou uma estrutura para vender todos os dias?", help_text: "", field_type: "single_choice", required_default: true, placeholder: "", options: [{ label: "Apenas um site", value: "apenas_site" }, { label: "Estrutura para vender todos os dias", value: "estrutura_vendas" }, { label: "Ainda estou entendendo", value: "ainda_entendendo" }], sort_order: 132 },

  { slug: "diferente-de-tudo", section_name: "Final", label: "Tem algo que você gostaria que fosse diferente de tudo que já viu?", help_text: "", field_type: "long_text", required_default: false, placeholder: "Compartilhe uma visão, desejo ou referência forte.", options: [], sort_order: 140 },
  { slug: "autoriza-estrategia", section_name: "Final", label: "Autoriza a NovaesWeb a criar uma estratégia personalizada para seu negócio?", help_text: "", field_type: "single_choice", required_default: true, placeholder: "", options: [{ label: "Sim", value: "sim" }, { label: "Não", value: "nao" }], sort_order: 141 },
];

export function buildBriefingTitle(clientName?: string | null) {
  const normalized = clientName?.trim();
  return normalized ? `Briefing do site - ${normalized}` : "Briefing do site";
}

export function createEmptyBriefingField(sortOrder = 0): BriefingFieldDraft {
  return {
    id: crypto.randomUUID(),
    template_id: null,
    section_name: "Geral",
    label: "",
    help_text: "",
    field_type: "short_text",
    required: false,
    placeholder: "",
    options: [],
    sort_order: sortOrder,
    is_custom: true,
  };
}

export function toFieldDraft(field: any): BriefingFieldDraft {
  return {
    id: field.id,
    template_id: field.template_id,
    section_name: field.section_name,
    label: field.label,
    help_text: field.help_text || "",
    field_type: field.field_type,
    required: field.required,
    placeholder: field.placeholder || "",
    options: parseBriefingOptions(field.options),
    sort_order: field.sort_order,
    is_custom: field.is_custom,
  };
}

export function createFieldDraftFromTemplate(
  template: {
    id?: string | null;
    section_name: string;
    label: string;
    help_text?: string | null;
    field_type: BriefingFieldType;
    required_default?: boolean;
    placeholder?: string | null;
    options?: BriefingOption[];
  },
  sortOrder: number,
): BriefingFieldDraft {
  return {
    id: crypto.randomUUID(),
    template_id: template.id || null,
    section_name: template.section_name || "Geral",
    label: template.label,
    help_text: template.help_text?.trim() || "",
    field_type: template.field_type,
    required: Boolean(template.required_default),
    placeholder: template.placeholder?.trim() || "",
    options: (template.options || []).map((option) => ({
      label: option.label.trim(),
      value: option.value.trim() || option.label.trim(),
    })),
    sort_order: sortOrder,
    is_custom: false,
  };
}

export function parseBriefingOptions(raw: Json | null | undefined): BriefingOption[] {
  if (!raw || !Array.isArray(raw)) return [];

  return raw
    .map((item) => {
      if (typeof item === "string") {
        const normalized = item.trim();
        return normalized ? { label: normalized, value: normalized } : null;
      }

      if (item && typeof item === "object") {
        const label = typeof item.label === "string" ? item.label.trim() : "";
        const value = typeof item.value === "string" ? item.value.trim() : label;

        if (!label && !value) return null;

        return {
          label: label || value,
          value: value || label,
        };
      }

      return null;
    })
    .filter((item): item is BriefingOption => Boolean(item));
}

export function serializeBriefingOptions(options: BriefingOption[]): Json {
  return options.map((option) => ({
    label: option.label,
    value: option.value,
  }));
}

export function parseOptionsInput(input: string): BriefingOption[] {
  return input
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => ({ label: item, value: item }));
}

export function stringifyOptions(options: BriefingOption[]) {
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

export function buildBriefingSnapshot(
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
        sectionLines.push(`${field.label}: ${displayValue}`);
        sections.set(sectionName, sectionLines);
      }
      return;
    }

    if (field.field_type === "file_upload") {
      const fieldFiles = attachments.filter((attachment) => attachment.field_id === field.id);
      if (fieldFiles.length > 0) {
        sectionLines.push(`${field.label}: ${fieldFiles.map((file) => file.nome).join(", ")}`);
        references.push(...fieldFiles.map((file) => `${field.label}: ${file.url}`));
        sections.set(sectionName, sectionLines);
      }
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
    briefing: briefing.trim(),
    references: references.join("\n").trim(),
  };
}

export function getTemplateSearchText(template: Pick<BriefingTemplate, "section_name" | "label" | "help_text">) {
  return `${template.section_name} ${template.label} ${template.help_text}`.toLowerCase();
}
