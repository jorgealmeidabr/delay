import { TeamStats } from './gemini';

export interface CalculatedStats {
  aproveitamento: number;
  mediaGm: number;
  mediaGs: number;
  vitorias: number;
  consistencia: number;
  pontos: number;
}

export interface FavoritismResult {
  statsA: CalculatedStats;
  statsB: CalculatedStats;
  favorito: 'A' | 'B' | 'Empate';
  pontosFavorito: number;
  pontosAzarao: number;
  resumo: string;
}

const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

export const calculateTeamStats = (stats: TeamStats): CalculatedStats => {
  // Aproveitamento (V: 3pts, E: 1pt) -> Max 30 pts em 10 jogos
  const pontosGanhos = (stats.vitorias * 3) + stats.empates;
  const aproveitamento = (pontosGanhos / 30) * 100;

  const mediaGm = stats.gols_marcados / 10;
  const mediaGs = stats.gols_sofridos / 10;
  
  // Normalizar Média de Gols Marcados (considerando 3 gols/jogo como 100%)
  const normGm = clamp((mediaGm / 3) * 100, 0, 100);
  
  // Normalizar Média de Gols Sofridos (inverso: 0 gols = 100%, 3 gols = 0%)
  const normGs = clamp(((3 - mediaGs) / 3) * 100, 0, 100);

  const normVitorias = (stats.vitorias / 10) * 100;
  const consistencia = (stats.jogos_sem_sofrer_gols / 10) * 100;

  // PESOS EXATOS: Aproveitamento(30%), GM(25%), GS(20%), Vitorias(15%), Consistencia(10%)
  const pontuacaoFinal = (aproveitamento * 0.30) +
                         (normGm * 0.25) +
                         (normGs * 0.20) +
                         (normVitorias * 0.15) +
                         (consistencia * 0.10);

  return {
    aproveitamento,
    mediaGm,
    mediaGs,
    vitorias: normVitorias,
    consistencia,
    pontos: Math.round(pontuacaoFinal)
  };
};

export const calculateFavoritism = (
  teamNameA: string,
  statsA: TeamStats,
  teamNameB: string,
  statsB: TeamStats
): FavoritismResult => {
  const calcA = calculateTeamStats(statsA);
  const calcB = calculateTeamStats(statsB);

  let favorito: 'A' | 'B' | 'Empate' = 'Empate';
  let pontosFavorito = calcA.pontos;
  let pontosAzarao = calcB.pontos;
  let favoritoName = '';

  if (calcA.pontos > calcB.pontos + 3) {
    favorito = 'A';
    pontosFavorito = calcA.pontos;
    pontosAzarao = calcB.pontos;
    favoritoName = teamNameA;
  } else if (calcB.pontos > calcA.pontos + 3) {
    favorito = 'B';
    pontosFavorito = calcB.pontos;
    pontosAzarao = calcA.pontos;
    favoritoName = teamNameB;
  }

  // Generate automated comparative summary
  let resumo = '';
  const advA = [];
  const advB = [];

  if (calcA.aproveitamento > calcB.aproveitamento) advA.push('melhor aproveitamento recente');
  else if (calcB.aproveitamento > calcA.aproveitamento) advB.push('melhor aproveitamento recente');

  if (calcA.mediaGm > calcB.mediaGm) advA.push('maior média ofensiva');
  else if (calcB.mediaGm > calcA.mediaGm) advB.push('maior média ofensiva');

  if (calcA.mediaGs < calcB.mediaGs) advA.push('defesa mais sólida');
  else if (calcB.mediaGs < calcA.mediaGs) advB.push('defesa mais sólida');

  if (statsA.derrotas < statsB.derrotas) advA.push('menor número de derrotas');
  else if (statsB.derrotas < statsA.derrotas) advB.push('menor número de derrotas');

  if (favorito === 'A') {
    resumo = `${favoritoName} é o Favorito Estatístico. A equipe possui ${advA.join(', ').replace(/, ([^,]*)$/, ' e $1')}.`;
  } else if (favorito === 'B') {
    resumo = `${favoritoName} é o Favorito Estatístico. A equipe possui ${advB.join(', ').replace(/, ([^,]*)$/, ' e $1')}.`;
  } else {
    resumo = `Confronto extremamente equilibrado. A tendência atual não aponta um favorito claro nos últimos 10 jogos.`;
  }

  return {
    statsA: calcA,
    statsB: calcB,
    favorito,
    pontosFavorito,
    pontosAzarao,
    resumo
  };
};
