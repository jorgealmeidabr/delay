import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function GlobalBanner() {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (apiKey) return null;

  return (
    <div className="bg-yellow-500 text-black px-4 py-2 flex items-center justify-center gap-2 text-sm font-bold w-full z-50">
      <AlertTriangle className="w-5 h-5" />
      ⚠️ Configure sua chave Gemini (VITE_GEMINI_API_KEY) no arquivo .env local para usar o app!
    </div>
  );
}
