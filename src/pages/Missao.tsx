import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Radar, Gift, Copy, CheckCircle, Send, User, Mail, Phone,
  MapPin, Hash, FileText, Upload, MessageCircle, ArrowRight, Share2, ExternalLink
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { logAction } from '../lib/audit';
import {
  getOrCreateMyInvite,
  getMissionConfig,
  markRequestSent,
  InviteRecord,
} from '../lib/invites';
import { AccessRequest } from './Landing';
import { UserOrigin } from '../contexts/AuthContext';

export default function MissaoPage() {
  const [invite, setInvite] = useState<InviteRecord | null>(null);
  const [config, setConfig] = useState({ active: false, goal: 2, destLink: '', message: '' });
  const [copied, setCopied] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [whatsLink, setWhatsLink] = useState('');

  // Form fields
  const [nome, setNome] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [emailBet, setEmailBet] = useState('');
  const [idBet, setIdBet] = useState('');
  const [codigoAfiliado, setCodigoAfiliado] = useState('');
  const [cidade, setCidade] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [comprovante, setComprovante] = useState<string | undefined>();
  const [comprovanteNome, setComprovanteNome] = useState('');
  const [origin, setOrigin] = useState<UserOrigin | ''>('');

  useEffect(() => {
    const cfg = getMissionConfig();
    setConfig(cfg);
    const inv = getOrCreateMyInvite();
    setInvite(inv);
    setWhatsLink(localStorage.getItem('funnel_whatsapp_link') || '');
    logAction('Convites', 'Link Criado / Visualizado', inv.code);
  }, []);

  const shareUrl = invite ? `${window.location.origin}/r/${invite.code}` : '';
  const validVisits = invite?.visits.length ?? 0;
  const goal = config.goal;
  const progress = Math.min((validVisits / goal) * 100, 100);
  const goalMet = invite?.goalMet || validVisits >= goal;
  const missionMessage = config.message.replace('{meta}', String(goal));

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    logAction('Convites', 'Link Copiado', invite?.code || '');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert('O comprovante não pode ultrapassar 2MB.'); return; }
    const reader = new FileReader();
    reader.onloadend = () => { setComprovante(reader.result as string); setComprovanteNome(file.name); };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!nome.trim() || !whatsapp.trim() || !email.trim() || !emailBet.trim() || !origin) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }
    const requests: AccessRequest[] = JSON.parse(localStorage.getItem('system_requests') || '[]');
    if (requests.some(r => r.email === email && r.status !== 'rejeitado')) {
      alert('Já existe uma solicitação com este e-mail.');
      return;
    }
    const newRequest: AccessRequest = {
      id: 'req-' + Date.now(),
      nome: nome.trim(), whatsapp: whatsapp.trim(), email: email.trim(),
      emailBet: emailBet.trim(), idBet: idBet.trim(), codigoAfiliado: codigoAfiliado.trim(),
      cidade: cidade.trim(), observacoes: observacoes.trim(),
      origin: origin as UserOrigin, comprovante, status: 'pendente',
      createdAt: new Date().toISOString(),
    };
    requests.push(newRequest);
    localStorage.setItem('system_requests', JSON.stringify(requests));
    if (invite) markRequestSent(invite.code, nome.trim());
    logAction('Convites', 'Solicitação Liberada', newRequest.email);
    logAction('Solicitações', 'Solicitação Criada', newRequest.email, undefined, newRequest.nome);
    setSubmitted(true);
  };

  const whatsappMsg = encodeURIComponent(
    `Olá.\n\nConclui a missão exigida.\n\nNome: ${nome || '(preenchido no formulário)'}\nEmail: ${email || '—'}\nVisitas válidas: ${validVisits}\nCódigo: ${invite?.code || '—'}\n\nGostaria da liberação do meu acesso.`
  );
  const whatsappHref = whatsLink ? `${whatsLink}?text=${whatsappMsg}` : `https://wa.me/?text=${whatsappMsg}`;

  // Se a missão estiver desligada, vai para Landing normal
  if (!config.active) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
        <div className="bg-[#111] border border-gray-800 rounded-2xl p-10 max-w-sm text-center space-y-4">
          <Radar className="w-12 h-12 text-[#00FF66] mx-auto" />
          <h2 className="text-xl font-bold">Sistema de Missão inativo</h2>
          <p className="text-gray-400 text-sm">Acesse a página de solicitação diretamente.</p>
          <Link to="/"><Button fullWidth>Ir para o Início</Button></Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
        <div className="bg-[#111] border border-gray-800 rounded-2xl p-10 max-w-md text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-[#00FF66]/10 flex items-center justify-center mx-auto border-2 border-[#00FF66]/30">
            <CheckCircle className="w-10 h-10 text-[#00FF66]" />
          </div>
          <h2 className="text-2xl font-black text-white">Solicitação Enviada!</h2>
          <p className="text-gray-400 leading-relaxed">
            Sua solicitação foi registrada. Para agilizar a aprovação, clique no botão abaixo e envie a mensagem para o WhatsApp do administrador.
          </p>
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
            <Button fullWidth className="gap-2 bg-green-600 hover:bg-green-500 text-white font-bold">
              <MessageCircle className="w-4 h-4" /> Solicitar Liberação via WhatsApp
            </Button>
          </a>
          <div className="pt-4 border-t border-gray-800">
            <Link to="/login" className="text-[#00FF66] font-bold hover:underline text-sm">
              Já recebeu suas credenciais? Faça login aqui →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-[#00FF66]/5" />
        <div className="max-w-2xl mx-auto px-4 py-14 relative z-10 text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
              <Gift className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          <h1 className="text-4xl font-black">Ganhe acesso ao <span className="text-[#00FF66]">sistema</span></h1>
          <p className="text-gray-400 text-base max-w-lg mx-auto leading-relaxed">
            Para solicitar seu acesso, você precisa concluir a missão abaixo.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-20 space-y-6">

        {/* Card Missão */}
        <div className="bg-[#111] border border-gray-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2 text-purple-400 font-bold text-sm uppercase tracking-wider">
            <Share2 className="w-4 h-4" /> Sua Missão
          </div>
          <p className="text-gray-200 text-base leading-relaxed">{missionMessage}</p>

          {/* Link exclusivo */}
          <div className="space-y-2">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Seu link exclusivo</p>
            <div className="flex gap-2">
              <div className="flex-1 bg-[#1A1A1A] border border-gray-700 rounded-xl px-4 py-3 text-sm font-mono text-[#00FF66] truncate">
                {shareUrl}
              </div>
              <Button onClick={handleCopy} variant="outline" className="border-gray-700 flex-shrink-0 gap-2">
                {copied ? <CheckCircle className="w-4 h-4 text-[#00FF66]" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copiado!' : 'Copiar'}
              </Button>
            </div>
          </div>

          {/* Progresso */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">
                Visitas válidas: <strong className="text-white">{validVisits}/{goal}</strong>
              </span>
              <span className="text-gray-500">
                {goalMet ? '✅ Meta atingida!' : `Faltam: ${goal - validVisits} visita${goal - validVisits !== 1 ? 's' : ''}`}
              </span>
            </div>
            <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${goalMet ? 'bg-[#00FF66]' : 'bg-purple-500'}`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="grid grid-cols-3 text-center text-xs text-gray-500">
              <span>Meta: <strong className="text-white">{goal} visitas</strong></span>
              <span>Válidas: <strong className="text-[#00FF66]">{validVisits}</strong></span>
              <span>Faltam: <strong className="text-yellow-400">{Math.max(0, goal - validVisits)}</strong></span>
            </div>
          </div>
        </div>

        {/* Bloco de Solicitação */}
        {goalMet ? (
          <div className="bg-[#111] border border-[#00FF66]/30 rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-[#00FF66]" />
              <div>
                <p className="font-bold text-[#00FF66]">Missão concluída!</p>
                <p className="text-gray-400 text-sm">Seu acesso pode ser solicitado agora.</p>
              </div>
            </div>

            {!showForm ? (
              <Button fullWidth className="gap-2" onClick={() => setShowForm(true)}>
                <Send className="w-4 h-4" /> Solicitar Acesso
              </Button>
            ) : (
              <div className="space-y-4 pt-4 border-t border-gray-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-1.5 text-sm text-gray-400 mb-1"><User className="w-3.5 h-3.5" /> Nome Completo *</label>
                    <input type="text" value={nome} onChange={e => setNome(e.target.value)} className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg p-2.5 text-white outline-none focus:border-[#00FF66] text-sm" placeholder="Seu nome completo" />
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-sm text-gray-400 mb-1"><Phone className="w-3.5 h-3.5" /> WhatsApp *</label>
                    <input type="tel" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg p-2.5 text-white outline-none focus:border-[#00FF66] text-sm" placeholder="(11) 99999-9999" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-1.5 text-sm text-gray-400 mb-1"><Mail className="w-3.5 h-3.5" /> E-mail *</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg p-2.5 text-white outline-none focus:border-[#00FF66] text-sm" placeholder="seu@email.com" />
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-sm text-gray-400 mb-1"><Mail className="w-3.5 h-3.5" /> E-mail da Bet *</label>
                    <input type="email" value={emailBet} onChange={e => setEmailBet(e.target.value)} className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg p-2.5 text-white outline-none focus:border-[#00FF66] text-sm" placeholder="email-da-bet@email.com" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="flex items-center gap-1.5 text-sm text-gray-400 mb-1"><Hash className="w-3.5 h-3.5" /> ID Bet</label>
                    <input type="text" value={idBet} onChange={e => setIdBet(e.target.value)} className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg p-2.5 text-white outline-none focus:border-[#00FF66] text-sm" placeholder="Opcional" />
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-sm text-gray-400 mb-1"><Hash className="w-3.5 h-3.5" /> Cód. Afiliado</label>
                    <input type="text" value={codigoAfiliado} onChange={e => setCodigoAfiliado(e.target.value)} className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg p-2.5 text-white outline-none focus:border-[#00FF66] text-sm" placeholder="Opcional" />
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-sm text-gray-400 mb-1"><MapPin className="w-3.5 h-3.5" /> Cidade</label>
                    <input type="text" value={cidade} onChange={e => setCidade(e.target.value)} className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg p-2.5 text-white outline-none focus:border-[#00FF66] text-sm" placeholder="Opcional" />
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-sm text-gray-400 mb-1"><MapPin className="w-3.5 h-3.5" /> Como conheceu? *</label>
                  <select value={origin} onChange={e => setOrigin(e.target.value as UserOrigin | '')} className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg p-2.5 text-white outline-none focus:border-[#00FF66] text-sm">
                    <option value="">Selecione...</option>
                    {['Instagram','TikTok','WhatsApp','YouTube','Facebook','Google','Indicação','Outros'].map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-sm text-gray-400 mb-1"><FileText className="w-3.5 h-3.5" /> Observações</label>
                  <textarea value={observacoes} onChange={e => setObservacoes(e.target.value)} rows={2} className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg p-2.5 text-white outline-none focus:border-[#00FF66] text-sm resize-none" placeholder="Opcional" />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-sm text-gray-400 mb-1"><Upload className="w-3.5 h-3.5" /> Comprovante da Bet</label>
                  <label className="flex items-center gap-3 cursor-pointer bg-[#1A1A1A] border border-dashed border-gray-700 rounded-lg p-4 hover:border-[#00FF66]/50 transition">
                    <Upload className="w-5 h-5 text-gray-500" />
                    <span className="text-sm text-gray-400">{comprovanteNome || 'Clique para anexar imagem'}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>
                <Button fullWidth className="gap-2 py-3" onClick={handleSubmit}>
                  <Send className="w-4 h-4" /> Enviar Solicitação de Acesso
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-[#111] border border-gray-800 rounded-2xl p-6 text-center space-y-3 opacity-70">
            <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mx-auto">
              <Send className="w-5 h-5 text-gray-500" />
            </div>
            <p className="font-bold text-gray-400">Solicitar Acesso</p>
            <p className="text-sm text-gray-600">Complete a missão acima para desbloquear o formulário de solicitação.</p>
          </div>
        )}

        {/* Login link */}
        <div className="text-center">
          <Link to="/login" className="text-gray-500 hover:text-[#00FF66] text-sm transition-colors">
            Já tem acesso? Fazer login →
          </Link>
        </div>
      </div>
    </div>
  );
}
