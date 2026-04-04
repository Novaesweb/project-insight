import { supabase } from "@/integrations/supabase/client";

export interface AsaasPaymentPayload {
  customer: string;
  billingType: "BOLETO" | "CREDIT_CARD" | "PIX" | "UNDEFINED";
  value: number;
  dueDate: string;
  description: string;
  externalReference?: string;
  postalService?: boolean;
}

export interface AsaasCustomerPayload {
  name: string;
  email?: string;
  cpfCnpj?: string;
  mobilePhone?: string;
  externalReference?: string;
}

export class AsaasService {
  private static async getConfig() {
    const { data } = await supabase
      .from("app_config")
      .select("key, value")
      .in("key", ["asaas_api_key", "asaas_environment"]);

    const apiKey = data?.find((c) => c.key === "asaas_api_key")?.value;
    const env = data?.find((c) => c.key === "asaas_environment")?.value || "sandbox";

    return { apiKey, env };
  }

  private static getBaseUrl(env: string) {
    return env === "production"
      ? "https://api.asaas.com/v3"
      : "https://sandbox.asaas.com/api/v3";
  }

  /**
   * Faz uma requisição para a API do Asaas via Supabase Edge Function (Ponte Segura)
   */
  private static async request(path: string, method: string = "GET", body?: any) {
    const { data, error } = await supabase.functions.invoke('asaas-api', {
      body: { 
        path: path.startsWith('/') ? path.substring(1) : path, 
        method, 
        body 
      }
    });

    if (error) {
      console.error("Erro na Edge Function do Asaas:", error.message);
      // Tenta extrair a mensagem de erro detalhada
      let errorMessage = "Falha na ponte de comunicação com o Asaas.";
      try {
        const errorJson = await error.context?.json();
        errorMessage = errorJson?.error || errorJson?.errors?.[0]?.description || error.message;
      } catch (e) {
        errorMessage = error.message;
      }
      throw new Error(errorMessage);
    }

    if (data?.errors) {
      throw new Error(data.errors[0]?.description || "Erro na API do Asaas.");
    }

    return data;
  }

  /**
   * Cria ou busca um cliente pelo documento ou email
   */
  static async getOrCreateCustomer(payload: AsaasCustomerPayload) {
    // Tenta buscar por CPF/CNPJ se disponível
    if (payload.cpfCnpj) {
      const search = await this.request(`/customers?cpfCnpj=${payload.cpfCnpj}`);
      if (search.data && search.data.length > 0) {
        // Se encontrou, verifica se precisa atualizar com CPF/CNPJ
        const customer = search.data[0];
        if (!customer.cpfCnpj && payload.cpfCnpj) {
          const updated = await this.request(`/customers/${customer.id}`, "POST", {
            cpfCnpj: payload.cpfCnpj,
            mobilePhone: payload.mobilePhone,
            externalReference: payload.externalReference
          });
          return updated;
        }
        return customer;
      }
    }
    
    // Senão, busca por email
    if (payload.email) {
      const search = await this.request(`/customers?email=${encodeURIComponent(payload.email)}`);
      if (search.data && search.data.length > 0) {
        // Se encontrou, verifica se precisa atualizar com CPF/CNPJ
        const customer = search.data[0];
        if (!customer.cpfCnpj && payload.cpfCnpj) {
          const updated = await this.request(`/customers/${customer.id}`, "POST", {
            cpfCnpj: payload.cpfCnpj,
            mobilePhone: payload.mobilePhone,
            externalReference: payload.externalReference
          });
          return updated;
        }
        return customer;
      }
    }
    
    // Senão, cria novo
    return this.request("/customers", "POST", payload);
  }

  /**
   * Atualiza um cliente existente no Asaas
   */
  static async updateCustomer(id: string, payload: Partial<AsaasCustomerPayload>) {
    return this.request(`/customers/${id}`, "POST", payload);
  }

  /**
   * Cria uma nova cobrança
   */
  static async createPayment(payload: AsaasPaymentPayload) {
    return this.request("/payments", "POST", payload);
  }

  /**
   * Busca detalhes de uma cobrança
   */
  static async getPayment(id: string) {
    return this.request(`/payments/${id}`);
  }
}
