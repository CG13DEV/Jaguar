import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Language } from './App';

interface VehicleInterfacePrototypeProps {
  onBack: () => void;
  lang: Language;
  embedded?: boolean;
  viewportRatio?: '16:9' | '21:9' | '32:9';
}

function LabSlider({
  label,
  value,
  onChange,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  suffix: string;
}) {
  return (
    <label className="block font-sans">
      <div className="mb-[0.35vh] flex items-center justify-between">
        <span className="text-[0.86vh] uppercase tracking-[0.16em] text-white/28">{label}</span>
        <span className="font-mono text-[0.9vh] text-white/42">{value}{suffix}</span>
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

export function VehicleInterfacePrototype({
  onBack,
  lang,
  embedded = false,
  viewportRatio = '16:9',
}: VehicleInterfacePrototypeProps) {
  const [rpm, setRpm] = useState(42);
  const [fuel, setFuel] = useState(68);
  const [damage, setDamage] = useState(12);

  const viewportAspect = viewportRatio === '32:9' ? '32 / 9' : viewportRatio === '21:9' ? '21 / 9' : '16 / 9';
  const viewportWidth = viewportRatio === '32:9'
    ? 'min(72vw, calc(67vh * 32 / 9))'
    : viewportRatio === '21:9'
      ? 'min(72vw, calc(67vh * 21 / 9))'
      : 'min(72vw, calc(67vh * 16 / 9))';

  const derived = useMemo(() => {
    const gear = rpm < 8 ? 'N' : rpm < 23 ? '1' : rpm < 39 ? '2' : rpm < 56 ? '3' : rpm < 73 ? '4' : rpm < 88 ? '5' : '6';
    const speed = rpm < 8 ? 0 : Math.round((rpm / 100) * 172);
    return { gear, speed };
  }, [rpm]);

  const criticalDamage = damage >= 70;
  const visibleDamage = damage >= 25;
  const lowFuel = fuel <= 20;
  const highRpm = rpm >= 84;

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
          className="relative overflow-hidden border border-white/10 bg-black shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
          style={{ width: viewportWidth, aspectRatio: viewportAspect }}
        >
          {(visibleDamage || lowFuel || highRpm) && (
            <div className="absolute bottom-[7%] left-[5.5%] flex flex-col gap-[6px] font-rajdhani">
              {criticalDamage ? (
                <div className="flex items-center gap-[8px] text-[10px] uppercase tracking-[0.28em] text-[#9c1414]">
                  <span className="h-[5px] w-[5px] rounded-full bg-[#9c1414]" />
                  {lang === 'ru' ? 'критическое повреждение' : 'critical damage'}
                </div>
              ) : visibleDamage ? (
                <div className="flex items-center gap-[8px] text-[10px] uppercase tracking-[0.28em] text-white/38">
                  <span className="h-[5px] w-[5px] rounded-full border border-white/35" />
                  {lang === 'ru' ? 'повреждение машины' : 'vehicle damage'} {damage}%
                </div>
              ) : null}

              {lowFuel && (
                <div className="flex items-center gap-[8px] text-[10px] uppercase tracking-[0.28em] text-[#9c1414]/85">
                  <span className="h-[5px] w-[5px] rounded-full bg-[#9c1414]/85" />
                  {lang === 'ru' ? 'мало топлива' : 'low fuel'}
                </div>
              )}

              {highRpm && (
                <div className="flex items-center gap-[8px] text-[10px] uppercase tracking-[0.28em] text-white/38">
                  <span className="h-[5px] w-[5px] rounded-full bg-white/28" />
                  {lang === 'ru' ? 'высокие обороты' : 'high rpm'}
                </div>
              )}
            </div>
          )}

          <div className="absolute bottom-[6.5%] right-[5.5%] flex items-end gap-[18px] font-rajdhani">
            <div className="mb-[4px] flex h-[66px] flex-col justify-end gap-[4px]">
              <div className="flex items-center justify-between text-[8px] uppercase tracking-[0.25em] text-white/18">
                <span>rpm</span>
                <span className={highRpm ? 'text-[#9c1414]/80' : 'text-white/18'}>{rpm}%</span>
              </div>
              <div className="flex items-end gap-[2px]">
                {Array.from({ length: 14 }, (_, index) => {
                  const threshold = ((index + 1) / 14) * 100;
                  const lit = rpm >= threshold;
                  const hot = index >= 11;
                  return (
                    <motion.i
                      key={index}
                      animate={{ opacity: lit ? 1 : 0.11, height: 8 + index * 1.35 }}
                      transition={{ duration: 0.14 }}
                      className={`w-[3px] ${hot && lit ? 'bg-[#9c1414]' : 'bg-white/65'}`}
                    />
                  );
                })}
              </div>

              <div className="mt-[3px] grid grid-cols-[36px_78px_30px] items-center gap-[5px]">
                <span className="text-[8px] uppercase tracking-[0.18em] text-white/16">fuel</span>
                <div className="h-[2px] bg-white/10">
                  <motion.div
                    animate={{ width: `${fuel}%` }}
                    transition={{ duration: 0.16 }}
                    className={`h-full ${lowFuel ? 'bg-[#9c1414]/80' : 'bg-white/45'}`}
                  />
                </div>
                <span className={`text-right font-mono text-[8px] ${lowFuel ? 'text-[#9c1414]/75' : 'text-white/18'}`}>
                  {fuel}%
                </span>
              </div>

              <div className="grid grid-cols-[36px_78px_30px] items-center gap-[5px]">
                <span className="text-[8px] uppercase tracking-[0.18em] text-white/16">car</span>
                <div className="h-[2px] bg-white/10">
                  <motion.div
                    animate={{ width: `${damage}%` }}
                    transition={{ duration: 0.16 }}
                    className={`h-full ${criticalDamage ? 'bg-[#9c1414]' : visibleDamage ? 'bg-[#9c1414]/60' : 'bg-white/30'}`}
                  />
                </div>
                <span className={`text-right font-mono text-[8px] ${visibleDamage ? 'text-[#9c1414]/70' : 'text-white/18'}`}>
                  {damage}%
                </span>
              </div>
            </div>

            <div className="flex items-end gap-[12px]">
              <motion.div
                key={derived.gear}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[52px] font-light leading-[0.8] text-white/78"
              >
                {derived.gear}
              </motion.div>
              <div className="min-w-[86px] text-right">
                <motion.div
                  animate={{ opacity: 1 }}
                  className="text-[34px] font-light leading-none text-white/72"
                >
                  {derived.speed.toString().padStart(3, '0')}
                </motion.div>
                <div className="mt-[3px] text-[9px] uppercase tracking-[0.34em] text-white/22">km/h</div>
              </div>
            </div>
          </div>

          {damage > 0 && (
            <motion.div
              animate={{ opacity: criticalDamage ? [0.05, 0.15, 0.06, 0.12] : damage > 35 ? 0.055 : 0 }}
              transition={{ duration: 2.2, repeat: criticalDamage ? Infinity : 0 }}
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_78%,rgba(156,20,20,0.24),transparent_36%)]"
            />
          )}
        </div>
      </div>

      <div className="absolute right-[8vw] top-[31vh] z-20 w-[5.4vw]">
        <div className="mb-[1vh] font-sans text-[0.88vh] uppercase tracking-[0.22em] text-white/18">
          {lang === 'ru' ? 'параметры' : 'parameters'}
        </div>
        <div className="flex flex-col gap-[1.2vh]">
          <LabSlider label="RPM" value={rpm} onChange={setRpm} suffix="%" />
          <LabSlider label={lang === 'ru' ? 'Топливо' : 'Fuel'} value={fuel} onChange={setFuel} suffix="%" />
          <LabSlider label={lang === 'ru' ? 'Урон' : 'Damage'} value={damage} onChange={setDamage} suffix="%" />
        </div>
      </div>

      <button
        onClick={onBack}
        className={`${embedded ? 'hidden' : 'group flex'} absolute bottom-[6vh] right-[6vw] items-center gap-[0.8vw] text-[#666] hover:text-[#c0c0c0]`}
      >
        <span className="border border-[#333] px-[0.6vw] py-[0.2vh] font-mono text-[1.2vh] tracking-wider group-hover:border-[#666]">ESC</span>
        <span className="text-[2vh] uppercase tracking-wider">{lang === 'ru' ? 'Назад' : 'Back'}</span>
      </button>
    </motion.div>
  );
}
