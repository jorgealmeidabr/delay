import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, User } from '../contexts/AuthContext';
import { ShieldAlert } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { logAction } from '../lib/audit';

export default function TrocarSenha() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!password.trim()) {
      setError('A senha não pode ser vazia.');
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    // Update in system_users
    const systemUsers: User[] = JSON.parse(localStorage.getItem('system_users') || '[]');
    const index = systemUsers.findIndex(u => u.id === user?.id);
    
    if (index !== -1) {
      const updatedUser = { ...systemUsers[index], password: password.trim(), forcarTrocaSenha: false };
      systemUsers[index] = updatedUser;
      localStorage.setItem('system_users', JSON.stringify(systemUsers));
      localStorage.setItem('user', JSON.stringify(updatedUser)); // Update current session
      
      logAction('Autenticação', 'Troca de Senha Obrigatória', updatedUser.email, undefined, 'Senha atualizada e bloqueio removido');
      
      // Force reload to let AuthContext pick up the updated user state correctly
      window.location.href = '/jogos';
    } else {
      setError('Erro fatal: usuário não encontrado na base de dados.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      <div className="bg-[#111] border border-gray-800 p-8 rounded-xl w-full max-w-md shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center border border-yellow-500/20">
            <ShieldAlert className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        
        <h1 className="text-2xl font-black text-white text-center mb-2">Segurança Exigida</h1>
        <p className="text-gray-400 text-center text-sm mb-6 leading-relaxed">
          Este é o seu primeiro acesso ou sua senha foi redefinida por um administrador. 
          <br />Você deve criar uma senha pessoal para prosseguir.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-500 text-sm text-center">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-1">Nova Senha</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg p-3 text-white outline-none focus:border-[#00FF66] transition-colors"
              placeholder="Digite sua nova senha"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-1">Confirmar Senha</label>
            <input 
              type="password" 
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full bg-[#1A1A1A] border border-gray-700 rounded-lg p-3 text-white outline-none focus:border-[#00FF66] transition-colors"
              placeholder="Repita a senha"
            />
          </div>

          <Button fullWidth className="mt-4 py-3" onClick={handleSave}>
            Salvar e Acessar o Sistema
          </Button>
        </div>
      </div>
    </div>
  );
}
