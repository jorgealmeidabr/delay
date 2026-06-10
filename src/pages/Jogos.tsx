import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { scanGlobalMatches, GlobalMatch } from '../lib/gemini';
import { Button } from '../components/ui/Button';
import { Trophy, RefreshCw, AlertCircle, Play, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function JogosPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [matches, setMatches] = useState<GlobalMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sportTab, setSportTab] = useState<'Futebol' | 'Basquete'>('Futebol');
  const [visibleCount, setVisibleCount] = useState(15);

  const fetchMatches = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await scanGlobalMatches();
      setMatches(data || []);
      setVisibleCount(15);
    } catch (err: any) {
      setError(err.message || 'Falha ao buscar os jogos globais.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleSelect = (match: GlobalMatch) => {
    const gameName = `${match.timeCasa} x ${match.timeFora}`;
    localStorage.setItem('prefill_game', gameName);
    navigate(`/analise/busca?q=${encodeURIComponent(gameName)}`);
  };

  // Filtrar por esporte
  const filteredBySport = useMemo(() => {
    return matches.filter(m => m.esporte === sportTab);
  }, [matches, sportTab]);

  // Agrupar por campeonato
  const groupedMatches = useMemo(() => {
    const groups: Record<string, GlobalMatch[]> = {};
    filteredBySport.forEach(m => {
      if (!groups[m.campeonato]) groups[m.campeonato] = [];
      groups[m.campeonato].push(m);
    });

    // Ordenar os jogos dentro de cada grupo por horário
    Object.keys(groups).forEach(camp => {
      groups[camp].sort((a, b) => a.hora.localeCompare(b.hora));
    });

    // Transformar em array e ordenar grupos em ordem alfabética
    const sortedGroups = Object.keys(groups).map(camp => ({
      campeonato: camp,
      jogos: groups[camp]
    })).sort((a, b) => a.campeonato.localeCompare(b.campeonato));

    return sortedGroups;
  }, [filteredBySport]);

  // Nivelar (flatten) de volta para aplicar a paginação global
  const flatSortedMatches = useMemo(() => {
    let flat: GlobalMatch[] = [];
    groupedMatches.forEach(g => {
      flat = [...flat, ...g.jogos];
    });
    return flat;
  }, [groupedMatches]);

  const visibleMatches = flatSortedMatches.slice(0, visibleCount);
  const hasMore = visibleCount < flatSortedMatches.length;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Trophy className="text-[#00FF66] w-8 h-8" />
            Radar Global
            <span className="ml-2 text-[10px] font-bold bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/30 uppercase tracking-widest flex items-center gap-1">
              ✨ IA
            </span>
          </h1>
          <Button onClick={fetchMatches} variant="outline" className="text-gray-400 hover:text-white border-gray-700">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin text-[#00FF66]' : ''}`} />
            Varrer Novamente
          </Button>
        </div>

        {error && (
          <div className="bg-red-950/40 border border-red-500/40 rounded-xl p-4 flex items-center gap-3 text-red-300">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Abas de Esporte */}
        <div className="flex gap-2 border-b border-gray-800 pb-px">
          <button
            onClick={() => { setSportTab('Futebol'); setVisibleCount(15); }}
            className={`px-6 py-3 font-bold text-sm transition-colors border-b-2 ${sportTab === 'Futebol' ? 'border-[#00FF66] text-[#00FF66]' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
          >
            Futebol
          </button>
          <button
            onClick={() => { setSportTab('Basquete'); setVisibleCount(15); }}
            className={`px-6 py-3 font-bold text-sm transition-colors border-b-2 ${sportTab === 'Basquete' ? 'border-[#00FF66] text-[#00FF66]' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
          >
            Basquete
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-[#111] border border-gray-800 rounded-xl p-5 h-36 animate-pulse" />
            ))}
          </div>
        ) : flatSortedMatches.length === 0 ? (
          <div className="text-center py-20 border border-gray-800 rounded-xl bg-[#111] mt-4">
            <h2 className="text-xl font-bold mb-2">Nenhum evento encontrado</h2>
            <p className="text-gray-400">Não foram encontradas partidas de {sportTab} agendadas para hoje ou próximas 24h.</p>
          </div>
        ) : (
          <div className="space-y-8 mt-4">
            {groupedMatches.map(group => {
              // Filtrar os jogos deste grupo que estão visíveis pela paginação geral
              const groupVisibleMatches = group.jogos.filter(m => visibleMatches.includes(m));
              if (groupVisibleMatches.length === 0) return null;

              return (
                <div key={group.campeonato} className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-300 flex items-center gap-2 pb-2 border-b border-gray-800/50">
                    <span className="w-2 h-2 rounded-full bg-gray-500" />
                    {group.campeonato}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groupVisibleMatches.map(match => (
                      <div key={match.id} onClick={() => handleSelect(match)} className="bg-[#111] hover:bg-[#1A1A1A] transition border border-gray-800 hover:border-[#00FF66]/30 rounded-xl p-4 flex flex-col gap-3 cursor-pointer group">
                        <div className="flex justify-between items-center text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                          <span>{match.data}</span>
                          <span className="text-[#00FF66] bg-[#00FF66]/10 px-2 py-0.5 rounded">{match.hora}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 gap-2">
                          <span className="font-bold text-base truncate flex-1 text-right">{match.timeCasa}</span>
                          <span className="text-gray-600 text-xs flex-shrink-0">vs</span>
                          <span className="font-bold text-base truncate flex-1">{match.timeFora}</span>
                        </div>
                        <Button className="w-full mt-1 bg-[#00FF66]/10 text-[#00FF66] hover:bg-[#00FF66] hover:text-black transition text-sm h-9">
                          <Play className="w-3.5 h-3.5 mr-1.5" /> Analisar
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {hasMore && (
              <div className="flex justify-center pt-6 pb-10">
                <Button onClick={() => setVisibleCount(v => v + 15)} variant="outline" className="text-[#00FF66] border-[#00FF66]/30 hover:bg-[#00FF66]/10 gap-2 px-8">
                  <ChevronDown className="w-4 h-4" /> Carregar Mais Jogos
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
