import { supabase } from "@/integrations/supabase/client";

const APIFY_ENDPOINT = "https://api.apify.com/v2";

/**
 * Inicia o script do Apify para buscar leads de negócios
 * Usaremos o actor compass/google-maps-scraper ou similar recomendado da plataforma
 */
export async function extractLeadsFromApify(
  searchQuery: string,
  token: string,
  limit: number = 20,
  onProgress?: (msg: string) => void
) {
  if (!token) throw new Error("Token do Apify é obrigatório");

  const actorId = "drobnikj~crawler-google-places"; // O scraper mais oficial e famoso de Google Maps do Apify

  try {
    // 1. Iniciar a extração (Run Actor)
    onProgress?.("Iniciando varredura no Google Maps...");
    const runRes = await fetch(`${APIFY_ENDPOINT}/acts/${actorId}/runs?token=${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        searchStringsArray: [searchQuery],
        maxCrawledPlacesPerSearch: limit,
        language: "pt",
        countryCode: "br",
        zoom: 12,
        proxyConfig: { useApifyProxy: true }
      })
    });

    if (!runRes.ok) {
      const err = await runRes.json();
      if (err.error?.type === 'not-enough-usage-to-run-paid-actor') {
        throw new Error("Saldo insuficiente no Apify! Você precisa adicionar créditos de uso/cartão na sua conta da Apify para rodar este extrator.");
      }
      throw new Error(err.error?.message || "Erro ao iniciar raspagem no Apify");
    }

    const runData = await runRes.json();
    const runId = runData.data.id;
    const defaultDatasetId = runData.data.defaultDatasetId;

    // 2. Fazer Polling até a extração terminar
    onProgress?.("Minerando dados de negócios (isso pode levar alguns minutos)...");
    let status = runData.data.status;
    let retries = 0;

    while (status !== "SUCCEEDED" && status !== "FAILED" && status !== "ABORTED" && status !== "TIMED-OUT") {
      await new Promise(r => setTimeout(r, 5000)); // check a cada 5 segundos
      retries++;
      if(retries > 60) throw new Error("Timeout: a extração demorou muito."); // 5 minutos timeout

      const checkRes = await fetch(`${APIFY_ENDPOINT}/acts/${actorId}/runs/${runId}?token=${token}`);
      const checkData = await checkRes.json();
      status = checkData.data.status;
    }

    if (status !== "SUCCEEDED") {
      throw new Error("A raspagem falhou ou foi abortada no Apify. Status: " + status);
    }

    // 3. Puxar os resultados do Dataset
    onProgress?.("Varrer concluído! Importando contatos encontrados...");
    const datasetRes = await fetch(`${APIFY_ENDPOINT}/datasets/${defaultDatasetId}/items?token=${token}&clean=true`);
    const dataset = await datasetRes.json();

    if (!dataset || dataset.length === 0) {
      return { success: true, count: 0, message: "A busca terminou, mas nenhum negócio foi encontrado." };
    }

    // 4. Salvar os resultados no Supabase `leads`
    onProgress?.("Salvando leads no painel inteligente...");
    let inseridos = 0;

    for (const item of dataset) {
      // Filtrar apenas se tiver algum meio de contato (telefone ou site)
      if (!item.phoneUnformatted && !item.phone && !item.website && !item.reviewsCount) {
        continue;
      }

      const rawPhone = item.phoneUnformatted || item.phone || "";
      const cleanedPhone = rawPhone.replace(/\D/g, "");

      // Evitar erros de campos nulos
      const novoLead = {
        nome: item.title || "Agência/Local sem nome",
        email: "Não informado (Buscar no site)", // Apify google maps scraper nem sempre traz email direto
        whatsapp: cleanedPhone || "Não informado",
        cidade: item.city || item.neighborhood || null,
        estado: item.state || null,
        nome_negocio: item.title,
        segmento: item.categoryName || null,
        status: "novo",
        mensagem: `Lead importado do Apify.\nSite: ${item.website || "Sem site"}\nEndereço: ${item.address || "Sem Endereço"}\nAvaliação: ${item.totalScore || 0} (${item.reviewsCount || 0} avaliações)\nEncontrado buscando por: "${searchQuery}"`,
        visualizado: false
      };

      // Inserir lead se nome tiver tamanho razoável
      if (novoLead.nome && novoLead.nome.length > 2) {
         await supabase.from("leads").insert(novoLead);
         inseridos++;
      }
    }

    return { 
      success: true, 
      count: inseridos, 
      message: `Tudo pronto! ${inseridos} novos leads foram adicionados ao seu painel.` 
    };

  } catch (err: any) {
    throw new Error(err.message || "Falha grave de integração com o Apify");
  }
}
