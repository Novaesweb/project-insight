export interface ContractVariable {
  key: string;
  label: string;
  type: "text" | "number" | "date" | "textarea";
  defaultValue?: string;
  autoFill?: "nome_cliente" | "cpf_cnpj" | "endereco" | "data";
}

export interface ContractTemplate {
  id: string;
  nome: string;
  tipo: "projeto_unico" | "recorrente_mensal";
  variaveis: ContractVariable[];
  corpo: string;
}

const baseVars: ContractVariable[] = [
  { key: "nome_cliente", label: "Nome do Cliente", type: "text", autoFill: "nome_cliente" },
  { key: "cpf_cnpj", label: "CPF/CNPJ do Cliente", type: "text", autoFill: "cpf_cnpj" },
  { key: "endereco", label: "Endereço do Cliente", type: "text", autoFill: "endereco" },
  { key: "cnpj_webnovax", label: "CNPJ WebNovaX", type: "text", defaultValue: "" },
  { key: "lista_servicos", label: "Lista de Serviços", type: "textarea" },
  { key: "numero_revisoes", label: "Nº de Revisões", type: "number", defaultValue: "2" },
  { key: "valor_revisao", label: "Valor Revisão Adicional (R$/hora)", type: "number", defaultValue: "50" },
  { key: "percentual_multa", label: "Percentual Multa Rescisão (%)", type: "number", defaultValue: "30" },
  { key: "forma_pagamento", label: "Forma de Pagamento", type: "text" },
  { key: "data", label: "Data de Assinatura", type: "date", autoFill: "data" },
];

const projetoUnicoVars: ContractVariable[] = [
  { key: "prazo_dias", label: "Prazo de Entrega (dias úteis)", type: "number" },
  { key: "valor_total", label: "Valor Total (R$)", type: "number" },
];

export const contractTemplates: ContractTemplate[] = [
  {
    id: "criacao-site",
    nome: "Criação de Site",
    tipo: "projeto_unico",
    variaveis: [
      ...baseVars,
      ...projetoUnicoVars,
      { key: "condicao_hospedagem", label: "Condição de Hospedagem", type: "textarea" },
      { key: "prazo_suporte", label: "Prazo Suporte Pós Entrega (dias)", type: "number", defaultValue: "30" },
    ],
    corpo: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE DESENVOLVIMENTO WEB

CONTRATANTE: {nome_cliente}, {cpf_cnpj}, residente/sediado em {endereco}, doravante denominado CONTRATANTE.

CONTRATADA: WebNovaX, CNPJ {cnpj_webnovax}, sediada em Alvorada, RS, doravante denominada CONTRATADA.

As partes acima identificadas têm entre si justo e acertado o presente contrato, que se regerá pelas cláusulas seguintes:

CLÁUSULA 1 — DO OBJETO
A CONTRATADA se compromete a desenvolver um site profissional para o CONTRATANTE conforme as especificações acordadas em briefing, incluindo: {lista_servicos}.

CLÁUSULA 2 — DO PRAZO
O prazo de entrega é de {prazo_dias} dias úteis a contar da data de aprovação do briefing e recebimento do pagamento inicial. O prazo poderá ser prorrogado caso o CONTRATANTE demore mais de 48h para responder solicitações da CONTRATADA.

CLÁUSULA 3 — DO VALOR E PAGAMENTO
O valor total do serviço é de R$ {valor_total}. Forma de pagamento: {forma_pagamento}. O não pagamento dentro do prazo acarretará multa de 2% ao mês sobre o valor em aberto.

CLÁUSULA 4 — DAS REVISÕES
Estão incluídas {numero_revisoes} rodadas de revisão no escopo do projeto. Revisões adicionais serão cobradas à parte no valor de R$ {valor_revisao} por hora.

CLÁUSULA 5 — DOS DIREITOS AUTORAIS
Após a quitação total do contrato os direitos sobre o site desenvolvido serão transferidos ao CONTRATANTE. Até o pagamento total o site permanece sob propriedade da CONTRATADA.

CLÁUSULA 6 — DO CONTEÚDO
O CONTRATANTE é responsável por fornecer todos os textos, imagens e informações necessárias para o desenvolvimento. A CONTRATADA não se responsabiliza por conteúdo fornecido pelo CONTRATANTE que viole direitos de terceiros.

CLÁUSULA 7 — DA HOSPEDAGEM
{condicao_hospedagem}. A CONTRATADA não se responsabiliza por quedas de serviço causadas pela empresa de hospedagem.

CLÁUSULA 8 — DAS OBRIGAÇÕES DA CONTRATADA
A CONTRATADA se compromete a: entregar o projeto no prazo acordado, manter sigilo sobre as informações do CONTRATANTE, realizar as revisões incluídas no escopo e prestar suporte técnico por {prazo_suporte} dias após a entrega.

CLÁUSULA 9 — DAS OBRIGAÇÕES DO CONTRATANTE
O CONTRATANTE se compromete a: fornecer o briefing completo no prazo, realizar pagamentos conforme acordado, fornecer feedback dentro de 48h nas etapas de revisão e não utilizar o site para fins ilegais.

CLÁUSULA 10 — DA RESCISÃO
Em caso de rescisão por parte do CONTRATANTE após o início do desenvolvimento será cobrada multa de {percentual_multa}% sobre o valor total do contrato referente ao trabalho já executado. Em caso de rescisão por parte da CONTRATADA sem justificativa o valor já pago será devolvido integralmente.

CLÁUSULA 11 — DO FORO
As partes elegem o foro da Comarca de Alvorada, RS para dirimir quaisquer dúvidas ou litígios decorrentes deste contrato.

Alvorada, {data}.

CONTRATANTE: ___________________________
CONTRATADA — WebNovaX: ___________________________`,
  },
  {
    id: "loja-virtual",
    nome: "Loja Virtual",
    tipo: "projeto_unico",
    variaveis: [
      ...baseVars,
      ...projetoUnicoVars,
      { key: "numero_produtos", label: "Capacidade Máx. de Produtos", type: "number" },
      { key: "integracoes", label: "Integrações de Pagamento", type: "textarea" },
      { key: "numero_horas", label: "Horas de Treinamento", type: "number", defaultValue: "2" },
      { key: "numero_produtos_iniciais", label: "Produtos do Cadastro Inicial", type: "number" },
    ],
    corpo: `CONTRATO DE DESENVOLVIMENTO DE E-COMMERCE

CONTRATANTE: {nome_cliente}, {cpf_cnpj}, residente/sediado em {endereco}, doravante denominado CONTRATANTE.

CONTRATADA: WebNovaX, CNPJ {cnpj_webnovax}, sediada em Alvorada, RS, doravante denominada CONTRATADA.

CLÁUSULA 1 — DO OBJETO
A CONTRATADA se compromete a desenvolver uma loja virtual completa incluindo: {lista_servicos}, com capacidade para até {numero_produtos} produtos cadastrados.

CLÁUSULA 2 — DO PRAZO
Prazo de entrega: {prazo_dias} dias úteis após aprovação do briefing e pagamento inicial.

CLÁUSULA 3 — DO VALOR E PAGAMENTO
Valor total: R$ {valor_total}. Forma de pagamento: {forma_pagamento}. O não pagamento dentro do prazo acarretará multa de 2% ao mês sobre o valor em aberto.

CLÁUSULA 4 — DAS INTEGRAÇÕES
Estão incluídas no escopo as seguintes integrações de pagamento: {integracoes}. Integrações adicionais não previstas serão orçadas separadamente.

CLÁUSULA 5 — DO TREINAMENTO
A CONTRATADA se compromete a realizar {numero_horas}h de treinamento online para o CONTRATANTE aprender a gerenciar a loja virtual após a entrega.

CLÁUSULA 6 — DAS REVISÕES
Estão incluídas {numero_revisoes} rodadas de revisão. Revisões adicionais: R$ {valor_revisao}/hora.

CLÁUSULA 7 — DA MANUTENÇÃO
A manutenção contínua da loja não está incluída neste contrato e deverá ser contratada separadamente mediante plano mensal.

CLÁUSULA 8 — DA SEGURANÇA
A CONTRATADA implementará as medidas básicas de segurança disponíveis na plataforma utilizada. O CONTRATANTE é responsável por manter senhas seguras e não compartilhá-las.

CLÁUSULA 9 — DAS OBRIGAÇÕES DO CONTRATANTE
O CONTRATANTE se compromete a fornecer: fotos dos produtos, descrições, preços, dados de frete e todas as informações necessárias para o cadastro inicial de {numero_produtos_iniciais} produtos.

CLÁUSULA 10 — DOS DIREITOS AUTORAIS
Após a quitação total do contrato os direitos sobre a loja virtual desenvolvida serão transferidos ao CONTRATANTE.

CLÁUSULA 11 — DA RESCISÃO
Multa de {percentual_multa}% sobre o valor total em caso de rescisão após início do desenvolvimento.

CLÁUSULA 12 — DO FORO
Foro da Comarca de Alvorada, RS.

Alvorada, {data}.

CONTRATANTE: ___________________________
CONTRATADA — WebNovaX: ___________________________`,
  },
  {
    id: "manutencao-mensal",
    nome: "Manutenção Mensal",
    tipo: "recorrente_mensal",
    variaveis: [
      ...baseVars,
      { key: "data_inicio", label: "Data de Início", type: "date" },
      { key: "dia_vencimento", label: "Dia do Vencimento Mensal", type: "number", defaultValue: "10" },
      { key: "valor_mensal", label: "Valor Mensal (R$)", type: "number" },
      { key: "numero_horas", label: "Horas de Ajustes/Mês", type: "number", defaultValue: "4" },
      { key: "numero_atualizacoes", label: "Atualizações Mensais", type: "number", defaultValue: "4" },
    ],
    corpo: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE MANUTENÇÃO

CONTRATANTE: {nome_cliente}, {cpf_cnpj}, residente/sediado em {endereco}, doravante denominado CONTRATANTE.

CONTRATADA: WebNovaX, CNPJ {cnpj_webnovax}, sediada em Alvorada, RS, doravante denominada CONTRATADA.

CLÁUSULA 1 — DO OBJETO
A CONTRATADA prestará serviços mensais de manutenção do site/sistema do CONTRATANTE incluindo: {lista_servicos}.

CLÁUSULA 2 — DA VIGÊNCIA
O presente contrato vigorará por prazo indeterminado a partir de {data_inicio}, podendo ser rescindido por qualquer das partes mediante aviso prévio de 30 dias.

CLÁUSULA 3 — DO VALOR E PAGAMENTO
Mensalidade: R$ {valor_mensal}. Vencimento todo dia {dia_vencimento} de cada mês. Pagamento via {forma_pagamento}. Atraso superior a 10 dias acarretará suspensão dos serviços.

CLÁUSULA 4 — DO ESCOPO MENSAL
Estão incluídas no plano mensal: até {numero_horas}h de ajustes por mês, {numero_atualizacoes} atualizações de conteúdo, backup semanal e monitoramento de disponibilidade. Demandas acima do escopo serão orçadas separadamente.

CLÁUSULA 5 — DO PRAZO DE ATENDIMENTO
Solicitações normais: atendimento em até 48h úteis. Solicitações urgentes (site fora do ar): atendimento em até 4h úteis.

CLÁUSULA 6 — DAS EXCLUSÕES
Não estão incluídos neste contrato: desenvolvimento de novas funcionalidades, criação de novas páginas, campanhas de marketing e design de novos materiais. Esses serviços serão orçados separadamente.

CLÁUSULA 7 — DA RESCISÃO
Qualquer das partes pode rescindir mediante aviso prévio de 30 dias. Não haverá multa rescisória neste modelo de contrato.

CLÁUSULA 8 — DO FORO
Foro da Comarca de Alvorada, RS.

Alvorada, {data}.

CONTRATANTE: ___________________________
CONTRATADA — WebNovaX: ___________________________`,
  },
  {
    id: "marketing-digital",
    nome: "Marketing Digital",
    tipo: "recorrente_mensal",
    variaveis: [
      ...baseVars,
      { key: "data_inicio", label: "Data de Início", type: "date" },
      { key: "dia_vencimento", label: "Dia do Vencimento", type: "number", defaultValue: "10" },
      { key: "valor_mensal", label: "Valor Mensal (R$)", type: "number" },
      { key: "prazo_meses", label: "Duração (meses)", type: "number", defaultValue: "6" },
      { key: "verba_anuncios", label: "Verba Anúncios (R$)", type: "number", defaultValue: "0" },
      { key: "lista_entregas", label: "Entregas Mensais", type: "textarea" },
    ],
    corpo: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE MARKETING DIGITAL

CONTRATANTE: {nome_cliente}, {cpf_cnpj}, residente/sediado em {endereco}, doravante denominado CONTRATANTE.

CONTRATADA: WebNovaX, CNPJ {cnpj_webnovax}, sediada em Alvorada, RS, doravante denominada CONTRATADA.

CLÁUSULA 1 — DO OBJETO
A CONTRATADA prestará serviços de marketing digital incluindo: {lista_servicos}.

CLÁUSULA 2 — DA VIGÊNCIA
Contrato com vigência de {prazo_meses} meses a partir de {data_inicio}, renovável automaticamente salvo aviso contrário com 30 dias de antecedência.

CLÁUSULA 3 — DO VALOR E PAGAMENTO
Mensalidade: R$ {valor_mensal}. Vencimento dia {dia_vencimento}. Valor de verba para anúncios pagos (se aplicável): R$ {verba_anuncios} gerenciado pelo CONTRATANTE diretamente nas plataformas.

CLÁUSULA 4 — DAS ENTREGAS MENSAIS
A CONTRATADA entregará mensalmente: {lista_entregas}. Relatório mensal de resultados enviado até o dia 5 do mês seguinte.

CLÁUSULA 5 — DOS RESULTADOS
A CONTRATADA se compromete a aplicar as melhores práticas disponíveis porém não garante resultados específicos em vendas ou leads pois esses dependem de fatores externos como mercado, produto e investimento em anúncios.

CLÁUSULA 6 — DOS ACESSOS
O CONTRATANTE fornecerá acesso às plataformas necessárias para execução dos serviços. A CONTRATADA se compromete a manter sigilo total sobre esses acessos.

CLÁUSULA 7 — DA APROVAÇÃO DE CONTEÚDO
Todo conteúdo será submetido para aprovação do CONTRATANTE com antecedência mínima de 2 dias úteis antes da publicação. O CONTRATANTE tem 24h para aprovar ou solicitar ajustes.

CLÁUSULA 8 — DA RESCISÃO
Rescisão antecipada pelo CONTRATANTE antes do término do prazo: multa de {percentual_multa}% sobre o valor restante do contrato.

CLÁUSULA 9 — DO FORO
Foro da Comarca de Alvorada, RS.

Alvorada, {data}.

CONTRATANTE: ___________________________
CONTRATADA — WebNovaX: ___________________________`,
  },
  {
    id: "landing-page",
    nome: "Landing Page",
    tipo: "projeto_unico",
    variaveis: [
      ...baseVars,
      ...projetoUnicoVars,
      { key: "finalidade", label: "Finalidade da Landing Page", type: "text" },
      { key: "numero_whatsapp", label: "WhatsApp do Cliente", type: "text" },
    ],
    corpo: `CONTRATO DE DESENVOLVIMENTO DE LANDING PAGE

CONTRATANTE: {nome_cliente}, {cpf_cnpj}, residente/sediado em {endereco}, doravante denominado CONTRATANTE.

CONTRATADA: WebNovaX, CNPJ {cnpj_webnovax}, sediada em Alvorada, RS, doravante denominada CONTRATADA.

CLÁUSULA 1 — DO OBJETO
A CONTRATADA se compromete a desenvolver uma landing page de alta conversão para {finalidade} incluindo: {lista_servicos}.

CLÁUSULA 2 — DO PRAZO
Prazo de entrega: {prazo_dias} dias úteis após aprovação do briefing e pagamento.

CLÁUSULA 3 — DO VALOR E PAGAMENTO
Valor total: R$ {valor_total}. Pagamento: {forma_pagamento}.

CLÁUSULA 4 — DAS REVISÕES
Incluídas {numero_revisoes} rodadas de revisão. Revisões adicionais: R$ {valor_revisao}/hora.

CLÁUSULA 5 — DA INTEGRAÇÃO COM WHATSAPP
A landing page incluirá botão de contato direto pelo WhatsApp com mensagem pré-configurada para o número {numero_whatsapp} do CONTRATANTE.

CLÁUSULA 6 — DOS DIREITOS
Após quitação total os direitos sobre a landing page são transferidos ao CONTRATANTE.

CLÁUSULA 7 — DA RESCISÃO
Multa de {percentual_multa}% após início do desenvolvimento.

CLÁUSULA 8 — DO FORO
Foro da Comarca de Alvorada, RS.

Alvorada, {data}.

CONTRATANTE: ___________________________
CONTRATADA — WebNovaX: ___________________________`,
  },
];

export function fillTemplate(corpo: string, values: Record<string, string>): string {
  let result = corpo;
  for (const [key, value] of Object.entries(values)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, "g"), value || `{${key}}`);
  }
  return result;
}


