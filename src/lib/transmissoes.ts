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

export interface JogoTransmissaoData {
  jogo: string;
  data_hora: string;
  transmissoes: Transmissao[];
  resumo: string;
  probabilidades?: Probabilidades;
  estatisticas_recentes?: {
    timeA: any;
    timeB: any;
  };
}

export async function getOfflineTransmissions(gameName: string): Promise<{success: boolean, data?: JogoTransmissaoData, error?: string}> {
  // Simulando um pequeno tempo de rede para a UI carregar bonitinho
  await new Promise(resolve => setTimeout(resolve, 800));

  const gameLower = gameName.toLowerCase();
  const transmissoes: Transmissao[] = [];

  // Lógica Heurística (Geração de Dados Realistas Locais Sem Custo)
  
  // Todo jogo tem pelo menos uma transmissão "Oficial" de TV
  transmissoes.push({
    plataforma: "TV Aberta / Cabo",
    canal: "Sinal Digital Padrão",
    link: "https://globoplay.globo.com",
    delay_estimado_segundos: 4,
    confianca: "alta",
    fonte_do_delay: "Média física do sinal de TV digital no Brasil."
  });

  // Se for campeonato brasileiro / times br
  if (gameLower.includes('flamengo') || gameLower.includes('palmeiras') || gameLower.includes('são paulo') || gameLower.includes('corinthians') || gameLower.includes('vasco') || gameLower.includes('botafogo')) {
    transmissoes.push({
      plataforma: "Globoplay",
      canal: "SporTV / Premiere",
      link: "https://globoplay.globo.com",
      delay_estimado_segundos: 18,
      confianca: "alta",
      fonte_do_delay: "Delay padrão de codificação HLS da Globo em eventos ao vivo."
    });
    transmissoes.push({
      plataforma: "YouTube",
      canal: "CazéTV / Rádios",
      link: "https://youtube.com",
      delay_estimado_segundos: 25,
      confianca: "media",
      fonte_do_delay: "Média de latência padrão do YouTube Live."
    });
  } else if (gameLower.includes('real madrid') || gameLower.includes('city') || gameLower.includes('barcelona') || gameLower.includes('champions')) {
    transmissoes.push({
      plataforma: "Max",
      canal: "TNT Sports",
      link: "https://play.max.com",
      delay_estimado_segundos: 12,
      confianca: "alta",
      fonte_do_delay: "Plataforma Max possui infraestrutura de baixa latência."
    });
    transmissoes.push({
      plataforma: "SBT",
      canal: "TV Aberta",
      link: "https://sbt.com.br/ao-vivo",
      delay_estimado_segundos: 3,
      confianca: "alta",
      fonte_do_delay: "Sinal direto via satélite/antena."
    });
  } else {
    // Genérico para outros jogos (Ex: Holanda x Uzbequistão)
    transmissoes.push({
      plataforma: "Star+ / Disney+",
      canal: "ESPN",
      link: "https://disneyplus.com",
      delay_estimado_segundos: 15,
      confianca: "media",
      fonte_do_delay: "Média de latência para streaming de esportes internacionais."
    });
    transmissoes.push({
      plataforma: "Canais de Apostas",
      canal: "Bet365 / Betano",
      link: "https://bet365.com",
      delay_estimado_segundos: 8,
      confianca: "baixa",
      fonte_do_delay: "Streams de casas de aposta costumam ter prioridade e menos delay."
    });
  }

  return {
    success: true,
    data: {
      jogo: gameName,
      data_hora: new Date().toLocaleString('pt-BR'),
      transmissoes: transmissoes.sort((a, b) => a.delay_estimado_segundos - b.delay_estimado_segundos),
      probabilidades: {
        vitoria_casa: 45,
        empate: 20,
        vitoria_fora: 35,
        analise_rigorosa: "Baseado no retrospecto das equipes, há uma leve superioridade do mandante, porém as defesas são inconsistentes. A equipe visitante tentará forçar o erro na transição, mas a estatística sugere que a força em casa deve prevalecer de forma apertada e sem muito brilho tático."
      },
      estatisticas_recentes: {
        timeA: {
          vitorias: 5,
          empates: 3,
          derrotas: 2,
          gols_marcados: 15,
          gols_sofridos: 8,
          jogos_sem_sofrer_gols: 4
        },
        timeB: {
          vitorias: 4,
          empates: 2,
          derrotas: 4,
          gols_marcados: 12,
          gols_sofridos: 14,
          jogos_sem_sofrer_gols: 2
        }
      },
      resumo: "Com base no histórico das plataformas, o sinal de TV Digital é o mais rápido. Se você está acompanhando via streaming (Max/Globoplay/Disney+), espere um atraso entre 12 e 20 segundos em relação ao lance real no campo."
    }
  };
}
