import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Radar, ExternalLink, MessageCircle, Send, CheckCircle, Upload, User, Mail, Phone, MapPin, Hash, FileText, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { logAction } from '../lib/audit';
import { UserOrigin } from '../contexts/AuthContext';
import { getMissionConfig } from '../lib/invites';

export interface AccessRequest {
  id: string;
  nome: string;
  whatsapp: string;
  email: string;
  emailBet: string;
  idBet: string;
  codigoAfiliado: string;
  cidade: string;
  observacoes: string;
  comprovante?: string; // base64
  status: 'pendente' | 'em_analise' | 'aprovado' | 'rejeitado' | 'login_criado';
  createdAt: string;
  adminResponsavel?: string;
  loginCriado?: string;
  origin?: UserOrigin;
}

export default function Landing() {
  const [step1Done, setStep1Done] = useState(false);
  const [step2Done, setStep2Done] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [missionActive, setMissionActive] = useState(false);

  // Form state
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

  // Funnel config
  const [betLink, setBetLink] = useState('');
  const [betActive, setBetActive] = useState(true);
  const [whatsappLink, setWhatsappLink] = useState('');
  const [whatsappActive, setWhatsappActive] = useState(true);

  useEffect(() => {
    setBetLink(localStorage.getItem('funnel_bet_link') || '');
    setBetActive(localStorage.getItem('funnel_bet_active') !== 'false');
    setWhatsappLink(localStorage.getItem('funnel_whatsapp_link') || '');
    setWhatsappActive(localStorage.getItem('funnel_whatsapp_active') !== 'false');
    setMissionActive(getMissionConfig().active);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('O comprovante não pode ultrapassar 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setComprovante(reader.result as string);
      setComprovanteNome(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!nome.trim() || !whatsapp.trim() || !email.trim() || !emailBet.trim() || !origin) {
      alert('Preencha todos os campos obrigatórios (Nome, WhatsApp, E-mail, E-mail da Bet e Origem).');
      return;
    }

    const requests: AccessRequest[] = JSON.parse(localStorage.getItem('system_requests') || '[]');

    // Check duplicate email
    if (requests.some(r => r.email === email && r.status !== 'rejeitado')) {
      alert('Já existe uma solicitação com este e-mail. Aguarde a análise do administrador.');
      return;
    }

    const newRequest: AccessRequest = {
      id: 'req-' + Date.now(),
      nome: nome.trim(),
      whatsapp: whatsapp.trim(),
      email: email.trim(),
      emailBet: emailBet.trim(),
      idBet: idBet.trim(),
      codigoAfiliado: codigoAfiliado.trim(),
      cidade: cidade.trim(),
      observacoes: observacoes.trim(),
      origin: origin as UserOrigin,
      comprovante,
      status: 'pendente',
      createdAt: new Date().toISOString()
    };

    requests.push(newRequest);
    localStorage.setItem('system_requests', JSON.stringify(requests));
    logAction('Solicitações', 'Solicitação Criada', newRequest.email, undefined, newRequest.nome);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
        <div className="bg-[#111] border border-gray-800 rounded-2xl p-10 max-w-md text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-[#00FF66]/10 flex items-center justify-center mx-auto border-2 border-[#00FF66]/30">
            <CheckCircle className="w-10 h-10 text-[#00FF66]" />
          </div>
          <h2 className="text-2xl font-black text-white">Solicitação Enviada!</h2>
          <p className="text-gray-400 leading-relaxed">
            Sua solicitação de acesso foi registrada com sucesso. Um administrador irá analisar suas informações e entrará em contato pelo WhatsApp informado.
          </p>
          <div className="pt-4 border-t border-gray-800">
            <Link to="/login" className="text-[#00FF66] font-bold hover:underline text-sm">
              Já recebeu suas credenciais? Faça login aqui →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const showBetStep = betActive && !!betLink;
  const showWhatsappStep = whatsappActive && !!whatsappLink;
  
  let currentStep = 1;
  const betStepNum = showBetStep ? currentStep++ : 0;
  const wppStepNum = showWhatsappStep ? currentStep++ : 0;
  const finalStepNum = currentStep;

  const isFormLocked = (showBetStep && !step1Done) || (showWhatsappStep && !step2Done);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00FF66]/5 via-transparent to-blue-500/5" />
        <div className="max-w-4xl mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-2xl bg-[#00FF66]/10 flex items-center justify-center border border-[#00FF66]/20">
                <Radar className="w-10 h-10 text-[#00FF66]" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-black">
              Delay<span className="text-[#00FF66]">Radar</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-lg mx-auto leading-relaxed">
              Análise avançada de transmissões esportivas ao vivo com inteligência artificial.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Link to="/login">
                <Button variant="outline" className="gap-2 px-6">
                  Já sou cliente <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="max-w-2xl mx-auto px-4 pb-20 space-y-6">
        <h2 className="text-2xl font-bold text-center mb-8">Solicitação de Acesso</h2>
        <p className="text-gray-400 text-center text-sm -mt-6 mb-8">Para receber acesso à plataforma, siga os passos abaixo.</p>

        {/* Step 1 */}
        {showBetStep && (
          <div className={`bg-[#111] border rounded-xl p-6 transition-all ${step1Done ? 'border-[#00FF66]/40' : 'border-gray-800'}`}>
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-black text-lg ${step1Done ? 'bg-[#00FF66] text-black' : 'bg-gray-800 text-gray-400'}`}>
                {step1Done ? '✓' : betStepNum}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold">Criar Conta na Bet Parceira</h3>
                <p className="text-sm text-gray-400 mt-1">Crie sua conta na casa de apostas parceira para começar.</p>
                <Button
                  className="mt-4 gap-2"
                  onClick={() => {
                    window.open(betLink, '_blank');
                    setStep1Done(true);
                  }}
                >
                  Criar Conta <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {showWhatsappStep && (
          <div className={`bg-[#111] border rounded-xl p-6 transition-all ${step2Done ? 'border-green-500/40' : 'border-gray-800'}`}>
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-black text-lg ${step2Done ? 'bg-green-500 text-black' : 'bg-gray-800 text-gray-400'}`}>
                {step2Done ? '✓' : wppStepNum}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold">Entrar no Grupo Oficial</h3>
                <p className="text-sm text-gray-400 mt-1">Entre no nosso grupo VIP do WhatsApp para receber dicas e suporte.</p>
                <Button
                  className="mt-4 gap-2"
                  variant="secondary"
                  onClick={() => {
                    window.open(whatsappLink, '_blank');
                    setStep2Done(true);
                  }}
                >
                  <MessageCircle className="w-4 h-4" /> Entrar no Grupo
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3 */}
        <div className={`bg-[#111] border rounded-xl p-6 transition-all ${showForm ? 'border-blue-500/40' : 'border-gray-800'}`}>
          <div className="flex items-start gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-black text-lg ${showForm ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-400'}`}>
              {finalStepNum}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold">{missionActive ? 'Missão de Liberação' : 'Solicitar Liberação'}</h3>
              <p className="text-sm text-gray-400 mt-1">
                {missionActive 
                  ? 'Para liberar o acesso, você precisa concluir a missão de convites.'
                  : 'Preencha o formulário abaixo para que um administrador analise sua solicitação.'}
              </p>

              {!showForm && !missionActive && (
                <Button
                  className="mt-4 gap-2"
                  variant="outline"
                  onClick={() => setShowForm(true)}
                  disabled={isFormLocked}
                >
                  <Send className="w-4 h-4" /> Solicitar Meu Acesso
                </Button>
              )}

              {!showForm && missionActive && (
                <Link to={isFormLocked ? "#" : "/missao"}>
                  <Button
                    className="mt-4 gap-2"
                    variant="outline"
                    disabled={isFormLocked}
                  >
                    <Send className="w-4 h-4" /> Ir para a Missão
                  </Button>
                </Link>
              )}
              {isFormLocked && !showForm && (
                <p className="text-xs text-yellow-500 mt-2">Complete os passos anteriores para desbloquear.</p>
              )}
            </div>
          </div>

          {showForm && !missionActive && (
            <div className="mt-6 pt-6 border-t border-gray-800 space-y-4">
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
                  <label className="flex items-center gap-1.5 text-sm text-gray-400 mb-1"><Mail className="w-3.5 h-3.5" /> E-mail utilizado na Bet *</label>
                  <input type="email" value={emailBet} onChange={e => setEmailBet(e.target.value)} className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg p-2.5 text-white outline-none focus:border-[#00FF66] text-sm" placeholder="email-da-bet@email.com" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="flex items-center gap-1.5 text-sm text-gray-400 mb-1"><Hash className="w-3.5 h-3.5" /> ID da Conta na Bet</label>
                  <input type="text" value={idBet} onChange={e => setIdBet(e.target.value)} className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg p-2.5 text-white outline-none focus:border-[#00FF66] text-sm" placeholder="Opcional" />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-sm text-gray-400 mb-1"><Hash className="w-3.5 h-3.5" /> Código de Afiliado</label>
                  <input type="text" value={codigoAfiliado} onChange={e => setCodigoAfiliado(e.target.value)} className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg p-2.5 text-white outline-none focus:border-[#00FF66] text-sm" placeholder="Opcional" />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-sm text-gray-400 mb-1"><MapPin className="w-3.5 h-3.5" /> Cidade</label>
                  <input type="text" value={cidade} onChange={e => setCidade(e.target.value)} className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg p-2.5 text-white outline-none focus:border-[#00FF66] text-sm" placeholder="Opcional" />
                </div>
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-sm text-gray-400 mb-1"><MapPin className="w-3.5 h-3.5" /> Como conheceu a plataforma? *</label>
                <select value={origin} onChange={e => setOrigin(e.target.value as UserOrigin | '')} className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg p-2.5 text-white outline-none focus:border-[#00FF66] text-sm">
                  <option value="">Selecione...</option>
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
                <label className="flex items-center gap-1.5 text-sm text-gray-400 mb-1"><FileText className="w-3.5 h-3.5" /> Observações</label>
                <textarea value={observacoes} onChange={e => setObservacoes(e.target.value)} rows={3} className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg p-2.5 text-white outline-none focus:border-[#00FF66] text-sm resize-none" placeholder="Informações adicionais (opcional)" />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-sm text-gray-400 mb-1"><Upload className="w-3.5 h-3.5" /> Comprovante de Cadastro na Bet</label>
                <p className="text-xs text-gray-600 mb-2">Envie um print da tela de cadastro (imagem até 2MB). Opcional, mas recomendado.</p>
                <label className="flex items-center gap-3 cursor-pointer bg-[#1A1A1A] border border-dashed border-gray-700 rounded-lg p-4 hover:border-[#00FF66]/50 transition">
                  <Upload className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-400">{comprovanteNome || 'Clique para anexar imagem'}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                </label>
                {comprovante && (
                  <img src={comprovante} alt="Comprovante" className="mt-3 rounded-lg max-h-32 border border-gray-800" />
                )}
              </div>

              <Button fullWidth className="mt-4 gap-2 py-3" onClick={handleSubmit}>
                <Send className="w-4 h-4" /> Enviar Solicitação de Acesso
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
