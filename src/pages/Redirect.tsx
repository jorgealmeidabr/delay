import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { registerVisit, getMissionConfig } from '../lib/invites';
import { logAction } from '../lib/audit';

export default function RedirectPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'counted' | 'duplicate' | 'invalid'>('loading');

  useEffect(() => {
    if (!code) { navigate('/'); return; }

    const missionCfg = getMissionConfig();
    if (!missionCfg.active) {
      // Missão desligada — redireciona direto ao destino configurado ou landing
      window.location.href = missionCfg.destLink || window.location.origin;
      return;
    }

    const result = registerVisit(code.toUpperCase());

    if (result.success) {
      logAction('Convites', 'Visita Válida Registrada', code.toUpperCase());
      setStatus('counted');
    } else {
      setStatus('duplicate');
    }

    // Redireciona após breve feedback visual (1.5s)
    setTimeout(() => {
      window.location.href = result.redirectUrl || '/';
    }, 1500);
  }, [code]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      <div className="text-center space-y-4">
        {status === 'loading' && (
          <>
            <div className="w-12 h-12 border-4 border-[#00FF66] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-gray-400 text-sm">Registrando visita...</p>
          </>
        )}
        {status === 'counted' && (
          <>
            <div className="text-5xl">✅</div>
            <p className="text-[#00FF66] font-bold">Visita registrada!</p>
            <p className="text-gray-400 text-sm">Redirecionando...</p>
          </>
        )}
        {(status === 'duplicate' || status === 'invalid') && (
          <>
            <div className="text-5xl">🔄</div>
            <p className="text-gray-300 font-bold">Redirecionando...</p>
          </>
        )}
      </div>
    </div>
  );
}
