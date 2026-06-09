import React, { useState, useEffect } from 'react';
import { Megaphone, Plus, Edit, Trash2, Calendar, AlertCircle, Info, ShieldAlert } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { logAction } from '../lib/audit';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'normal' | 'importante' | 'urgente';
  startDate: string;
  expirationDate: string;
  createdAt: string;
}

export default function Comunicados() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'normal' | 'importante' | 'urgente'>('normal');
  const [startDate, setStartDate] = useState('');
  const [expirationDate, setExpirationDate] = useState('');

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = () => {
    const list: Announcement[] = JSON.parse(localStorage.getItem('system_announcements') || '[]');
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setAnnouncements(list);
  };

  const handleOpenModal = (item?: Announcement) => {
    if (item) {
      setEditingId(item.id);
      setTitle(item.title);
      setContent(item.content);
      setPriority(item.priority);
      setStartDate(item.startDate);
      setExpirationDate(item.expirationDate);
    } else {
      setEditingId(null);
      setTitle('');
      setContent('');
      setPriority('normal');
      setStartDate(new Date().toISOString().split('T')[0]);
      
      const future = new Date();
      future.setDate(future.getDate() + 7);
      setExpirationDate(future.toISOString().split('T')[0]);
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!title.trim() || !content.trim() || !startDate || !expirationDate) {
      alert("Preencha todos os campos.");
      return;
    }

    if (new Date(startDate) > new Date(expirationDate)) {
      alert("A data inicial não pode ser maior que a data de expiração.");
      return;
    }

    const list = [...announcements];

    if (editingId) {
      const index = list.findIndex(a => a.id === editingId);
      if (index !== -1) {
        list[index] = { ...list[index], title, content, priority, startDate, expirationDate };
        logAction('Comunicados', 'Edição', 'Admin', undefined, `Comunicado editado: ${title}`);
      }
    } else {
      const newItem: Announcement = {
        id: 'ann-' + Date.now(),
        title,
        content,
        priority,
        startDate,
        expirationDate,
        createdAt: new Date().toISOString()
      };
      list.push(newItem);
      logAction('Comunicados', 'Criação', 'Admin', undefined, `Novo comunicado: ${title}`);
    }

    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    localStorage.setItem('system_announcements', JSON.stringify(list));
    setAnnouncements(list);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Deseja mesmo excluir este comunicado?")) {
      const list = announcements.filter(a => a.id !== id);
      localStorage.setItem('system_announcements', JSON.stringify(list));
      setAnnouncements(list);
      logAction('Comunicados', 'Exclusão', 'Admin', undefined, `Comunicado excluído: ${id}`);
    }
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'urgente': return 'bg-red-500/20 text-red-500 border-red-500/30';
      case 'importante': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  const isExpired = (expDate: string) => new Date(expDate + 'T23:59:59') < new Date();
  const isScheduled = (startDate: string) => new Date(startDate + 'T00:00:00') > new Date();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Megaphone className="text-[#00FF66] w-8 h-8" />
              Central de Comunicados
            </h1>
            <p className="text-gray-400 text-sm mt-1">Crie avisos que aparecerão para os usuários do sistema.</p>
          </div>
          <Button onClick={() => handleOpenModal()} className="gap-2">
            <Plus className="w-4 h-4" /> Novo Comunicado
          </Button>
        </div>

        <div className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[#1A1A1A] text-gray-400 text-sm">
              <tr>
                <th className="p-4 font-medium w-1/3">Título / Conteúdo</th>
                <th className="p-4 font-medium">Prioridade</th>
                <th className="p-4 font-medium">Período de Exibição</th>
                <th className="p-4 font-medium">Status Atual</th>
                <th className="p-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-sm">
              {announcements.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">Nenhum comunicado criado.</td>
                </tr>
              ) : (
                announcements.map(a => {
                  const expired = isExpired(a.expirationDate);
                  const scheduled = isScheduled(a.startDate);
                  const active = !expired && !scheduled;

                  return (
                    <tr key={a.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-white">{a.title}</p>
                        <p className="text-gray-500 text-xs mt-1 truncate max-w-xs">{a.content}</p>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${getPriorityColor(a.priority)}`}>
                          {a.priority}
                        </span>
                      </td>
                      <td className="p-4 text-gray-400 text-xs">
                        <div className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Início: {new Date(a.startDate + 'T12:00:00').toLocaleDateString('pt-BR')}</div>
                        <div className="flex items-center gap-1 mt-1 text-gray-500">Fim: {new Date(a.expirationDate + 'T12:00:00').toLocaleDateString('pt-BR')}</div>
                      </td>
                      <td className="p-4">
                        {expired ? (
                          <span className="text-red-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1"><ShieldAlert className="w-3.5 h-3.5" /> Expirado (Inativo)</span>
                        ) : scheduled ? (
                          <span className="text-blue-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Agendado</span>
                        ) : (
                          <span className="text-[#00FF66] text-xs font-bold uppercase tracking-wider flex items-center gap-1"><Megaphone className="w-3.5 h-3.5" /> Ativo Agora</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleOpenModal(a)} className="p-2 text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-800 rounded transition" title="Editar">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(a.id)} className="p-2 text-gray-400 hover:text-red-500 bg-gray-800/50 hover:bg-gray-800 rounded transition" title="Excluir">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111] border border-gray-800 rounded-xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Editar Comunicado' : 'Novo Comunicado'}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Título do Comunicado</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Manutenção Programada" className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg p-2 text-white outline-none focus:border-[#00FF66]" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Conteúdo</label>
                <textarea value={content} onChange={e => setContent(e.target.value)} rows={4} placeholder="Mensagem detalhada..." className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg p-2 text-white outline-none focus:border-[#00FF66] resize-none" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Prioridade</label>
                <div className="flex gap-2">
                  {(['normal', 'importante', 'urgente'] as const).map(p => (
                    <label key={p} className={`flex-1 flex items-center justify-center gap-2 p-2 rounded-lg border cursor-pointer transition capitalize font-bold text-xs ${priority === p ? getPriorityColor(p) + ' bg-opacity-30' : 'bg-[#1A1A1A] border-gray-700 text-gray-500 hover:border-gray-600'}`}>
                      <input type="radio" name="priority" checked={priority === p} onChange={() => setPriority(p)} className="hidden" />
                      {p === 'urgente' ? <AlertCircle className="w-4 h-4" /> : p === 'importante' ? <Info className="w-4 h-4" /> : <Megaphone className="w-4 h-4" />}
                      {p}
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 border-t border-gray-800 pt-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Aparece a partir de:</label>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg p-2 text-sm text-white outline-none focus:border-[#00FF66] [color-scheme:dark]" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Ocultado após:</label>
                  <input type="date" value={expirationDate} onChange={e => setExpirationDate(e.target.value)} className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg p-2 text-sm text-white outline-none focus:border-[#00FF66] [color-scheme:dark]" />
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6 pt-4 border-t border-gray-800">
              <Button variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button className="flex-1" onClick={handleSave}>Salvar Comunicado</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
