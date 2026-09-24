import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Language } from './App';
import { CharacterInterfacePrototype } from './CharacterInterfacePrototype';
import { VehicleInterfacePrototype } from './VehicleInterfacePrototype';
import { InventoryInterfacePrototype } from './InventoryInterfacePrototype';

type InterfaceSection = 'character' | 'vehicle' | 'inventory';

interface InterfacesScreenProps {
  onBack: () => void;
  lang: Language;
}

const SECTIONS: Array<{ id: InterfaceSection; ru: string; en: string }> = [
  { id: 'character', ru: 'Персонаж', en: 'Character' },
  { id: 'vehicle', ru: 'Авто', en: 'Vehicle' },
  { id: 'inventory', ru: 'Инвентарь', en: 'Inventory' },
];

const SWIPE_THRESHOLD_PX = 48;

export function InterfacesScreen({ onBack, lang }: InterfacesScreenProps) {
  const [sectionIndex, setSectionIndex] = useState(0);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);

  const activeSection = SECTIONS[sectionIndex];

  const moveSection = useCallback((direction: number) => {
    setSectionIndex((current) => {
      const next = current + direction;
      if (next < 0 || next >= SECTIONS.length) return current;
      return next;
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') {
        moveSection(-1);
      } else if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') {
        moveSection(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moveSection]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'touch') return;
    pointerStartRef.current = { x: event.clientX, y: event.clientY };
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'touch' || !pointerStartRef.current) return;

    const deltaX = event.clientX - pointerStartRef.current.x;
    const deltaY = event.clientY - pointerStartRef.current.y;
    pointerStartRef.current = null;

    if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX || Math.abs(deltaX) <= Math.abs(deltaY)) return;
    moveSection(deltaX < 0 ? 1 : -1);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="absolute inset-0 overflow-hidden bg-[#0d0d0d] font-oswald select-none"
      style={{ touchAction: 'none' }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => { pointerStartRef.current = null; }}
    >
      {/* Persistent page header — never remounted when switching prototypes. */}
      <div className="pointer-events-none absolute left-[6vw] top-[5vh] z-40">
        <h1 className="text-[7vh] font-light uppercase leading-none tracking-tight text-[#c0c0c0]">
          {lang === 'ru' ? 'Интерфейсы' : 'Interfaces'}
        </h1>
        <div className="mt-[1.4vh] flex items-center gap-[0.8vw]">
          <div className="h-[2px] w-[1.5vw] bg-[#9c1414]" />
          <span className="font-sans text-[1.5vh] lowercase tracking-[0.18em] text-[#555]">
            {lang === 'ru' ? 'прототипы игровых экранов' : 'game interface prototypes'}
          </span>
        </div>
      </div>

      {/* Only the prototype body changes. */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={activeSection.id}
          initial={{ opacity: 0, x: 14 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -14 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          {activeSection.id === 'character' && (
            <CharacterInterfacePrototype onBack={onBack} lang={lang} embedded />
          )}
          {activeSection.id === 'vehicle' && (
            <VehicleInterfacePrototype onBack={onBack} lang={lang} embedded />
          )}
          {activeSection.id === 'inventory' && (
            <InventoryInterfacePrototype onBack={onBack} lang={lang} embedded />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Same page language as FeatureScreen: current group name + thin bottom indicators. */}
      <div className="pointer-events-none absolute bottom-[12.6vh] left-1/2 z-40 -translate-x-1/2">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeSection.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="font-sans text-[1.05vh] uppercase tracking-[0.28em] text-[#555]"
          >
            {lang === 'ru' ? activeSection.ru : activeSection.en}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="absolute bottom-[9.2vh] left-1/2 z-40 flex -translate-x-1/2 gap-[1vw]">
        {SECTIONS.map((item, index) => {
          const active = index === sectionIndex;

          return (
            <button
              key={item.id}
              onClick={() => setSectionIndex(index)}
              className="flex items-center justify-center px-[1vw] py-[1vh] focus:outline-none"
              aria-label={lang === 'ru' ? item.ru : item.en}
            >
              {active ? (
                <div className="h-[3px] w-[4vw] bg-[#9c1414] shadow-[0_0_10px_rgba(156,20,20,0.8)] transition-all duration-300" />
              ) : (
                <div className="h-[2px] w-[3vw] bg-[#444] transition-all duration-300 hover:bg-[#666]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Persistent back control, matching the rest of the site. */}
      <div className="absolute bottom-[6vh] right-[8vw] z-40">
        <button
          onClick={onBack}
          className="group flex items-center gap-[1vw] text-[#666] transition-colors duration-300 hover:text-[#c0c0c0] focus:outline-none"
        >
          <div className="border border-[#333] bg-[#0d0d0d]/50 px-[0.6vw] py-[0.2vh] font-mono text-[1.4vh] tracking-wider transition-colors duration-300 group-hover:border-[#666]">
            ESC
          </div>
          <span className="text-[2.5vh] uppercase tracking-wider">
            {lang === 'ru' ? 'Назад' : 'Back'}
          </span>
        </button>
      </div>
    </motion.div>
  );
}
