import React, { useState, useEffect } from 'react';
import { ActivitySquare, Search, Filter, Download, Trash2, ChevronDown } from 'lucide-react';
import { getLogs, AuditLog } from '../lib/audit';

const MODULES = ['Todos', 'Autenticação', 'Segurança', 'Usuários', 'Análise', 'Configurações', 'Sistema'];
const ACTIONS_ICONS: Record<string, string> = {
  'Login': '🔐',
  'Logout': '🚪',
  'Criação': '➕',
  'Edição': '✏️',
  'Exclusão': '🗑️',
  'Bloqueio de Acesso': '🚫',
  'Acesso Negado': '❌',
  'Tentativa de Login Falha': '⚠️',
  'Redefinição de Senha': '🔑',
  'Inicialização': '🚀',
};

export default function LogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filtered, setFiltered] = useState<AuditLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModule, setFilterModule] = useState('Todos');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const loaded = getLogs();
    setLogs(loaded);
    setFiltered(loaded);
  }, []);

  useEffect(() => {
    let result = logs;
    if (filterModule !== 'Todos') {
      result = result.filter(l => l.modulo === filterModule);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(l =>
        l.usuario.toLowerCase().includes(q) ||
        l.acao.toLowerCase().includes(q) ||
        l.registroAfetado.toLowerCase().includes(q) ||
        l.modulo.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [searchQuery, filterModule, logs]);

  const exportCSV = () => {
    const header = 'Data/Hora,Usuário,Perfil,Módulo,Ação,Registro Afetado,Navegador';
    const rows = filtered.map(l =>
      `"${new Date(l.timestamp).toLocaleString('pt-BR')}","${l.usuario}","${l.role}","${l.modulo}","${l.acao}","${l.registroAfetado}","${l.navegador}"`
    );
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auditoria_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const getActionColor = (acao: string) => {
    if (acao.includes('Login') && !acao.includes('Falha')) return 'text-[#00FF66]';
    if (acao.includes('Falha') || acao.includes('Negado') || acao.includes('Bloqueio')) return 'text-red-500';
    if (acao.includes('Exclusão')) return 'text-orange-500';
    if (acao.includes('Criação')) return 'text-blue-400';
    if (acao.includes('Edição') || acao.includes('Senha')) return 'text-yellow-400';
    return 'text-gray-300';
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ActivitySquare className="text-purple-500 w-8 h-8" />
              Auditoria Global do Sistema
            </h1>
            <p className="text-sm text-gray-500 mt-1">{filtered.length} registros imutáveis encontrados</p>
          </div>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-[#111] border border-gray-700 hover:border-gray-500 rounded-lg text-sm transition"
          >
            <Download className="w-4 h-4 text-[#00FF66]" />
            Exportar CSV
          </button>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por usuário, ação ou registro..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[#111] border border-gray-800 rounded-xl py-2.5 pl-9 pr-4 text-sm focus:border-purple-500 outline-none transition"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filterModule}
              onChange={e => setFilterModule(e.target.value)}
              className="bg-[#111] border border-gray-800 rounded-lg py-2.5 px-3 text-sm text-white outline-none focus:border-purple-500"
            >
              {MODULES.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#1A1A1A] text-gray-400">
                <tr>
                  <th className="p-3 text-left font-medium w-8"></th>
                  <th className="p-3 text-left font-medium">Data/Hora</th>
                  <th className="p-3 text-left font-medium">Usuário</th>
                  <th className="p-3 text-left font-medium">Módulo</th>
                  <th className="p-3 text-left font-medium">Ação</th>
                  <th className="p-3 text-left font-medium">Registro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">Nenhum log encontrado.</td>
                  </tr>
                )}
                {filtered.map(log => (
                  <>
                    <tr
                      key={log.id}
                      className="hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                    >
                      <td className="p-3 text-center text-base">
                        {ACTIONS_ICONS[log.acao] || '📋'}
                      </td>
                      <td className="p-3 text-gray-400 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString('pt-BR')}
                      </td>
                      <td className="p-3">
                        <p className="font-medium text-white">{log.usuario}</p>
                        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${log.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                          {log.role}
                        </span>
                      </td>
                      <td className="p-3 text-gray-400">{log.modulo}</td>
                      <td className={`p-3 font-medium ${getActionColor(log.acao)}`}>{log.acao}</td>
                      <td className="p-3 text-gray-400 max-w-[200px] truncate">{log.registroAfetado}</td>
                    </tr>
                    {expandedId === log.id && (
                      <tr key={log.id + '-detail'} className="bg-purple-500/5 border-l-2 border-purple-500">
                        <td colSpan={6} className="p-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                            <div>
                              <p className="text-gray-500 mb-1 uppercase tracking-wider font-bold">ID do Log</p>
                              <p className="text-gray-300 font-mono">{log.id.slice(0, 16)}...</p>
                            </div>
                            <div>
                              <p className="text-gray-500 mb-1 uppercase tracking-wider font-bold">Navegador</p>
                              <p className="text-gray-300">{log.navegador}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 mb-1 uppercase tracking-wider font-bold">IP</p>
                              <p className="text-gray-300">{log.ip}</p>
                            </div>
                            {log.valorAnterior && (
                              <div>
                                <p className="text-gray-500 mb-1 uppercase tracking-wider font-bold">Valor Anterior</p>
                                <p className="text-gray-300 truncate">{log.valorAnterior}</p>
                              </div>
                            )}
                            {log.valorNovo && (
                              <div>
                                <p className="text-gray-500 mb-1 uppercase tracking-wider font-bold">Valor Novo</p>
                                <p className="text-[#00FF66] truncate">{log.valorNovo}</p>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Aviso de imutabilidade */}
        <div className="flex items-start gap-2 px-4 py-3 bg-[#111] border border-gray-800 rounded-lg text-xs text-gray-500">
          <Trash2 className="w-4 h-4 text-red-500/50 flex-shrink-0 mt-0.5" />
          Os registros de auditoria são <strong className="text-gray-400">permanentes e imutáveis</strong>. Não é possível excluir logs do sistema para garantir rastreabilidade completa.
        </div>
      </div>
    </div>
  );
}
