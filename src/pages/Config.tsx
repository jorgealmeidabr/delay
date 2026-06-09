import React, { useState, useEffect } from 'react';
import { Settings, Bell, EyeOff, Globe, MessageCircle, Link2, FileText, Gift, Target } from 'lucide-react';
import { logAction } from '../lib/audit';
import { Button } from '../components/ui/Button';
import { getMissionConfig, saveMissionConfig } from '../lib/invites';

export default function ConfigPage() {
  const [monitorActive, setMonitorActive] = useState(false);
  const [interval, setIntervalTime] = useState('30');
  const [blurPlatforms, setBlurPlatforms] = useState(false);

  // Mission System settings
  const [missionActive, setMissionActive] = useState(false);
  const [missionGoal, setMissionGoal] = useState('2');
  const [missionDestLink, setMissionDestLink] = useState('');
  const [missionMessage, setMissionMessage] = useState('Convide {meta} pessoas para acessar este link e desbloqueie sua solicitação de acesso.');

  // Funnel settings
  const [betLink, setBetLink] = useState('');
  const [betActive, setBetActive] = useState(true);
  const [whatsappLink, setWhatsappLink] = useState('');
  const [whatsappActive, setWhatsappActive] = useState(true);
  const [systemLink, setSystemLink] = useState('');
  const [msgTemplate, setMsgTemplate] = useState(
    `Olá {nome},\n\nSeu acesso ao DelayAPI foi aprovado! 🎉\n\nLogin: {email}\nSenha: {senha}\n\nAcesse agora:\n{link_sistema}\n\nNo primeiro acesso você deverá criar uma senha pessoal.\n\nBoas análises! ⚽`
  );

  useEffect(() => {
    setMonitorActive(localStorage.getItem('monitor_active') === 'true');
    setIntervalTime(localStorage.getItem('monitor_interval') || '30');
    setBlurPlatforms(localStorage.getItem('blur_platforms') === 'true');
    setBetLink(localStorage.getItem('funnel_bet_link') || '');
    setBetActive(localStorage.getItem('funnel_bet_active') !== 'false');
    setWhatsappLink(localStorage.getItem('funnel_whatsapp_link') || '');
    setWhatsappActive(localStorage.getItem('funnel_whatsapp_active') !== 'false');
    setSystemLink(localStorage.getItem('funnel_system_link') || window.location.origin);
    setMsgTemplate(localStorage.getItem('funnel_msg_template') || msgTemplate);
    // Load mission config
    const mc = getMissionConfig();
    setMissionActive(mc.active);
    setMissionGoal(String(mc.goal));
    setMissionDestLink(mc.destLink);
    setMissionMessage(mc.message);
  }, []);

  const handleMonitorToggle = () => {
    const val = !monitorActive;
    setMonitorActive(val);
    localStorage.setItem('monitor_active', String(val));
    logAction('Configurações', 'Alteração', 'Monitoramento de Delay', String(monitorActive), String(val));
    if (val) {
      if ('Notification' in window) Notification.requestPermission();
    }
  };

  const handleIntervalChange = (e: any) => {
    const val = e.target.value;
    setIntervalTime(val);
    localStorage.setItem('monitor_interval', val);
  };

  const handleBlurToggle = () => {
    const val = !blurPlatforms;
    setBlurPlatforms(val);
    localStorage.setItem('blur_platforms', String(val));
    logAction('Configurações', 'Alteração', 'Ocultar Plataformas', String(blurPlatforms), String(val));
  };

  const saveFunnelField = (key: string, value: string, label: string) => {
    localStorage.setItem(key, value);
    logAction('Configurações', 'Alteração', label, undefined, value);
  };

  const handleSaveField = (key: string, value: string, label: string) => {
    saveFunnelField(key, value, label);
    alert(`${label} salvo com sucesso!`);
  };

  const handleSaveFunnel = () => {
    saveFunnelField('funnel_bet_link', betLink, 'Link da Bet');
    saveFunnelField('funnel_bet_active', String(betActive), 'Bet Ativa');
    saveFunnelField('funnel_whatsapp_link', whatsappLink, 'Link WhatsApp');
    saveFunnelField('funnel_whatsapp_active', String(whatsappActive), 'WhatsApp Ativo');
    saveFunnelField('funnel_system_link', systemLink, 'Link do Sistema');
    saveFunnelField('funnel_msg_template', msgTemplate, 'Template de Mensagem');
    alert('Configurações do Funil salvas com sucesso!');
  };

  const handleSaveMission = () => {
    saveMissionConfig({
      active: missionActive,
      goal: parseInt(missionGoal) || 2,
      destLink: missionDestLink,
      message: missionMessage,
    });
    logAction('Configurações', 'Alteração', 'Sistema de Missão', undefined, `ativo=${missionActive}, meta=${missionGoal}`);
    alert('Sistema de Missão salvo com sucesso!');
  };

  const ToggleSwitch = ({ checked, onChange, color = '#00FF66' }: { checked: boolean; onChange: () => void; color?: string }) => (
    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
      <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} />
      <div className={`w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`} style={{ backgroundColor: checked ? color : undefined }} />
    </label>
  );

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="text-[#00FF66] w-8 h-8" />
          Configurações
        </h1>

        {/* Monitoramento */}
        <div className="bg-[#111] border border-gray-800 rounded-xl p-6 space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2 border-b border-gray-800 pb-4">
            <Bell className="w-5 h-5 text-[#00FF66]" /> Monitoramento & Notificações
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-lg">Monitoramento de Delay</p>
              <p className="text-sm text-gray-400">Receba avisos quando o delay de um jogo alterar</p>
            </div>
            <ToggleSwitch checked={monitorActive} onChange={handleMonitorToggle} />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-400">Intervalo de verificação</label>
            <select
              value={interval}
              onChange={handleIntervalChange}
              disabled={!monitorActive}
              className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg p-3 text-white focus:border-[#00FF66] outline-none disabled:opacity-50"
            >
              <option value="15">A cada 15 minutos</option>
              <option value="30">A cada 30 minutos</option>
              <option value="60">A cada 1 hora</option>
            </select>
          </div>
        </div>

        {/* Privacidade */}
        <div className="bg-[#111] border border-gray-800 rounded-xl p-6 space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2 border-b border-gray-800 pb-4">
            <EyeOff className="w-5 h-5 text-purple-500" /> Privacidade & Visualização
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-lg">Ocultar Plataformas e Delay</p>
              <p className="text-sm text-gray-400">Borra as informações de delay nos resultados até que você passe o mouse em cima.</p>
            </div>
            <ToggleSwitch checked={blurPlatforms} onChange={handleBlurToggle} color="#a855f7" />
          </div>
        </div>

        {/* Funil de Entrada */}
        <div className="bg-[#111] border border-gray-800 rounded-xl p-6 space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2 border-b border-gray-800 pb-4">
            <Globe className="w-5 h-5 text-blue-400" /> Funil de Entrada
          </h2>

          {/* Bet Link */}
          <div className="space-y-3 p-4 bg-[#0A0A0A] rounded-lg border border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-yellow-500" />
                <p className="font-medium">Casa de Apostas Parceira</p>
              </div>
              <ToggleSwitch checked={betActive} onChange={() => {
                setBetActive(!betActive);
                saveFunnelField('funnel_bet_active', String(!betActive), 'Bet Ativa');
              }} color="#eab308" />
            </div>
            <div className="flex gap-2">
              <input
                type="url"
                value={betLink}
                onChange={e => setBetLink(e.target.value)}
                placeholder="https://siteparceiro.com/cadastro"
                className="flex-1 bg-[#1A1A1A] border border-gray-700 rounded-lg p-2.5 text-white outline-none focus:border-yellow-500 text-sm"
              />
              <Button onClick={() => handleSaveField('funnel_bet_link', betLink, 'Link da Bet')} variant="outline" className="text-yellow-500 border-yellow-500/50 hover:bg-yellow-500/10">
                Salvar
              </Button>
            </div>
          </div>

          {/* WhatsApp Link */}
          <div className="space-y-3 p-4 bg-[#0A0A0A] rounded-lg border border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-green-500" />
                <p className="font-medium">Grupo VIP do WhatsApp</p>
              </div>
              <ToggleSwitch checked={whatsappActive} onChange={() => {
                setWhatsappActive(!whatsappActive);
                saveFunnelField('funnel_whatsapp_active', String(!whatsappActive), 'WhatsApp Ativo');
              }} color="#22c55e" />
            </div>
            <div className="flex gap-2">
              <input
                type="url"
                value={whatsappLink}
                onChange={e => setWhatsappLink(e.target.value)}
                placeholder="https://chat.whatsapp.com/..."
                className="flex-1 bg-[#1A1A1A] border border-gray-700 rounded-lg p-2.5 text-white outline-none focus:border-green-500 text-sm"
              />
              <Button onClick={() => handleSaveField('funnel_whatsapp_link', whatsappLink, 'Link WhatsApp')} variant="outline" className="text-green-500 border-green-500/50 hover:bg-green-500/10">
                Salvar
              </Button>
            </div>
          </div>

          {/* System Link */}
          <div className="space-y-3 p-4 bg-[#0A0A0A] rounded-lg border border-gray-800">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-400" />
              <p className="font-medium">Link do Sistema</p>
            </div>
            <div className="flex gap-2">
              <input
                type="url"
                value={systemLink}
                onChange={e => setSystemLink(e.target.value)}
                placeholder="https://delayapi.com"
                className="flex-1 bg-[#1A1A1A] border border-gray-700 rounded-lg p-2.5 text-white outline-none focus:border-blue-400 text-sm"
              />
              <Button onClick={() => handleSaveField('funnel_system_link', systemLink, 'Link do Sistema')} variant="outline" className="text-blue-400 border-blue-400/50 hover:bg-blue-400/10">
                Salvar
              </Button>
            </div>
          </div>

          {/* Message Template */}
          <div className="space-y-3 p-4 bg-[#0A0A0A] rounded-lg border border-gray-800">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" />
              <p className="font-medium">Modelo de Mensagem de Aprovação</p>
            </div>
            <p className="text-xs text-gray-500">Variáveis disponíveis: <code className="text-purple-400">{'{nome}'}</code>, <code className="text-purple-400">{'{email}'}</code>, <code className="text-purple-400">{'{senha}'}</code>, <code className="text-purple-400">{'{link_sistema}'}</code></p>
            <textarea
              value={msgTemplate}
              onChange={e => setMsgTemplate(e.target.value)}
              rows={8}
              className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg p-3 text-white outline-none focus:border-purple-500 text-sm font-mono resize-none"
            />
            <div className="flex justify-end mt-2">
              <Button onClick={() => handleSaveField('funnel_msg_template', msgTemplate, 'Template de Mensagem')} variant="outline" className="text-purple-400 border-purple-400/50 hover:bg-purple-400/10">
                Salvar Mensagem
              </Button>
            </div>
          </div>

          <Button fullWidth onClick={handleSaveFunnel} className="mt-2">
            Salvar Configurações do Funil
          </Button>
        </div>

        {/* Sistema de Missão */}
        <div className="bg-[#111] border border-purple-500/20 rounded-xl p-6 space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2 border-b border-gray-800 pb-4">
            <Gift className="w-5 h-5 text-purple-400" /> Sistema de Missão
          </h2>

          {/* Ativar */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-lg">Ativar Sistema de Missão</p>
              <p className="text-sm text-gray-400">
                Quando ativo, os visitantes devem cumprir a missão antes de solicitar acesso.
              </p>
            </div>
            <ToggleSwitch checked={missionActive} onChange={() => setMissionActive(v => !v)} color="#a855f7" />
          </div>

          {/* Meta de visitas */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-400">
              <Target className="w-4 h-4" /> Meta de Visitas Válidas
            </label>
            <select
              value={missionGoal}
              onChange={e => setMissionGoal(e.target.value)}
              className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg p-3 text-white outline-none focus:border-purple-500"
            >
              {['1','2','3','5','10','15','20'].map(v => (
                <option key={v} value={v}>{v} visita{v !== '1' ? 's' : ''}</option>
              ))}
            </select>
          </div>

          {/* Link de destino */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-400">
              <Link2 className="w-4 h-4" /> Link de Destino
            </label>
            <p className="text-xs text-gray-600">Para onde os visitantes serão redirecionados ao acessar o link de convite.</p>
            <input
              type="url"
              value={missionDestLink}
              onChange={e => setMissionDestLink(e.target.value)}
              placeholder="https://meulink.com ou https://grupo.vip.com"
              className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg p-3 text-white outline-none focus:border-purple-500 text-sm"
            />
          </div>

          {/* Mensagem da missão */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-400">
              <FileText className="w-4 h-4" /> Mensagem da Missão
            </label>
            <p className="text-xs text-gray-600">Use <code className="text-purple-400">{'{meta}'}</code> para inserir o número da meta automaticamente.</p>
            <textarea
              value={missionMessage}
              onChange={e => setMissionMessage(e.target.value)}
              rows={3}
              className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg p-3 text-white outline-none focus:border-purple-500 text-sm resize-none"
            />
          </div>

          <Button fullWidth onClick={handleSaveMission} className="bg-purple-600 hover:bg-purple-500 text-white font-bold">
            Salvar Sistema de Missão
          </Button>

          {/* Preview do link */}
          <div className="bg-[#0A0A0A] border border-gray-800 rounded-lg p-4 space-y-1">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Página pública da missão</p>
            <code className="text-purple-400 text-sm">{window.location.origin}/missao</code>
          </div>
        </div>

      </div>
    </div>
  );
}

