import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Radar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const success = login(email, password);
    if (success) {
      const visitedWelcome = localStorage.getItem('visited_welcome');
      if (!visitedWelcome) {
        navigate('/welcome');
      } else {
        navigate('/jogos');
      }
    } else {
      setErrorMsg('Acesso negado. Usuário inativo ou não cadastrado.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] p-4 text-white">
      <div className="max-w-md w-full space-y-8 bg-[#111] p-8 rounded-2xl border border-gray-800">
        <div className="flex flex-col items-center">
          <Radar className="w-12 h-12 text-[#00FF66]" />
          <h2 className="mt-6 text-3xl font-extrabold text-white">Delay<span className="text-[#00FF66]">API</span></h2>
          <p className="mt-2 text-sm text-gray-400">Acesso Restrito</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-3 rounded-lg text-sm text-center">
              {errorMsg}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400">Email</label>
              <input
                type="email"
                required
                className="mt-1 block w-full bg-[#1A1A1A] border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:border-[#00FF66] focus:ring-1 focus:ring-[#00FF66] outline-none transition"
                placeholder="admin@admin.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">Senha</label>
              <input
                type="password"
                required
                className="mt-1 block w-full bg-[#1A1A1A] border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:border-[#00FF66] focus:ring-1 focus:ring-[#00FF66] outline-none transition"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-black bg-[#00FF66] hover:bg-[#00FF66]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0A0A0A] focus:ring-[#00FF66] transition-colors"
          >
            Entrar no Sistema
          </button>
        </form>
      </div>
    </div>
  );
}
