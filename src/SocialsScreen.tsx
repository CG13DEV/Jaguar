import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Language } from './App';

interface SocialsScreenProps {
  onBack: () => void;
  lang: Language;
}

export function SocialsScreen({ onBack, lang }: SocialsScreenProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const links = [
    { label: 'Steam', url: 'https://store.steampowered.com/app/4296180/YAguar/?beta=0' },
    { label: 'YouTube', url: 'https://www.youtube.com/@CG13dev' },
    { label: 'Telegram', url: 'https://t.me/cg13dev' }
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onBack();
      } else if (e.key === 'ArrowUp' || e.key === 'w') {
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : links.length - 1));
      } else if (e.key === 'ArrowDown' || e.key === 's') {
        setSelectedIndex((prev) => (prev < links.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'Enter') {
        window.open(links[selectedIndex].url, '_blank');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBack, selectedIndex, links]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="absolute inset-0 bg-[#0d0d0d] flex flex-col items-center justify-center overflow-hidden font-oswald select-none"
    >
      <div className="flex flex-col items-center gap-[4vh]">
        {links.map((link, index) => (
          <a
            key={link.label}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            onMouseEnter={() => setSelectedIndex(index)}
            className={`font-oswald text-[6vh] uppercase tracking-wider transition-colors duration-300 ${
              selectedIndex === index ? 'text-[#9c1414] drop-shadow-[0_0_10px_rgba(156,20,20,0.5)]' : 'text-[#a0a0a0] hover:text-[#d0d0d0]'
            }`}
            style={{ transform: 'scaleY(1.2)' }}
          >
            {link.label}
          </a>
        ))}
      </div>

      {/* Back Button */}
      <div className="absolute bottom-[6vh] right-[8vw] z-10">
        <button
          onClick={onBack}
          className="group flex items-center gap-[1vw] text-[#666] hover:text-[#c0c0c0] transition-colors duration-300 focus:outline-none"
        >
          <div className="border border-[#333] group-hover:border-[#666] px-[0.6vw] py-[0.2vh] text-[1.4vh] font-mono tracking-wider transition-colors duration-300">
            ESC
          </div>
          <span className="font-oswald text-[2.5vh] uppercase tracking-wider">
            {lang === 'ru' ? 'Назад' : 'Back'}
          </span>
        </button>
      </div>
    </motion.div>
  );
}
