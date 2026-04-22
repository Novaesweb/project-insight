export interface ContractVariable {
  key: string;
  label: string;
  type: "text" | "number" | "date" | "textarea";
  defaultValue?: string;
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

const baseVariables: ContractVariable[] = [
  { key: "nome_cliente", label: "Nome do cliente", type: "text" },
  { key: "cpf_cliente", label: "CPF/CNPJ do cliente", type: "text" },
  { key: "telefone_cliente", label: "Telefone do cliente", type: "text" },
  { key: "email_cliente", label: "E-mail do cliente", type: "text" },
  { key: "endereco_cliente", label: "Endereço do cliente", type: "text" },
  { key: "cidade_estado", label: "Cidade e estado", type: "text" },
  { key: "numero_contrato", label: "Número do contrato", type: "text" },
  { key: "data_emissao", label: "Data de emissão", type: "date" },
  { key: "data_inicio", label: "Data de início", type: "date" },
  { key: "vencimento", label: "Vencimento", type: "date" },
  { key: "plano", label: "Plano", type: "text" },
  { key: "valor_base", label: "Valor base", type: "text" },
  { key: "lista_extras", label: "Lista de extras", type: "textarea" },
  { key: "valor_extras", label: "Valor dos extras", type: "text" },
  { key: "valor_total", label: "Valor total", type: "text" },
  { key: "clausulas_adicionais", label: "Cláusulas Adicionais", type: "textarea" },
  { key: "observacoes", label: "Observações", type: "textarea" },
  { key: "nome_contratada", label: "Nome da contratada", type: "text" },
  { key: "documento_contratada", label: "Documento da contratada", type: "text" },
  { key: "endereco_contratada", label: "Endereço da contratada", type: "text" },
];

export const contractTemplates: ContractTemplate[] = [
  {
    id: "novaesweb-contrato-mestre",
    nome: "Contrato Dinâmico NovaesWeb",
    tipo: "contrato_mestre",
    variaveis: baseVariables,
    corpo: `CONTRATO DE PRESTACAO DE SERVICOS DIGITAIS NOVAESWEB

NUMERO DO CONTRATO
{{numero_contrato}}

PARTES

CONTRATANTE
{{nome_cliente}}, inscrito(a) sob o documento {{cpf_cliente}}, com contato principal em {{telefone_cliente}} e e-mail {{email_cliente}}, residente ou sediado(a) em {{endereco_cliente}}, {{cidade_estado}}.

CONTRATADA
{{nome_contratada}}, documento {{documento_contratada}}, com endereço em {{endereco_contratada}}.

OBJETO
Este instrumento formaliza a prestação dos serviços digitais contratados junto à NovaesWeb, conforme plano, extras e observações abaixo.

DADOS COMERCIAIS
- Data de emissão: {{data_emissao}}
- Data de início: {{data_inicio}}
- Vencimento: {{vencimento}}
- Plano principal: {{plano}}
- Valor base: {{valor_base}}
- Valor dos extras: {{valor_extras}}
- Valor total do contrato: {{valor_total}}

EXTRAS VINCULADOS
{{lista_extras}}

OBSERVACOES
{{observacoes}}

CLAUSULA 1 - DO ESCOPO
O escopo contratado compreende o plano principal indicado acima, bem como os extras vinculados e descritos neste documento.

CLAUSULA 2 - DOS DADOS DO CLIENTE
Os dados do cliente utilizados neste contrato são preenchidos automaticamente a partir do cadastro administrativo e podem receber complementos pontuais antes do envio final.

CLAUSULA 3 - DOS EXTRAS
Cada extra listado neste contrato possui descrição, valor e cláusula específica, passando a integrar formalmente o escopo aprovado.

CLAUSULA 4 - DOS VALORES
O valor total deste contrato corresponde à soma do valor base com todos os extras ativos vinculados ao cliente.

CLAUSULA 5 - DO ACEITE
Após revisão e aprovação, o contrato poderá ser enviado ao portal do cliente para leitura, solicitação de ajuste, assinatura eletrônica, ativação e encerramento do ciclo operacional.

CLAUSULA 6 - DAS DISPOSICOES GERAIS
Qualquer ajuste estrutural, item não previsto, mudança de escopo ou necessidade técnica adicional poderá gerar novo orçamento, revisão contratual ou aditivo.

{{clausulas_adicionais}}

Canoas/RS, {{data_emissao}}.
`,
  },
];

export function fillTemplate(corpo: string, values: Record<string, string>) {
  let result = corpo;

  for (const [key, value] of Object.entries(values)) {
    const safeValue = sanitizeTemplateValue(value);
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), safeValue || `{{${key}}}`);
    result = result.replace(new RegExp(`\\{${key}\\}`, "g"), safeValue || `{${key}}`);
  }

  return result;
}

export function getContractTypeLabel(_tipo?: ContractTemplate["tipo"]) {
  return "Contrato Dinâmico";
}
