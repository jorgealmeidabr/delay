"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Transmissao } from '../lib/gemini';
import { Button } from './ui/Button';
import { ExternalLink, Star, ChevronUp, ChevronDown } from 'lucide-react';

interface CompareTableProps {
  transmissoes: Transmissao[];
  onOpenTransmission: (t: Transmissao) => void;
}

type SortKey = 'plataforma' | 'canal' | 'delay_estimado_segundos' | 'confianca';
type SortDir = 'asc' | 'desc';

const confidenceOrder: Record<string, number> = { alta: 3, media: 2, média: 2, baixa: 1 };

const getDelayCell = (delay: number) => {
  if (delay < 30) return 'text-[#00FF66] font-black';
  if (delay <= 60) return 'text-yellow-400 font-black';
  return 'text-red-500 font-black';
};

const getBestOption = (transmissoes: Transmissao[]): number => {
  const highMed = transmissoes.filter(t =>
    t.confianca === 'alta' || t.confianca === 'media' || (t.confianca as string) === 'média'
  );
  const pool = highMed.length > 0 ? highMed : transmissoes;
  const best = pool.reduce((prev, curr) =>
    curr.delay_estimado_segundos < prev.delay_estimado_segundos ? curr : prev
  );
  return transmissoes.indexOf(best);
};

export default function CompareTable({ transmissoes, onOpenTransmission }: CompareTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('delay_estimado_segundos');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const bestOriginalIdx = useMemo(() => getBestOption(transmissoes), [transmissoes]);

  const sorted = useMemo(() => {
    return [...transmissoes]
      .map((t, originalIdx) => ({ ...t, originalIdx }))
      .sort((a, b) => {
        let comparison = 0;
        if (sortKey === 'delay_estimado_segundos') {
          comparison = a.delay_estimado_segundos - b.delay_estimado_segundos;
        } else if (sortKey === 'confianca') {
          comparison = (confidenceOrder[b.confianca] || 0) - (confidenceOrder[a.confianca] || 0);
        } else {
          comparison = String(a[sortKey]).localeCompare(String(b[sortKey]));
        }
        return sortDir === 'asc' ? comparison : -comparison;
      });
  }, [transmissoes, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronUp className="w-3 h-3 opacity-20" />;
    return sortDir === 'asc'
      ? <ChevronUp className="w-3 h-3 text-[#00FF66]" />
      : <ChevronDown className="w-3 h-3 text-[#00FF66]" />;
  };

  const headers: { key: SortKey; label: string }[] = [
    { key: 'plataforma', label: 'Plataforma' },
    { key: 'canal', label: 'Canal' },
    { key: 'delay_estimado_segundos', label: 'Delay Est.' },
    { key: 'confianca', label: 'Confiança' },
  ];

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-gray-800">
      <table className="w-full text-sm">
        <thead className="bg-[#111] border-b border-gray-800">
          <tr>
            {headers.map(h => (
              <th
                key={h.key}
                onClick={() => handleSort(h.key)}
                className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white select-none group"
              >
                <span className="flex items-center gap-1">
                  {h.label} <SortIcon col={h.key} />
                </span>
              </th>
            ))}
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Ação
            </th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence mode="popLayout">
            {sorted.map((t, i) => {
              const isBest = t.originalIdx === bestOriginalIdx;
              return (
                <motion.tr
                  key={t.canal + t.plataforma}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`border-b border-gray-800/50 transition-colors hover:bg-white/5 ${
                    isBest ? 'bg-[#00FF66]/5 border-l-2 border-l-[#00FF66]' : 'bg-[#0A0A0A]'
                  }`}
                >
                  {/* Plataforma */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{t.plataforma}</span>
                      {isBest && (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 bg-[#00FF66]/20 text-[#00FF66] text-xs font-bold rounded border border-[#00FF66]/40">
                          <Star className="w-3 h-3 fill-[#00FF66]" />
                          Melhor opção
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Canal */}
                  <td className="px-4 py-3 text-gray-300 max-w-[160px] truncate">
                    {t.canal}
                  </td>

                  {/* Delay */}
                  <td className="px-4 py-3">
                    <span className={`text-lg ${getDelayCell(t.delay_estimado_segundos)}`}>
                      ~{t.delay_estimado_segundos}s
                    </span>
                  </td>

                  {/* Confiança */}
                  <td className="px-4 py-3">
                    <span className={`capitalize text-xs font-semibold px-2 py-1 rounded ${
                      t.confianca === 'alta'
                        ? 'bg-[#00FF66]/10 text-[#00FF66]'
                        : t.confianca === 'media' || (t.confianca as string) === 'média'
                        ? 'bg-yellow-400/10 text-yellow-400'
                        : 'bg-red-500/10 text-red-400'
                    }`}>
                      {t.confianca}
                    </span>
                  </td>

                  {/* Ação */}
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant={isBest ? 'primary' : 'outline'}
                      onClick={() => onOpenTransmission(t)}
                      className="gap-1 text-xs"
                    >
                      Abrir <ExternalLink className="w-3 h-3" />
                    </Button>
                  </td>
                </motion.tr>
              );
            })}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
}
