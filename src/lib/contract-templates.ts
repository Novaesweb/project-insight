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
  { key: "valor_subtotal_implantacao", label: "Subtotal da Implantação (R$)", type: "number", defaultValue: "0" },
  { key: "valor_desconto", label: "Desconto Aplicado (R$)", type: "number", defaultValue: "0" },
  { key: "valor_ativacao_total", label: "Valor Final da Ativação (R$)", type: "number", defaultValue: "0" },
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
      { key: "endereco", label: "Endereço do Cliente", type: "text", autoFill: "ende    corpo: `CONTRATO MESTRE UNIVERSAL NOVAESWEB

CONTRATANTE

{nome_cliente}, inscrito(a) no CPF/CNPJ sob o nº {cpf_cnpj}, com endereço em {endereco}, doravante denominado(a) simplesmente CONTRATANTE.

CONTRATADA

{nome_contratada}, CPF/CNPJ {cpf_cnpj_contratada}, com endereço em {endereco_contratada}, doravante denominada simplesmente CONTRATADA. A CONTRATANTE declara ciência de que a NovaesWeb está em fase inicial de operação e utiliza atualmente CPF como forma de recebimento.

As partes acima identificadas resolvem celebrar o presente CONTRATO MESTRE UNIVERSAL DE PRESTAÇÃO DE SERVIÇOS DIGITAIS, que se regerá pelas cláusulas e condições abaixo.

CONDIÇÕES COMERCIAIS

{tabela_servicos}

CLÁUSULA 1 — DO OBJETO
1.1. O presente contrato tem por objeto a prestação, pela CONTRATADA, de serviços digitais, estratégicos e operacionais dentro do ecossistema NovaesWeb, podendo abranger, de forma modular e conforme contratação específica, a criação, implantação, personalização, manutenção e evolução de site institucional, landing page, sistema interno, painel administrativo, gestão de pedidos e módulos adicionais.
1.2. Os serviços efetivamente contratados neste instrumento são os seguintes: {lista_servicos}.
1.3. Integra ainda o presente contrato o resumo comercial constante na seção Plano e Serviços Contratados, com subtotal de implantação de R$ {valor_subtotal_implantacao}, desconto de R$ {valor_desconto}, ativação total de R$ {valor_ativacao_total} e mensalidade de R$ {valor_mensal}.

CLÁUSULA 2 — DO ESCOPO CONTRATADO E DAS EXCLUSÕES
2.1. A execução observará o escopo aprovado comercialmente e os limites operacionais definidos pela proposta, briefing, checklist e aprovações trocadas entre as partes.
2.2. Ficam expressamente excluídos do escopo desta contratação todos os serviços de marketing digital, gestão de tráfego pago, produção de conteúdo, gerenciamento de redes sociais, campanhas publicitárias e estratégias de captação. Tais serviços são de responsabilidade exclusiva do CONTRATANTE ou de profissionais por ele contratados.
2.3. Ficam desde já reconhecidas como exclusões padrão, salvo previsão expressa em contrário: {escopo_exclusoes}.
2.4. Qualquer item, módulo, integração, página, automação, ajuste estrutural ou material não previsto expressamente no escopo inicial será tratado como adicional e poderá ser objeto de novo orçamento, aditivo ou faturamento complementar.

CLÁUSULA 3 — DOS MATERIAIS E DO BRIEFING
3.1. O CONTRATANTE deverá fornecer, em prazo razoável, todos os materiais e informações necessários para a execução do projeto ou serviço, incluindo, quando aplicável, logotipo, identidade visual, textos, fotos, vídeos, descrições, tabela de preços, links, acessos, credenciais, documentação técnica, briefing validado e demais conteúdos necessários.
3.2. O atraso no envio de materiais, acessos, aprovações, feedbacks ou qualquer informação essencial pelo CONTRATANTE suspenderá automaticamente a contagem dos prazos da CONTRATADA até a regularização da pendência.

CLÁUSULA 4 — DOS PRAZOS E DA EXECUÇÃO
4.1. O prazo inicial estimado para entrega é de {prazo_dias} dias úteis, contados a partir do recebimento do briefing aprovado, dos materiais mínimos necessários e da confirmação do pagamento da entrada, quando aplicável.
4.2. O prazo acima é estimado e poderá ser ajustado em razão de volume de alterações, mudanças de escopo, pendências do CONTRATANTE, indisponibilidade técnica externa ou qualquer fato superveniente que impacte a execução.

CLÁUSULA 5 — DOS VALORES E DO PAGAMENTO
5.1. O CONTRATANTE pagará à CONTRATADA os valores definidos nas condições comerciais.
5.2. A forma de pagamento acordada é: {forma_pagamento}.
5.3. Custos com licenças de terceiros, APIs, gateways, domínio, hospedagem, disparos e serviços não inclusos no escopo serão de responsabilidade do CONTRATANTE.

CLÁUSULA 6 — DA INADIMPLÊNCIA
6.1. O inadimplemento de qualquer parcela ou mensalidade sujeitará o CONTRATANTE à incidência de multa moratória de 2% (dois por cento), juros de 1% (um por cento) ao mês, correção monetária pelo IGPM e demais encargos legais cabíveis.
6.2. Em caso de atraso, a CONTRATADA poderá suspender parcial ou integralmente os serviços recorrentes, atendimento, manutenção, publicações, entregas e liberações até a regularização financeira.
6.3. Caso haja saldo em aberto durante projeto em andamento, a CONTRATADA poderá congelar a continuidade da execução e reter entregas, acessos, arquivos e publicações até a quitação integral.

CLÁUSULA 7 — DAS REVISÕES, AJUSTES E MUDANÇAS DE ESCOPO
7.1. Estão incluídas até {numero_revisoes} rodadas de revisão dentro do escopo aprovado.
7.2. Revisões extras, refações por mudança de direção ou novos pedidos fora do escopo serão cobrados adicionalmente no valor mínimo de R$ {valor_revisao} por demanda.

CLÁUSULA 8 — DA PROPRIEDADE INTELECTUAL, TITULARIDADE E ACESSOS
8.1. Até a quitação integral de todos os valores contratados, a estrutura produzida, os arquivos editáveis, o painel, as páginas, os sistemas, os layouts, os códigos, as integrações e quaisquer ativos digitais desenvolvidos permanecerão sob titularidade da CONTRATADA.
8.2. A cessão definitiva de uso, acesso, entrega final ou transferência plena dos ativos contratados ocorrerá somente após a quitação total do contrato e de eventuais adicionais.
8.3. Domínio, hospedagem, contas de terceiros, plataformas externas, APIs, gateways, ferramentas e licenças obedecerão àquilo que tiver sido efetivamente contratado.

CLÁUSULA 9 — DO ESCOPO DE ATUAÇÃO E LIMITAÇÃO DE RESPONSABILIDADE
9.1. A CONTRATADA atua exclusivamente na criação, desenvolvimento, implantação e manutenção das estruturas digitais objeto deste contrato, conforme escopo aprovado.
9.2. Serviços de marketing digital, gestão de tráfego pago, produção de conteúdo, gerenciamento de redes sociais, campanhas publicitárias e estratégias de captação NÃO fazem parte do escopo da CONTRATADA e são de responsabilidade exclusiva do CONTRATANTE.
9.3. O CONTRATANTE declara ciência de que não existe garantia absoluta de resultado comercial, faturamento, quantidade de leads, volume de pedidos, conversão, alcance ou retorno financeiro, pois tais fatores dependem integralmente de variáveis externas e da operação comercial do CONTRATANTE.

CLÁUSULA 10 — DO SUPORTE, MANUTENÇÃO E RECORRÊNCIA
10.1. Serviços de suporte, manutenção, acompanhamento ou operação recorrente só serão devidos se contratados expressamente.
10.2. Quando existentes, serão prestados dentro da janela: {prazo_suporte}.

CLÁUSULA 11 — DA RESCISÃO
11.1. O CONTRATANTE poderá solicitar o cancelamento do contrato após o início dos trabalhos. Nessa hipótese, os valores já pagos para ativação, configuração e estruturação não serão devolvidos, considerando as horas de produção já utilizadas.
11.2. Em caso de cancelamento, a estrutura contratada permanecerá ativa apenas até o fim do período já pago.
11.3. A CONTRATADA poderá rescindir o contrato de forma imediata em caso de descumprimento grave, inadimplência reiterada ou uso indevido da estrutura.

CLÁUSULA 12 — DO SIGILO, DADOS E CONFORMIDADE (LGPD)
12.1. As partes comprometem-se a manter sigilo sobre informações estratégicas, comerciais e operacionais trocadas em razão deste contrato.
12.2. Os dados tratados pela CONTRATADA serão utilizados apenas para execução do objeto contratado, em conformidade com a Lei Geral de Proteção de Dados (LGPD).

CLÁUSULA 13 — DAS OBSERVAÇÕES COMERCIAIS
13.1. As partes reconhecem e integram ao presente contrato as seguintes observações comerciais: {observacoes_comerciais}.
13.2. Serviços de marketing digital, mídia paga e gestão de redes sociais ficam sob responsabilidade exclusiva do CONTRATANTE.

CLÁUSULA 14 — DO FORO
14.1. Fica eleito o foro da Comarca de {cidade_foro}/{estado_foro} para dirimir quaisquer controvérsias oriundas deste contrato.

--------------------------------------------------
CONTRATO EXPLICADO EM LINGUAGEM SIMPLES

Cláusula 1 — O que está sendo contratado: Este contrato cobre a estrutura digital (site, sistema, painel) do ecossistema NovaesWeb conforme detalhado nas condições comerciais.

Cláusula 2 — Escopo e exclusões: Tudo o que está no resumo faz parte da entrega. Marketing digital, tráfego pago e redes sociais NÃO estão inclusos. Placeholders e materiais devem ser enviados pelo cliente para não atrasar o prazo.

Cláusula 6 — Atrasos: Em caso de atraso, o serviço e o atendimento podem ser suspensos até a regularização.

Cláusulas 8 e 9 — Propriedade e Resultados: A estrutura é sua após a quitação total. A NovaesWeb garante a parte técnica e estratégica, mas resultados de vendas dependem do seu mercado e operação.

Cláusula 11 — Cancelamento: Você pode cancelar, mas o valor de ativação já usado em horas de trabalho não é devolvido.

{cidade_foro}/{estado_foro}, {data}.`,tos criativos, fotos profissionais, vídeos personalizados, artes gráficas, licenças premium de terceiros, campanhas pagas, domínio, hospedagem ou novas funcionalidades não descritas na proposta aprovada.

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
