import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Radar, Table2, Trophy, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function Welcome() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const slides = [
    {
      title: "Busque o jogo",
      desc: "Nossa IA varre a internet para encontrar transmissões ao vivo em tempo real.",
      icon: Radar
    },
    {
      title: "Análise Rigorosa",
      desc: "Veja probabilidades táticas de vitória e links diretos para a transmissão.",
      icon: Table2
    },
    {
      title: "Aposte informado",
      desc: "Descubra quem é o favorito e assista ao vivo sem delay extra.",
      icon: Trophy
    }
  ];

  const handleNext = () => {
    if (step < slides.length - 1) {
      setStep(step + 1);
    } else {
      localStorage.setItem('visited_welcome', 'true');
      navigate('/jogos');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#111] rounded-2xl border border-gray-800 p-8 text-center min-h-[400px] flex flex-col">
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-[#00FF66]' : 'w-2 bg-gray-700'}`} />
          ))}
        </div>

        <div className="flex-1 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col items-center"
            >
              {React.createElement(slides[step].icon, { className: "w-20 h-20 text-[#00FF66] mb-6" })}
              <h2 className="text-2xl font-bold text-white mb-4">{slides[step].title}</h2>
              <p className="text-gray-400">{slides[step].desc}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        <Button onClick={handleNext} className="w-full mt-8 py-6 text-lg bg-[#00FF66] hover:bg-[#00FF66]/90 text-black">
          {step === slides.length - 1 ? "Começar" : "Próximo"}
          <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
