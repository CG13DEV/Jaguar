import { useState } from 'react';
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

export function InterfacesScreen({ onBack, lang }: InterfacesScreenProps) {
  const [section, setSection] = useState<InterfaceSection>('character');

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#0d0d0d]">
      <AnimatePresence mode="wait">
        {section === 'character' && (
          <CharacterInterfacePrototype key="character" onBack={onBack} lang={lang} />
        )}
        {section === 'vehicle' && (
          <VehicleInterfacePrototype key="vehicle" onBack={onBack} lang={lang} />
        )}
        {section === 'inventory' && (
          <InventoryInterfacePrototype key="inventory" onBack={onBack} lang={lang} />
        )}
      </AnimatePresence>

      <div className="fixed left-1/2 top-[6.2vh] z-40 flex -translate-x-1/2 items-center gap-[0.35vw] border border-white/10 bg-[#0d0d0d]/90 p-[0.35vh] backdrop-blur-sm">
        {SECTIONS.map((item) => {
          const active = item.id === section;

          return (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              className={`relative min-w-[7.8vw] px-[1.15vw] py-[0.7vh] text-center font-oswald text-[1.45vh] uppercase tracking-[0.14em] transition-colors ${
                active ? 'text-[#d0d0d0]' : 'text-[#555] hover:text-[#999]'
              }`}
            >
              {lang === 'ru' ? item.ru : item.en}
              {active && (
                <motion.div
                  layoutId="interface-section"
                  className="absolute inset-x-[12%] bottom-0 h-[2px] bg-[#9c1414]"
                  transition={{ type: 'spring', stiffness: 460, damping: 36 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
