import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Language } from './App';

type Mode = 'unarmed' | 'pistol' | 'shotgun' | 'melee' | 'drugged';

interface CharacterInterfacePrototypeProps {
  onBack: () => void;
  lang: Language;
  embedded?: boolean;
  viewportRatio?: '16:9' | '21:9' | '32:9';
}

const MODES: Array<{
  id: Mode;
  ru: string;
  en: string;
  magazine?: number;
  reserve?: number;
}> = [
  { id: 'unarmed', ru: 'Без оружия', en: 'Unarmed' },
  { id: 'pistol', ru: 'Пистолет', en: 'Pistol', magazine: 8, reserve: 24 },
  { id: 'shotgun', ru: 'Дробовик', en: 'Shotgun', magazine: 5, reserve: 15 },
  { id: 'melee', ru: 'Ближний бой', en: 'Melee' },
  { id: 'drugged', ru: 'Под веществами', en: 'Drugged' },
];

function Reticle({ mode, pulse }: { mode: Mode; pulse: number }) {
  if (mode === 'unarmed') return null;

  if (mode === 'pistol') {
    return (
      <motion.div
        key={pulse}
        initial={{ scale: pulse ? 1.65 : 1, opacity: 0.55 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.16 }}
        className="absolute left-1/2 top-1/2 h-[34px] w-[34px] -translate-x-1/2 -translate-y-1/2"
      >
        <i className="absolute left-1/2 top-0 h-[8px] w-px -translate-x-1/2 bg-white/80" />
        <i className="absolute bottom-0 left-1/2 h-[8px] w-px -translate-x-1/2 bg-white/80" />
        <i className="absolute left-0 top-1/2 h-px w-[8px] -translate-y-1/2 bg-white/80" />
        <i className="absolute right-0 top-1/2 h-px w-[8px] -translate-y-1/2 bg-white/80" />
        <i className="absolute left-1/2 top-1/2 h-[2px] w-[2px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#9c1414]" />
      </motion.div>
    );
  }

  if (mode === 'shotgun') {
    return (
      <motion.div
        key={pulse}
        initial={{ scale: pulse ? 1.38 : 1, opacity: 0.4 }}
        animate={{ scale: 1, opacity: 0.85 }}
        transition={{ duration: 0.22 }}
        className="absolute left-1/2 top-1/2 h-[58px] w-[58px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/30"
      >
        <i className="absolute left-1/2 top-[-7px] h-[10px] w-px -translate-x-1/2 bg-white/60" />
        <i className="absolute bottom-[-7px] left-1/2 h-[10px] w-px -translate-x-1/2 bg-white/60" />
        <i className="absolute left-[-7px] top-1/2 h-px w-[10px] -translate-y-1/2 bg-white/60" />
        <i className="absolute right-[-7px] top-1/2 h-px w-[10px] -translate-y-1/2 bg-white/60" />
      </motion.div>
    );
  }

  if (mode === 'melee') {
    return (
      <motion.div
        key={pulse}
        initial={{ scale: pulse ? 0.72 : 1, opacity: 0.35 }}
        animate={{ scale: 1, opacity: 0.78 }}
        transition={{ duration: 0.2 }}
        className="absolute left-1/2 top-1/2 h-[70px] w-[92px] -translate-x-1/2 -translate-y-1/2"
      >
        <i className="absolute left-0 top-[12px] h-[18px] w-[18px] border-l border-t border-white/55" />
        <i className="absolute right-0 top-[12px] h-[18px] w-[18px] border-r border-t border-white/55" />
        <i className="absolute bottom-[12px] left-0 h-[18px] w-[18px] border-b border-l border-white/55" />
        <i className="absolute bottom-[12px] right-0 h-[18px] w-[18px] border-b border-r border-white/55" />
      </motion.div>
    );
  }

  return (
    <motion.div
      animate={{ scale: [1, 1.15, 0.96, 1.08, 1], opacity: [0.42, 0.9, 0.5, 0.78, 0.42] }}
      transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
      className="absolute left-1/2 top-1/2 h-[42px] w-[42px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10"
    >
      <i className="absolute left-1/2 top-1/2 h-[2px] w-[2px] -translate-x-[10px] -translate-y-1/2 rounded-full bg-[#9c1414]/70" />
      <i className="absolute left-1/2 top-1/2 h-[2px] w-[2px] translate-x-[8px] -translate-y-1/2 rounded-full bg-white/45" />
      <i className="absolute left-1/2 top-1/2 h-[2px] w-[2px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/80" />
    </motion.div>
  );
}

export function CharacterInterfacePrototype({ onBack, lang, embedded = false, viewportRatio = '16:9' }: CharacterInterfacePrototypeProps) {
  const [mode, setMode] = useState<Mode>('pistol');
  const [ammo, setAmmo] = useState(8);
  const [reserve, setReserve] = useState(24);
  const [pulse, setPulse] = useState(0);
  const [reloading, setReloading] = useState(false);
  const [dryFire, setDryFire] = useState(false);

  const config = useMemo(() => MODES.find((item) => item.id === mode) ?? MODES[0], [mode]);

  const selectMode = useCallback((nextMode: Mode) => {
    const next = MODES.find((item) => item.id === nextMode) ?? MODES[0];
    setMode(nextMode);
    setAmmo(next.magazine ?? 0);
    setReserve(next.reserve ?? 0);
    setReloading(false);
    setDryFire(false);
    setPulse(0);
  }, []);

  const action = useCallback(() => {
    if (reloading) return;

    if (config.magazine) {
      if (ammo <= 0) {
        setDryFire(true);
        window.setTimeout(() => setDryFire(false), 180);
        return;
      }
      setAmmo((value) => value - 1);
    }

    setPulse((value) => value + 1);
  }, [ammo, config.magazine, reloading]);

  const reload = useCallback(() => {
    if (!config.magazine || reloading || ammo >= config.magazine || reserve <= 0) return;
    const missing = config.magazine - ammo;
    const loaded = Math.min(missing, reserve);
    setReloading(true);

    window.setTimeout(() => {
      setAmmo((value) => value + loaded);
      setReserve((value) => value - loaded);
      setReloading(false);
    }, mode === 'shotgun' ? 900 : 650);
  }, [ammo, config.magazine, mode, reloading, reserve]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (!embedded) onBack();
        return;
      }
      if (event.key >= '1' && event.key <= '5') return selectMode(MODES[Number(event.key) - 1].id);
      if (event.key.toLowerCase() === 'r') return reload();
      if (event.code === 'Space') {
        event.preventDefault();
        action();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [action, embedded, onBack, reload, selectMode]);

  const bullets = Array.from({ length: config.magazine ?? 0 }, (_, index) => index < ammo);
  const viewportAspect = viewportRatio === '32:9' ? '32 / 9' : viewportRatio === '21:9' ? '21 / 9' : '16 / 9';
  const viewportWidth = viewportRatio === '32:9'
    ? 'min(84vw, calc(67vh * 32 / 9))'
    : viewportRatio === '21:9'
      ? 'min(84vw, calc(67vh * 21 / 9))'
      : 'min(84vw, calc(67vh * 16 / 9))';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 overflow-hidden bg-[#0d0d0d] font-oswald select-none"
    >
      <div className={embedded ? "hidden" : "absolute left-[6vw] top-[5vh]"}>
        <h1 className="text-[7vh] font-light uppercase leading-none tracking-tight text-[#c0c0c0]">
          {lang === 'ru' ? 'Интерфейсы' : 'Interfaces'}
        </h1>
        <div className="mt-[1.4vh] flex items-center gap-[0.8vw]">
          <div className="h-[2px] w-[1.5vw] bg-[#9c1414]" />
          <span className="font-sans text-[1.5vh] lowercase tracking-[0.18em] text-[#555]">
            {lang === 'ru' ? 'hud / персонаж / прототип' : 'hud / character / prototype'}
          </span>
        </div>
      </div>

      <div className="absolute inset-x-0 top-[17vh] flex justify-center">
        <div
          className="relative overflow-hidden border border-white/10 bg-black shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
          style={{ width: viewportWidth, aspectRatio: viewportAspect }}
          onMouseDown={(event) => event.button === 0 && action()}
        >
          {mode === 'drugged' && (
            <motion.div
              animate={{ opacity: [0.07, 0.18, 0.09, 0.22, 0.07], scale: [1, 1.04, 1, 1.06, 1] }}
              transition={{ duration: 4.4, repeat: Infinity }}
              className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06),transparent_52%)]"
            />
          )}

          <Reticle mode={mode} pulse={pulse} />

          <div className="absolute bottom-[7.5%] left-[5.5%] w-[190px] font-rajdhani">
            <div className="mb-[9px] flex items-center gap-[9px]">
              <div className="h-[2px] flex-1 bg-white/10"><div className="h-full w-[84%] bg-[#9c1414]/85" /></div>
              <span className="w-[18px] text-right text-[10px] tracking-[0.16em] text-white/22">HP</span>
            </div>
            <div className="flex items-center gap-[9px]">
              <div className="h-px flex-1 bg-white/10"><div className="h-full w-[82%] bg-white/50" /></div>
              <span className="w-[18px] text-right text-[10px] tracking-[0.16em] text-white/20">ST</span>
            </div>
          </div>

          {config.magazine && (
            <div className="absolute bottom-[7.5%] right-[5.5%] flex items-end gap-[15px] font-rajdhani">
              <div className="flex items-end gap-[5px]">
                {bullets.map((filled, index) => (
                  <motion.i
                    key={index}
                    animate={{ opacity: filled ? 1 : 0.13, y: filled ? 0 : 2 }}
                    className={mode === 'shotgun'
                      ? 'relative h-[26px] w-[7px] rounded-[2px] border border-white/45'
                      : 'relative h-[22px] w-[4px] rounded-t-full border border-white/45'}
                  >
                    <span className={`absolute inset-[1px] ${filled ? 'bg-white/70' : ''}`} />
                    {mode === 'shotgun' && <span className="absolute bottom-[-3px] left-[-1px] h-[3px] w-[7px] bg-[#9c1414]/55" />}
                  </motion.i>
                ))}
              </div>

              <div className="min-w-[52px] text-right">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${ammo}-${reloading}`}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className={`text-[30px] leading-none ${ammo === 0 ? 'text-[#9c1414]' : 'text-white/78'}`}
                  >
                    {reloading ? '—' : ammo.toString().padStart(2, '0')}
                  </motion.div>
                </AnimatePresence>
                <div className="mt-[4px] text-[11px] tracking-[0.2em] text-white/28">+{reserve.toString().padStart(2, '0')}</div>
              </div>
            </div>
          )}

          {mode === 'unarmed' && (
            <div className="absolute bottom-[7.2%] left-1/2 flex -translate-x-1/2 items-center gap-[9px] text-white/25">
              <span className="border border-white/20 px-[7px] py-[2px] font-mono text-[10px]">E</span>
              <span className="font-rajdhani text-[11px] uppercase tracking-[0.22em]">
                {lang === 'ru' ? 'взаимодействовать' : 'interact'}
              </span>
            </div>
          )}

          {mode === 'melee' && (
            <motion.div
              key={pulse}
              initial={{ opacity: pulse ? 0.9 : 0.34, x: pulse ? 7 : 0 }}
              animate={{ opacity: 0.34, x: 0 }}
              className="absolute bottom-[7.5%] right-[5.5%] font-rajdhani text-[11px] uppercase tracking-[0.34em] text-white/30"
            >
              {lang === 'ru' ? 'нож' : 'knife'}
            </motion.div>
          )}

          <AnimatePresence>
            {dryFire && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.65 }}
                exit={{ opacity: 0 }}
                className="absolute left-1/2 top-[57%] -translate-x-1/2 font-rajdhani text-[10px] uppercase tracking-[0.35em] text-[#9c1414]"
              >
                {lang === 'ru' ? 'пусто' : 'empty'}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="absolute right-[1.25vw] top-[27vh] z-20 w-[5.8vw]">
        <div className="mb-[1vh] font-sans text-[0.9vh] uppercase tracking-[0.22em] text-white/18">
          {lang === 'ru' ? 'состояние' : 'state'}
        </div>

        <div className="flex flex-col gap-[0.55vh]">
          {MODES.map((item, index) => (
            <button
              key={item.id}
              onClick={() => selectMode(item.id)}
              className={`flex w-full items-center gap-[0.45vw] border px-[0.55vw] py-[0.7vh] text-left transition-colors ${
                item.id === mode
                  ? 'border-[#9c1414]/70 bg-[#9c1414]/10 text-[#c8c8c8]'
                  : 'border-white/10 text-[#555] hover:border-white/20 hover:text-[#999]'
              }`}
            >
              <span className={`shrink-0 font-mono text-[0.9vh] ${item.id === mode ? 'text-[#9c1414]' : 'text-[#3e3e3e]'}`}>{index + 1}</span>
              <span className="text-[1.08vh] uppercase leading-[1.05] tracking-[0.06em]">{lang === 'ru' ? item.ru : item.en}</span>
            </button>
          ))}
        </div>

        <div className="mt-[1.1vh] font-mono text-[0.78vh] leading-[1.55] tracking-[0.04em] text-[#383838]">
          {lang === 'ru' ? 'SPACE / ЛКМ — действие\nR — перезарядка' : 'SPACE / LMB — action\nR — reload'}
        </div>
      </div>

      <button onClick={onBack} className={`${embedded ? "hidden" : "group flex"} absolute bottom-[6vh] right-[6vw] items-center gap-[0.8vw] text-[#666] hover:text-[#c0c0c0]`}>
        <span className="border border-[#333] px-[0.6vw] py-[0.2vh] font-mono text-[1.2vh] tracking-wider group-hover:border-[#666]">ESC</span>
        <span className="text-[2vh] uppercase tracking-wider">{lang === 'ru' ? 'Назад' : 'Back'}</span>
      </button>
    </motion.div>
  );
}
