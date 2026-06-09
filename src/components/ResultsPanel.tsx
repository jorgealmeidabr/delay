"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { JogoTransmissaoData, Transmissao } from '../lib/gemini';
import { Button } from './ui/Button';
import { Card, CardContent, CardFooter, CardHeader } from './ui/Card';
import { Radar, ExternalLink, SignalHigh, SignalMedium, SignalLow, AlertCircle, RefreshCw, Timer, Zap, Activity, Info } from 'lucide-react';
import KpiPanel from './KpiPanel';

interface ResultsPanelProps {
  isLoading: boolean;
  error: string | null;
  data: JogoTransmissaoData | null;
  gameName: string;
  onNewSearch: () => void;
  onOpenTransmission?: (t: Transmissao) => void;
}

const getPlatformBadgeColor = (platform: string) => {
  const p = platform.toLowerCase();
  if (p.includes('youtube')) return 'bg-red-600 text-white';
  if (p.includes('globoplay')) return 'bg-blue-600 text-white';
  if (p.includes('twitch')) return 'bg-purple-600 text-white';
  return 'bg-gray-700 text-white';
};

const getDelayColor = (delay: number) => {
  if (delay < 30) return 'text-[#00FF66]';
  if (delay <= 60) return 'text-yellow-400';
  return 'text-red-500';
};

const ConfidenceIcon = ({ level }: { level: string }) => {
  const l = level.toLowerCase();
  if (l === 'alta') return <SignalHigh className="w-5 h-5 text-[#00FF66]" />;
  if (l === 'media' || l === 'média') return <SignalMedium className="w-5 h-5 text-yellow-400" />;
  return <SignalLow className="w-5 h-5 text-red-500" />;
};

export default function ResultsPanel({ isLoading, error, data, gameName, onNewSearch, onOpenTransmission }: ResultsPanelProps) {
  const [blurPlatforms, setBlurPlatforms] = useState(false);

  useEffect(() => {
    setBlurPlatforms(localStorage.getItem('blur_platforms') === 'true');
  }, []);

  const getBaseUrl = (plataforma: string) => {
    const p = plataforma.toLowerCase();
    if (p.includes('youtube')) return 'https://youtube.com';
    if (p.includes('twitch')) return 'https://twitch.tv';
    if (p.includes('globoplay') || p.includes('globo') || p.includes('premiere')) return 'https://globoplay.globo.com';
    if (p.includes('max') || p.includes('tnt')) return 'https://play.max.com';
    if (p.includes('disney') || p.includes('star') || p.includes('espn')) return 'https://disneyplus.com';
    if (p.includes('amazon') || p.includes('prime')) return 'https://primevideo.com';
    if (p.includes('paramount')) return 'https://paramountplus.com';
    if (p.includes('cazé') || p.includes('caze')) return 'https://youtube.com/@CazeTV';
    if (p.includes('sbt')) return 'https://sbt.com.br/ao-vivo';
    if (p.includes('record')) return 'https://playplus.com';
    if (p.includes('band')) return 'https://bandplay.com';
    return `https://${plataforma.replace(/\s+/g, '').toLowerCase()}.com.br`;
  };

  const handleOpenLink = (t: Transmissao) => {
    let finalUrl = t.link;
    if (!finalUrl || finalUrl === '#' || finalUrl.toLowerCase() === 'n/a' || finalUrl.toLowerCase() === 'não aplicável') {
      finalUrl = getBaseUrl(t.plataforma);
    }
    
    if (!finalUrl.startsWith('http')) {
      finalUrl = 'https://' + finalUrl;
    }
    window.open(finalUrl, '_blank');
  };

  // Removido viewMode conforme solicitado
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-6">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-24 h-24 border border-[#00FF66] rounded-full animate-ping opacity-20" />
          <div className="absolute w-16 h-16 border border-[#00FF66] rounded-full animate-ping opacity-40 animation-delay-300" />
          <div className="bg-black p-4 rounded-full border border-gray-800 z-10 relative shadow-[0_0_30px_rgba(0,255,102,0.2)]">
            <Radar className="w-10 h-10 text-[#00FF66] animate-[spin_3s_linear_infinite]" />
          </div>
        </div>
        <div>
          <h3 className="text-xl font-bold text-white mb-2">Varrendo a internet...</h3>
          <p className="text-gray-400 max-w-sm">O Gemini está analisando plataformas, fóruns e chats para encontrar a transmissão com menor delay para {gameName}.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-red-500/20 bg-red-500/5 rounded-xl">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Ops! Algo deu errado.</h3>
        <p className="text-gray-400 mb-6 max-w-md">
          {error}
        </p>
        <Button variant="outline" onClick={onNewSearch}>Tentar novamente</Button>
      </div>
    );
  }

  if (!data || data.transmissoes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-gray-800 bg-[#111] rounded-xl">
        <Radar className="w-12 h-12 text-gray-600 mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Nenhuma transmissão encontrada</h3>
        <p className="text-gray-400 mb-6 max-w-md">
          A pesquisa do Gemini não retornou nenhum link ao vivo no momento para {gameName}.
        </p>
        <Button onClick={onNewSearch}>Nova busca</Button>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  } as any;

  const hasMultiple = data.transmissoes.length > 1;

  const [homeTeam, awayTeam] = gameName.includes(' x ') ? gameName.split(' x ') : ['Casa', 'Fora'];
  
  return (
    <div className="w-full space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-800 pb-4">
        <h2 className="text-xl font-bold text-white">Transmissões para: <span className="text-[#00FF66]">{data.jogo}</span></h2>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onNewSearch} className="text-gray-400 hover:text-white">
            <RefreshCw className="w-4 h-4 mr-2" /> Nova busca
          </Button>
        </div>
      </div>

      {/* KPI Dashboard */}
      {data.transmissoes.length > 0 && (
        <div className="grid grid-cols-2 gap-4 mb-2">
          <div className="bg-[#111] border border-gray-800 rounded-xl p-4 flex items-center gap-4">
            <div className="bg-[#00FF66]/20 p-3 rounded-full">
              <Zap className="w-6 h-6 text-[#00FF66]" />
            </div>
            <div>
              <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Menor Latência</span>
              <div className="text-2xl font-black text-white">
                {Math.min(...data.transmissoes.map(t => t.delay_estimado_segundos))}s
              </div>
            </div>
          </div>
          <div className="bg-[#111] border border-gray-800 rounded-xl p-4 flex items-center gap-4">
            <div className="bg-blue-500/20 p-3 rounded-full">
              <Activity className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Média Geral</span>
              <div className="text-2xl font-black text-white">
                {Math.round(data.transmissoes.reduce((acc, t) => acc + t.delay_estimado_segundos, 0) / data.transmissoes.length)}s
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cards Mode */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {data.transmissoes.map((t: Transmissao, index: number) => (
          <motion.div key={index} variants={cardVariants}>
            <Card className="h-full flex flex-col bg-[#0A0A0A] border-gray-800 hover:border-gray-700 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {t.plataforma.toLowerCase().includes('youtube') ? <Radar className="w-5 h-5 text-red-500" /> : <Radar className="w-5 h-5 text-blue-400" />}
                    <h3 className={`font-bold text-lg text-white ${blurPlatforms ? 'blur-sm hover:blur-none transition-all' : ''}`}>{t.plataforma}</h3>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-[#1A1A1A] px-2 py-1 rounded border border-gray-800">
                    <ConfidenceIcon level={t.confianca} />
                    <span className="capitalize">Confiança {t.confianca}</span>
                  </div>
                </div>
                <p className={`text-gray-400 text-sm ${blurPlatforms ? 'blur-sm hover:blur-none transition-all' : ''}`}>{t.canal}</p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between bg-black/50 p-4 rounded-lg border border-gray-800">
                  <span className="text-gray-400 font-medium">Delay Estimado</span>
                  <div className="flex items-center gap-2">
                    <Timer className="w-4 h-4 text-yellow-500" />
                    <span className={`text-2xl font-black ${t.delay_estimado_segundos <= 5 ? 'text-[#00FF66]' : t.delay_estimado_segundos <= 15 ? 'text-yellow-400' : 'text-red-500'} ${blurPlatforms ? 'blur-md hover:blur-none transition-all cursor-help' : ''}`}>
                      ~{t.delay_estimado_segundos}s
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 italic flex items-start gap-1">
                  <span className="font-semibold text-gray-400">Como estimei:</span> 
                  {t.fonte_do_delay}
                </p>
              </CardContent>

              <CardFooter className="pt-0 flex flex-col gap-2">
                <Button 
                  fullWidth 
                  variant="outline"
                  onClick={() => handleOpenLink(t)}
                  className="gap-2 bg-white/5 hover:bg-white/10"
                >
                  Assistir Transmissão <ExternalLink className="w-4 h-4" />
                </Button>

              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {data.probabilidades && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 bg-[#0a0a0a] border border-gray-800 p-5 rounded-xl"
        >
          <h4 className="text-white font-bold mb-4 flex items-center gap-2 uppercase tracking-wide text-sm">
            <Activity className="w-5 h-5 text-purple-500" />
            Análise Tática Rigorosa & Probabilidades
          </h4>
          
          <div className="flex w-full h-4 rounded-full overflow-hidden mb-4">
            <div style={{ width: `${data.probabilidades.vitoria_casa}%` }} className="bg-blue-500 flex items-center justify-center text-[10px] font-bold text-white shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
              {data.probabilidades.vitoria_casa}%
            </div>
            <div style={{ width: `${data.probabilidades.empate}%` }} className="bg-gray-500 flex items-center justify-center text-[10px] font-bold text-white shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
              {data.probabilidades.empate}%
            </div>
            <div style={{ width: `${data.probabilidades.vitoria_fora}%` }} className="bg-red-500 flex items-center justify-center text-[10px] font-bold text-white shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
              {data.probabilidades.vitoria_fora}%
            </div>
          </div>
          
          {data.estatisticas_recentes && (
            <KpiPanel 
              gameName={data.jogo} 
              statsA={data.estatisticas_recentes.timeA} 
              statsB={data.estatisticas_recentes.timeB} 
            />
          )}

          <div className="flex justify-between text-xs font-bold text-gray-500 mb-6 uppercase">
            <span className={`text-blue-500 ${data.probabilidades.vitoria_casa > Math.max(data.probabilidades.empate, data.probabilidades.vitoria_fora) ? 'underline decoration-2 underline-offset-4' : ''}`}>
              {homeTeam}
            </span>
            <span className={data.probabilidades.empate > Math.max(data.probabilidades.vitoria_casa, data.probabilidades.vitoria_fora) ? 'underline decoration-2 underline-offset-4' : ''}>
              Empate
            </span>
            <span className={`text-red-500 ${data.probabilidades.vitoria_fora > Math.max(data.probabilidades.vitoria_casa, data.probabilidades.empate) ? 'underline decoration-2 underline-offset-4' : ''}`}>
              {awayTeam}
            </span>
          </div>

          <div className="bg-[#111] p-4 rounded-lg border-l-4 border-purple-500">
            <p className="text-sm text-gray-300 leading-relaxed italic">
              "{data.probabilidades.analise_rigorosa}"
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
