import React, { useState, useEffect } from 'react';
import { Language } from './App';

interface HistoryScreenProps {
  onBack: () => void;
  lang: Language;
}

const eventsDict = {
  ru: [
    {
      year: '1995',
      date: '10 Января',
      title: 'Начало',
      description: 'Первое дело. Надо просто забрать товар\nи привезти в указанное место.\nНичего сложного.',
      position: 10,
    },
    {
      year: '1995',
      date: '25 Января',
      title: 'Ягуар',
      description: 'Белый ягуар в багажнике товар белый товар в\nцелофане и это не детское питание реп заебал\nдаб это кал но все равно погромче на трубу\nзвонит ромчик немовский план суши бар бляди\nпо 500 баку берем неглядя',
      position: 28,
    },
    {
      year: '1995',
      date: '12 Февраля',
      title: 'Сделка',
      description: 'Встреча на заброшенном заводе.\nПринеси деньги, забери товар.\nБез глупостей.',
      position: 45,
    },
    {
      year: '1995',
      date: '3 Марта',
      title: 'Засада',
      description: 'Нас сдали. Полиция на хвосте.\nНужно уходить дворами и не\nпопасться на глаза копам.',
      position: 48,
    },
    {
      year: '1995',
      date: '15 Апреля',
      title: 'Финал',
      description: 'Последнее дело. Все или ничего.\nГлавное выжить.',
      position: 52,
    }
  ],
  en: [
    {
      year: '1995',
      date: 'January 10',
      title: 'The Beginning',
      description: 'First job. Just pick up the goods\nand deliver them to the location.\nNothing complicated.',
      position: 10,
    },
    {
      year: '1995',
      date: 'January 25',
      title: 'Jaguar',
      description: 'White jaguar in the trunk white goods in\ncellophane and this is not baby food rap is annoying\ndub is shit but still louder on the phone\nromchik is calling nemovsky plan sushi bar whores\nfor 500 bucks we take them without looking',
      position: 28,
    },
    {
      year: '1995',
      date: 'February 12',
      title: 'The Deal',
      description: 'Meeting at an abandoned factory.\nBring the money, take the goods.\nNo funny business.',
      position: 45,
    },
    {
      year: '1995',
      date: 'March 3',
      title: 'Ambush',
      description: 'We were set up. Police on our tail.\nNeed to escape through the yards and not\nget caught by the cops.',
      position: 48,
    },
    {
      year: '1995',
      date: 'April 15',
      title: 'Finale',
      description: 'The last job. All or nothing.\nThe main thing is to survive.',
      position: 52,
    }
  ]
};

export function HistoryScreen({ onBack, lang }: HistoryScreenProps) {
  const [selectedEventIndex, setSelectedEventIndex] = useState(1);
  const events = eventsDict[lang];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onBack();
      } else if (e.key === 'ArrowLeft' || e.key === 'a') {
        setSelectedEventIndex((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        setSelectedEventIndex((prev) => (prev < events.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'Enter') {
        console.log('Play', events[selectedEventIndex].title);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedEventIndex, onBack, events]);

  const activeEvent = events[selectedEventIndex];

  const cdnBase = import.meta.env.VITE_CDN_URL || '';
  const mapUrl = cdnBase ? `${cdnBase}/map.png` : '/map.png';

  return (
    <div 
      className="fixed inset-0 bg-[#0a0f0d] flex flex-col items-center select-none"
      style={{
        backgroundImage: `url(${mapUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Dark gradient overlay at the bottom for menu buttons */}
      <div className="absolute bottom-0 left-0 right-0 h-[35%] bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d]/80 to-transparent pointer-events-none"></div>
      <div className="absolute top-0 left-0 right-0 h-[35%] bg-gradient-to-b from-[#0d0d0d] via-[#0d0d0d]/80 to-transparent pointer-events-none"></div>
      <div className="relative z-10 w-full flex flex-col items-center pt-[8vh]">
        {/* Date */}
        <div className="text-[#a0a0a0] font-oswald text-[3.5vh] leading-none font-light" style={{ transform: 'scaleY(1.2)' }}>
          {activeEvent.year}
        </div>
        <div className="text-[#808080] font-oswald text-[1.8vh] uppercase mt-[1.5vh] tracking-wide font-light" style={{ transform: 'scaleY(1.2)' }}>
          {activeEvent.date}
        </div>

        {/* Timeline */}
        <div className="relative w-[50%] h-[1px] bg-[#555] mt-[6vh] mb-[6vh] flex items-center">
          {events.map((ev, idx) => {
            const isActive = idx === selectedEventIndex;
            return (
              <div 
                key={idx}
                className="absolute flex items-center justify-center cursor-pointer p-2"
                style={{ left: `${ev.position}%`, transform: 'translateX(-50%)' }}
                onClick={() => setSelectedEventIndex(idx)}
              >
                {isActive ? (
                  <div className="w-[12px] h-[12px] bg-[#d0d0d0] rounded-full border-[3px] border-[#222] ring-1 ring-[#d0d0d0]"></div>
                ) : (
                  <div className="w-[6px] h-[6px] bg-[#888] rounded-full hover:bg-[#ccc] transition-colors"></div>
                )}
              </div>
            );
          })}
        </div>

        {/* Title */}
        <div className="font-oswald text-[6vh] text-[#d0d0d0] font-light mb-[4vh] tracking-wide" style={{ transform: 'scaleY(1.2)' }}>
          {activeEvent.title}
        </div>

        {/* Separator */}
        <div className="w-[35%] h-[1px] bg-[#555] mb-[4vh]"></div>

        {/* Description */}
        <div className="text-white font-sans font-medium text-center leading-[1.4] whitespace-pre-line text-[2.2vh] max-w-[40%] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          {activeEvent.description}
        </div>
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
    </div>
  );
}
