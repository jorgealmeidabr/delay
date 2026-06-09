import React, { useState, useEffect } from 'react';
import { ClipboardList, Clock, Search, CheckCircle, XCircle, UserPlus, Eye, Copy, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { User } from '../contexts/AuthContext';
import { logAction } from '../lib/audit';
import { AccessRequest } from './Landing';

type StatusFilter = 'todos' | 'pendente' | 'em_analise' | 'aprovado' | 'rejeitado' | 'login_criado';

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  pendente:      { label: 'Pendente',     color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
  em_analise:    { label: 'Em Análise',   color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/20' },
  aprovado:      { label: 'Aprovado',     color: 'text-green-400',  bg: 'bg-green-500/10 border-green-500/20' },
  rejeitado:     { label: 'Rejeitado',    color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/20' },
  login_criado:  { label: 'Login Criado', color: 'text-[#00FF66]',  bg: 'bg-[#00FF66]/10 border-[#00FF66]/20' },
};

export default function Solicitacoes() {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [filter, setFilter] = useState<StatusFilter>('todos');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Approve modal
  const [approveRequest, setApproveRequest] = useState<AccessRequest | null>(null);
  const [approvePassword, setApprovePassword] = useState('');
  const [approveRole, setApproveRole] = useState<'admin' | 'usuario'>('usuario');

  // Message modal
  const [msgModal, setMsgModal] = useState<{ nome: string; email: string; senha: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = () => {
    const list: AccessRequest[] = JSON.parse(localStorage.getItem('system_requests') || '[]');
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setRequests(list);
  };

  const updateRequest = (id: string, updates: Partial<AccessRequest>) => {
    const list: AccessRequest[] = JSON.parse(localStorage.getItem('system_requests') || '[]');
    const idx = list.findIndex(r => r.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates };
      localStorage.setItem('system_requests', JSON.stringify(list));
      setRequests([...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }
  };

  const handleAnalise = (req: AccessRequest) => {
    updateRequest(req.id, { status: 'em_analise' });
    logAction('Solicitações', 'Em Análise', req.email, 'pendente', 'em_analise');
  };

  const handleReject = (req: AccessRequest) => {
    if (window.confirm(`Rejeitar a solicitação de ${req.nome}?`)) {
      updateRequest(req.id, { status: 'rejeitado' });
      logAction('Solicitações', 'Solicitação Rejeitada', req.email, req.status, 'rejeitado');
    }
  };

  const handleApproveSubmit = () => {
    if (!approveRequest) return;
    if (!approvePassword.trim()) {
      alert('Informe uma senha inicial para o usuário.');
      return;
    }

    // Create user in system_users
    const systemUsers: User[] = JSON.parse(localStorage.getItem('system_users') || '[]');
    if (systemUsers.some(u => u.email === approveRequest.email)) {
      alert('Já existe um usuário com este e-mail no sistema.');
      return;
    }

    const newUser: User = {
      id: 'usr-' + Date.now(),
      name: approveRequest.nome,
      email: approveRequest.email,
      password: approvePassword.trim(),
      role: approveRole,
      status: 'ativo',
      forcarTrocaSenha: true,
      createdAt: new Date().toISOString(),
      plan: 'free',
      startDate: new Date().toISOString(),
      origin: approveRequest.origin
    };

    systemUsers.push(newUser);
    localStorage.setItem('system_users', JSON.stringify(systemUsers));

    // Update request status
    updateRequest(approveRequest.id, {
      status: 'login_criado',
      adminResponsavel: 'Admin',
      loginCriado: approveRequest.email
    });

    logAction('Solicitações', 'Solicitação Aprovada', approveRequest.email, 'em_analise', 'aprovado');
    logAction('Usuários', 'Login Criado via Solicitação', newUser.email, undefined, JSON.stringify(newUser));

    // Show message modal
    setMsgModal({ nome: approveRequest.nome, email: approveRequest.email, senha: approvePassword.trim() });
    setApproveRequest(null);
    setApprovePassword('');
  };

  const getRenderedMessage = () => {
    if (!msgModal) return '';
    const template = localStorage.getItem('funnel_msg_template') || 'Login: {email}\nSenha: {senha}';
    const systemLink = localStorage.getItem('funnel_system_link') || window.location.origin;
    return template
      .replace(/\{nome\}/g, msgModal.nome)
      .replace(/\{email\}/g, msgModal.email)
      .replace(/\{senha\}/g, msgModal.senha)
      .replace(/\{link_sistema\}/g, systemLink);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getRenderedMessage());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filtered = filter === 'todos' ? requests : requests.filter(r => r.status === filter);

  const counts = {
    pendente: requests.filter(r => r.status === 'pendente').length,
    em_analise: requests.filter(r => r.status === 'em_analise').length,
    aprovado: requests.filter(r => r.status === 'aprovado').length,
    rejeitado: requests.filter(r => r.status === 'rejeitado').length,
    login_criado: requests.filter(r => r.status === 'login_criado').length,
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ClipboardList className="text-[#00FF66] w-8 h-8" />
          Solicitações de Acesso
        </h1>

        {/* Dashboard counters */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(counts).map(([key, val]) => {
            const s = STATUS_LABELS[key];
            return (
              <button
                key={key}
                onClick={() => setFilter(key as StatusFilter)}
                className={`p-4 rounded-xl border text-left transition-all ${filter === key ? s.bg + ' ring-1 ring-white/10' : 'bg-[#111] border-gray-800 hover:border-gray-700'}`}
              >
                <p className="text-2xl font-black text-white">{val}</p>
                <p className={`text-xs font-bold uppercase tracking-wider mt-1 ${s.color}`}>{s.label}</p>
              </button>
            );
          })}
        </div>

        <button onClick={() => setFilter('todos')} className={`text-xs px-3 py-1 rounded-full border transition ${filter === 'todos' ? 'bg-white/10 border-white/20 text-white' : 'border-gray-800 text-gray-500 hover:text-white'}`}>
          Mostrar Todos ({requests.length})
        </button>

        {/* Request List */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-600">
              <ClipboardList className="w-12 h-12 mx-auto opacity-30 mb-3" />
              <p>Nenhuma solicitação encontrada.</p>
            </div>
          )}

          {filtered.map(req => {
            const s = STATUS_LABELS[req.status];
            const isExpanded = expandedId === req.id;
            return (
              <div key={req.id} className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden">
                {/* Row */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : req.id)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${s.color.replace('text-', 'bg-')}`} />
                    <div className="min-w-0">
                      <p className="font-bold text-white truncate">{req.nome}</p>
                      <p className="text-xs text-gray-500 truncate">{req.email} · {req.whatsapp}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded border ${s.bg} ${s.color}`}>
                      {s.label}
                    </span>
                    <span className="text-xs text-gray-600 hidden md:inline">
                      {new Date(req.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                  </div>
                </button>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="p-4 pt-0 border-t border-gray-800 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div><span className="text-gray-500">Nome:</span> <span className="text-white ml-1">{req.nome}</span></div>
                      <div><span className="text-gray-500">WhatsApp:</span> <span className="text-white ml-1">{req.whatsapp}</span></div>
                      <div><span className="text-gray-500">E-mail:</span> <span className="text-white ml-1">{req.email}</span></div>
                      <div><span className="text-gray-500">E-mail da Bet:</span> <span className="text-white ml-1">{req.emailBet}</span></div>
                      {req.idBet && <div><span className="text-gray-500">ID Bet:</span> <span className="text-white ml-1">{req.idBet}</span></div>}
                      {req.codigoAfiliado && <div><span className="text-gray-500">Cód. Afiliado:</span> <span className="text-white ml-1">{req.codigoAfiliado}</span></div>}
                      {req.cidade && <div><span className="text-gray-500">Cidade:</span> <span className="text-white ml-1">{req.cidade}</span></div>}
                      {req.origin && <div><span className="text-gray-500">Origem:</span> <span className="text-white ml-1">{req.origin}</span></div>}
                      <div><span className="text-gray-500">Solicitação:</span> <span className="text-white ml-1">{new Date(req.createdAt).toLocaleString('pt-BR')}</span></div>
                    </div>
                    {req.observacoes && (
                      <div className="text-sm"><span className="text-gray-500">Observações:</span> <span className="text-gray-300 ml-1">{req.observacoes}</span></div>
                    )}
                    {req.comprovante && (
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Comprovante:</p>
                        <img src={req.comprovante} alt="Comprovante" className="rounded-lg max-h-48 border border-gray-800" />
                      </div>
                    )}
                    {req.adminResponsavel && (
                      <div className="text-xs text-gray-600">Admin responsável: {req.adminResponsavel} | Login: {req.loginCriado}</div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t border-gray-800/50 flex-wrap">
                      {req.status === 'pendente' && (
                        <>
                          <Button variant="secondary" className="gap-1.5 text-xs" onClick={() => handleAnalise(req)}>
                            <Eye className="w-3.5 h-3.5" /> Iniciar Análise
                          </Button>
                          <Button variant="outline" className="gap-1.5 text-xs text-red-400 border-red-500/30 hover:bg-red-500/10" onClick={() => handleReject(req)}>
                            <XCircle className="w-3.5 h-3.5" /> Rejeitar
                          </Button>
                        </>
                      )}
                      {req.status === 'em_analise' && (
                        <>
                          <Button className="gap-1.5 text-xs" onClick={() => { setApproveRequest(req); setApprovePassword(''); setApproveRole('usuario'); }}>
                            <UserPlus className="w-3.5 h-3.5" /> Aprovar e Criar Login
                          </Button>
                          <Button variant="outline" className="gap-1.5 text-xs text-red-400 border-red-500/30 hover:bg-red-500/10" onClick={() => handleReject(req)}>
                            <XCircle className="w-3.5 h-3.5" /> Rejeitar
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Approve Modal */}
      {approveRequest && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111] border border-gray-800 rounded-xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-[#00FF66]" /> Aprovar e Criar Login
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nome</label>
                <input type="text" value={approveRequest.nome} disabled className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg p-2 text-white opacity-60" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">E-mail (será o login)</label>
                <input type="text" value={approveRequest.email} disabled className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg p-2 text-white opacity-60" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Perfil</label>
                <select value={approveRole} onChange={(e: any) => setApproveRole(e.target.value)} className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg p-2 text-white outline-none focus:border-[#00FF66]">
                  <option value="usuario">Usuário</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Senha Inicial</label>
                <input type="text" value={approvePassword} onChange={e => setApprovePassword(e.target.value)} placeholder="Digite a senha para enviar ao cliente" className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg p-2 text-white outline-none focus:border-[#00FF66]" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" className="flex-1" onClick={() => setApproveRequest(null)}>Cancelar</Button>
              <Button className="flex-1" onClick={handleApproveSubmit}>Criar Login</Button>
            </div>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {msgModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111] border border-gray-800 rounded-xl p-6 w-full max-w-lg space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-green-500" /> Mensagem Pronta para o WhatsApp
            </h2>
            <p className="text-xs text-gray-500">Copie a mensagem abaixo e envie para o cliente via WhatsApp.</p>
            <pre className="bg-[#0A0A0A] border border-gray-800 rounded-lg p-4 text-sm text-gray-300 whitespace-pre-wrap font-mono max-h-64 overflow-y-auto">
              {getRenderedMessage()}
            </pre>
            <div className="flex gap-2">
              <Button className="flex-1 gap-2" onClick={handleCopy}>
                <Copy className="w-4 h-4" /> {copied ? 'Copiado!' : 'Copiar Mensagem'}
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => { setMsgModal(null); loadRequests(); }}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
