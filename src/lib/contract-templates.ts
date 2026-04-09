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
    corpo: `CONTRATO MESTRE UNIVERSAL DE PRESTAÇÃO DE SERVIÇOS DIGITAIS NOVAESWEB

Pelo presente instrumento particular, de um lado:

CONTRATANTE: {nome_cliente}, inscrito(a) no CPF/CNPJ sob o nº {cpf_cnpj}, com endereço em {endereco}, doravante denominado(a) simplesmente CONTRATANTE.

E, de outro lado:

CONTRATADA: {nome_contratada}, CPF/CNPJ {cpf_cnpj_contratada}, com endereço em {endereco_contratada}, doravante denominada simplesmente CONTRATADA. A CONTRATANTE declara ciência de que a NovaesWeb está em fase inicial de operação e utiliza atualmente CPF como forma de recebimento.

As partes acima identificadas resolvem celebrar o presente CONTRATO MESTRE UNIVERSAL DE PRESTAÇÃO DE SERVIÇOS DIGITAIS, que se regerá pelas cláusulas e condições abaixo.

CLÁUSULA 1 — DO OBJETO
1.1. O presente contrato tem por objeto a prestação, pela CONTRATADA, de serviços digitais, estratégicos e operacionais dentro do ecossistema NovaesWeb, podendo abranger, de forma modular e conforme contratação específica, a criação, implantação, personalização, manutenção e evolução de site institucional, landing page, sistema interno, painel administrativo, gestão de pedidos, automação de atendimento via WhatsApp, marketing digital, manutenção recorrente, módulos adicionais, integrações e extras.
1.2. Os serviços efetivamente contratados neste instrumento são os seguintes: {lista_servicos}.

1.3. Integra ainda o presente contrato o resumo comercial abaixo, contendo exclusivamente os itens efetivamente contratados nesta proposta:

{tabela_servicos}

CLÁUSULA 2 — DO ESCOPO CONTRATADO E DAS EXCLUSÕES
2.1. A execução observará o escopo aprovado comercialmente e os limites operacionais definidos pela proposta, briefing, checklist e aprovações trocadas entre as partes.
2.2. Ficam desde já reconhecidas como exclusões padrão, salvo previsão expressa em contrário, as seguintes hipóteses: {escopo_exclusoes}.
2.3. Qualquer item, módulo, integração, campanha, página, automação, criativo, rotina, ajuste estrutural ou material não previsto expressamente no escopo inicial será tratado como adicional e poderá ser objeto de novo orçamento, aditivo ou faturamento complementar.

CLÁUSULA 3 — DOS MATERIAIS, ACESSOS E BRIEFING DO CONTRATANTE
3.1. O CONTRATANTE deverá fornecer, em prazo razoável, todos os materiais e informações necessários para a execução do projeto ou serviço, incluindo, quando aplicável, logotipo, identidade visual, textos, fotos, vídeos, descrições, tabela de preços, links, acessos, credenciais, documentação técnica, briefing validado e demais conteúdos necessários.
3.2. O atraso no envio de materiais, acessos, aprovações, feedbacks ou qualquer informação essencial pelo CONTRATANTE suspenderá automaticamente a contagem dos prazos da CONTRATADA até a regularização da pendência.
3.3. A CONTRATADA não se responsabiliza por atrasos, falhas, refações ou limitações decorrentes de material incompleto, inconsistente, desatualizado ou enviado fora do prazo pelo CONTRATANTE.

CLÁUSULA 4 — DO PRAZO E DA EXECUÇÃO
4.1. O prazo inicial estimado para a entrega da primeira implantação ou etapa principal é de {prazo_dias} dias úteis, contados a partir do recebimento do briefing aprovado, dos materiais mínimos necessários e da confirmação do pagamento da entrada, quando aplicável.
4.2. O prazo acima é estimado e poderá ser ajustado em razão de: volume de alterações, mudanças de escopo, pendências do CONTRATANTE, indisponibilidade de terceiros, aprovações demoradas, indisponibilidade técnica externa ou qualquer fato superveniente que impacte a execução.
4.3. Havendo paralisação causada pelo CONTRATANTE por período superior a 15 (quinze) dias, a CONTRATADA poderá reprogramar a fila de produção e redefinir o cronograma de entrega.

CLÁUSULA 5 — DO VALOR E DAS CONDIÇÕES DE PAGAMENTO
5.1. Pela prestação dos serviços ora contratados, o CONTRATANTE pagará à CONTRATADA:
a) Entrada / sinal no valor de R$ {valor_entrada};
b) Saldo final no valor de R$ {valor_saldo};
c) Mensalidade ou recorrência, quando aplicável, no valor de R$ {valor_mensal}, com vencimento todo dia {dia_vencimento}.
5.2. A forma de pagamento ajustada entre as partes é: {forma_pagamento}.
5.3. O início da execução poderá ficar condicionado à compensação da entrada, quando aplicável.
5.4. Custos com licenças, ferramentas de terceiros, domínio, hospedagem, disparos, mídia paga, integrações externas, provedores e serviços não inclusos no escopo serão cobrados separadamente ou pagos diretamente pelo CONTRATANTE.
5.5. Demandas adicionais, evoluções, alterações de escopo e solicitações extraordinárias poderão ser faturadas à parte, mediante aprovação.

CLÁUSULA 6 — DA INADIMPLÊNCIA
6.1. O inadimplemento de qualquer parcela ou mensalidade sujeitará o CONTRATANTE à incidência de multa, juros, correção monetária e demais encargos legais cabíveis.
6.2. Em caso de atraso, a CONTRATADA poderá suspender parcial ou integralmente os serviços recorrentes, atendimento, manutenção, publicações, automações, entregas e liberações até a regularização financeira.
6.3. Caso haja saldo em aberto durante projeto em andamento, a CONTRATADA poderá congelar a continuidade da execução e reter entregas, acessos, arquivos e publicações até a quitação integral.

CLÁUSULA 7 — DAS REVISÕES, AJUSTES E MUDANÇAS DE ESCOPO
7.1. Estão incluídas até {numero_revisoes} rodadas de revisão dentro do escopo originalmente aprovado.
7.2. Revisões, refações, alterações estruturais, mudanças de direção, novos pedidos, retrabalhos ou ajustes fora do escopo aprovado poderão ser cobrados adicionalmente no valor mínimo de R$ {valor_revisao} por demanda, hora técnica, bloco ou item, conforme avaliação comercial.
7.3. A aprovação expressa ou tácita de etapas pelo CONTRATANTE encerra a fase correspondente, não sendo devida refação sem custo após essa aprovação, salvo erro material imputável exclusivamente à CONTRATADA.

CLÁUSULA 8 — DA PROPRIEDADE INTELECTUAL, TITULARIDADE E ACESSOS
8.1. Até a quitação integral de todos os valores contratados, a estrutura produzida, os arquivos editáveis, o painel, as páginas, os sistemas, as automações, os layouts, os códigos, as integrações e quaisquer ativos digitais desenvolvidos permanecerão sob titularidade da CONTRATADA.
8.2. A cessão definitiva de uso, acesso, entrega final ou transferência plena dos ativos contratados ocorrerá somente após a quitação total do contrato e de eventuais adicionais.
8.3. Domínio, hospedagem, contas de terceiros, plataformas externas, APIs, gateways, ferramentas e licenças obedecerão àquilo que tiver sido efetivamente contratado, não se presumindo cessão, titularidade ou custeio automático pela CONTRATADA.

CLÁUSULA 9 — DOS SERVIÇOS DE MARKETING, AUTOMAÇÃO E RESULTADOS
9.1. Quando o escopo envolver marketing, conteúdo, automações, atendimento, funis, campanhas, captação, CRM, painéis, pedidos ou rotinas comerciais, a CONTRATADA atuará com base em melhores práticas técnicas e estratégicas disponíveis.
9.2. O CONTRATANTE declara ciência de que não existe garantia absoluta de resultado comercial, faturamento, quantidade de leads, volume de pedidos, conversão, alcance ou retorno financeiro, pois tais fatores dependem de variáveis externas, incluindo mercado, oferta, precificação, verba, operação interna, aprovação e agilidade do CONTRATANTE.
9.3. A performance de campanhas, automações e sistemas também depende do envio correto de material, da aprovação em prazo razoável, do funcionamento de plataformas terceiras e da continuidade operacional do CONTRATANTE.

CLÁUSULA 10 — DO SUPORTE, MANUTENÇÃO E RECORRÊNCIA
10.1. Serviços de suporte, manutenção, acompanhamento, operação recorrente, atualização, publicação, marketing mensal ou gestão contínua somente serão devidos se contratados expressamente.
10.2. Quando existentes, serão prestados dentro da seguinte janela operacional: {prazo_suporte}.
10.3. Não se incluem automaticamente em suporte ou manutenção recorrente: criação de novas páginas, novos módulos, mudanças profundas de layout, integrações não previstas, refações estratégicas, campanhas extraordinárias ou demandas fora do escopo contratado.

CLÁUSULA 11 — DA RESCISÃO
11.1. O CONTRATANTE poderá solicitar o cancelamento do contrato mesmo após o início dos trabalhos. Nessa hipótese, os valores já pagos para início, ativação, configuração, desenvolvimento, implantação e estruturação do projeto não serão devolvidos, considerando que a CONTRATADA já terá iniciado a operação técnica, reservado estrutura, utilizado plataformas, ferramentas e horas de produção para execução do serviço.
11.2. Em caso de cancelamento após o início do projeto, o site, sistema, painel, automação ou estrutura contratada permanecerá ativo apenas até o fim do período já pago pelo CONTRATANTE. Encerrado esse período, a CONTRATADA poderá suspender e cancelar automaticamente os serviços, sem obrigação de continuidade, reembolso ou manutenção adicional.
11.3. Em caso de descumprimento contratual grave, inadimplência reiterada, uso indevido da estrutura, fraude, má-fé ou exigências incompatíveis com a proposta aprovada, a CONTRATADA poderá rescindir o contrato de forma imediata, preservando o direito de cobrança dos valores devidos.

CLÁUSULA 12 — DO SIGILO, DADOS E CONFORMIDADE
12.1. As partes comprometem-se a manter sigilo sobre informações estratégicas, comerciais, operacionais, dados, acessos e documentos trocados em razão deste contrato.
12.2. Os dados eventualmente tratados pela CONTRATADA serão utilizados apenas para execução do objeto contratado, atendimento operacional, suporte, cobrança e obrigações correlatas.
12.3. O CONTRATANTE declara ciência de que é responsável pela veracidade das informações, materiais e bases de dados fornecidos, bem como pela regularidade de seu uso.

CLÁUSULA 13 — DAS OBSERVAÇÕES COMERCIAIS
13.1. As partes reconhecem e integram ao presente contrato as seguintes observações comerciais: {observacoes_comerciais}.

CLÁUSULA 14 — DO FORO
14.1. Fica eleito o foro da Comarca de {cidade_foro}/{estado_foro}, com renúncia expressa a qualquer outro, por mais privilegiado que seja, para dirimir dúvidas ou controvérsias oriundas deste contrato.

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
