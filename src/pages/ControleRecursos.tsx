import React, { useState, useEffect } from 'react';
import { Settings2, Save, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { UserPlan } from '../contexts/AuthContext';
import { logAction } from '../lib/audit';

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  minPlan: UserPlan;
  active: boolean;
}

const DEFAULT_FEATURES: FeatureFlag[] = [
  { id: 'kpi_avancado', name: 'KPI Avançado', description: 'Módulo avançado de dados na análise do jogo', minPlan: 'premium', active: true },
  { id: 'favorito_estatistico', name: 'Favorito Estatístico', description: 'Análise de 10 jogos e Índice de Confiança Tática', minPlan: 'premium', active: true },
  { id: 'historico_completo', name: 'Histórico Completo', description: 'Acesso completo ao registro de todos os jogos passados', minPlan: 'vip', active: true },
];

export const hasFeatureAccess = (featureId: string, userPlan: UserPlan): boolean => {
  const features: FeatureFlag[] = JSON.parse(localStorage.getItem('system_features') || JSON.stringify(DEFAULT_FEATURES));
  const feature = features.find(f => f.id === featureId);
  
  if (!feature || !feature.active) return false;
  
  const planHierarchy = { 'free': 0, 'premium': 1, 'vip': 2 };
  return planHierarchy[userPlan] >= planHierarchy[feature.minPlan];
};

export default function ControleRecursos() {
  const [features, setFeatures] = useState<FeatureFlag[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedFeatures = localStorage.getItem('system_features');
    if (savedFeatures) {
      setFeatures(JSON.parse(savedFeatures));
    } else {
      setFeatures(DEFAULT_FEATURES);
      localStorage.setItem('system_features', JSON.stringify(DEFAULT_FEATURES));
    }
  }, []);

  const handleToggle = (id: string) => {
    setFeatures(prev => prev.map(f => f.id === id ? { ...f, active: !f.active } : f));
  };

  const handlePlanChange = (id: string, plan: UserPlan) => {
    setFeatures(prev => prev.map(f => f.id === id ? { ...f, minPlan: plan } : f));
  };

  const handleSave = () => {
    const oldFeatures = localStorage.getItem('system_features');
    localStorage.setItem('system_features', JSON.stringify(features));
    logAction('Configurações', 'Alteração de Recursos', 'Admin', oldFeatures || '', JSON.stringify(features));
    
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Settings2 className="text-[#00FF66] w-8 h-8" />
              Controle de Recursos
            </h1>
            <p className="text-gray-400 text-sm mt-1">Defina quais planos têm acesso a cada funcionalidade do sistema.</p>
          </div>
          <Button onClick={handleSave} className="gap-2">
            {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? 'Salvo!' : 'Salvar Alterações'}
          </Button>
        </div>

        <div className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[#1A1A1A] text-gray-400 text-sm">
              <tr>
                <th className="p-4 font-medium w-1/2">Recurso</th>
                <th className="p-4 font-medium">Plano Mínimo Necessário</th>
                <th className="p-4 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {features.map(f => (
                <tr key={f.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-white">{f.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{f.description}</p>
                  </td>
                  <td className="p-4">
                    <select
                      value={f.minPlan}
                      onChange={(e: any) => handlePlanChange(f.id, e.target.value)}
                      className="bg-[#1A1A1A] border border-gray-700 rounded-lg p-2 text-sm text-white outline-none focus:border-[#00FF66]"
                    >
                      <option value="free">Free (Liberado para todos)</option>
                      <option value="premium">Premium (Premium e VIP)</option>
                      <option value="vip">VIP (Apenas VIP)</option>
                    </select>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleToggle(f.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#00FF66] focus:ring-offset-2 focus:ring-offset-black ${
                        f.active ? 'bg-[#00FF66]' : 'bg-gray-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          f.active ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <p className="text-[10px] text-gray-500 mt-1">{f.active ? 'ATIVO' : 'INATIVO'}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-3">
          <ShieldAlert className="w-5 h-5 text-blue-400 flex-shrink-0" />
          <div className="text-sm text-blue-400">
            <p className="font-bold mb-1">Como funciona a hierarquia?</p>
            <p className="opacity-80">O sistema respeita a ordem: <strong>Free &lt; Premium &lt; VIP</strong>. Se um recurso for definido como <em>Premium</em>, usuários Free não terão acesso, mas usuários Premium e VIP terão.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
