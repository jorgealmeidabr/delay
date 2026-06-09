import { GoogleGenerativeAI } from "@google/generative-ai";

export interface Transmissao {
  plataforma: string;
  canal: string;
  link: string;
  delay_estimado_segundos: number;
  confianca: 'alta' | 'media' | 'baixa';
  fonte_do_delay: string;
}

export interface Probabilidades {
  vitoria_casa: number;
  empate: number;
  vitoria_fora: number;
  analise_rigorosa: string;
}

export interface TeamStats {
  vitorias: number;
  empates: number;
  derrotas: number;
  gols_marcados: number;
  gols_sofridos: number;
  jogos_sem_sofrer_gols: number;
}

export interface JogoTransmissaoData {
  jogo: string;
  data_hora: string;
  transmissoes: Transmissao[];
  probabilidades?: Probabilidades;
  estatisticas_recentes?: {
    timeA: TeamStats;
    timeB: TeamStats;
  };
  resumo: string;
}

export interface GeminiResponse {
  success: boolean;
  data?: JogoTransmissaoData;
  error?: string;
}

export interface GlobalMatch {
  id: string;
  esporte: 'Futebol' | 'Basquete';
  campeonato: string;
  timeCasa: string;
  timeFora: string;
  data: string;
  hora: string;
}


export async function searchLiveStreams(gameName: string): Promise<GeminiResponse> {
  const cacheKey = `gemini_delay_${gameName}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      const parsedCache = JSON.parse(cached);
      if (Date.now() - parsedCache.timestamp < 10 * 60 * 1000) { // 10 min cache
        return parsedCache.data;
      }
    } catch(e) {}
  }

  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      return { success: false, error: 'Chave da API do Gemini não configurada.' };
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      tools: [ { googleSearch: {} } as any ],
    });

    const prompt = `Você é um analista esportivo implacável e especialista em transmissões ao vivo. Pesquise agora na internet as transmissões reais do jogo: [${gameName}].
Para cada transmissão encontrada, retorne um JSON com este formato exato:
{
  "jogo": "nome do jogo",
  "data_hora": "horário encontrado",
  "probabilidades": {
    "vitoria_casa": probabilidade em % (numero inteiro),
    "empate": probabilidade em % (numero),
    "vitoria_fora": probabilidade em % (numero),
    "analise_rigorosa": "Sua análise tática fria, calculista e rigorosa justificando quem deve ganhar e por que o outro time falhará."
  },
  "estatisticas_recentes": {
    "timeA": {
      "vitorias": numero de vitorias nos ultimos 10 jogos,
      "empates": numero de empates,
      "derrotas": numero de derrotas,
      "gols_marcados": total de gols feitos nestes 10 jogos,
      "gols_sofridos": total de gols sofridos,
      "jogos_sem_sofrer_gols": total de jogos sem tomar gol (clean sheets)
    },
    "timeB": {
      "vitorias": numero de vitorias nos ultimos 10 jogos,
      "empates": numero de empates,
      "derrotas": numero de derrotas,
      "gols_marcados": total de gols feitos nestes 10 jogos,
      "gols_sofridos": total de gols sofridos,
      "jogos_sem_sofrer_gols": total de jogos sem tomar gol (clean sheets)
    }
  },
  "transmissoes": [
    {
      "plataforma": "plataforma",
      "canal": "nome do canal",
      "link": "URL EXATA DIRETA do player de vídeo ou live (DEEP LINK). Se não encontrar o link exato para a partida, use '#'",
      "delay_estimado_segundos": numero inteiro do delay,
      "confianca": "alta/media/baixa",
      "fonte_do_delay": "Sua justificativa da análise de rede"
    }
  ],
  "resumo": "Análise real das transmissões e latências"
}
Seja estrito na URL: NUNCA retorne o link da home do site (como youtube.com), apenas a URL direta do vídeo.
Retorne APENAS o JSON.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    const cleanedText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsedJson = JSON.parse(cleanedText);
    
    const finalData = { success: true, data: parsedJson };
    localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data: finalData }));
    return finalData;

  } catch (error: any) {
    console.error("Erro na API Gemini:", error);
    const msg = error?.message || '';
    if (msg.includes('429')) return { success: false, error: 'Limite do Gemini atingido. Aguarde alguns segundos.' };
    if (msg.includes('503')) return { success: false, error: 'Servidor do Google sobrecarregado. Tente novamente.' };
    return { success: false, error: 'Erro ao analisar: ' + msg };
  }
}

export async function scanGlobalMatches(): Promise<GlobalMatch[]> {
  const cacheKey = 'gemini_global_matches_cache';
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      const parsedCache = JSON.parse(cached);
      // Cache de 30 minutos para evitar esgotamento da API
      if (Date.now() - parsedCache.timestamp < 30 * 60 * 1000) {
        return parsedCache.data;
      }
    } catch(e) {}
  }

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error('Chave Gemini não configurada');

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    tools: [{ googleSearch: {} } as any],
  });

  const prompt = `Atue como um radar esportivo global avançado.
Seu objetivo é encontrar o MAIOR VOLUME POSSÍVEL de partidas REAIS de Futebol e Basquete que estão agendadas para HOJE e para as PRÓXIMAS 24 HORAS. Não invente ou crie jogos fictícios.
Faça uma varredura rigorosa.

PRIORIZE ABSOLUTAMENTE as seguintes ligas:
FUTEBOL: Brasil (todas divisões), Libertadores, Sul-Americana, Champions League, Europa League, Premier League, La Liga, Serie A Itália, Bundesliga, Ligue 1, MLS, Argentina, México e principais da Ásia.
BASQUETE: NBA, WNBA, EuroLeague, NBB, NCAA, e principais ligas europeias.

Instruções críticas:
1. Retorne os dados EXCLUSIVAMENTE em formato de array JSON.
2. Remova duplicidades.
3. Não limite a resposta a poucos jogos. Traga todos os eventos relevantes que conseguir encontrar.

O JSON retornado deve seguir rigorosamente esta estrutura:
[
  {
    "id": "gere um id unico simples, ex: fut_bra_1",
    "esporte": "Futebol" ou "Basquete",
    "campeonato": "Nome Oficial do Campeonato",
    "timeCasa": "Nome do Time Mandante",
    "timeFora": "Nome do Time Visitante",
    "data": "DD/MM/YYYY",
    "hora": "HH:MM"
  }
]
Apenas retorne o JSON e nada mais. Nenhuma formatação markdown.`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanedText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const data = JSON.parse(cleanedText) as GlobalMatch[];
    
    if (data && data.length > 0) {
      localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data }));
    }
    return data;
  } catch (e: any) {
    console.error("Failed to fetch/parse global matches:", e);
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes('429')) {
      throw new Error('Limite de requisições gratuitas da API excedido. Aguarde alguns minutos ou utilize o cache atual.');
    }
    if (msg.includes('503')) {
      throw new Error('O modelo do Gemini está sobrecarregado no momento (Erro 503). Tente novamente em alguns segundos.');
    }
    throw new Error('Falha ao buscar a varredura de jogos via Gemini: ' + msg);
  }
}

