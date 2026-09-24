import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Language } from './App';

type VehicleState = 'cruise' | 'push' | 'damage';

interface VehicleInterfacePrototypeProps {
  onBack: () => void;
  lang: Language;
  embedded?: boolean;
}

const STATES: Array<{ id: VehicleState; ru: string; en: string; speed: number; gear: string; rpm: number; fuel: number }> = [
  { id: 'cruise', ru: 'Спокойно', en: 'Cruise', speed: 54, gear: '3', rpm: 38, fuel: 67 },
  { id: 'push', ru: 'Высокая нагрузка', en: 'High load', speed: 126, gear: '4', rpm: 78, fuel: 64 },
  { id: 'damage', ru: 'Повреждения', en: 'Damage', speed: 71, gear: '3', rpm: 62, fuel: 29 },
];

export function VehicleInterfacePrototype({ onBack, lang, embedded = false }: VehicleInterfacePrototypeProps) {
  const [state, setState] = useState<VehicleState>('cruise');
  const active = useMemo(() => STATES.find((item) => item.id === state) ?? STATES[0], [state]);

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
            {lang === 'ru' ? 'hud / автомобиль / прототип' : 'hud / vehicle / prototype'}
          </span>
        </div>
      </div>

      <div className="absolute inset-x-0 top-[17vh] flex justify-center">
        <div
          className="relative overflow-hidden border border-white/10 bg-black shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
          style={{ width: 'min(84vw, calc(67vh * 16 / 9))', aspectRatio: '16 / 9' }}
        >
          <div className="absolute inset-x-[5.5%] bottom-[6.5%] flex items-end justify-between">
            <AnimatePresence mode="wait">
              <motion.div
                key={state}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: state === 'damage' ? 0.92 : 0.45, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="font-rajdhani"
              >
                {state === 'damage' ? (
                  <div className="flex flex-col gap-[6px]">
                    <div className="flex items-center gap-[8px] text-[10px] uppercase tracking-[0.28em] text-[#9c1414]">
                      <span className="h-[5px] w-[5px] rounded-full bg-[#9c1414]" />
                      {lang === 'ru' ? 'двигатель' : 'engine'}
                    </div>
                    <div className="flex items-center gap-[8px] text-[10px] uppercase tracking-[0.28em] text-white/40">
                      <span className="h-[5px] w-[5px] rounded-full border border-white/30" />
                      {lang === 'ru' ? 'топливо низко' : 'low fuel'}
                    </div>
                  </div>
                ) : state === 'push' ? (
                  <div className="flex items-center gap-[8px] text-[10px] uppercase tracking-[0.28em] text-white/35">
                    <span className="h-[5px] w-[5px] rounded-full bg-white/35" />
                    {lang === 'ru' ? 'высокая нагрузка' : 'high load'}
                  </div>
                ) : (
                  <div className="text-[10px] uppercase tracking-[0.28em] text-white/18">
                    {lang === 'ru' ? 'системы в норме' : 'systems normal'}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex items-end gap-[18px] font-rajdhani">
              <div className="mb-[4px] flex h-[62px] flex-col justify-end gap-[4px]">
                <div className="text-right text-[8px] uppercase tracking-[0.25em] text-white/18">rpm</div>
                <div className="flex items-end gap-[2px]">
                  {Array.from({ length: 12 }, (_, index) => {
                    const threshold = ((index + 1) / 12) * 100;
                    const lit = active.rpm >= threshold;
                    const hot = index >= 9;
                    return (
                      <motion.i
                        key={index}
                        animate={{ opacity: lit ? 1 : 0.12, height: 8 + index * 1.45 }}
                        className={`w-[3px] ${hot && lit ? 'bg-[#9c1414]' : 'bg-white/65'}`}
                      />
                    );
                  })}
                </div>
                <div className="mt-[3px] flex items-center gap-[5px]">
                  <span className="text-[8px] uppercase tracking-[0.2em] text-white/16">fuel</span>
                  <div className="h-[2px] w-[62px] bg-white/10">
                    <motion.div
                      animate={{ width: `${active.fuel}%` }}
                      className={`h-full ${active.fuel < 35 ? 'bg-[#9c1414]/75' : 'bg-white/45'}`}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-end gap-[12px]">
                <motion.div
                  key={active.gear}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[52px] font-light leading-[0.8] text-white/78"
                >
                  {active.gear}
                </motion.div>
                <div className="min-w-[86px] text-right">
                  <motion.div
                    key={active.speed}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[34px] font-light leading-none text-white/72"
                  >
                    {active.speed.toString().padStart(3, '0')}
                  </motion.div>
                  <div className="mt-[3px] text-[9px] uppercase tracking-[0.34em] text-white/22">km/h</div>
                </div>
              </div>
            </div>
          </div>

          {state === 'damage' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.04, 0.12, 0.05, 0.1] }}
              transition={{ duration: 2.6, repeat: Infinity }}
              className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(156,20,20,0.18),transparent_34%)]"
            />
          )}
        </div>
      </div>

      <div className="absolute bottom-[6vh] left-[6vw] right-[6vw] flex items-end justify-between gap-[3vw]">
        <div>
          <div className="mb-[1.4vh] flex gap-[0.55vw]">
            {STATES.map((item, index) => (
              <button
                key={item.id}
                onClick={() => setState(item.id)}
                className={`flex items-center gap-[0.55vw] border px-[0.9vw] py-[0.55vh] transition-colors ${
                  item.id === state
                    ? 'border-[#9c1414]/70 bg-[#9c1414]/10 text-[#c8c8c8]'
                    : 'border-white/10 text-[#555] hover:border-white/20 hover:text-[#999]'
                }`}
              >
                <span className={`font-mono text-[1.05vh] ${item.id === state ? 'text-[#9c1414]' : 'text-[#3e3e3e]'}`}>{index + 1}</span>
                <span className="text-[1.55vh] uppercase tracking-[0.08em]">{lang === 'ru' ? item.ru : item.en}</span>
              </button>
            ))}
          </div>
          <div className="max-w-[58vw] font-sans text-[1.15vh] leading-[1.5] tracking-[0.04em] text-[#454545]">
            {lang === 'ru'
              ? 'Постоянно только передача, скорость, обороты и топливо. Предупреждения появляются лишь когда машине действительно нужно внимание.'
              : 'Only gear, speed, RPM and fuel stay persistent. Warnings appear only when the car actually needs attention.'}
          </div>
        </div>

        <button onClick={onBack} className={`${embedded ? "hidden" : "group flex"} shrink-0 items-center gap-[0.8vw] text-[#666] hover:text-[#c0c0c0]`}>
          <span className="border border-[#333] px-[0.6vw] py-[0.2vh] font-mono text-[1.2vh] tracking-wider group-hover:border-[#666]">ESC</span>
          <span className="text-[2vh] uppercase tracking-wider">{lang === 'ru' ? 'Назад' : 'Back'}</span>
        </button>
      </div>
    </motion.div>
  );
}
