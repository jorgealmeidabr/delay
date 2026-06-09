import { ApiResponse, Fixture } from '../types/api';

export type { Fixture };

const API_KEY = import.meta.env.VITE_API_FOOTBALL_KEY;
const BASE_URL = 'https://v3.football.api-sports.io';

// Supported Leagues: Brasileirão Série A (71), Champions League (2), Premier League (39)
const SUPPORTED_LEAGUES = '71,2,39';

// Mock data in case API key is missing or API fails
const MOCK_GAMES: Fixture[] = [
  {
    fixture: { id: 101, date: new Date().toISOString(), status: { long: 'First Half', short: '1H', elapsed: 32 } },
    league: { id: 71, name: 'Serie A', country: 'Brazil', logo: 'https://media.api-sports.io/football/leagues/71.png', flag: 'https://media.api-sports.io/flags/br.svg' },
    teams: {
      home: { id: 127, name: 'Flamengo', logo: 'https://media.api-sports.io/football/teams/127.png', winner: null },
      away: { id: 121, name: 'Palmeiras', logo: 'https://media.api-sports.io/football/teams/121.png', winner: null }
    },
    goals: { home: 1, away: 0 }
  },
  {
    fixture: { id: 102, date: new Date(Date.now() + 3600000).toISOString(), status: { long: 'Not Started', short: 'NS', elapsed: null } },
    league: { id: 2, name: 'UEFA Champions League', country: 'World', logo: 'https://media.api-sports.io/football/leagues/2.png', flag: null },
    teams: {
      home: { id: 50, name: 'Real Madrid', logo: 'https://media.api-sports.io/football/teams/541.png', winner: null },
      away: { id: 65, name: 'Manchester City', logo: 'https://media.api-sports.io/football/teams/50.png', winner: null }
    },
    goals: { home: null, away: null }
  }
];

export async function getLiveGames(): Promise<Fixture[]> {
  if (!API_KEY || API_KEY === 'your_api_football_key_here' || API_KEY === 'undefined') return MOCK_GAMES.filter((g: Fixture) => g.fixture.status.short !== 'NS');
  
  try {
    const res = await fetch(`${BASE_URL}/fixtures?live=all`, {
      headers: { 'x-apisports-key': API_KEY }
    });
    if (!res.ok) throw new Error('Failed to fetch live games');
    const data: ApiResponse = await res.json();
    return data.response.filter((g: Fixture) => SUPPORTED_LEAGUES.includes(g.league.id.toString()));
  } catch (error) {
    console.error(error);
    return MOCK_GAMES.filter((g: Fixture) => g.fixture.status.short !== 'NS');
  }
}

export async function getGamesByDate(dateStr: string): Promise<Fixture[]> {
  if (!API_KEY || API_KEY === 'your_api_football_key_here') return MOCK_GAMES;

  try {
    const res = await fetch(`${BASE_URL}/fixtures?date=${dateStr}&season=2024`, {
      headers: { 'x-apisports-key': API_KEY }
    });
    if (!res.ok) throw new Error('Failed to fetch daily games');
    const data: ApiResponse = await res.json();
    return data.response.filter((g: Fixture) => SUPPORTED_LEAGUES.includes(g.league.id.toString()));
  } catch (error) {
    console.error(error);
    return MOCK_GAMES;
  }
}

export async function getLiveGamesESPN(): Promise<Fixture[]> {
  try {
    const res = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/all/scoreboard');
    const data = await res.json();
    
    let liveEvents = data.events?.filter((e: any) => e.status.type.state === 'in') || [];
    
    // Fallback para mostrar algo se não houver jogos acontecendo agora mesmo
    if (liveEvents.length === 0 && data.events?.length > 0) {
      liveEvents = data.events.slice(0, 6);
    }

    return liveEvents.map((ev: any) => {
      const home = ev.competitions[0].competitors.find((c: any) => c.homeAway === 'home');
      const away = ev.competitions[0].competitors.find((c: any) => c.homeAway === 'away');
      
      let elapsedStr = ev.status.type.detail; // e.g. "41'"
      let elapsedNum = parseInt(elapsedStr.replace("'", ""));
      if (isNaN(elapsedNum)) elapsedNum = 0;

      return {
        fixture: {
          id: parseInt(ev.id),
          date: ev.date,
          status: {
            elapsed: elapsedStr.includes("'") ? elapsedNum : elapsedStr,
            short: ev.status.type.state === 'in' ? 'LIVE' : ev.status.type.state === 'post' ? 'FT' : 'NS'
          }
        },
        league: {
          name: ev.season?.slug || ev.competitions[0].type?.abbreviation || 'Futebol'
        },
        teams: {
          home: { name: home?.team?.name || 'Casa', logo: home?.team?.logo || '' },
          away: { name: away?.team?.name || 'Fora', logo: away?.team?.logo || '' }
        },
        goals: {
          home: home?.score ? parseInt(home.score) : 0,
          away: away?.score ? parseInt(away.score) : 0
        }
      } as Fixture;
    });
  } catch (err) {
    console.error("Erro na API da ESPN:", err);
    return [];
  }
}
