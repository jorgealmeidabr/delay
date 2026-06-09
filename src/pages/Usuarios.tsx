import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit, Trash2, KeyRound, ShieldAlert, CheckCircle2, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { useAuth, User, UserPlan, UserOrigin } from '../contexts/AuthContext';
import { logAction } from '../lib/audit';
import { Button } from '../components/ui/Button';
import { HistoryTab } from '../components/HistoryTab';

export default function UsuariosPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [historyUser, setHistoryUser] = useState<User | null>(null);
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'usuario'>('usuario');
  const [status, setStatus] = useState<'ativo' | 'inativo' | 'suspenso' | 'expirado'>('ativo');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Comercial
  const [plan, setPlan] = useState<UserPlan>('free');
  const [origin, setOrigin] = useState<UserOrigin | ''>('');
  const [amountPaid, setAmountPaid] = useState<number | ''>('');
  const [adminNotes, setAdminNotes] = useState('');
  const [validade, setValidade] = useState<string>('manter'); // 30, 60, 90, 180, vitalicio, manter

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const list: User[] = JSON.parse(localStorage.getItem('system_users') || '[]');
    setUsers(list);
  };

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setName(user.name);
      setEmail(user.email);
      setRole(user.role);
      setStatus(user.status);
      setPlan(user.plan || 'free');
      setOrigin(user.origin || '');
      setAmountPaid(user.amountPaid || '');
      setAdminNotes(user.adminNotes || '');
      setValidade('manter');
    } else {
      setEditingUser(null);
      setName('');
      setEmail('');
      setRole('usuario');
      setStatus('ativo');
      setPassword('');
      setConfirmPassword('');
      setPlan('free');
      setOrigin('');
      setAmountPaid('');
      setAdminNotes('');
      setValidade('vitalicio');
    }
    setIsModalOpen(true);
  };

  const handleSaveUser = () => {
    if (!name.trim() || !email.trim()) {
      alert("Nome e E-mail são obrigatórios.");
      return;
    }
    
    const list = [...users];
    
    // Calcula expiração
    let newExpiration: string | undefined = undefined;
    if (editingUser) {
      newExpiration = editingUser.expirationDate;
    }
    if (validade !== 'manter') {
      if (validade === 'vitalicio') {
        newExpiration = undefined;
      } else {
        const days = parseInt(validade);
        const date = new Date();
        date.setDate(date.getDate() + days);
        newExpiration = date.toISOString();
      }
    }

    if (editingUser) {
      const index = list.findIndex(u => u.id === editingUser.id);
      if (index !== -1) {
        const oldUser = list[index];
        if (email !== oldUser.email && list.some(u => u.email === email)) {
          alert("Este e-mail já está em uso por outro usuário.");
          return;
        }
        
        const updated: User = { 
          ...oldUser, 
          name, 
          email, 
          role, 
          status,
          plan,
          origin: origin ? (origin as UserOrigin) : undefined,
          amountPaid: amountPaid === '' ? undefined : Number(amountPaid),
          adminNotes,
          expirationDate: newExpiration
        };
        
        // Logs específicos para ações comerciais
        if (oldUser.status !== status && status === 'suspenso') logAction('Usuários', 'Suspensão de Usuário', updated.email, oldUser.status, status);
        if (oldUser.status !== status && status === 'ativo' && oldUser.status === 'suspenso') logAction('Usuários', 'Reativação de Usuário', updated.email, oldUser.status, status);
        if (oldUser.plan !== plan) logAction('Usuários', 'Alteração de Plano', updated.email, oldUser.plan, plan);
        if (validade !== 'manter') logAction('Usuários', 'Alteração de Validade', updated.email, oldUser.expirationDate || 'vitalicio', newExpiration || 'vitalicio');

        list[index] = updated;
        logAction('Usuários', 'Edição Geral', updated.email, JSON.stringify(oldUser), JSON.stringify(updated));
      }
    } else {
      if (!password.trim()) {
        alert("Informe uma senha inicial.");
        return;
      }
      if (password !== confirmPassword) {
        alert("As senhas não coincidem.");
        return;
      }
      if (list.some(u => u.email === email)) {
        alert("Este e-mail já está em uso.");
        return;
      }
      const newUser: User = {
        id: 'usr-' + Date.now().toString(),
        name,
        email,
        password,
        role,
        status,
        forcarTrocaSenha: true,
        createdAt: new Date().toISOString(),
        startDate: new Date().toISOString(),
        plan,
        origin: origin ? (origin as UserOrigin) : undefined,
        amountPaid: amountPaid === '' ? undefined : Number(amountPaid),
        adminNotes,
        expirationDate: newExpiration
      };
      list.push(newUser);
      logAction('Usuários', 'Criação', newUser.email, undefined, JSON.stringify(newUser));
    }

    localStorage.setItem('system_users', JSON.stringify(list));
    setUsers(list);
    setIsModalOpen(false);
  };

  const handleDeleteUser = (u: User) => {
    if (u.id === 'root-admin-001') {
      alert("Não é possível excluir o Administrador Master do sistema.");
      return;
    }
    const confirm = window.confirm(`Deseja mesmo excluir o usuário ${u.email}?`);
    if (confirm) {
      const newList = users.filter(usr => usr.id !== u.id);
      localStorage.setItem('system_users', JSON.stringify(newList));
      setUsers(newList);
      logAction('Usuários', 'Exclusão', u.email, JSON.stringify(u), undefined);
    }
  };

  const handleResetPassword = (u: User) => {
    const novaSenha = window.prompt(`Redefinir a senha de ${u.email}\n\nDigite a nova senha para este usuário:`);
    if (novaSenha !== null && novaSenha.trim() !== '') {
      const newList = [...users];
      const index = newList.findIndex(user => user.id === u.id);
      if (index !== -1) {
        const oldUser = newList[index];
        const updatedUser = { ...oldUser, password: novaSenha.trim(), forcarTrocaSenha: true };
        newList[index] = updatedUser;
        localStorage.setItem('system_users', JSON.stringify(newList));
        setUsers(newList);
        logAction('Usuários', 'Redefinição de Senha', u.email, undefined, 'Senha redefinida e forcarTrocaSenha ativado');
        alert("Senha redefinida com sucesso.");
      }
    }
  };

  const getStatusIcon = (s: string) => {
    switch(s) {
      case 'ativo': return <CheckCircle2 className="w-4 h-4 text-[#00FF66]" />;
      case 'inativo': return <XCircle className="w-4 h-4 text-gray-500" />;
      case 'suspenso': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'expirado': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <CheckCircle2 className="w-4 h-4" />;
    }
  };

  const getStatusColor = (s: string) => {
    switch(s) {
      case 'ativo': return 'text-[#00FF66]';
      case 'inativo': return 'text-gray-500';
      case 'suspenso': return 'text-yellow-500';
      case 'expirado': return 'text-red-500';
      default: return 'text-white';
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="text-[#00FF66] w-8 h-8" />
            Gestão de Usuários
          </h1>
        </div>

        <div className="flex justify-end mb-4">
          {user?.role === 'admin' && (
            <Button onClick={() => handleOpenModal()} className="gap-2 bg-[#00FF66] text-black font-bold">
              + Novo Usuário
            </Button>
          )}
        </div>

        <div className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[#1A1A1A] text-gray-400 text-sm">
              <tr>
                <th className="p-4 font-medium">Nome / Email</th>
                <th className="p-4 font-medium">Plano / Perfil</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium hidden md:table-cell">Data Criação</th>
                <th className="p-4 font-medium">Último Acesso</th>
                <th className="p-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-sm">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-white">{u.name}</p>
                    <p className="text-gray-500">{u.email}</p>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1 items-start">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${u.plan === 'vip' ? 'bg-yellow-500/20 text-yellow-500' : u.plan === 'premium' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'}`}>
                        {u.plan || 'free'}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${u.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-800 text-gray-400'}`}>
                        {u.role}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5">
                        {getStatusIcon(u.status)}
                        <span className={`${getStatusColor(u.status)} capitalize font-medium`}>
                          {u.status}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-500">
                        {u.expirationDate ? `Expira: ${new Date(u.expirationDate).toLocaleDateString('pt-BR')}` : 'Vitalício'}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-500 hidden md:table-cell">
                    {new Date(u.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="p-4 text-gray-500">
                    {u.lastAccess ? new Date(u.lastAccess).toLocaleString('pt-BR') : 'Nunca acessou'}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleResetPassword(u)} className="p-2 text-gray-400 hover:text-yellow-500 bg-gray-800/50 hover:bg-gray-800 rounded transition" title="Redefinir Senha">
                        <KeyRound className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleOpenModal(u)} className="p-2 text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-800 rounded transition" title="Editar">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => setHistoryUser(u === historyUser ? null : u)} className={`p-2 bg-gray-800/50 hover:bg-gray-800 rounded transition ${historyUser?.id === u.id ? 'text-[#00FF66]' : 'text-gray-400 hover:text-white'}`} title="Histórico">
                        <Clock className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteUser(u)} className="p-2 text-gray-400 hover:text-red-500 bg-gray-800/50 hover:bg-gray-800 rounded transition" title="Excluir">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {historyUser && (
          <div className="bg-[#111] border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#00FF66]" />
              Histórico de Atividades — {historyUser.email}
            </h3>
            <HistoryTab registroId={historyUser.email} />
          </div>
        )}

        {/* Modal de Criação/Edição */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-[#111] border border-gray-800 rounded-xl p-6 w-full max-w-2xl my-8">
              <h2 className="text-xl font-bold mb-4">{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Coluna 1: Dados Básicos */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-[#00FF66] border-b border-gray-800 pb-2">Dados Básicos</h3>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Nome Completo</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg p-2 text-white outline-none focus:border-[#00FF66]" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} disabled={editingUser?.id === 'root-admin-001'} className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg p-2 text-white outline-none focus:border-[#00FF66] disabled:opacity-50" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Perfil</label>
                      <select value={role} onChange={(e: any) => setRole(e.target.value)} disabled={editingUser?.id === 'root-admin-001'} className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg p-2 text-white outline-none focus:border-[#00FF66] disabled:opacity-50">
                        <option value="usuario">Usuário</option>
                        <option value="admin">Administrador</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Status</label>
                      <select value={status} onChange={(e: any) => setStatus(e.target.value)} disabled={editingUser?.id === 'root-admin-001'} className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg p-2 text-white outline-none focus:border-[#00FF66] disabled:opacity-50">
                        <option value="ativo">Ativo</option>
                        <option value="inativo">Inativo</option>
                        <option value="suspenso">Suspenso</option>
                        <option value="expirado">Expirado</option>
                      </select>
                    </div>
                  </div>
                  {!editingUser && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Senha Inicial</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Digite a senha" className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg p-2 text-white outline-none focus:border-[#00FF66]" />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Confirmar Senha</label>
                        <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repita a senha" className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg p-2 text-white outline-none focus:border-[#00FF66]" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Coluna 2: Dados Comerciais */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-blue-400 border-b border-gray-800 pb-2">Controle Comercial</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Plano</label>
                      <select value={plan} onChange={(e: any) => setPlan(e.target.value)} className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg p-2 text-white outline-none focus:border-[#00FF66]">
                        <option value="free">Free</option>
                        <option value="premium">Premium</option>
                        <option value="vip">VIP</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Validade do Acesso</label>
                      <select value={validade} onChange={(e: any) => setValidade(e.target.value)} className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg p-2 text-white outline-none focus:border-[#00FF66]">
                        {editingUser && <option value="manter">Manter atual</option>}
                        <option value="30">30 dias</option>
                        <option value="60">60 dias</option>
                        <option value="90">90 dias</option>
                        <option value="180">180 dias</option>
                        <option value="vitalicio">Vitalício</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Origem</label>
                      <select value={origin} onChange={(e: any) => setOrigin(e.target.value)} className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg p-2 text-white outline-none focus:border-[#00FF66]">
                        <option value="">Nenhuma / Direta</option>
                        <option value="Instagram">Instagram</option>
                        <option value="TikTok">TikTok</option>
                        <option value="WhatsApp">WhatsApp</option>
                        <option value="YouTube">YouTube</option>
                        <option value="Facebook">Facebook</option>
                        <option value="Google">Google</option>
                        <option value="Indicação">Indicação</option>
                        <option value="Outros">Outros</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Valor Pago (R$)</label>
                      <input type="number" step="0.01" value={amountPaid} onChange={e => setAmountPaid(e.target.value === '' ? '' : Number(e.target.value))} placeholder="Ex: 97.00" className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg p-2 text-white outline-none focus:border-[#00FF66]" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Observações Administrativas</label>
                    <textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} rows={3} className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg p-2 text-white outline-none focus:border-[#00FF66] resize-none" placeholder="Notas internas..." />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-8 pt-4 border-t border-gray-800">
                <Button variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button className="flex-1" onClick={handleSaveUser}>Salvar Usuário</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
