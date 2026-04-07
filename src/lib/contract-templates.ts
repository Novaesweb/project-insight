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
  tipo: "projeto_unico" | "recorrente_mensal" | "contrato_mestre";
  variaveis: ContractVariable[];
  corpo: string;
}

const baseVars: ContractVariable[] = [
  { key: "nome_cliente", label: "Nome do Cliente", type: "text", autoFill: "nome_cliente" },
  { key: "cpf_cnpj", label: "CPF/CNPJ do Cliente", type: "text", autoFill: "cpf_cnpj" },
  { key: "endereco", label: "Endereço do Cliente", type: "text", autoFill: "endereco" },
  { key: "cnpj_novaesweb", label: "CNPJ novaesweb", type: "text", defaultValue: "" },
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
  { key: "cidade_foro", label: "Cidade do Foro", type: "text", autoFill: "cidade_foro", defaultValue: "Alvorada" },
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
  { key: "percentual_multa", label: "Percentual de Multa Rescisória (%)", type: "number", defaultValue: "30" },
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

1.3. Integra ainda o presente contrato o resumo comercial abaixo, com os itens inclusos e não inclusos no pacote contratado:

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
6.1. O inadimplemento de qualquer parcela ou mensalidade sujeitará o CONTRATANTE à incidência de multa, juros, correção e demais encargos legais cabíveis, sem prejuízo da multa contratual prevista neste instrumento.
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
11.1. Em caso de cancelamento imotivado pelo CONTRATANTE após o início dos trabalhos, será devida multa rescisória não compensatória de {percentual_multa}% sobre o valor remanescente do contrato, sem prejuízo da retenção proporcional dos valores referentes às etapas já executadas, horas técnicas consumidas, materiais produzidos e custos operacionais já incorridos.
11.2. Nos serviços recorrentes, a rescisão deverá observar aviso prévio mínimo de 30 (trinta) dias, permanecendo exigíveis os valores vencidos, proporcionais e obrigações já assumidas até a data efetiva do encerramento.
11.3. Em caso de descumprimento contratual grave, inadimplência reiterada, uso indevido da estrutura, fraude, má-fé ou exigências incompatíveis com a proposta aprovada, a CONTRATADA poderá rescindir o contrato de forma imediata, preservando o direito de cobrança dos valores devidos.

CLÁUSULA 12 — DO SIGILO, DADOS E CONFORMIDADE
12.1. As partes comprometem-se a manter sigilo sobre informações estratégicas, comerciais, operacionais, dados, acessos e documentos trocados em razão deste contrato.
12.2. Os dados eventualmente tratados pela CONTRATADA serão utilizados apenas para execução do objeto contratado, atendimento operacional, suporte, cobrança e obrigações correlatas.
12.3. O CONTRATANTE declara ciência de que é responsável pela veracidade das informações, materiais e bases de dados fornecidos, bem como pela regularidade de seu uso.

CLÁUSULA 13 — DAS OBSERVAÇÕES COMERCIAIS
13.1. As partes reconhecem e integram ao presente contrato as seguintes observações comerciais: {observacoes_comerciais}.

CLÁUSULA 14 — DO FORO
14.1. Fica eleito o foro da Comarca de {cidade_foro}/{estado_foro}, com renúncia expressa a qualquer outro, por mais privilegiado que seja, para dirimir dúvidas ou controvérsias oriundas deste contrato.

E, por estarem justas e contratadas, as partes firmam o presente instrumento.

{cidade_foro}/{estado_foro}, {data}.

CONTRATANTE: ___________________________
CONTRATADA: ___________________________`,
  },
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

CONTRATADA: novaesweb, CNPJ {cnpj_novaesweb}, sediada em Alvorada, RS, doravante denominada CONTRATADA.

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
CONTRATADA — novaesweb: ___________________________`,
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

CONTRATADA: novaesweb, CNPJ {cnpj_novaesweb}, sediada em Alvorada, RS, doravante denominada CONTRATADA.

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
CONTRATADA — novaesweb: ___________________________`,
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

CONTRATADA: novaesweb, CNPJ {cnpj_novaesweb}, sediada em Alvorada, RS, doravante denominada CONTRATADA.

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
CONTRATADA — novaesweb: ___________________________`,
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

CONTRATADA: novaesweb, CNPJ {cnpj_novaesweb}, sediada em Alvorada, RS, doravante denominada CONTRATADA.

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
CONTRATADA — novaesweb: ___________________________`,
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

CONTRATADA: novaesweb, CNPJ {cnpj_novaesweb}, sediada em Alvorada, RS, doravante denominada CONTRATADA.

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
CONTRATADA — novaesweb: ___________________________`,
  },
];

export function fillTemplate(corpo: string, values: Record<string, string>): string {
  let result = corpo;
  for (const [key, value] of Object.entries(values)) {
    const nextValue = /^\d{4}-\d{2}-\d{2}$/.test(value || "")
      ? new Date(`${value}T00:00:00`).toLocaleDateString("pt-BR")
      : value;
    result = result.replace(new RegExp(`\\{${key}\\}`, "g"), nextValue || `{${key}}`);
  }
  return result;
}

export function getContractTypeLabel(tipo: ContractTemplate["tipo"]) {
  if (tipo === "projeto_unico") return "Projeto Único";
  if (tipo === "recorrente_mensal") return "Recorrente Mensal";
  return "Contrato Mestre";
}



