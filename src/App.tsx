import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import Header from './components/Header';
import GlobalBanner from './components/GlobalBanner';
import Login from './pages/Login';
import Welcome from './pages/Welcome';
import Jogos from './pages/Jogos';
import AnalisePage from './pages/Analise';
import Search from './pages/Search';
import Config from './pages/Config';
import Usuarios from './pages/Usuarios';
import Logs from './pages/Logs';
import TrocarSenha from './pages/TrocarSenha';
import Landing from './pages/Landing';
import Solicitacoes from './pages/Solicitacoes';
import Dashboard from './pages/Dashboard';
import ControleRecursos from './pages/ControleRecursos';
import Assertividade from './pages/Assertividade';
import Comunicados from './pages/Comunicados';
import Missao from './pages/Missao';
import Redirect from './pages/Redirect';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import GlobalAnnouncements from './components/GlobalAnnouncements';

const App = () => (
  <HelmetProvider>
    <Helmet>
      <title>DelayRadar</title>
      <meta name="description" content="Encontre o delay da sua transmissão ao vivo" />
    </Helmet>
    <BrowserRouter>
      <AuthProvider>
        <GlobalBanner />
        <GlobalAnnouncements />
        <Header />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/missao" element={<Missao />} />
          <Route path="/r/:code" element={<Redirect />} />
          <Route path="/welcome" element={<ProtectedRoute><Welcome /></ProtectedRoute>} />
          <Route path="/jogos" element={<ProtectedRoute><Jogos /></ProtectedRoute>} />
          <Route path="/analise/busca" element={<ProtectedRoute><AnalisePage /></ProtectedRoute>} />
          <Route path="/analise/:gameId" element={<ProtectedRoute><AnalisePage /></ProtectedRoute>} />
          <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
          <Route path="/trocar-senha" element={<ProtectedRoute><TrocarSenha /></ProtectedRoute>} />
          <Route path="/config" element={<ProtectedRoute requireAdmin><Config /></ProtectedRoute>} />
          <Route path="/usuarios" element={<ProtectedRoute requireAdmin><Usuarios /></ProtectedRoute>} />
          <Route path="/solicitacoes" element={<ProtectedRoute requireAdmin><Solicitacoes /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute requireAdmin><Dashboard /></ProtectedRoute>} />
          <Route path="/assertividade" element={<ProtectedRoute requireAdmin><Assertividade /></ProtectedRoute>} />
          <Route path="/comunicados" element={<ProtectedRoute requireAdmin><Comunicados /></ProtectedRoute>} />
          <Route path="/recursos" element={<ProtectedRoute requireAdmin><ControleRecursos /></ProtectedRoute>} />
          <Route path="/logs" element={<ProtectedRoute requireAdmin><Logs /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </HelmetProvider>
);

export default App;
