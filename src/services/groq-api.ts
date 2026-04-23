import { invokeAdminFunction } from "@/lib/admin-function-client";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const CLIENT_API_KEY = import.meta.env.VITE_GROQ_API_KEY || "";
const REQUEST_TIMEOUT_MS = 25_000;
const DEFAULT_AI_ERROR_MESSAGE = "Nao foi possivel gerar a sugestao da IA agora.";

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

type ContractAiSuggestionResponse = {
  suggestion?: string;
};

function buildAbortSignal(timeoutMs: number) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

  return {
    signal: controller.signal,
    cleanup: () => window.clearTimeout(timeout),
  };
}

async function readErrorMessage(response: Response) {
  const contentType = response.headers.get("content-type") || "";

  try {
    if (contentType.includes("application/json")) {
      const payload = await response.json();
      return payload?.error?.message || payload?.message || "Falha na comunicacao com a IA.";
    }

    const text = await response.text();
    return text.trim() || "Falha na comunicacao com a IA.";
  } catch {
    return "Falha na comunicacao com a IA.";
  }
}

function hasClientApiKey() {
  return CLIENT_API_KEY.trim().length > 0;
}

function normalizeError(error: unknown, fallbackMessage = DEFAULT_AI_ERROR_MESSAGE) {
  if (error instanceof Error && error.message.trim()) {
    return error;
  }

  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
    return new Error(error.message.trim() || fallbackMessage);
  }

  if (typeof error === "string" && error.trim()) {
    return new Error(error.trim());
  }

  return new Error(fallbackMessage);
}

async function getDirectChatCompletion({
  model = "llama-3.3-70b-versatile",
  temperature = 0.7,
  max_tokens = 1024,
  messages,
}: GroqCompletionOptions) {
  if (!hasClientApiKey()) {
    throw new Error("A chave da IA nao esta configurada no frontend.");
  }

  const { signal, cleanup } = buildAbortSignal(REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CLIENT_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens,
      }),
      signal,
    });

    if (!response.ok) {
      throw new Error(await readErrorMessage(response));
    }

    const data = await response.json();
    const suggestion = data?.choices?.[0]?.message?.content?.trim();

    if (!suggestion) {
      throw new Error("A IA nao retornou nenhuma sugestao para este campo.");
    }

    return suggestion;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("A IA demorou demais para responder. Tente novamente.");
    }

    throw error;
  } finally {
    cleanup();
  }
}

async function getServerContractSuggestion(context: string, instruction: string, currentText: string) {
  const response = await invokeAdminFunction<ContractAiSuggestionResponse>("contract-ai-assistant", {
    body: { context, instruction, currentText },
    returnTo: "/admin/contratos",
    source: "contracts-ai-assistant",
    fallbackMessage: "Nao foi possivel gerar a sugestao da IA agora.",
  });

  const suggestion = response?.suggestion?.trim();
  if (!suggestion) {
    throw new Error("A IA nao retornou nenhuma sugestao para este campo.");
  }

  return suggestion;
}

export const groqService = {
  async getChatCompletion(options: GroqCompletionOptions) {
    return getDirectChatCompletion(options);
  },

  async helpWithContractField(context: string, instruction: string, currentText: string = "") {
    const systemPrompt = `Voce e um assistente juridico especializado em contratos de servicos digitais da NovaesWeb.
Sua tarefa e ajudar a redigir ou ajustar partes de um contrato (clausulas, escopo, observacoes).
Seja profissional, direto e utilize uma linguagem juridica moderna e clara.
Contexto do campo: ${context}
Texto atual (se houver): ${currentText}`;

    const messages: GroqMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: instruction },
    ];

    try {
      return await getServerContractSuggestion(context, instruction, currentText);
    } catch (serverError) {
      const normalizedServerError = normalizeError(serverError);

      if (!hasClientApiKey()) {
        throw normalizedServerError;
      }

      console.warn("[Groq] fallback para chamada direta no cliente", normalizedServerError);

      try {
        return await getDirectChatCompletion({ messages });
      } catch (clientError) {
        const normalizedClientError = normalizeError(clientError);

        throw new Error(
          `${normalizedServerError.message} Fallback do frontend: ${normalizedClientError.message}`,
        );
      }
    }
  },
};
