"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/Button';
import { Radar, Clock, Trash2, Search, ChevronRight } from 'lucide-react';

interface CalibrationRecord {
  plataforma: string;
  delay_real: number;
  timestamp: string;
  jogo: string;
  realTimeInput?: string;
}

const getDelayBadge = (delay: number) => {
  if (delay < 30) return { color: 'bg-[#00FF66]/20 text-[#00FF66] border-[#00FF66]/30', label: 'Ótimo' };
  if (delay <= 60) return { color: 'bg-yellow-400/20 text-yellow-400 border-yellow-400/30', label: 'Médio' };
  return { color: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'Alto' };
};

export default function History() {
  const navigate = useNavigate();
  const [records, setRecords] = useState<CalibrationRecord[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('calibrations') || '[]');
    setRecords([...data].reverse()); // Cronológica reversa
  }, []);

  const handleClear = () => {
    localStorage.removeItem('calibrations');
    setRecords([]);
    setShowConfirm(false);
  };

  const handleSearchAgain = (jogo: string) => {
    navigate(`/calibrar/busca?q=${encodeURIComponent(jogo)}`);
  };

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Clock className="text-[#00FF66] w-8 h-8" />
          Histórico de Buscas
        </h1>
        {records.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowConfirm(true)}
            className="text-red-400 hover:text-red-300 hover:bg-red-950/30 gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Limpar histórico
          </Button>
        )}
      </div>

      {/* Confirm Dialog */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-950/40 border border-red-500/40 rounded-xl p-4 flex items-center justify-between"
          >
            <span className="text-red-300 text-sm">Deseja apagar todo o histórico permanentemente?</span>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => setShowConfirm(false)}>Cancelar</Button>
              <Button size="sm" onClick={handleClear} className="bg-red-600 hover:bg-red-700 text-white">Apagar</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {records.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-24 text-center space-y-4 border border-gray-800 rounded-2xl bg-[#111]"
        >
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-[#1A1A1A] border border-gray-800 flex items-center justify-center">
              <Radar className="w-12 h-12 text-gray-600" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gray-700 rounded-full border-2 border-[#111]" />
          </div>
          <h2 className="text-xl font-bold text-white">Nenhuma busca ainda.</h2>
          <p className="text-gray-400 max-w-xs">
            Comece varrendo um jogo! Seus resultados de calibração aparecerão aqui.
          </p>
          <Button onClick={() => navigate('/jogos')} className="mt-2">
            Explorar Jogos
          </Button>
        </motion.div>
      ) : (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.07 } } }}
          className="space-y-3"
        >
          {records.map((record, i) => {
            const badge = getDelayBadge(record.delay_real);
            const date = new Date(record.timestamp).toLocaleDateString('pt-BR', {
              day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
            });
            return (
              <motion.div
                key={i}
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } }
                }}
                className="bg-[#0A0A0A] border border-gray-800 rounded-xl p-4 flex items-center gap-4 hover:border-gray-700 transition-colors group"
              >
                {/* Delay badge */}
                <div className={`text-center px-3 py-2 rounded-lg border min-w-[64px] ${badge.color}`}>
                  <div className="text-2xl font-black">{record.delay_real}s</div>
                  <div className="text-xs font-medium">{badge.label}</div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white truncate">{record.jogo}</p>
                  <p className="text-sm text-gray-400">{record.plataforma} · {date}</p>
                </div>

                {/* Action */}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleSearchAgain(record.jogo)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-[#00FF66] hover:text-[#00FF66] gap-1 shrink-0"
                >
                  <Search className="w-4 h-4" />
                  Buscar novamente
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
