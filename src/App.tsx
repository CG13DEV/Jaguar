/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Logo from './Logo';
import { HistoryScreen } from './HistoryScreen';
import { AuthorsScreen } from './AuthorsScreen';
import { GameplayScreen } from './GameplayScreen';
import { TechnologyScreen } from './TechnologyScreen';
import { SocialsScreen } from './SocialsScreen';

export type Language = 'ru' | 'en';
type Screen = 'main' | 'history' | 'gameplay' | 'technology' | 'authors' | 'socials';

const SCREENS_BY_MENU_INDEX: Screen[] = ['history', 'gameplay', 'technology', 'authors', 'socials'];

const isScreen = (value: unknown): value is Screen => (
  value === 'main' ||
  value === 'history' ||
  value === 'gameplay' ||
  value === 'technology' ||
  value === 'authors' ||
  value === 'socials'
);

export default function App() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [currentScreen, setCurrentScreen] = useState<Screen>('main');
  const [lang, setLang] = useState<Language>('ru');

  const menuItems = {
    ru: [
      "История",
      "Геймплей",
      "Технологии",
      "Авторы",
      "Социальные сети"
    ],
    en: [
      "History",
      "Gameplay",
      "Technology",
      "Authors",
      "Socials"
    ]
  };

  const currentMenu = menuItems[lang];

  useEffect(() => {
    window.history.replaceState({ screen: 'main' }, '', window.location.href);

    const handlePopState = (event: PopStateEvent) => {
      const nextScreen = event.state && isScreen(event.state.screen) ? event.state.screen : 'main';
      setCurrentScreen(nextScreen);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToScreen = useCallback((screen: Screen) => {
    setCurrentScreen(screen);
    window.history.pushState({ screen }, '', window.location.href);
  }, []);

  const navigateBack = useCallback(() => {
    if (currentScreen === 'main') return;
    window.history.back();
  }, [currentScreen]);

  useEffect(() => {
    if (currentScreen !== 'main') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : currentMenu.length - 1));
      } else if (e.key === 'ArrowDown') {
        setSelectedIndex((prev) => (prev < currentMenu.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'Enter') {
        navigateToScreen(SCREENS_BY_MENU_INDEX[selectedIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentScreen, selectedIndex, currentMenu.length, navigateToScreen]);

  return (
    <>
      <AnimatePresence mode="wait">
        {currentScreen === 'main' && (
          <motion.div 
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 bg-[#0d0d0d] overflow-hidden select-none"
          >
            {/* Logo Area */}
            <div className="absolute top-[11%] left-[3.5%] w-[28%] min-w-[250px] max-w-[600px]">
              <Logo />
            </div>

            {/* Main Menu Area */}
            <div className="absolute bottom-[13%] left-[3.5%] flex flex-col items-start gap-[1vh]">
              {currentMenu.map((item, index) => (
                <button
                  key={item}
                  onMouseEnter={() => setSelectedIndex(index)}
                  onClick={() => {
                    setSelectedIndex(index);
                    navigateToScreen(SCREENS_BY_MENU_INDEX[index]);
                  }}
                  className={`text-left font-oswald text-[4.8vh] leading-[1.1] tracking-wide transition-colors duration-200 font-light ${
                    selectedIndex === index 
                      ? 'text-[#9c1414]' 
                      : 'text-[#b0b0b0] hover:text-[#e0e0e0]'
                  }`}
                  style={{
                    transform: 'scaleY(1.2)',
                    transformOrigin: 'left center',
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {currentScreen === 'history' && <HistoryScreen onBack={navigateBack} lang={lang} />}
        {currentScreen === 'gameplay' && <GameplayScreen onBack={navigateBack} lang={lang} />}
        {currentScreen === 'technology' && <TechnologyScreen onBack={navigateBack} lang={lang} />}
        {currentScreen === 'authors' && <AuthorsScreen onBack={navigateBack} lang={lang} />}
        {currentScreen === 'socials' && <SocialsScreen onBack={navigateBack} lang={lang} />}
      </AnimatePresence>

      {/* Language Switcher */}
      <div className="fixed top-[6vh] right-[8vw] z-50 flex gap-[0.5vw] font-oswald text-[2.5vh] uppercase tracking-wider">
        <button 
          onClick={() => setLang('ru')} 
          className={`transition-colors duration-300 ${lang === 'ru' ? 'text-[#9c1414] drop-shadow-[0_0_5px_rgba(156,20,20,0.8)]' : 'text-[#666] hover:text-[#c0c0c0]'}`}
        >
          RU
        </button>
        <span className="text-[#333]">/</span>
        <button 
          onClick={() => setLang('en')} 
          className={`transition-colors duration-300 ${lang === 'en' ? 'text-[#9c1414] drop-shadow-[0_0_5px_rgba(156,20,20,0.8)]' : 'text-[#666] hover:text-[#c0c0c0]'}`}
        >
          EN
        </button>
      </div>
    </>
  );
}
