import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { Search, Zap, AlertTriangle, BarChart2 } from 'lucide-react';
import { searchLiveStreams, JogoTransmissaoData } from '../lib/gemini';
import { getOfflineTransmissions } from '../lib/transmissoes';
import { logAction } from '../lib/audit';
import ResultsPanel from '../components/ResultsPanel';
import { Button } from '../components/ui/Button';

export default function AnalisePage() {
  const { gameId } = useParams();
  const [searchParams] = useSearchParams();
  const queryQ = searchParams.get('q');
  
  const [gameName, setGameName] = useState('');
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<'gemini' | 'local' | null>(null);

  useEffect(() => {
    const initialSearch = queryQ || localStorage.getItem('prefill_game') || '';
    if (initialSearch) {
      setGameName(initialSearch);
      localStorage.removeItem('prefill_game');
      handleSearch(initialSearch);
    }
  }, [queryQ]);

  const handleSearch = async (name: string) => {
    if (!name.trim()) return;
    setLoading(true);
    setResult(null);
    setDataSource(null);

    // 1. Tenta análise real via Gemini + Google Search
    const geminiResult = await searchLiveStreams(name);
    logAction('Análise', 'Busca de Transmissão', name, undefined, geminiResult.success ? 'Sucesso via Gemini' : 'Fallback local');

    if (geminiResult.success && geminiResult.data) {
      setResult(geminiResult);
      setDataSource('gemini');
      setLoading(false);
      return;
    }

    // 2. Fallback: motor heurístico local
    console.warn('Gemini indisponível. Usando motor local.', geminiResult.error);
    const localResult = await getOfflineTransmissions(name);
    setResult({ ...localResult, geminiError: geminiResult.error });
    setDataSource('local');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-4">
      <div className="max-w-4xl mx-auto space-y-6 pt-6">
        {/* Header da Página */}
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-purple-500/20 p-3 rounded-full">
            <BarChart2 className="w-7 h-7 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Análise do Jogo</h1>
            <p className="text-sm text-gray-400">Transmissões, latência e probabilidades em tempo real</p>
          </div>
        </div>

        {/* Barra de busca */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(gameName)}
              placeholder="Ex: Flamengo x Fluminense, Netherlands x Uzbekistan..."
              className="w-full bg-[#111] border border-gray-800 rounded-xl py-3 pl-10 pr-4 focus:border-[#00FF66] outline-none transition-colors"
            />
          </div>
          <Button onClick={() => handleSearch(gameName)} disabled={loading || !gameName} className="gap-2">
            <Zap className="w-4 h-4" />
            Analisar
          </Button>
        </div>

        {/* Banner fonte de dados */}
        {dataSource && !loading && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border ${
            dataSource === 'gemini'
              ? 'bg-[#00FF66]/10 border-[#00FF66]/30 text-[#00FF66]'
              : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
          }`}>
            {dataSource === 'gemini' ? (
              <>✨ Análise em tempo real via Gemini + Google Search</>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                Motor local ativo. Dados baseados em histórico real de plataformas.
              </>
            )}
          </div>
        )}

        <ResultsPanel 
          isLoading={loading} 
          error={null}
          data={result?.data || null}
          gameName={gameName}
          onNewSearch={() => { setResult(null); setGameName(''); setDataSource(null); }}
        />
      </div>
    </div>
  );
}
