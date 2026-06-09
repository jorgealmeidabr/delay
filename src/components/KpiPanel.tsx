import React from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp, ShieldCheck, Swords, Activity, ArrowRight, Info } from 'lucide-react';
import { TeamStats } from '../lib/gemini';
import { calculateFavoritism } from '../lib/kpi';

interface KpiPanelProps {
  gameName: string;
  statsA: TeamStats;
  statsB: TeamStats;
}

export default function KpiPanel({ gameName, statsA, statsB }: KpiPanelProps) {
  // Extract team names from "TeamA vs TeamB"
  const [teamA = 'Time A', teamB = 'Time B'] = gameName.split(' x ').map(s => s.trim());
  
  const result = calculateFavoritism(teamA, statsA, teamB, statsB);

  const renderStatBar = (label: string, valA: number, valB: number, isPercent = false, inverseGood = false) => {
    const max = Math.max(valA, valB) || 1; // Avoid div by 0
    let pctA = (valA / max) * 100;
    let pctB = (valB / max) * 100;
    
    // Highlight colors
    let colorA = 'bg-gray-700';
    let colorB = 'bg-gray-700';
    
    if (valA !== valB) {
      if ((valA > valB && !inverseGood) || (valA < valB && inverseGood)) {
        colorA = 'bg-[#00FF66]';
      } else {
        colorB = 'bg-[#00FF66]';
      }
    } else {
      colorA = 'bg-gray-500';
      colorB = 'bg-gray-500';
    }

    const fmt = (v: number) => isPercent ? `${v.toFixed(0)}%` : v.toFixed(1).replace('.0', '');

    return (
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-gray-400 font-medium px-1">
          <span className={colorA.includes('00FF66') ? 'text-white font-bold' : ''}>{fmt(valA)}</span>
          <span className="uppercase tracking-wider text-[10px]">{label}</span>
          <span className={colorB.includes('00FF66') ? 'text-white font-bold' : ''}>{fmt(valB)}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-[#1A1A1A] rounded-full overflow-hidden rotate-180">
            <div className={`h-full ${colorA} transition-all duration-1000`} style={{ width: `${pctA}%` }} />
          </div>
          <div className="flex-1 h-2 bg-[#1A1A1A] rounded-full overflow-hidden">
            <div className={`h-full ${colorB} transition-all duration-1000`} style={{ width: `${pctB}%` }} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="mt-6 bg-[#0a0a0a] border border-gray-800 p-5 rounded-xl space-y-6"
    >
      <div className="flex items-center gap-3 border-b border-gray-800/50 pb-4">
        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
          <Activity className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h3 className="font-bold text-white text-lg flex items-center gap-2">
            Análise Avançada: Últimos 10 Jogos
          </h3>
          <p className="text-gray-400 text-sm">Comparativo de desempenho recente das equipes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Lado Esquerdo: Estatísticas Comparativas */}
        <div className="space-y-5 bg-[#111] p-5 rounded-xl border border-gray-800">
          <div className="flex justify-between text-sm font-bold text-gray-300 mb-4 pb-2 border-b border-gray-800">
            <span className="truncate w-1/3">{teamA}</span>
            <span className="text-center w-1/3 text-gray-500 text-xs mt-0.5">X</span>
            <span className="truncate w-1/3 text-right">{teamB}</span>
          </div>

          <div className="space-y-4">
            {renderStatBar('Aproveitamento', result.statsA.aproveitamento, result.statsB.aproveitamento, true)}
            {renderStatBar('Média GM', result.statsA.mediaGm, result.statsB.mediaGm)}
            {renderStatBar('Média GS', result.statsA.mediaGs, result.statsB.mediaGs, false, true)}
            {renderStatBar('Vitórias', statsA.vitorias, statsB.vitorias)}
            {renderStatBar('Derrotas', statsA.derrotas, statsB.derrotas, false, true)}
            {renderStatBar('Jogos Sem Sofrer Gol', statsA.jogos_sem_sofrer_gols, statsB.jogos_sem_sofrer_gols)}
          </div>
        </div>

        {/* Lado Direito: Favoritismo e Resumo */}
        <div className="flex flex-col gap-4">
          
          {/* Card Favorito */}
          <div className={`p-5 rounded-xl border relative overflow-hidden ${
            result.favorito !== 'Empate' 
              ? 'bg-[#00FF66]/5 border-[#00FF66]/20' 
              : 'bg-yellow-500/5 border-yellow-500/20'
          }`}>
            {result.favorito !== 'Empate' && (
              <div className="absolute -right-4 -top-4 opacity-5">
                <Swords className="w-32 h-32" />
              </div>
            )}
            
            <p className="text-xs uppercase tracking-wider font-bold text-gray-500 mb-2">
              Tendência Estatística Atual
            </p>
            
            {result.favorito !== 'Empate' ? (
              <>
                <h4 className="text-2xl font-black text-white mb-1">
                  Favorito: <span className="text-[#00FF66]">{result.favorito === 'A' ? teamA : teamB}</span>
                </h4>
                <div className="flex items-end gap-2 mt-4">
                  <span className="text-4xl font-black text-white">{result.pontosFavorito}<span className="text-xl text-gray-500">%</span></span>
                  <span className="text-sm text-gray-400 mb-1.5">Índice de Confiança Tática</span>
                </div>
              </>
            ) : (
              <>
                <h4 className="text-2xl font-black text-yellow-400 mb-1">Confronto Equilibrado</h4>
                <div className="flex items-end gap-2 mt-4">
                  <span className="text-4xl font-black text-white">{result.pontosFavorito}<span className="text-xl text-gray-500">pts</span></span>
                  <span className="text-sm text-gray-400 mb-1.5">Índice igualado para ambas as equipes</span>
                </div>
              </>
            )}
            
            <div className="mt-4 pt-4 border-t border-gray-800/50">
              <p className="text-sm text-gray-300 leading-relaxed">
                {result.resumo}
              </p>
            </div>
          </div>

          {/* Info Badge */}
          <div className="flex items-start gap-3 p-4 bg-[#111] border border-gray-800 rounded-xl text-xs text-gray-400">
            <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <p>
              O Índice de Favoritismo é calculado com base em pesos específicos (Aproveitamento 30%, Média de Gols Marcados 25%, Média de Gols Sofridos 20%, Vitórias Recentes 15% e Consistência Defensiva 10%). 
              <br/><br/>
              <strong className="text-gray-300">Atenção:</strong> A estatística aponta tendências e não garante resultados absolutos.
            </p>
          </div>

        </div>
      </div>
    </motion.div>
  );
}
