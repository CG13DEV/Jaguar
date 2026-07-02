import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language } from './App';

interface Author {
  id: string;
  name: string;
  role: string;
  description: string;
  fontClass: string;
  colorClass: string;
  sizeClass: string;
}

const AUTHORS_DICT: Record<Language, Author[]> = {
  ru: [
    {
      id: '1',
      name: 'adil',
      role: 'the human',
      description: 'Хидео Кодзима | Director | Producer | Game Disigner | Gameplay Programmer | Tech Artist | Level Designer | Level Artist | Gametool Programmer | UI/UX Designer/Programmer | Sound Designer | Devops',
      fontClass: 'font-playfair',
      colorClass: 'text-[#d0d0d0]',
      sizeClass: 'text-[min(8vh,6.5vw)]',
    },
    {
      id: '2',
      name: 'adick',
      role: 'red panda',
      description: 'Environment Artist | Weapon Artist',
      fontClass: 'font-marker',
      colorClass: 'text-[#d0d0d0]',
      sizeClass: 'text-[min(7.5vh,6vw)]',
    },
    {
      id: '3',
      name: 'ilya',
      role: 'babazumba',
      description: 'Level Designer | Level Artist',
      fontClass: 'font-syncopate lowercase tracking-widest',
      colorClass: 'text-[#b0b0b0]',
      sizeClass: 'text-[min(5vh,4.5vw)]',
    },
    {
      id: '4',
      name: 'papasogreed',
      role: '',
      description: 'Stop Motion',
      fontClass: 'font-gothic',
      colorClass: 'text-[#c0c0c0]',
      sizeClass: 'text-[min(7vh,4vw)]',
    },
    {
      id: '5',
      name: 'i W \\ s k \\',
      role: '',
      description: 'Sound Designer',
      fontClass: 'font-rajdhani tracking-[0.4em] font-light uppercase',
      colorClass: 'text-[#d0d0d0]',
      sizeClass: 'text-[min(5.5vh,3vw)]',
    },
    {
      id: '6',
      name: 'alisaknife',
      role: '',
      description: 'Environment Artist',
      fontClass: 'font-caveat',
      colorClass: 'text-[#e0e0e0]',
      sizeClass: 'text-[min(8vh,5vw)]',
    },
    {
      id: '7',
      name: 'Yaroslav',
      role: 'qa',
      description: 'Playtester',
      fontClass: 'font-mono uppercase',
      colorClass: 'text-[#888]',
      sizeClass: 'text-[min(4vh,4vw)]',
    },
    {
      id: '8',
      name: 'someone',
      role: 'support',
      description: 'Модератор сообщества и комьюнити-менеджер. Поддерживает связь с игроками.',
      fontClass: 'font-sans',
      colorClass: 'text-[#666]',
      sizeClass: 'text-[min(4.5vh,4vw)]',
    }
  ],
  en: [
    {
      id: '1',
      name: 'adil',
      role: 'the human',
      description: 'Hideo Kojima | Director | Producer | Game Designer | Gameplay Programmer | Tech Artist | Level Designer | Level Artist | Gametool Programmer | UI/UX Designer/Programmer | Sound Designer | Devops',
      fontClass: 'font-playfair',
      colorClass: 'text-[#d0d0d0]',
      sizeClass: 'text-[min(8vh,6.5vw)]',
    },
    {
      id: '2',
      name: 'adick',
      role: 'red panda',
      description: 'Environment Artist | Weapon Artist',
      fontClass: 'font-marker',
      colorClass: 'text-[#d0d0d0]',
      sizeClass: 'text-[min(7.5vh,6vw)]',
    },
    {
      id: '3',
      name: 'ilya',
      role: 'babazumba',
      description: 'Level Designer | Level Artist',
      fontClass: 'font-syncopate lowercase tracking-widest',
      colorClass: 'text-[#b0b0b0]',
      sizeClass: 'text-[min(5vh,4.5vw)]',
    },
    {
      id: '4',
      name: 'papasogreed',
      role: '',
      description: 'Stop Motion',
      fontClass: 'font-gothic',
      colorClass: 'text-[#c0c0c0]',
      sizeClass: 'text-[min(7vh,4vw)]',
    },
    {
      id: '5',
      name: 'i W \\ s k \\',
      role: '',
      description: 'Sound Designer',
      fontClass: 'font-rajdhani tracking-[0.4em] font-light uppercase',
      colorClass: 'text-[#d0d0d0]',
      sizeClass: 'text-[min(5.5vh,3vw)]',
    },
    {
      id: '6',
      name: 'alisaknife',
      role: '',
      description: 'Environment Artist',
      fontClass: 'font-caveat',
      colorClass: 'text-[#e0e0e0]',
      sizeClass: 'text-[min(8vh,5vw)]',
    },
    {
      id: '7',
      name: 'Yaroslav',
      role: 'qa',
      description: 'Playtester',
      fontClass: 'font-mono uppercase',
      colorClass: 'text-[#888]',
      sizeClass: 'text-[min(4vh,4vw)]',
    },
    {
      id: '8',
      name: 'someone',
      role: 'support',
      description: 'Community moderator and manager. Maintains communication with players.',
      fontClass: 'font-sans',
      colorClass: 'text-[#666]',
      sizeClass: 'text-[min(4.5vh,4vw)]',
    }
  ]
};

const ITEMS_PER_PAGE = 6;

interface AuthorsScreenProps {
  onBack: () => void;
  lang: Language;
}

export function AuthorsScreen({ onBack, lang }: AuthorsScreenProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showPopup, setShowPopup] = useState(false);

  const AUTHORS = AUTHORS_DICT[lang];

  const currentPage = Math.floor(selectedIndex / ITEMS_PER_PAGE);
  const totalPages = Math.ceil(AUTHORS.length / ITEMS_PER_PAGE);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showPopup) {
        if (e.key === 'Escape' || e.key === 'Enter') {
          setShowPopup(false);
        }
        return;
      }

      if (e.key === 'Escape') {
        onBack();
      } else if (e.key === 'Enter') {
        setShowPopup(true);
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        setSelectedIndex(prev => Math.min(prev + 1, AUTHORS.length - 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'a') {
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'ArrowUp' || e.key === 'w') {
        setSelectedIndex(prev => Math.max(prev - 3, 0));
      } else if (e.key === 'ArrowDown' || e.key === 's') {
        setSelectedIndex(prev => Math.min(prev + 3, AUTHORS.length - 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBack, selectedIndex, showPopup, AUTHORS.length]);

  const currentAuthors = AUTHORS.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  // Fill empty slots to maintain grid layout
  const gridItems = [...currentAuthors];
  while (gridItems.length < ITEMS_PER_PAGE) {
    gridItems.push({
      id: `empty-${gridItems.length}`,
      name: '',
      role: '',
      description: '',
      fontClass: '',
      colorClass: '',
      sizeClass: ''
    });
  }

  // Active author on the current page
  const activeIndexOnPage = selectedIndex % ITEMS_PER_PAGE;
  const isTopRowActive = activeIndexOnPage < 3;
  const isBottomRowActive = activeIndexOnPage >= 3;

  const activeAuthor = AUTHORS[selectedIndex];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="absolute inset-0 bg-[#0d0d0d] flex flex-col justify-between overflow-hidden font-oswald select-none"
    >
      {/* Top Section */}
      <div className={`pt-[8vh] px-[8vw] transition-opacity duration-300 ${showPopup ? 'opacity-30' : 'opacity-100'}`}>
        <h1 className="text-[10vh] text-[#c0c0c0] font-oswald uppercase leading-none tracking-tight">
          {lang === 'ru' ? 'Авторы' : 'Authors'}
        </h1>
        <div className="flex items-center gap-[1vw] mt-[1vh] pl-[0.5vw]">
          <div className="w-[1.5vw] h-[2px] bg-[#9c1414]"></div>
          <span className="text-[#555] font-sans text-[1.8vh] lowercase tracking-wide">
            {lang === 'ru' ? 'поддержка и вклад' : 'support & contribution'}
          </span>
        </div>
      </div>

      {/* Grid Section */}
      <div className={`flex-1 flex items-center justify-center px-[8vw] transition-opacity duration-300 ${showPopup ? 'opacity-30' : 'opacity-100'}`}>
        <div className="w-full h-[50vh] grid grid-cols-3 grid-rows-2 relative">
          
          {/* Vertical Separators */}
          <div className="absolute top-0 bottom-0 left-[33.33%] w-[1px] bg-[#222]"></div>
          <div className="absolute top-0 bottom-0 left-[66.66%] w-[1px] bg-[#222]"></div>
          
          {/* Horizontal Separator */}
          <div className="absolute left-0 right-0 top-[50%] h-[1px] flex">
            {/* The horizontal separator is a solid line, but we can highlight the active column's segment if it is in the top row */}
            <div className={`w-[33.33%] h-full transition-colors duration-300 ${isTopRowActive && activeIndexOnPage === 0 ? 'bg-[#9c1414]' : 'bg-[#222]'}`}></div>
            <div className={`w-[33.34%] h-full transition-colors duration-300 ${isTopRowActive && activeIndexOnPage === 1 ? 'bg-[#9c1414]' : 'bg-[#222]'}`}></div>
            <div className={`w-[33.33%] h-full transition-colors duration-300 ${isTopRowActive && activeIndexOnPage === 2 ? 'bg-[#9c1414]' : 'bg-[#222]'}`}></div>
          </div>
          
          {/* Bottom border highlights for the bottom row */}
          <div className="absolute left-0 right-0 bottom-0 h-[1px] flex">
            <div className={`w-[33.33%] h-full transition-colors duration-300 ${isBottomRowActive && activeIndexOnPage === 3 ? 'bg-[#9c1414]' : 'transparent'}`}></div>
            <div className={`w-[33.34%] h-full transition-colors duration-300 ${isBottomRowActive && activeIndexOnPage === 4 ? 'bg-[#9c1414]' : 'transparent'}`}></div>
            <div className={`w-[33.33%] h-full transition-colors duration-300 ${isBottomRowActive && activeIndexOnPage === 5 ? 'bg-[#9c1414]' : 'transparent'}`}></div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div 
              key={currentPage}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 grid grid-cols-3 grid-rows-2"
            >
              {gridItems.map((author, index) => {
                const isActive = activeIndexOnPage === index;
                return (
                  <div 
                    key={author.id} 
                    className="flex flex-col items-center justify-center relative cursor-pointer w-full h-full"
                    onMouseMove={() => {
                      if (author.name && !showPopup && selectedIndex !== currentPage * ITEMS_PER_PAGE + index) {
                        setSelectedIndex(currentPage * ITEMS_PER_PAGE + index);
                      }
                    }}
                    onClick={() => {
                      if (author.name) {
                        setShowPopup(true);
                      }
                    }}
                  >
                    {author.name && (
                      <>
                        <div className={`mb-[1vh] ${author.fontClass} ${author.sizeClass} whitespace-nowrap transition-colors duration-300 ${isActive ? 'text-[#9c1414] drop-shadow-[0_0_10px_rgba(156,20,20,0.5)]' : author.colorClass}`}>
                          {author.name}
                        </div>
                        {author.role && (
                          <div className={`font-sans tracking-[0.2em] uppercase text-[1.4vh] whitespace-nowrap transition-colors duration-300 ${isActive ? 'text-[#9c1414]' : 'text-[#666]'}`}>
                            {author.role}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Section */}
      <div className={`pb-[6vh] px-[8vw] flex justify-between items-end transition-opacity duration-300 ${showPopup ? 'opacity-30' : 'opacity-100'}`}>
        {/* Pagination */}
        <div className="font-oswald text-[2vh] tracking-widest">
          <span className="text-[#9c1414]">{(currentPage + 1).toString().padStart(2, '0')}</span>
          <span className="text-[#444] mx-[0.5vw]">/</span>
          <span className="text-[#666]">{(totalPages).toString().padStart(2, '0')}</span>
        </div>

        {/* Back Button */}
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

      {/* Popup Overlay */}
      <AnimatePresence>
        {showPopup && activeAuthor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-[50vw] max-w-[800px] border border-[#333] bg-[#0a0a0a] p-[5vh] shadow-[0_0_50px_rgba(0,0,0,0.8)]"
            >
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#9c1414] to-transparent"></div>
              
              <div className="flex flex-col items-center text-center">
                <div className={`mb-[1vh] ${activeAuthor.fontClass} text-[#e0e0e0] ${activeAuthor.sizeClass}`}>
                  {activeAuthor.name}
                </div>
                
                {activeAuthor.role && (
                  <div className="font-sans tracking-[0.3em] uppercase text-[1.6vh] text-[#9c1414] mb-[4vh]">
                    {activeAuthor.role}
                  </div>
                )}
                
                <div className="w-[20%] h-[1px] bg-[#333] mb-[4vh]"></div>
                
                <div className="font-sans text-[#a0a0a0] text-[2.2vh] font-light leading-[1.6] max-w-[80%] whitespace-pre-line">
                  {activeAuthor.description}
                </div>
              </div>

              <div className="mt-[8vh] flex justify-center">
                <button
                  onClick={() => setShowPopup(false)}
                  className="group flex items-center gap-[1vw] text-[#666] hover:text-[#c0c0c0] transition-colors duration-300 focus:outline-none"
                >
                  <div className="border border-[#333] group-hover:border-[#666] px-[0.6vw] py-[0.2vh] text-[1.4vh] font-mono tracking-wider transition-colors duration-300">
                    ENTER / ESC
                  </div>
                  <span className="font-oswald text-[2vh] uppercase tracking-wider">
                    {lang === 'ru' ? 'Закрыть' : 'Close'}
                  </span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
