import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = React.useState('');

  const handleSearch = () => {
    if (query.trim()) {
      navigate(`/analise/busca?q=${encodeURIComponent(query)}`);
    }
  };

  const shortcuts = [
    { label: '🇧🇷 Brasileirão', query: 'Brasileirão jogos de hoje' },
    { label: '🏆 Champions', query: 'Champions League jogos de hoje' },
    { label: '⚽ Premier League', query: 'Premier League jogos de hoje' },
    { label: '🌎 Sul-Americana', query: 'Sul-Americana jogos de hoje' }
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-4 flex flex-col items-center justify-center">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-black mb-4">Varredura de <span className="text-[#00FF66]">Transmissões</span></h1>
          <p className="text-gray-400">Encontre o delay exato de qualquer jogo ao vivo</p>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Digite o nome do jogo ou campeonato..."
              className="w-full bg-[#111] border-2 border-gray-800 rounded-2xl py-4 pl-12 pr-4 text-lg focus:border-[#00FF66] outline-none transition"
            />
          </div>
          <Button onClick={handleSearch} disabled={!query} className="px-8 text-lg rounded-2xl">
            Buscar
          </Button>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {shortcuts.map(shortcut => (
            <button
              key={shortcut.label}
              onClick={() => {
                setQuery(shortcut.query);
                setTimeout(() => navigate(`/analise/busca?q=${encodeURIComponent(shortcut.query)}`), 100);
              }}
              className="px-4 py-2 bg-[#1A1A1A] border border-gray-800 hover:border-[#00FF66]/50 rounded-full text-sm font-medium transition"
            >
              {shortcut.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
