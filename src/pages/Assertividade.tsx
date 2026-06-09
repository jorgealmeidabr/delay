import React, { useState, useEffect } from 'react';
import { Target, CheckCircle2, XCircle, Plus, Calendar, Trophy, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { logAction } from '../lib/audit';

interface AssertividadeRecord {
  id: string;
  date: string;
  championship: string;
  game: string;
  suggested: string;
  result: string;
  hit: boolean;
  createdAt: string;
}

export default function Assertividade() {
  const [records, setRecords] = useState<AssertividadeRecord[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form
  const [date, setDate] = useState('');
  const [championship, setChampionship] = useState('');
  const [game, setGame] = useState('');
  const [suggested, setSuggested] = useState('');
  const [result, setResult] = useState('');
  const [hit, setHit] = useState<boolean>(true);

  // Filters
  const [filterChampionship, setFilterChampionship] = useState('');
  const [filterResult, setFilterResult] = useState<'todos' | 'acertos' | 'erros'>('todos');
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = () => {
    const list = JSON.parse(localStorage.getItem('system_assertividade') || '[]');
    list.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setRecords(list);
  };

  const handleSave = () => {
    if (!date || !championship.trim() || !game.trim() || !suggested.trim() || !result.trim()) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    const newRecord: AssertividadeRecord = {
      id: 'ast-' + Date.now(),
      date,
      championship: championship.trim(),
      game: game.trim(),
      suggested: suggested.trim(),
      result: result.trim(),
      hit,
      createdAt: new Date().toISOString()
    };

    const list = [...records, newRecord];
    list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    localStorage.setItem('system_assertividade', JSON.stringify(list));
    setRecords(list);
    logAction('Inteligência', 'Registro de Assertividade', 'Admin', undefined, `Jogo: ${newRecord.game} | Acerto: ${hit ? 'Sim' : 'Não'}`);
    
    setIsModalOpen(false);
    setDate('');
    setChampionship('');
    setGame('');
    setSuggested('');
    setResult('');
    setHit(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Deseja excluir este registro?")) {
      const list = records.filter(r => r.id !== id);
      localStorage.setItem('system_assertividade', JSON.stringify(list));
      setRecords(list);
    }
  };

  // Filtragem
  const filteredRecords = records.filter(r => {
    if (filterChampionship && !r.championship.toLowerCase().includes(filterChampionship.toLowerCase())) return false;
    if (filterDate && r.date !== filterDate) return false;
    if (filterResult === 'acertos' && !r.hit) return false;
    if (filterResult === 'erros' && r.hit) return false;
    return true;
  });

  // Métricas baseadas apenas nos itens filtrados (ou em todos?)
  // O dashboard normalmente mostra o total global, mas vamos fazer global para o header.
  const totalAnalises = records.length;
  const totalAcertos = records.filter(r => r.hit).length;
  const totalErros = totalAnalises - totalAcertos;
  const precisao = totalAnalises > 0 ? ((totalAcertos / totalAnalises) * 100).toFixed(1) : '0.0';

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Target className="text-[#00FF66] w-8 h-8" />
              Ranking de Assertividade
            </h1>
            <p className="text-gray-400 text-sm mt-1">Gerencie e analise a eficiência das sugestões do sistema.</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Novo Registro
          </Button>
        </div>

        {/* Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#111] border border-gray-800 p-5 rounded-xl">
            <p className="text-gray-400 text-sm font-medium mb-1">Precisão Geral</p>
            <p className={`text-3xl font-black ${Number(precisao) >= 70 ? 'text-[#00FF66]' : Number(precisao) >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
              {precisao}%
            </p>
          </div>
          <div className="bg-[#111] border border-gray-800 p-5 rounded-xl">
            <p className="text-gray-400 text-sm font-medium mb-1">Total de Análises</p>
            <p className="text-3xl font-black text-white">{totalAnalises}</p>
          </div>
          <div className="bg-[#111] border border-gray-800 p-5 rounded-xl border-b-4 border-b-[#00FF66]">
            <p className="text-gray-400 text-sm font-medium mb-1">Acertos</p>
            <p className="text-3xl font-black text-[#00FF66]">{totalAcertos}</p>
          </div>
          <div className="bg-[#111] border border-gray-800 p-5 rounded-xl border-b-4 border-b-red-500">
            <p className="text-gray-400 text-sm font-medium mb-1">Erros</p>
            <p className="text-3xl font-black text-red-500">{totalErros}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-[#1A1A1A] border border-gray-800 p-4 rounded-xl flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Campeonato</label>
            <input type="text" value={filterChampionship} onChange={e => setFilterChampionship(e.target.value)} placeholder="Ex: Brasileirão" className="bg-[#111] border border-gray-700 rounded-lg p-2 text-sm text-white outline-none focus:border-[#00FF66]" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Data Específica</label>
            <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="bg-[#111] border border-gray-700 rounded-lg p-2 text-sm text-white outline-none focus:border-[#00FF66] [color-scheme:dark]" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Resultado</label>
            <select value={filterResult} onChange={(e: any) => setFilterResult(e.target.value)} className="bg-[#111] border border-gray-700 rounded-lg p-2 text-sm text-white outline-none focus:border-[#00FF66]">
              <option value="todos">Todos</option>
              <option value="acertos">Apenas Acertos</option>
              <option value="erros">Apenas Erros</option>
            </select>
          </div>
          <Button variant="outline" onClick={() => { setFilterChampionship(''); setFilterDate(''); setFilterResult('todos'); }}>
            Limpar Filtros
          </Button>
        </div>

        {/* Histórico */}
        <div className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[#1A1A1A] text-gray-400 text-sm">
              <tr>
                <th className="p-4 font-medium">Data</th>
                <th className="p-4 font-medium">Campeonato / Jogo</th>
                <th className="p-4 font-medium">Sugerido</th>
                <th className="p-4 font-medium">Resultado Final</th>
                <th className="p-4 font-medium text-center">Desfecho</th>
                <th className="p-4 font-medium text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-sm">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    Nenhum registro encontrado.
                  </td>
                </tr>
              ) : (
                filteredRecords.map(r => (
                  <tr key={r.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 whitespace-nowrap text-gray-400">
                      {new Date(r.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-4">
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{r.championship}</p>
                      <p className="font-medium text-white mt-0.5">{r.game}</p>
                    </td>
                    <td className="p-4">
                      <span className="bg-blue-500/10 text-blue-400 px-2 py-1 rounded font-medium text-xs">{r.suggested}</span>
                    </td>
                    <td className="p-4">
                      <span className="bg-gray-800 text-gray-300 px-2 py-1 rounded font-medium text-xs">{r.result}</span>
                    </td>
                    <td className="p-4 text-center">
                      {r.hit ? (
                        <span className="inline-flex items-center gap-1 text-[#00FF66] bg-[#00FF66]/10 px-2 py-1 rounded font-bold text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Acerto
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-500 bg-red-500/10 px-2 py-1 rounded font-bold text-xs">
                          <XCircle className="w-3.5 h-3.5" /> Erro
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleDelete(r.id)} className="p-2 text-gray-500 hover:text-red-500 transition rounded hover:bg-gray-800">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111] border border-gray-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#00FF66]" /> Novo Registro de Análise
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Data do Jogo *</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg p-2 text-white outline-none focus:border-[#00FF66] [color-scheme:dark]" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Campeonato *</label>
                <input type="text" value={championship} onChange={e => setChampionship(e.target.value)} placeholder="Ex: Premier League" className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg p-2 text-white outline-none focus:border-[#00FF66]" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Jogo (Times) *</label>
                <input type="text" value={game} onChange={e => setGame(e.target.value)} placeholder="Ex: Arsenal vs Chelsea" className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg p-2 text-white outline-none focus:border-[#00FF66]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Favorito Sugerido *</label>
                  <input type="text" value={suggested} onChange={e => setSuggested(e.target.value)} placeholder="Ex: Arsenal" className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg p-2 text-white outline-none focus:border-[#00FF66]" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Resultado Final *</label>
                  <input type="text" value={result} onChange={e => setResult(e.target.value)} placeholder="Ex: 3x1 Arsenal" className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg p-2 text-white outline-none focus:border-[#00FF66]" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Desfecho do Sistema</label>
                <div className="flex gap-4">
                  <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition ${hit ? 'bg-[#00FF66]/10 border-[#00FF66] text-[#00FF66]' : 'bg-[#1A1A1A] border-gray-700 text-gray-400 hover:border-gray-500'}`}>
                    <input type="radio" name="hit" checked={hit === true} onChange={() => setHit(true)} className="hidden" />
                    <CheckCircle2 className="w-5 h-5" /> Acerto
                  </label>
                  <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition ${!hit ? 'bg-red-500/10 border-red-500 text-red-500' : 'bg-[#1A1A1A] border-gray-700 text-gray-400 hover:border-gray-500'}`}>
                    <input type="radio" name="hit" checked={hit === false} onChange={() => setHit(false)} className="hidden" />
                    <XCircle className="w-5 h-5" /> Erro
                  </label>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button className="flex-1" onClick={handleSave}>Salvar Registro</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
