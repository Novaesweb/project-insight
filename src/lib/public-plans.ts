export type PublicPlanCatalogItem = {
  id: "express" | "pro" | "sob-medida";
  tag: string;
  title: string;
  eyebrow: string;
  description: string;
  oldPrice?: number;
  setupPrice: number;
  monthlyPrice: number;
  monthlyNote?: string;
  monthlyDisplay?: string;
  pricePrefix?: string;
  priceLabel: string;
  priceSub: string;
  idealFor?: string;
  outcome?: string;
  features: string[];
  cta: string;
  whatsapp: string;
  popular?: boolean;
};

export const PUBLIC_PLAN_CATALOG: PublicPlanCatalogItem[] = [
  {
    id: "express",
    tag: "Express",
    title: "Express",
    eyebrow: "Entrada rapida e profissional",
    description:
      "Para negocios que precisam sair do improviso e colocar uma vitrine digital no ar com mais autoridade.",
    oldPrice: 597,
    setupPrice: 180,
    monthlyPrice: 0,
    monthlyDisplay: "Opcional a partir de R$ 60/mes",
    monthlyNote: "Voce pode adicionar automacao de WhatsApp e novos modulos depois.",
    priceLabel: "Setup inicial",
    priceSub: "Ideal para tirar a operacao do zero digital",
    idealFor: "Autonomos, negocios locais, prestadores de servico e marcas que precisam se apresentar melhor.",
    outcome: "Presenca mais forte, contato mais claro e mais credibilidade para vender.",
    features: [
      "Design moderno e totalmente responsivo",
      "Vitrine estrategica de servicos",
      "Pagina de captura e contato",
      "Integracao com mapas e localizacao",
      "Botao flutuante de WhatsApp",
    ],
    cta: "Quero avaliar o Express",
    whatsapp: "Ola! Quero avaliar o plano Express da NovaesWeb.",
  },
  {
    id: "pro",
    tag: "Pro",
    title: "Pro",
    eyebrow: "Estrutura para operar e escalar",
    description:
      "Para empresas que precisam vender melhor, organizar clientes e centralizar a operacao em uma base propria.",
    oldPrice: 1200,
    setupPrice: 349,
    monthlyPrice: 0,
    monthlyDisplay: "Conforme modulos e recorrencias do projeto",
    pricePrefix: "A partir de",
    priceLabel: "Setup inicial",
    priceSub: "Estrutura desenhada de acordo com os modulos contratados",
    idealFor: "Empresas em crescimento que querem unir atendimento, acompanhamento, contratos e organizacao.",
    outcome: "Mais controle comercial, atendimento mais organizado e uma operacao com cara de sistema proprio.",
    features: [
      "Tudo do plano Express +",
      "Painel administrativo exclusivo",
      "Cadastro de clientes e CRM operacional",
      "Modulo de recebimento de pedidos",
      "Notificacoes em tempo real",
    ],
    cta: "Montar minha estrutura Pro",
    whatsapp: "Ola! Quero montar minha estrutura Pro com a NovaesWeb.",
    popular: true,
  },
  {
    id: "sob-medida",
    tag: "Sob Medida",
    title: "Sob Medida",
    eyebrow: "Projetos com operacao personalizada",
    description:
      "Para operacoes que precisam de sistema interno, dashboard, automacao, area do cliente e processos proprios.",
    setupPrice: 0,
    monthlyPrice: 0,
    monthlyDisplay: "Definida apos analise tecnica",
    priceLabel: "Orcamento tecnico",
    priceSub: "Escopo e investimento definidos apos diagnostico",
    idealFor: "Projetos com mais integracoes, etapas, equipe ou necessidade de software realmente sob medida.",
    outcome: "Uma estrutura desenhada para o seu processo, nao um pacote generico.",
    features: [
      "Sistemas de gestao internos",
      "Dashboards analiticos",
      "Marketing e captacao alinhados ao projeto",
      "Design de alta fidelidade",
      "Consultoria tecnica para expansao",
    ],
    cta: "Quero um diagnostico sob medida",
    whatsapp: "Ola! Quero um diagnostico para um projeto sob medida com a NovaesWeb.",
  },
];
