export function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function formatCep(value: string) {
  const digits = onlyDigits(value).slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function formatPhone(value: string) {
  const digits = onlyDigits(value).slice(0, 11);

  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function formatCpfCnpj(value: string) {
  const digits = onlyDigits(value).slice(0, 14);

  if (digits.length <= 11) {
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  }

  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  if (digits.length <= 14) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
  return digits;
}

export function getDocumentoProgressText(value: string) {
  const digits = onlyDigits(value);

  if (!digits.length) return "";

  if (digits.length <= 11) {
    const remaining = Math.max(11 - digits.length, 0);
    return remaining > 0
      ? `Faltam ${remaining} número${remaining > 1 ? "s" : ""} para completar o CPF.`
      : "CPF completo.";
  }

  const remaining = Math.max(14 - digits.length, 0);
  return remaining > 0
    ? `Faltam ${remaining} número${remaining > 1 ? "s" : ""} para completar o CNPJ.`
    : "CNPJ completo.";
}

export function getPhoneProgressText(value: string) {
  const digits = onlyDigits(value);
  if (!digits.length) return "";

  const expectedLength = digits.length > 10 ? 11 : 10;
  const remaining = Math.max(expectedLength - digits.length, 0);

  return remaining > 0
    ? `Faltam ${remaining} dígito${remaining > 1 ? "s" : ""} para completar o número.`
    : "Número completo.";
}

export function normalizeEmailSuggestion(value: string) {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed.includes("@")) return trimmed;

  const [localPart, domainPart] = trimmed.split("@");
  if (!localPart || !domainPart || domainPart.includes(".")) return trimmed;

  const commonDomains: Record<string, string> = {
    gmail: "gmail.com",
    hotmail: "hotmail.com",
    outlook: "outlook.com",
    live: "live.com",
    yahoo: "yahoo.com",
    icloud: "icloud.com",
    bol: "bol.com.br",
    uol: "uol.com.br",
  };

  const normalizedDomain = commonDomains[domainPart] || `${domainPart}.com`;
  return `${localPart}@${normalizedDomain}`;
}

export async function fetchAddressByCep(value: string) {
  const digits = onlyDigits(value);
  if (digits.length !== 8) return null;

  const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);

  if (!response.ok) {
    throw new Error("Não foi possível consultar o CEP agora.");
  }

  const data = await response.json();

  if (data?.erro) {
    return null;
  }

  return {
    endereco: data.logradouro || "",
    bairro: data.bairro || "",
    cidade: data.localidade || "",
    estado: data.uf || "",
    complemento: data.complemento || "",
  };
}
