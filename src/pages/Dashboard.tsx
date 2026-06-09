import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, UserCheck, UserX, Clock, ShieldAlert, Activity, TrendingUp, Filter, Share2, Crown, Zap, AlertTriangle, Gift, Link2 } from 'lucide-react';
import { User, UserPlan, UserOrigin } from '../contexts/AuthContext';
import { AccessRequest } from './Landing';
import { getMissionStats } from '../lib/invites';

export default function Dashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [inviteFilter, setInviteFilter] = useState<'today' | '7d' | '30d' | '90d' | 'all'>('all');
  const [inviteStats, setInviteStats] = useState(getMissionStats());

  useEffect(() => {
    setUsers(JSON.parse(localStorage.getItem('system_users') || '[]'));
    setRequests(JSON.parse(localStorage.getItem('system_requests') || '[]'));
  }, []);

  useEffect(() => {
    setInviteStats(getMissionStats(inviteFilter === 'all' ? undefined : inviteFilter));
  }, [inviteFilter]);

  // --- Users Metrics ---
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'ativo').length;
  const inactiveUsers = users.filter(u => u.status === 'inativo').length;
  const expiredUsers = users.filter(u => u.status === 'expirado').length;
  const suspendedUsers = users.filter(u => u.status === 'suspenso').length;
  
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const new7Days = users.filter(u => new Date(u.createdAt) >= sevenDaysAgo).length;
  const new30Days = users.filter(u => new Date(u.createdAt) >= thirtyDaysAgo).length;

  // --- Requests Metrics ---
  const totalRequests = requests.length;
  const pendingRequests = requests.filter(r => r.status === 'pendente').length;
  const analyzingRequests = requests.filter(r => r.status === 'em_analise').length;
  const approvedRequests = requests.filter(r => r.status === 'aprovado').length;
  const rejectedRequests = requests.filter(r => r.status === 'rejeitado').length;
  const loginCreatedRequests = requests.filter(r => r.status === 'login_criado').length;

  const conversionRate = totalRequests > 0 ? ((loginCreatedRequests / totalRequests) * 100).toFixed(1) : '0.0';

  // --- Activity Metrics ---
  const neverAccessed = users.filter(u => !u.lastAccess).length;
  const pwdChangePending = users.filter(u => u.forcarTrocaSenha).length;
  const lastAccesses = [...users].filter(u => u.lastAccess).sort((a, b) => new Date(b.lastAccess!).getTime() - new Date(a.lastAccess!).getTime()).slice(0, 5);

  // --- Plans ---
  const planCounts = {
    free: users.filter(u => u.plan === 'free').length,
    premium: users.filter(u => u.plan === 'premium').length,
    vip: users.filter(u => u.plan === 'vip').length,
  };

  // --- Origins ---
  const originTypes: UserOrigin[] = ['Instagram', 'TikTok', 'WhatsApp', 'YouTube', 'Facebook', 'Google', 'Indicação', 'Outros'];
  
  const originStats = originTypes.map(origin => {
    const reqs = requests.filter(r => r.origin === origin);
    const converted = reqs.filter(r => r.status === 'login_criado');
    const rate = reqs.length > 0 ? ((converted.length / reqs.length) * 100).toFixed(1) : '0.0';
    return {
      origin,
      requests: reqs.length,
      converted: converted.length,
      rate: Number(rate)
    };
  }).filter(stat => stat.requests > 0).sort((a, b) => b.requests - a.requests);

  const bestChannelByVolume = originStats.length > 0 ? originStats[0] : null;
  const bestChannelByRate = originStats.length > 0 ? [...originStats].sort((a, b) => b.rate - a.rate)[0] : null;

  const StatCard = ({ title, value, icon: Icon, color, bg }: any) => (
    <div className={`p-5 rounded-xl border ${bg} border-gray-800`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
          <p className="text-2xl font-black text-white">{value}</p>
        </div>
        <div className={`p-2 rounded-lg ${color.replace('text-', 'bg-')}/10`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="text-[#00FF66] w-8 h-8" />
          <h1 className="text-2xl font-bold">Dashboard Executivo</h1>
        </div>

        {/* --- Visão Geral de Usuários --- */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2 border-b border-gray-800 pb-2">
            <Users className="w-5 h-5 text-blue-400" /> Visão Geral de Usuários
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard title="Total Cadastrados" value={totalUsers} icon={Users} color="text-blue-400" bg="bg-[#111]" />
            <StatCard title="Usuários Ativos" value={activeUsers} icon={UserCheck} color="text-[#00FF66]" bg="bg-[#111]" />
            <StatCard title="Usuários Expirados" value={expiredUsers} icon={Clock} color="text-red-500" bg="bg-[#111]" />
            <StatCard title="Usuários Suspensos" value={suspendedUsers} icon={AlertTriangle} color="text-yellow-500" bg="bg-[#111]" />
          </div>
          <div className="flex gap-4 text-sm text-gray-400">
            <span>Inativos: <strong className="text-white">{inactiveUsers}</strong></span>
            <span>•</span>
            <span>Novos (7 dias): <strong className="text-[#00FF66]">+{new7Days}</strong></span>
            <span>•</span>
            <span>Novos (30 dias): <strong className="text-[#00FF66]">+{new30Days}</strong></span>
          </div>
        </section>

        {/* --- Distribuição de Planos --- */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2 border-b border-gray-800 pb-2">
            <Crown className="w-5 h-5 text-yellow-500" /> Distribuição de Planos
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#111] border border-gray-800 p-4 rounded-xl text-center">
              <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Free</p>
              <p className="text-3xl font-black text-gray-300">{planCounts.free}</p>
            </div>
            <div className="bg-[#111] border border-gray-800 p-4 rounded-xl text-center ring-1 ring-blue-500/20">
              <p className="text-blue-400 text-sm font-bold uppercase tracking-wider mb-2">Premium</p>
              <p className="text-3xl font-black text-white">{planCounts.premium}</p>
            </div>
            <div className="bg-[#111] border border-gray-800 p-4 rounded-xl text-center ring-1 ring-yellow-500/20">
              <p className="text-yellow-500 text-sm font-bold uppercase tracking-wider mb-2">VIP</p>
              <p className="text-3xl font-black text-white">{planCounts.vip}</p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* --- Solicitações e Conversão --- */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2 border-b border-gray-800 pb-2">
              <TrendingUp className="w-5 h-5 text-purple-400" /> Funil de Conversão
            </h2>
            <div className="bg-[#111] border border-gray-800 rounded-xl p-5 space-y-5">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-400 text-sm">Taxa de Conversão Global</p>
                  <p className="text-3xl font-black text-purple-400">{conversionRate}%</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-sm">Total de Leads</p>
                  <p className="text-xl font-bold text-white">{totalRequests}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-[#1A1A1A] p-3 rounded-lg flex justify-between">
                  <span className="text-gray-400">Aprovados (Logins)</span>
                  <strong className="text-[#00FF66]">{loginCreatedRequests}</strong>
                </div>
                <div className="bg-[#1A1A1A] p-3 rounded-lg flex justify-between">
                  <span className="text-gray-400">Em Análise / Pendente</span>
                  <strong className="text-blue-400">{pendingRequests + analyzingRequests}</strong>
                </div>
                <div className="bg-[#1A1A1A] p-3 rounded-lg flex justify-between">
                  <span className="text-gray-400">Rejeitados</span>
                  <strong className="text-red-400">{rejectedRequests}</strong>
                </div>
              </div>
            </div>
          </section>

          {/* --- Atividade e Retenção --- */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2 border-b border-gray-800 pb-2">
              <Activity className="w-5 h-5 text-pink-400" /> Atividade e Retenção
            </h2>
            <div className="bg-[#111] border border-gray-800 rounded-xl p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4 border-b border-gray-800 pb-4">
                <div>
                  <p className="text-gray-400 text-sm">Nunca Acessaram</p>
                  <p className="text-xl font-bold text-yellow-500">{neverAccessed}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Troca de Senha Pendente</p>
                  <p className="text-xl font-bold text-orange-400">{pwdChangePending}</p>
                </div>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-2">Últimos Acessos</p>
                <div className="space-y-2">
                  {lastAccesses.length === 0 ? (
                    <p className="text-xs text-gray-500">Nenhum acesso registrado.</p>
                  ) : (
                    lastAccesses.map(u => (
                      <div key={u.id} className="flex justify-between items-center bg-[#1A1A1A] p-2 rounded-lg text-xs">
                        <span className="font-medium text-white">{u.name}</span>
                        <span className="text-gray-500">{new Date(u.lastAccess!).toLocaleString('pt-BR')}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* --- Conversão por Canal (Origem) --- */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2 border-b border-gray-800 pb-2">
            <Share2 className="w-5 h-5 text-cyan-400" /> Conversão por Canal de Origem
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {bestChannelByVolume && (
              <div className="bg-gradient-to-r from-blue-500/10 to-transparent border border-blue-500/20 p-4 rounded-xl">
                <p className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">Maior Volume de Leads</p>
                <p className="text-xl font-black text-white">{bestChannelByVolume.origin} <span className="text-sm font-normal text-gray-400">({bestChannelByVolume.requests} leads)</span></p>
              </div>
            )}
            {bestChannelByRate && (
              <div className="bg-gradient-to-r from-[#00FF66]/10 to-transparent border border-[#00FF66]/20 p-4 rounded-xl">
                <p className="text-[#00FF66] text-xs font-bold uppercase tracking-wider mb-1">Melhor Conversão</p>
                <p className="text-xl font-black text-white">{bestChannelByRate.origin} <span className="text-sm font-normal text-gray-400">({bestChannelByRate.rate}% convertidos)</span></p>
              </div>
            )}
          </div>

          <div className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-[#1A1A1A] text-gray-400 text-sm">
                <tr>
                  <th className="p-4 font-medium">Canal de Origem</th>
                  <th className="p-4 font-medium text-right">Solicitações</th>
                  <th className="p-4 font-medium text-right">Aprovados</th>
                  <th className="p-4 font-medium text-right">Taxa de Conversão</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 text-sm">
                {originStats.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500">
                      Nenhum dado de origem registrado nas solicitações.
                    </td>
                  </tr>
                ) : (
                  originStats.map(stat => (
                    <tr key={stat.origin} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 font-bold text-white flex items-center gap-2">
                        {stat.origin}
                      </td>
                      <td className="p-4 text-right text-gray-400">{stat.requests}</td>
                      <td className="p-4 text-right text-[#00FF66] font-bold">{stat.converted}</td>
                      <td className="p-4 text-right">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${stat.rate >= 50 ? 'bg-[#00FF66]/20 text-[#00FF66]' : stat.rate > 0 ? 'bg-yellow-500/20 text-yellow-500' : 'bg-gray-800 text-gray-500'}`}>
                          {stat.rate}%
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* --- Sistema de Convites --- */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-gray-800 pb-2">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Gift className="w-5 h-5 text-purple-400" /> Sistema de Convites
            </h2>
            <div className="flex gap-1">
              {(['today', '7d', '30d', '90d', 'all'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setInviteFilter(f)}
                  className={`px-3 py-1 text-xs rounded-full font-medium transition ${
                    inviteFilter === f ? 'bg-purple-600 text-white' : 'bg-[#1A1A1A] text-gray-400 hover:text-white'
                  }`}
                >
                  {f === 'today' ? 'Hoje' : f === 'all' ? 'Todos' : f}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <StatCard title="Links Gerados" value={inviteStats.totalLinks} icon={Link2} color="text-purple-400" bg="bg-[#111]" />
            <StatCard title="Visitas Válidas" value={inviteStats.totalValidVisits} icon={Share2} color="text-blue-400" bg="bg-[#111]" />
            <StatCard title="Metas Concluídas" value={inviteStats.totalGoalMet} icon={Zap} color="text-yellow-400" bg="bg-[#111]" />
            <StatCard title="Solic. Liberadas" value={inviteStats.totalRequestsSent} icon={UserCheck} color="text-[#00FF66]" bg="bg-[#111]" />
            <StatCard title="Aprovados" value={inviteStats.totalApproved} icon={Crown} color="text-orange-400" bg="bg-[#111]" />
          </div>

          <div className="bg-gradient-to-r from-purple-500/10 to-transparent border border-purple-500/20 rounded-xl p-4 flex justify-between items-center">
            <div>
              <p className="text-purple-400 text-xs font-bold uppercase tracking-wider mb-1">Taxa de Conversão de Convites</p>
              <p className="text-3xl font-black text-white">{inviteStats.conversionRate}%</p>
            </div>
            <p className="text-sm text-gray-500">Solic. Liberadas ÷ Links Gerados</p>
          </div>

          <div className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden">
            <div className="bg-[#1A1A1A] px-4 py-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <p className="font-bold text-sm">Ranking — Top por Visitas Geradas</p>
            </div>
            <table className="w-full text-left">
              <thead className="text-gray-400 text-xs">
                <tr>
                  <th className="px-4 py-3 font-medium">#</th>
                  <th className="px-4 py-3 font-medium">Nome / Código</th>
                  <th className="px-4 py-3 font-medium text-right">Visitas</th>
                  <th className="px-4 py-3 font-medium text-right hidden md:table-cell">Criado em</th>
                  <th className="px-4 py-3 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 text-sm">
                {inviteStats.ranking.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-500">Nenhum link gerado ainda.</td></tr>
                ) : (
                  inviteStats.ranking.map((r, i) => (
                    <tr key={r.code} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-gray-500 font-bold">{i + 1}</td>
                      <td className="px-4 py-3">
                        <p className="font-bold text-white">{r.name}</p>
                        <p className="text-xs text-gray-500 font-mono">{r.code}</p>
                      </td>
                      <td className="px-4 py-3 text-right font-black text-purple-400">{r.visits}</td>
                      <td className="px-4 py-3 text-right text-gray-500 hidden md:table-cell">{new Date(r.createdAt).toLocaleDateString('pt-BR')}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          r.status === 'Aprovado' ? 'bg-[#00FF66]/20 text-[#00FF66]'
                          : r.status === 'Rejeitado' ? 'bg-red-500/20 text-red-400'
                          : r.status === 'Concluído' ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-gray-800 text-gray-400'
                        }`}>{r.status}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
}
