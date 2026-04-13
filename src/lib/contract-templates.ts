export interface ContractVariable {
  key: string;
  label: string;
  type: "text" | "number" | "date" | "textarea";
  defaultValue?: string;
  autoFill?:
    | "nome_cliente"
    | "cpf_cnpj"
    | "endereco"
    | "data"
    | "nome_empresa"
    | "documento_empresa"
    | "endereco_empresa"
    | "cidade_foro"
    | "estado_foro";
}

export interface ContractTemplate {
  id: string;
  nome: string;
  tipo: "contrato_mestre";
  variaveis: ContractVariable[];
  corpo: string;
}

const CONTROL_CHARS_REGEX = new RegExp(
  `[${[
    [0x00, 0x08],
    [0x0b, 0x0c],
    [0x0e, 0x1f],
  ]
    .map(([start, end]) => `${String.fromCharCode(start)}-${String.fromCharCode(end)}`)
    .join("")}${String.fromCharCode(0x7f)}]`,
  "g",
);
const HTML_TAG_REGEX = /<[^>]*>/g;

function sanitizeTemplateValue(value: string) {
  return String(value || "")
    .replace(/\r\n?/g, "\n")
    .replace(CONTROL_CHARS_REGEX, "")
    .replace(HTML_TAG_REGEX, "")
    .trim();
}

const contratoMestreVars: ContractVariable[] = [
  {
    key: "nome_contratada",
    label: "Nome / Qualificação da Contratada",
    type: "text",
    defaultValue: "NovaesWeb, representada por seu fundador e CEO Lucas Rodrigo Ferreira dos Santos",
  },
  {
    key: "cpf_cnpj_contratada",
    label: "CPF/CNPJ da Contratada",
    type: "text",
    defaultValue: "503.328.838-50",
  },
  {
    key: "endereco_contratada",
    label: "Endereço da Contratada",
    type: "text",
    defaultValue: "Estrada da Prainha, 630 – Mato Grande, Canoas – RS",
  },
  { key: "cidade_foro", label: "Cidade do Foro", type: "text", autoFill: "cidade_foro", defaultValue: "Canoas" },
  { key: "estado_foro", label: "Estado do Foro", type: "text", autoFill: "estado_foro", defaultValue: "RS" },
  {
    key: "lista_servicos",
    label: "Serviços Contratados",
    type: "textarea",
    defaultValue:
      "Site profissional, painel de controlo, gestão de pedidos, automação de atendimento, marketing digital e módulos adicionais conforme proposta comercial.",
  },
  {
    key: "escopo_exclusoes",
    label: "Escopo Não Incluso / Exclusões",
    type: "textarea",
    defaultValue:
      "Não estão inclusos serviços, licenças, integrações, campanhas pagas, textos, fotos, artes, hospedagem, domínio ou novas funcionalidades não descritas na proposta aprovada.",
  },
  { key: "prazo_dias", label: "Prazo Inicial de Entrega (dias úteis)", type: "number", defaultValue: "20" },
  { key: "valor_entrada", label: "Valor da Entrada / Sinal (R$)", type: "number", defaultValue: "0" },
  { key: "valor_saldo", label: "Valor do Saldo Final (R$)", type: "number", defaultValue: "0" },
  { key: "valor_mensal", label: "Valor Mensal / Recorrente (R$)", type: "number", defaultValue: "0" },
  { key: "dia_vencimento", label: "Dia do Vencimento", type: "number", defaultValue: "10" },
  { key: "forma_pagamento", label: "Forma de Pagamento", type: "text", defaultValue: "PIX, boleto, cartão ou link de pagamento" },
  { key: "numero_revisoes", label: "Número de Revisões Inclusas", type: "number", defaultValue: "2" },
  { key: "valor_revisao", label: "Valor por Revisão / Alteração Extra (R$)", type: "number", defaultValue: "150" },
  {
    key: "prazo_suporte",
    label: "Janela de Suporte / Atendimento",
    type: "text",
    defaultValue: "Atendimento em dias úteis, dentro do horário comercial, conforme plano ou escopo contratado.",
  },
  {
    key: "observacoes_comerciais",
    label: "Observações Comerciais",
    type: "textarea",
    defaultValue:
      "Serviços recorrentes, extras, integrações, mídia paga, domínio, hospedagem e demandas fora do escopo poderão ser contratados e cobrados à parte mediante aprovação do contratante.",
  },
  { key: "tabela_servicos", label: "Tabela de Serviços / Escopo", type: "textarea", defaultValue: "" },
  { key: "data", label: "Data de Assinatura", type: "date", autoFill: "data" },
];

export const contractTemplates: ContractTemplate[] = [
  {
    id: "novaesweb-contrato-mestre",
    nome: "Contrato Mestre NovaesWeb",
    tipo: "contrato_mestre",
    variaveis: [
      { key: "nome_cliente", label: "Nome do Cliente", type: "text", autoFill: "nome_cliente" },
      { key: "cpf_cnpj", label: "CPF/CNPJ do Cliente", type: "text", autoFill: "cpf_cnpj" },
      { key: "endereco", label: "Endereço do Cliente", type: "text", autoFill: "endereco" },
      ...contratoMestreVars,
    ],
    corpo: `CONTRATO MESTRE UNIVERSAL NOVAESWEB

CONTRATANTE

{nome_cliente}, inscrito(a) no CPF/CNPJ sob o nº {cpf_cnpj}, com endereço em {endereco}, doravante denominado(a) simplesmente CONTRATANTE.

CONTRATADA

{nome_contratada}, CPF/CNPJ {cpf_cnpj_contratada}, com endereço em {endereco_contratada}, doravante denominada simplesmente CONTRATADA. A CONTRATANTE declara ciência de que a NovaesWeb está em fase inicial de operação e utiliza atualmente CPF como forma de recebimento.

As partes acima identificadas resolvem celebrar o presente CONTRATO MESTRE UNIVERSAL DE PRESTAÇÃO DE SERVIÇOS DIGITAIS, que se regerá pelas cláusulas e condições abaixo.

CONDIÇÕES COMERCIAIS

{tabela_servicos}

PLANO E SERVIÇOS CONTRATADOS

Os serviços efetivamente contratados neste instrumento são: {lista_servicos}.

ESCOPO DE ATUAÇÃO — IMPORTANTE

A execução observará o escopo aprovado comercialmente e os limites operacionais definidos pela proposta, briefing, checklist e aprovações trocadas entre as partes. Ficam desde já reconhecidas como exclusões padrão, salvo previsão expressa em contrário: {escopo_exclusoes}. Qualquer item, módulo, integração, campanha, página, automação, criativo, rotina, ajuste estrutural ou material não previsto expressamente no escopo inicial será tratado como adicional e poderá ser objeto de novo orçamento, aditivo ou faturamento complementar.

O CONTRATANTE deverá fornecer, em prazo razoável, todos os materiais e informações necessários para a execução do projeto ou serviço, incluindo, quando aplicável, logotipo, identidade visual, textos, fotos, vídeos, descrições, tabela de preços, links, acessos, credenciais, documentação técnica, briefing validado e demais conteúdos necessários. O atraso no envio de materiais, acessos, aprovações, feedbacks ou qualquer informação essencial pelo CONTRATANTE suspenderá automaticamente a contagem dos prazos da CONTRATADA até a regularização da pendência.

O prazo inicial estimado para entrega é de {prazo_dias} dias úteis, contados a partir do recebimento do briefing aprovado, dos materiais mínimos necessários e da confirmação do pagamento da entrada, quando aplicável. O prazo acima é estimado e poderá ser ajustado em razão de volume de alterações, mudanças de escopo, pendências do CONTRATANTE, indisponibilidade de terceiros, aprovações demoradas, indisponibilidade técnica externa ou qualquer fato superveniente que impacte a execução.

CONTRATO EXPLICADO EM LINGUAGEM SIMPLES

Cláusula 1 — O que está sendo contratado: Este contrato cobre a estrutura digital contratada dentro do ecossistema NovaesWeb, podendo abranger site institucional, landing page, sistema interno, painel administrativo, gestão de pedidos, automação de atendimento via WhatsApp, marketing digital, manutenção recorrente, módulos adicionais, integrações e extras, conforme detalhado nas condições comerciais.

Cláusula 2 — Escopo e exclusões: Tudo o que está descrito no resumo comercial faz parte da entrega. O que estiver fora do escopo, nas exclusões ou não estiver aprovado na proposta pode ser tratado como adicional e cobrado à parte. O cliente precisa enviar logo, textos, fotos, acessos e demais materiais necessários. Se isso atrasar, o prazo do projeto também pode atrasar.

Cláusula 3 — Materiais e briefing: O CONTRATANTE deverá fornecer todos os materiais e informações necessários. O atraso no envio suspende automaticamente a contagem dos prazos. A CONTRATADA não se responsabiliza por atrasos decorrentes de material incompleto ou enviado fora do prazo.

Cláusula 4 — Prazos e execução: Prazo estimado de {prazo_dias} dias úteis. O prazo começa quando briefing, materiais e pagamento inicial estiverem em ordem. Havendo paralisação por mais de 15 dias, a CONTRATADA poderá reprogramar a fila de produção.

Cláusula 5 — Valores e pagamento: O CONTRATANTE pagará à CONTRATADA os valores definidos nas condições comerciais. A forma de pagamento é: {forma_pagamento}. O início da execução poderá ficar condicionado à compensação da entrada. Custos com licenças, ferramentas de terceiros, domínio, hospedagem, disparos, mídia paga e serviços não inclusos no escopo serão cobrados separadamente.

Cláusula 6 — Atrasos e inadimplência: Em caso de atraso no pagamento, a CONTRATADA poderá suspender serviços, atendimento, manutenção, publicações, automações, entregas e liberações até a regularização. Se houver saldo em aberto durante projeto, a execução poderá ser congelada até quitação integral.

Cláusula 7 — Revisões e alterações: Estão incluídas até {numero_revisoes} rodadas de revisão dentro do escopo aprovado. Revisões, refações, alterações estruturais, mudanças de direção ou novos pedidos fora do escopo poderão ser cobrados adicionalmente no valor mínimo de R$ {valor_revisao} por demanda.

Cláusula 8 — Propriedade intelectual: Até a quitação integral, a estrutura, arquivos editáveis, painel, páginas, sistemas, automações, layouts, códigos e ativos digitais permanecem sob titularidade da CONTRATADA. A cessão definitiva ocorre somente após pagamento total.

Cláusula 9 — Marketing e resultados: Quando houver marketing, conteúdo, automações ou processos comerciais, a CONTRATADA atua com base técnica e estratégica, mas não garante resultado absoluto de vendas, leads ou faturamento, pois isso depende de variáveis externas e da operação do CONTRATANTE.

Cláusula 10 — Suporte e manutenção: Serviços de suporte, manutenção, acompanhamento ou operação recorrente só valem se contratados expressamente. Quando existentes, serão prestados dentro da janela: {prazo_suporte}. Não se incluem automaticamente: criação de novas páginas, novos módulos, mudanças profundas de layout, integrações não previstas ou demandas fora do escopo.

Cláusula 11 — Cancelamento e rescisão: O CONTRATANTE pode cancelar mesmo após início dos trabalhos, mas valores já pagos para ativação e estruturação não serão devolvidos. Em caso de cancelamento, a estrutura permanece ativa apenas até o período já pago. Em descumprimento grave, inadimplência reiterada ou uso indevido, a CONTRATADA poderá rescindir imediatamente.

Cláusula 12 — Sigilo e dados: As partes mantêm sigilo sobre informações estratégicas, comerciais, operacionais, dados e documentos. Os dados serão utilizados apenas para execução do serviço, atendimento, suporte e obrigações correlatas. O CONTRATANTE é responsável pela veracidade das informações fornecidas.

Cláusula 13 — Observações comerciais: As partes reconhecem as seguintes observações comerciais: {observacoes_comerciais}.

Cláusula 14 — Foro e jurisdição: Fica eleito o foro da Comarca de {cidade_foro}/{estado_foro}, com renúncia expressa a qualquer outro, por mais privilegiado que seja.

CONTRATO MESTRE UNIVERSAL — PROTEÇÃO AMPLA E CLAREZA TOTAL

Este contrato foi redigido para proteger ambos os lados, garantir clareza total nas responsabilidades e assegurar que o projeto digital seja entregue com excelência técnica e profissionalismo. A NovaesWeb se compromete com a qualidade, inovação e resultados, enquanto o CONTRATANTE se compromete com fornecer materiais em prazo, aprovações ágeis e cumprir com as condições financeiras acordadas.

Nosso diferencial: estrutura digital premium, atendimento especializado, tecnologia atualizada e acompanhamento contínuo. Trabalhamos com foco em resultados, mas respeitamos as variáveis de mercado, operação do cliente e fatores externos que podem influenciar performance.

Importante: Não fazemos promessas milagrosas. Garantimos trabalho técnico de ponta, estratégia digital moderna e suporte qualificado, mas resultados comerciais dependem também da qualidade dos produtos/serviços do cliente, precificação competitiva, operação interna e agilidade nas decisões.

Exclusões claras: Não estão inclusos textos criativos, fotos profissionais, vídeos personalizados, artes gráficas, licenças premium de terceiros, campanhas pagas, domínio, hospedagem ou novas funcionalidades não descritas na proposta aprovada.

Flexibilidade e evolução: O ecossistema NovaesWeb permite expansões, upgrades e novas funcionalidades. Qualquer evolução além do escopo original poderá ser contratada separadamente, com condições comerciais justas e transparentes.

E, por estarem justas e contratadas, as partes confirmam sua concordância com o presente instrumento, inclusive por meios eletrônicos quando aplicável.

{cidade_foro}/{estado_foro}, {data}.`,
  },
];

export function fillTemplate(corpo: string, values: Record<string, string>) {
  let result = corpo;
  for (const [key, value] of Object.entries(values)) {
    const safeValue = sanitizeTemplateValue(value);
    const nextValue = /^\d{4}-\d{2}-\d{2}$/.test(safeValue || "")
      ? new Date(`${safeValue}T00:00:00`).toLocaleDateString("pt-BR")
      : safeValue;
    result = result.replace(new RegExp(`\\{${key}\\}`, "g"), nextValue || `{${key}}`);
  }
  return result;
}

export function getContractTypeLabel(_tipo?: ContractTemplate["tipo"]) {
  return "Contrato Mestre";
}
