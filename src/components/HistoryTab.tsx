import React from 'react';
import { Clock, User } from 'lucide-react';
import { getLogsByRecord, AuditLog } from '../lib/audit';

interface HistoryTabProps {
  registroId: string;
  className?: string;
}

const ACTION_ICONS: Record<string, string> = {
  'Criação': '➕',
  'Edição': '✏️',
  'Exclusão': '🗑️',
  'Login': '🔐',
  'Logout': '🚪',
  'Redefinição de Senha': '🔑',
  'Alteração': '⚙️',
  'Busca de Transmissão': '📡',
  'Bloqueio de Acesso': '🚫',
};

export const HistoryTab: React.FC<HistoryTabProps> = ({ registroId, className = '' }) => {
  const logs: AuditLog[] = getLogsByRecord(registroId);

  if (logs.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-10 text-gray-600 text-sm gap-2 ${className}`}>
        <Clock className="w-8 h-8 opacity-40" />
        <p>Nenhuma atividade registrada para este registro.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-0 relative ${className}`}>
      {/* Vertical timeline line */}
      <div className="absolute left-5 top-0 bottom-0 w-px bg-gray-800" />

      {logs.map((log, i) => (
        <div key={log.id} className="relative flex gap-4 pb-5 pl-12">
          {/* Timeline dot */}
          <div className="absolute left-[15px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#00FF66] border-2 border-[#0A0A0A]" />

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base">{ACTION_ICONS[log.acao] || '📋'}</span>
                <span className="text-sm font-semibold text-white">{log.acao}</span>
                <span className="text-xs text-gray-500 px-2 py-0.5 bg-[#1A1A1A] rounded-full">{log.modulo}</span>
              </div>
              <span className="text-xs text-gray-600 whitespace-nowrap">
                {new Date(log.timestamp).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <div className="flex items-center gap-1.5 mt-1">
              <User className="w-3 h-3 text-gray-600" />
              <span className="text-xs text-gray-500">{log.usuario}</span>
              <span className={`text-[9px] font-bold uppercase px-1 py-0.5 rounded ${log.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                {log.role}
              </span>
            </div>

            {(log.valorAnterior || log.valorNovo) && (
              <div className="mt-2 flex gap-2 text-xs">
                {log.valorAnterior && (
                  <span className="bg-red-500/10 text-red-400 px-2 py-1 rounded border border-red-500/20 truncate max-w-[140px]">
                    Antes: {log.valorAnterior}
                  </span>
                )}
                {log.valorNovo && (
                  <span className="bg-[#00FF66]/10 text-[#00FF66] px-2 py-1 rounded border border-[#00FF66]/20 truncate max-w-[140px]">
                    Depois: {log.valorNovo}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
