import React, { createContext, useContext, useState, useEffect } from 'react';
import { logAction } from '../lib/audit';

export type UserRole = 'admin' | 'usuario';
export type UserPlan = 'free' | 'premium' | 'vip';
export type UserOrigin = 'Instagram' | 'TikTok' | 'WhatsApp' | 'YouTube' | 'Facebook' | 'Google' | 'Indicação' | 'Outros';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'ativo' | 'inativo' | 'suspenso' | 'expirado';
  password?: string;
  forcarTrocaSenha?: boolean;
  createdAt: string;
  lastAccess?: string;
  
  // Comercial
  plan: UserPlan;
  origin?: UserOrigin;
  startDate?: string;
  expirationDate?: string;
  amountPaid?: number;
  adminNotes?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password?: string) => boolean;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize and check root admin
  useEffect(() => {
    const initSystem = () => {
      let systemUsersStr = localStorage.getItem('system_users');
      let systemUsers: User[] = [];
      
      if (!systemUsersStr) {
        // Create root admin if system is fresh
        systemUsers = [{
          id: 'root-admin-001',
          name: 'Administrador Master',
          email: 'jorge@gmail.com',
          password: 'jorginho123', // Default password for root
          role: 'admin',
          status: 'ativo',
          plan: 'vip',
          createdAt: new Date().toISOString(),
          startDate: new Date().toISOString()
        }];
        localStorage.setItem('system_users', JSON.stringify(systemUsers));
        logAction('Sistema', 'Inicialização', 'admin@admin.com', undefined, 'Admin master criado');
      } else {
        const rawUsers = JSON.parse(systemUsersStr);
        let migrated = false;
        systemUsers = rawUsers.map((u: any) => {
          let updated = { ...u };
          let changed = false;
          
          if (!updated.plan) {
            updated.plan = updated.role === 'admin' ? 'vip' : 'premium';
            changed = true;
          }
          if (!updated.startDate) {
            updated.startDate = updated.createdAt;
            changed = true;
          }
          
          // Checar expiração
          if (updated.status === 'ativo' && updated.expirationDate) {
            if (new Date() > new Date(updated.expirationDate)) {
              updated.status = 'expirado';
              changed = true;
              logAction('Controle de Acesso', 'Expiração Automática', updated.email, 'ativo', 'expirado');
            }
          }
          
          if (changed) migrated = true;
          return updated;
        });

        if (migrated) {
          localStorage.setItem('system_users', JSON.stringify(systemUsers));
        }
      }

      // Check current session
      const sessionUserStr = localStorage.getItem('user');
      if (sessionUserStr) {
        const sessionUser: User = JSON.parse(sessionUserStr);
        // Validate against db
        const dbUser = systemUsers.find(u => u.email === sessionUser.email && u.status === 'ativo');
        if (dbUser) {
          setUser(dbUser);
        } else {
          localStorage.removeItem('user');
        }
      }
      setIsLoading(false);
    };

    initSystem();
  }, []);

  const login = (email: string, password?: string) => {
    const systemUsers: User[] = JSON.parse(localStorage.getItem('system_users') || '[]');
    const dbUser = systemUsers.find(u => u.email === email);

    if (!dbUser) {
      logAction('Autenticação', 'Tentativa de Login Falha', email, undefined, 'Usuário não encontrado');
      return false;
    }

    if (dbUser.status === 'inativo') {
      logAction('Autenticação', 'Tentativa de Login Falha', email, undefined, 'Conta inativa');
      return false;
    }

    if (dbUser.status === 'suspenso') {
      logAction('Autenticação', 'Tentativa de Login Falha', email, undefined, 'Conta suspensa');
      alert("Seu acesso encontra-se temporariamente suspenso. Entre em contato com o administrador.");
      return false;
    }

    if (dbUser.status === 'expirado') {
      logAction('Autenticação', 'Tentativa de Login Falha', email, undefined, 'Acesso expirado');
      alert("Seu acesso expirou. Entre em contato com o administrador.");
      return false;
    }

    if (dbUser.password && dbUser.password !== password) {
      logAction('Autenticação', 'Tentativa de Login Falha', email, undefined, 'Senha incorreta');
      return false;
    }
    
    const updatedUser = { ...dbUser, lastAccess: new Date().toISOString() };
    
    // Update db
    const updatedUsers = systemUsers.map(u => u.id === updatedUser.id ? updatedUser : u);
    localStorage.setItem('system_users', JSON.stringify(updatedUsers));
    
    // Set session
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    
    logAction('Autenticação', 'Login', updatedUser.email, undefined, 'Sessão iniciada');
    return true;
  };

  const logout = () => {
    if (user) {
      logAction('Autenticação', 'Logout', user.email, undefined, 'Sessão encerrada');
    }
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
