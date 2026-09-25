import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Language } from './App';
import { getHashEnum, getHashNumber, replaceHashParams } from './routeState';

type Mode = 'unarmed' | 'pistol' | 'shotgun' | 'automatic' | 'melee' | 'drugged';

interface CharacterInterfacePrototypeProps {
  onBack: () => void;
  lang: Language;
  embedded?: boolean;
  viewportRatio?: '16:9' | '21:9' | '32:9';
}

const MODE_IDS: Mode[] = ['unarmed', 'pistol', 'shotgun', 'automatic', 'melee', 'drugged'];

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
  { id: 'automatic', ru: 'Автомат', en: 'Automatic', magazine: 30, reserve: 90 },
  { id: 'melee', ru: 'Ближний бой', en: 'Melee' },
  { id: 'drugged', ru: 'Под веществами', en: 'Drugged' },
];

function LabSlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block font-sans">
      <div className="mb-[0.3vh] flex items-center justify-between">
        <span className="text-[0.82vh] uppercase tracking-[0.16em] text-white/24">{label}</span>
        <span className="font-mono text-[0.86vh] text-white/36">{value}</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-[2px] w-full cursor-pointer accent-[#9c1414]"
      />
    </label>
  );
}

function Reticle({
  mode,
  pulse,
  recoil,
}: {
  mode: Mode;
  pulse: number;
  recoil: number;
}) {
  if (mode === 'unarmed') return null;

  if (mode === 'pistol') {
    return (
      <div className="absolute left-1/2 top-1/2 h-[18px] w-[18px] -translate-x-1/2 -translate-y-1/2">
        <motion.i
          key={pulse}
          initial={{ scale: pulse ? 3.4 : 1, opacity: pulse ? 0.34 : 0 }}
          animate={{ scale: 1, opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="absolute left-1/2 top-1/2 h-[5px] w-[5px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/45"
        />
        <i className="absolute left-1/2 top-1/2 h-[2px] w-[2px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/72" />
      </div>
    );
  }

  if (mode === 'shotgun') {
    const baseGap = 45;
    const sustainedMaxGap = 62;
    const absoluteMaxGap = 68;
    const currentGap = baseGap + (sustainedMaxGap - baseGap) * recoil;
    const shotKick = Math.max(0, Math.min(absoluteMaxGap - currentGap, 6));

    return (
      <div className="absolute left-1/2 top-1/2 h-[42px] w-[76px] -translate-x-1/2 -translate-y-1/2 overflow-visible">
        <span
          className="absolute top-1/2 h-[14px] w-px -translate-y-1/2 transition-[left] duration-[90ms] ease-out"
          style={{ left: `calc(50% - ${currentGap}px)` }}
        >
          <motion.i
            key={`shotgun-left-${pulse}`}
            initial={{ x: 0, opacity: 0.52 }}
            animate={{ x: [0, -shotKick, 0], opacity: [0.52, 0.82, 0.52] }}
            transition={{ duration: 0.24, times: [0, 0.24, 1], ease: 'easeOut' }}
            className="block h-full w-px bg-white"
          />
        </span>

        <span
          className="absolute top-1/2 h-[14px] w-px -translate-y-1/2 transition-[left] duration-[90ms] ease-out"
          style={{ left: `calc(50% + ${currentGap}px)` }}
        >
          <motion.i
            key={`shotgun-right-${pulse}`}
            initial={{ x: 0, opacity: 0.52 }}
            animate={{ x: [0, shotKick, 0], opacity: [0.52, 0.82, 0.52] }}
            transition={{ duration: 0.24, times: [0, 0.24, 1], ease: 'easeOut' }}
            className="block h-full w-px bg-white"
          />
        </span>
      </div>
    );
  }

  if (mode === 'automatic') {
    const baseGap = 8;
    const sustainedMaxGap = 15;
    const absoluteMaxGap = 18;
    const currentGap = baseGap + (sustainedMaxGap - baseGap) * recoil;
    const shotKick = Math.max(0, Math.min(absoluteMaxGap - currentGap, 3));

    return (
      <div className="absolute left-1/2 top-1/2 h-[46px] w-[46px] -translate-x-1/2 -translate-y-1/2 overflow-visible">
        <span
          className="absolute top-1/2 h-px w-[5px] -translate-x-full -translate-y-1/2 transition-[left] duration-[80ms] ease-out"
          style={{ left: `calc(50% - ${currentGap}px)` }}
        >
          <motion.i
            key={`auto-left-${pulse}`}
            initial={{ x: 0, opacity: 0.55 }}
            animate={{ x: [0, -shotKick, 0], opacity: [0.55, 0.82, 0.55] }}
            transition={{ duration: 0.18, times: [0, 0.28, 1], ease: 'easeOut' }}
            className="block h-px w-[5px] bg-white"
          />
        </span>

        <span
          className="absolute top-1/2 h-px w-[5px] -translate-y-1/2 transition-[left] duration-[80ms] ease-out"
          style={{ left: `calc(50% + ${currentGap}px)` }}
        >
          <motion.i
            key={`auto-right-${pulse}`}
            initial={{ x: 0, opacity: 0.55 }}
            animate={{ x: [0, shotKick, 0], opacity: [0.55, 0.82, 0.55] }}
            transition={{ duration: 0.18, times: [0, 0.28, 1], ease: 'easeOut' }}
            className="block h-px w-[5px] bg-white"
          />
        </span>

        <span
          className="absolute left-1/2 h-[5px] w-px -translate-x-1/2 transition-[top] duration-[80ms] ease-out"
          style={{ top: `calc(50% + ${currentGap}px)` }}
        >
          <motion.i
            key={`auto-bottom-${pulse}`}
            initial={{ y: 0, opacity: 0.55 }}
            animate={{ y: [0, shotKick, 0], opacity: [0.55, 0.82, 0.55] }}
            transition={{ duration: 0.18, times: [0, 0.28, 1], ease: 'easeOut' }}
            className="block h-[5px] w-px bg-white"
          />
        </span>
      </div>
    );
  }

  if (mode === 'melee') {
    return (
      <AnimatePresence>
        {pulse > 0 && (
          <motion.div
            key={pulse}
            initial={{ opacity: 0.5, scale: 0.72 }}
            animate={{ opacity: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute left-1/2 top-1/2 h-[22px] w-[34px] -translate-x-1/2 -translate-y-1/2"
          >
            <i className="absolute left-0 top-1/2 h-[7px] w-px -translate-y-1/2 bg-white/48" />
            <i className="absolute right-0 top-1/2 h-[7px] w-px -translate-y-1/2 bg-white/48" />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <motion.div
      animate={{ x: [-1, 1, 0, 1, -1], y: [0, -1, 1, 0, 0], opacity: [0.5, 0.72, 0.46, 0.62, 0.5] }}
      transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
      className="absolute left-1/2 top-1/2 h-[12px] w-[12px] -translate-x-1/2 -translate-y-1/2"
    >
      <i className="absolute left-1/2 top-1/2 h-[2px] w-[2px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/60" />
      <i className="absolute left-1/2 top-1/2 h-[2px] w-[2px] -translate-x-[5px] -translate-y-[1px] rounded-full bg-[#9c1414]/38 blur-[0.3px]" />
    </motion.div>
  );
}

function ResourceLines({ health, stamina }: { health: number; stamina: number }) {
  const showHealth = health < 98;
  const showStamina = stamina < 98;

  return (
    <div className="absolute right-[4.8%] top-[5.8%] grid w-[58px] grid-rows-[1px_1px] gap-[5px]">
      <motion.div
        animate={{ opacity: showHealth ? (health < 30 ? 0.9 : 0.5) : 0 }}
        transition={{ duration: 0.14 }}
        className="h-px w-full bg-white/8"
      >
        <motion.div
          animate={{ width: `${health}%` }}
          transition={{ duration: 0.15 }}
          className="h-full bg-[#9c1414]"
        />
      </motion.div>

      <motion.div
        animate={{ opacity: showStamina ? (stamina < 25 ? 0.65 : 0.3) : 0 }}
        transition={{ duration: 0.14 }}
        className="h-px w-full bg-white/7"
      >
        <motion.div
          animate={{ width: `${stamina}%` }}
          transition={{ duration: 0.15 }}
          className="h-full bg-white/70"
        />
      </motion.div>
    </div>
  );
}

function AmmoReadout({
  ammo,
  reserve,
  reloading,
}: {
  ammo: number;
  reserve: number;
  reloading: boolean;
}) {
  return (
    <div className="absolute right-[4.8%] top-1/2 flex -translate-y-1/2 items-center gap-[7px] font-mono">
      <AnimatePresence mode="wait">
        <motion.span
          key={`${ammo}-${reloading}`}
          initial={{ opacity: 0, y: -2 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 2 }}
          transition={{ duration: 0.1 }}
          className={`text-[28px] leading-none ${ammo === 0 ? 'text-[#9c1414]/85' : 'text-white/72'}`}
        >
          {reloading ? '–' : ammo}
        </motion.span>
      </AnimatePresence>
      <span className="text-[11px] leading-none text-white/16">·</span>
      <span className="text-[12px] leading-none text-white/28">{reserve}</span>
    </div>
  );
}

export function CharacterInterfacePrototype({
  onBack,
  lang,
  embedded = false,
  viewportRatio = '16:9',
}: CharacterInterfacePrototypeProps) {
  const initialMode = getHashEnum<Mode>('mode', MODE_IDS, 'pistol');
  const initialConfig = MODES.find((item) => item.id === initialMode) ?? MODES[1];

  const [mode, setMode] = useState<Mode>(initialMode);
  const [ammo, setAmmo] = useState(() => getHashNumber('ammo', initialConfig.magazine ?? 0, 0, 999));
  const [reserve, setReserve] = useState(() => getHashNumber('reserve', initialConfig.reserve ?? 0, 0, 999));
  const [health, setHealth] = useState(() => getHashNumber('hp', 100, 0, 100));
  const [stamina, setStamina] = useState(() => getHashNumber('st', 100, 0, 100));
  const [pulse, setPulse] = useState(0);
  const [recoil, setRecoil] = useState(0);
  const [reloading, setReloading] = useState(false);
  const lastShotAtRef = useRef(0);

  const config = useMemo(() => MODES.find((item) => item.id === mode) ?? MODES[0], [mode]);

  useEffect(() => {
    replaceHashParams({
      mode,
      hp: health,
      st: stamina,
      ammo: config.magazine ? ammo : null,
      reserve: config.magazine ? reserve : null,
    });
  }, [ammo, config.magazine, health, mode, reserve, stamina]);

  const selectMode = useCallback((nextMode: Mode) => {
    const next = MODES.find((item) => item.id === nextMode) ?? MODES[0];
    setMode(nextMode);
    setAmmo(next.magazine ?? 0);
    setReserve(next.reserve ?? 0);
    setReloading(false);
    setPulse(0);
    setRecoil(0);
    lastShotAtRef.current = 0;
  }, []);

  const action = useCallback(() => {
    if (reloading) return;

    if (config.magazine) {
      if (ammo <= 0) {
        setPulse((value) => value + 1);
        return;
      }

      setAmmo((value) => value - 1);

      if (mode === 'automatic' || mode === 'shotgun') {
        lastShotAtRef.current = performance.now();
        const recoilStep = mode === 'automatic' ? 0.2 : 0.42;
        setRecoil((value) => Math.min(1, value + recoilStep));
      }
    }

    if (mode === 'melee') {
      setStamina((value) => Math.max(0, value - 18));
    }

    setPulse((value) => value + 1);
  }, [ammo, config.magazine, mode, reloading]);

  useEffect(() => {
    if (mode !== 'automatic' && mode !== 'shotgun') {
      setRecoil(0);
      return;
    }

    const decayDelay = mode === 'automatic' ? 150 : 220;
    const decayStep = mode === 'automatic' ? 0.035 : 0.045;

    const timer = window.setInterval(() => {
      if (performance.now() - lastShotAtRef.current < decayDelay) return;
      setRecoil((value) => Math.max(0, value - decayStep));
    }, 50);

    return () => window.clearInterval(timer);
  }, [mode]);

  const reload = useCallback(() => {
    if (!config.magazine || reloading || ammo >= config.magazine || reserve <= 0) return;

    const missing = config.magazine - ammo;
    const loaded = Math.min(missing, reserve);
    setReloading(true);

    window.setTimeout(() => {
      setAmmo((value) => value + loaded);
      setReserve((value) => value - loaded);
      setReloading(false);
    }, mode === 'shotgun' ? 780 : 520);
  }, [ammo, config.magazine, mode, reloading, reserve]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement) return;

      if (event.key === 'Escape') {
        if (!embedded) onBack();
        return;
      }

      if (event.key >= '1' && event.key <= '6') {
        selectMode(MODES[Number(event.key) - 1].id);
        return;
      }

      if (event.key.toLowerCase() === 'r') {
        reload();
        return;
      }

      if (event.code === 'Space') {
        event.preventDefault();
        action();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [action, embedded, onBack, reload, selectMode]);

  const viewportAspect = viewportRatio === '32:9' ? '32 / 9' : viewportRatio === '21:9' ? '21 / 9' : '16 / 9';
  const viewportWidth = viewportRatio === '32:9'
    ? 'min(72vw, calc(67vh * 32 / 9))'
    : viewportRatio === '21:9'
      ? 'min(72vw, calc(67vh * 21 / 9))'
      : 'min(72vw, calc(67vh * 16 / 9))';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 overflow-hidden bg-[#0d0d0d] font-oswald select-none"
    >
      <div className={embedded ? 'hidden' : 'absolute left-[8vw] top-[5vh]'}>
        <h1 className="text-[7vh] font-light uppercase leading-none tracking-tight text-[#c0c0c0]">
          {lang === 'ru' ? 'Интерфейсы' : 'Interfaces'}
        </h1>
      </div>

      <div className="absolute inset-x-0 top-[17vh] flex justify-center">
        <div
          id="hud-preview-viewport"
          className="relative overflow-hidden border border-white/10 bg-black shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
          style={{ width: viewportWidth, aspectRatio: viewportAspect }}
          onMouseDown={(event) => {
            if (event.button === 0) action();
          }}
        >
          <Reticle mode={mode} pulse={pulse} recoil={recoil} />
          <ResourceLines health={health} stamina={stamina} />

          {config.magazine && (
            <AmmoReadout ammo={ammo} reserve={reserve} reloading={reloading} />
          )}

          {mode === 'drugged' && (
            <motion.div
              animate={{ opacity: [0, 0.025, 0.008, 0.018, 0] }}
              transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(156,20,20,0.35),transparent_48%)]"
            />
          )}
        </div>
      </div>

      <div className="absolute right-[8vw] top-[25vh] z-20 w-[5.4vw]">
        <div className="mb-[0.9vh] font-sans text-[0.82vh] uppercase tracking-[0.2em] text-white/16">
          {lang === 'ru' ? 'состояние' : 'state'}
        </div>

        <div className="flex flex-col gap-[0.42vh]">
          {MODES.map((item, index) => (
            <button
              key={item.id}
              onClick={() => selectMode(item.id)}
              className={`flex w-full items-center gap-[0.4vw] border px-[0.48vw] py-[0.58vh] text-left transition-colors ${
                item.id === mode
                  ? 'border-[#9c1414]/55 bg-[#9c1414]/7 text-[#bdbdbd]'
                  : 'border-white/8 text-[#4f4f4f] hover:border-white/16 hover:text-[#858585]'
              }`}
            >
              <span className={`shrink-0 font-mono text-[0.78vh] ${item.id === mode ? 'text-[#9c1414]/85' : 'text-[#383838]'}`}>
                {index + 1}
              </span>
              <span className="text-[0.98vh] uppercase leading-[1.05] tracking-[0.04em]">
                {lang === 'ru' ? item.ru : item.en}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-[1.5vh] flex flex-col gap-[1.15vh]">
          <LabSlider label="HP" value={health} onChange={setHealth} />
          <LabSlider label="ST" value={stamina} onChange={setStamina} />
        </div>

        <div className="mt-[1.2vh] whitespace-pre-line font-mono text-[0.72vh] leading-[1.55] tracking-[0.03em] text-[#343434]">
          {lang === 'ru' ? 'SPACE / ЛКМ — действие\nR — перезарядка' : 'SPACE / LMB — action\nR — reload'}
        </div>
      </div>

      <button
        onClick={onBack}
        className={`${embedded ? 'hidden' : 'group flex'} absolute bottom-[6vh] right-[8vw] items-center gap-[0.8vw] text-[#666] hover:text-[#c0c0c0]`}
      >
        <span className="border border-[#333] px-[0.6vw] py-[0.2vh] font-mono text-[1.2vh] tracking-wider group-hover:border-[#666]">ESC</span>
        <span className="text-[2vh] uppercase tracking-wider">{lang === 'ru' ? 'Назад' : 'Back'}</span>
      </button>
    </motion.div>
  );
}
