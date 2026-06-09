"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Radar, Trophy, Search, LogOut, ChevronDown,
  LayoutDashboard, ClipboardList, Users, Target,
  Megaphone, Settings2, ActivitySquare, Settings, Menu, X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const adminMenuItems = [
  { href: '/dashboard',    label: 'Dashboard Executivo', icon: LayoutDashboard },
  { href: '/solicitacoes', label: 'Solicitações de Acesso', icon: ClipboardList },
  { href: '/usuarios',     label: 'Gestão de Usuários', icon: Users },
  { href: '/assertividade',label: 'Assertividade', icon: Target },
  { href: '/comunicados',  label: 'Comunicados', icon: Megaphone },
  { href: '/recursos',     label: 'Controle de Recursos', icon: Settings2 },
  { href: '/logs',         label: 'Auditoria', icon: ActivitySquare },
  { href: '/config',       label: 'Configurações', icon: Settings },
];

export default function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [adminOpen, setAdminOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setAdminOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setAdminOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdminActive = adminMenuItems.some(item => pathname.startsWith(item.href));

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-800 bg-[#0A0A0A]/95 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to={user ? '/jogos' : '/'} className="flex items-center gap-2 group flex-shrink-0">
          <Radar className="w-7 h-7 text-[#00FF66] transition-transform group-hover:rotate-12" />
          <span className="font-black text-lg tracking-tight text-white">
            Delay<span className="text-[#00FF66]">API</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {user && (
            <>
              {/* User links */}
              <Link
                to="/jogos"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  pathname.startsWith('/jogos') ? 'bg-[#00FF66]/10 text-[#00FF66]' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Trophy className="w-4 h-4" />
                <span>Jogos</span>
              </Link>
              <Link
                to="/search"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  pathname.startsWith('/search') ? 'bg-[#00FF66]/10 text-[#00FF66]' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Search className="w-4 h-4" />
                <span>Buscar</span>
              </Link>

              {/* Admin Dropdown */}
              {user.role === 'admin' && (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setAdminOpen(prev => !prev)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isAdminActive || adminOpen
                        ? 'bg-purple-500/10 text-purple-400'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Settings2 className="w-4 h-4" />
                    <span>Admin</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${adminOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {adminOpen && (
                    <div className="absolute top-full right-0 mt-2 w-64 bg-[#111] border border-gray-800 rounded-xl shadow-2xl shadow-black/60 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                      {adminMenuItems.map(({ href, label, icon: Icon }) => (
                        <Link
                          key={href}
                          to={href}
                          onClick={() => setAdminOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                            pathname.startsWith(href)
                              ? 'bg-purple-500/10 text-purple-400 font-medium'
                              : 'text-gray-400 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <Icon className="w-4 h-4 flex-shrink-0" />
                          {label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* User info + logout */}
              <div className="flex items-center gap-3 ml-2 pl-3 border-l border-gray-800">
                <span className="text-xs text-gray-500 hidden lg:block">
                  Olá, <strong className="text-gray-300">{user.name.split(' ')[0]}</strong>
                  <span className={`ml-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                    user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {user.plan?.toUpperCase() || user.role}
                  </span>
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition"
                  title="Sair do sistema"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sair</span>
                </button>
              </div>
            </>
          )}

          {!user && (
            <Link to="/login" className="px-4 py-2 bg-[#00FF66] text-black font-bold rounded-lg text-sm hover:bg-[#00FF66]/90 transition">
              Entrar
            </Link>
          )}
        </nav>

        {/* Mobile Hamburger */}
        {user && (
          <button
            className="md:hidden p-2 text-gray-400 hover:text-white"
            onClick={() => setMobileOpen(prev => !prev)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        )}
      </div>

      {/* Mobile Menu */}
      {mobileOpen && user && (
        <div className="md:hidden bg-[#111] border-t border-gray-800 px-4 py-3 space-y-1">
          <Link to="/jogos" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname.startsWith('/jogos') ? 'bg-[#00FF66]/10 text-[#00FF66]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <Trophy className="w-4 h-4" /> Jogos
          </Link>
          <Link to="/search" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname.startsWith('/search') ? 'bg-[#00FF66]/10 text-[#00FF66]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <Search className="w-4 h-4" /> Buscar
          </Link>

          {user.role === 'admin' && (
            <>
              <div className="pt-2 pb-1 px-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600">Administração</p>
              </div>
              {adminMenuItems.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  to={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    pathname.startsWith(href) ? 'bg-purple-500/10 text-purple-400' : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" /> {label}
                </Link>
              ))}
            </>
          )}

          <div className="pt-2 border-t border-gray-800">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition"
            >
              <LogOut className="w-4 h-4" /> Sair do Sistema
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
