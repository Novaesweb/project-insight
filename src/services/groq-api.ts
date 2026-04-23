const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// A chave será buscada do ambiente, mas podemos ter um fallback para desenvolvimento se necessário
// IMPORTANTE: Em produção, o ideal é usar Supabase Edge Functions para não expor a chave no cliente.
const API_KEY = import.meta.env.VITE_GROQ_API_KEY || "";

export interface GroqMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface GroqCompletionOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  messages: GroqMessage[];
}

export const groqService = {
  async getChatCompletion({
    model = "llama-3.3-70b-versatile",
    temperature = 0.7,
    max_tokens = 1024,
    messages
  }: GroqCompletionOptions) {
    if (!API_KEY) {
      console.error("Groq API Key não configurada no ambiente (VITE_GROQ_API_KEY).");
    }

    console.log(`[Groq] Enviando requisição para ${model}...`);

    try {
      const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Falha na comunicação com a API do Groq");
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || "";
    } catch (error) {
      console.error("Erro no serviço Groq:", error);
      throw error;
    }
  },

  /**
   * Atalho para gerar ou ajustar cláusulas contratuais
   */
  async helpWithContractField(context: string, instruction: string, currentText: string = "") {
    const systemPrompt = `Você é um assistente jurídico especializado em contratos de serviços digitais da NovaesWeb.
Sua tarefa é ajudar a redigir ou ajustar partes de um contrato (cláusulas, escopo, observações).
Seja profissional, direto e utilize uma linguagem jurídica moderna e clara.
Contexto do campo: ${context}
Texto atual (se houver): ${currentText}`;

    const userPrompt = instruction;

    return this.getChatCompletion({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]
    });
  }
};
