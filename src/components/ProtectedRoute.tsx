import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { logAction } from '../lib/audit';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-[#00FF66]">Carregando sistema seguro...</div>;
  }

  if (!user) {
    logAction('Segurança', 'Bloqueio de Acesso', location.pathname, undefined, 'Usuário não autenticado');
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user.role !== 'admin') {
    logAction('Segurança', 'Acesso Negado', location.pathname, user.role, 'Privilégios insuficientes');
    return <Navigate to="/jogos" replace />;
  }

  if (user.forcarTrocaSenha && location.pathname !== '/trocar-senha') {
    return <Navigate to="/trocar-senha" replace />;
  }

  if (!user.forcarTrocaSenha && location.pathname === '/trocar-senha') {
    return <Navigate to="/jogos" replace />;
  }

  return <>{children}</>;
};
