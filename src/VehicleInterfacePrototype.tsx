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
  suffix = '',
  max = 100,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
  max?: number;
}) {
  return (
    <label className="block font-sans">
      <div className="mb-[0.3vh] flex items-center justify-between">
        <span className="text-[0.82vh] uppercase tracking-[0.16em] text-white/24">{label}</span>
        <span className="font-mono text-[0.86vh] text-white/36">{value}{suffix}</span>
      </div>
      <input
        type="range"
        min={0}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-[2px] w-full cursor-pointer accent-[#9c1414]"
      />
    </label>
  );
}

function cardinalFromHeading(heading: number) {
  const points = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return points[Math.round(heading / 45) % 8];
}

function Radar({ heading }: { heading: number }) {
  return (
    <div className="relative h-[82px] w-[82px]">
      <div className="absolute inset-0 overflow-hidden rounded-full border border-white/12 bg-black/10">
        <motion.div
          animate={{ rotate: -heading }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="absolute left-1/2 top-1/2 h-[104px] w-[104px] -translate-x-1/2 -translate-y-1/2"
        >
          <i className="absolute left-[49px] top-[-12px] h-[128px] w-px rotate-[18deg] bg-white/12" />
          <i className="absolute left-[-8px] top-[50px] h-px w-[122px] -rotate-[12deg] bg-white/10" />
          <i className="absolute left-[22px] top-[18px] h-[66px] w-px -rotate-[42deg] bg-white/8" />
          <i className="absolute left-[63px] top-[34px] h-[3px] w-[3px] rounded-full bg-white/22" />
          <i className="absolute left-[29px] top-[70px] h-[2px] w-[2px] rounded-full bg-[#9c1414]/55" />
        </motion.div>

        <div className="absolute left-1/2 top-1/2 h-[9px] w-[7px] -translate-x-1/2 -translate-y-1/2">
          <i className="absolute left-1/2 top-0 h-0 w-0 -translate-x-1/2 border-x-[3.5px] border-b-[8px] border-x-transparent border-b-white/60" />
        </div>

        <i className="absolute left-1/2 top-[7px] h-[3px] w-px -translate-x-1/2 bg-white/18" />
        <i className="absolute bottom-[7px] left-1/2 h-[3px] w-px -translate-x-1/2 bg-white/10" />
        <i className="absolute left-[7px] top-1/2 h-px w-[3px] -translate-y-1/2 bg-white/10" />
        <i className="absolute right-[7px] top-1/2 h-px w-[3px] -translate-y-1/2 bg-white/10" />
      </div>

      <div className="absolute -top-[19px] left-1/2 flex -translate-x-1/2 items-center gap-[6px]">
        <motion.div
          animate={{ rotate: heading }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative h-[10px] w-[10px]"
        >
          <i className="absolute left-1/2 top-0 h-0 w-0 -translate-x-1/2 border-x-[2.5px] border-b-[7px] border-x-transparent border-b-white/44" />
        </motion.div>
        <span className="font-mono text-[8px] tracking-[0.1em] text-white/28">{cardinalFromHeading(heading)}</span>
      </div>
    </div>
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
  const [heading, setHeading] = useState(38);

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

  const lowFuel = fuel <= 25;
  const visibleDamage = damage >= 18;
  const criticalDamage = damage >= 70;
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
          <div className="absolute bottom-[5.7%] left-[4.8%]">
            <Radar heading={heading} />
          </div>

          <div className="absolute bottom-[5.7%] right-[4.8%] flex items-end gap-[14px]">
            <motion.div
              key={derived.gear}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.12 }}
              className="font-mono text-[30px] font-light leading-[0.8] text-white/72"
            >
              {derived.gear}
            </motion.div>

            <div className="mb-[1px] flex flex-col items-end">
              <div className="flex items-baseline gap-[5px] font-mono">
                <motion.span
                  animate={{ opacity: 1 }}
                  className="text-[20px] font-light leading-none text-white/58"
                >
                  {derived.speed}
                </motion.span>
                <span className="text-[7px] uppercase tracking-[0.16em] text-white/16">km/h</span>
              </div>

              <div className="mt-[6px] h-px w-[58px] bg-white/7">
                <motion.div
                  animate={{ width: `${rpm}%` }}
                  transition={{ duration: 0.14 }}
                  className={`h-full ${highRpm ? 'bg-[#9c1414]/72' : 'bg-white/34'}`}
                />
              </div>

              {(lowFuel || visibleDamage) && (
                <div className="mt-[5px] flex items-center gap-[7px] font-mono text-[7px]">
                  {lowFuel && (
                    <span className="flex items-center gap-[3px] text-[#9c1414]/68">
                      F
                      <i className="h-px w-[18px] bg-white/8">
                        <motion.i animate={{ width: `${fuel}%` }} className="block h-full bg-[#9c1414]/66" />
                      </i>
                    </span>
                  )}
                  {visibleDamage && (
                    <span className={criticalDamage ? 'text-[#9c1414]/82' : 'text-white/26'}>
                      {criticalDamage ? '!' : '◇'} {damage}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {criticalDamage && (
            <motion.div
              animate={{ opacity: [0.015, 0.05, 0.02, 0.045, 0.015] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_82%,rgba(156,20,20,0.28),transparent_34%)]"
            />
          )}
        </div>
      </div>

      <div className="absolute right-[8vw] top-[29vh] z-20 w-[5.4vw]">
        <div className="mb-[0.9vh] font-sans text-[0.82vh] uppercase tracking-[0.2em] text-white/16">
          {lang === 'ru' ? 'параметры' : 'parameters'}
        </div>

        <div className="flex flex-col gap-[1.05vh]">
          <LabSlider label="RPM" value={rpm} onChange={setRpm} suffix="%" />
          <LabSlider label={lang === 'ru' ? 'Топливо' : 'Fuel'} value={fuel} onChange={setFuel} suffix="%" />
          <LabSlider label={lang === 'ru' ? 'Урон' : 'Damage'} value={damage} onChange={setDamage} suffix="%" />
          <LabSlider label={lang === 'ru' ? 'Курс' : 'Heading'} value={heading} onChange={setHeading} suffix="°" max={359} />
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
