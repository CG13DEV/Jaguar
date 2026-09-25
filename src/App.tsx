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
import { InterfacesScreen } from './InterfacesScreen';
import {
  parseHashRoute,
  pushHashRoute,
  replaceHashParams,
  replaceHashRoute,
  type RouteScreen,
} from './routeState';

export type Language = 'ru' | 'en';
type Screen = RouteScreen;

const SCREENS_BY_MENU_INDEX: Screen[] = ['history', 'gameplay', 'interfaces', 'technology', 'authors', 'socials'];

export default function App() {
  const initialRoute = parseHashRoute();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [currentScreen, setCurrentScreen] = useState<Screen>(initialRoute.screen);
  const [lang, setLang] = useState<Language>(initialRoute.params.get('lang') === 'en' ? 'en' : 'ru');

  const menuItems = {
    ru: ['История', 'Геймплей', 'Интерфейсы', 'Технологии', 'Авторы', 'Социальные сети'],
    en: ['History', 'Gameplay', 'Interfaces', 'Technology', 'Authors', 'Socials'],
  };

  const currentMenu = menuItems[lang];

  useEffect(() => {
    const syncFromLocation = () => {
      const route = parseHashRoute();
      setCurrentScreen(route.screen);
      setLang(route.params.get('lang') === 'en' ? 'en' : 'ru');

      const menuIndex = SCREENS_BY_MENU_INDEX.indexOf(route.screen);
      if (menuIndex >= 0) setSelectedIndex(menuIndex);
    };

    if (!window.location.hash) {
      const params = new URLSearchParams();
      params.set('lang', lang);
      replaceHashRoute('main', undefined, params);
    } else {
      syncFromLocation();
    }

    window.addEventListener('popstate', syncFromLocation);
    window.addEventListener('hashchange', syncFromLocation);
    return () => {
      window.removeEventListener('popstate', syncFromLocation);
      window.removeEventListener('hashchange', syncFromLocation);
    };
  }, []);

  const navigateToScreen = useCallback((screen: Screen) => {
    const params = new URLSearchParams();
    params.set('lang', lang);
    pushHashRoute(screen, screen === 'interfaces' ? 'character' : undefined, params);
    setCurrentScreen(screen);
  }, [lang]);

  const navigateBack = useCallback(() => {
    if (currentScreen === 'main') return;
    window.history.back();
  }, [currentScreen]);

  const setLanguage = useCallback((next: Language) => {
    setLang(next);
    replaceHashParams({ lang: next });
  }, []);

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
            <div className="absolute top-[11%] left-[3.5%] w-[28%] min-w-[250px] max-w-[600px]">
              <Logo />
            </div>

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
                  style={{ transform: 'scaleY(1.2)', transformOrigin: 'left center' }}
                >
                  {item}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {currentScreen === 'history' && <HistoryScreen onBack={navigateBack} lang={lang} />}
        {currentScreen === 'gameplay' && <GameplayScreen onBack={navigateBack} lang={lang} />}
        {currentScreen === 'interfaces' && <InterfacesScreen onBack={navigateBack} lang={lang} />}
        {currentScreen === 'technology' && <TechnologyScreen onBack={navigateBack} lang={lang} />}
        {currentScreen === 'authors' && <AuthorsScreen onBack={navigateBack} lang={lang} />}
        {currentScreen === 'socials' && <SocialsScreen onBack={navigateBack} lang={lang} />}
      </AnimatePresence>

      <div className="fixed top-[6vh] right-[8vw] z-50 flex gap-[0.5vw] font-oswald text-[2.5vh] uppercase tracking-wider">
        <button
          onClick={() => setLanguage('ru')}
          className={`transition-colors duration-300 ${lang === 'ru' ? 'text-[#9c1414] drop-shadow-[0_0_5px_rgba(156,20,20,0.8)]' : 'text-[#666] hover:text-[#c0c0c0]'}`}
        >
          RU
        </button>
        <span className="text-[#333]">/</span>
        <button
          onClick={() => setLanguage('en')}
          className={`transition-colors duration-300 ${lang === 'en' ? 'text-[#9c1414] drop-shadow-[0_0_5px_rgba(156,20,20,0.8)]' : 'text-[#666] hover:text-[#c0c0c0]'}`}
        >
          EN
        </button>
      </div>
    </>
  );
}
