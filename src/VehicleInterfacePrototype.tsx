import { useState } from 'react';
import { motion } from 'motion/react';
import { Language } from './App';

interface VehicleInterfacePrototypeProps {
  onBack: () => void;
  lang: Language;
  embedded?: boolean;
  viewportRatio?: '16:9' | '21:9' | '32:9';
}

const GEARS = ['R', 'N', '1', '2', '3', '4', '5', '6'];

function LabSlider({
  label,
  value,
  onChange,
  suffix = '',
  min = 0,
  max = 100,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
  min?: number;
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
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-[2px] w-full cursor-pointer accent-[#9c1414]"
      />
    </label>
  );
}

function Meter({
  label,
  value,
  tone = 'neutral',
}: {
  label: string;
  value: number;
  tone?: 'neutral' | 'danger';
}) {
  return (
    <div className="grid grid-cols-[30px_44px] items-center gap-[5px] font-mono text-[7px]">
      <span className="text-white/18">{label}</span>
      <div className="h-px bg-white/7">
        <motion.div
          animate={{ width: `${Math.max(0, Math.min(100, value))}%` }}
          transition={{ duration: 0.12 }}
          className={`h-full ${tone === 'danger' ? 'bg-[#9c1414]/65' : 'bg-white/34'}`}
        />
      </div>
    </div>
  );
}

function SteeringMeter({ value }: { value: number }) {
  const normalized = Math.max(-100, Math.min(100, value));
  const offset = (normalized / 100) * 22;

  return (
    <div className="grid grid-cols-[30px_44px] items-center gap-[5px] font-mono text-[7px]">
      <span className="text-white/18">STR</span>
      <div className="relative h-[5px]">
        <i className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-white/9" />
        <i className="absolute left-1/2 top-0 h-[5px] w-px -translate-x-1/2 bg-white/16" />
        <motion.i
          animate={{ x: offset }}
          transition={{ duration: 0.1 }}
          className="absolute left-1/2 top-1/2 h-[3px] w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/56"
        />
      </div>
    </div>
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
          transition={{ duration: 0.18, ease: 'easeOut' }}
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
          transition={{ duration: 0.18, ease: 'easeOut' }}
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
  const [speed, setSpeed] = useState(72);
  const [rpm, setRpm] = useState(42);
  const [fuel, setFuel] = useState(68);
  const [throttle, setThrottle] = useState(36);
  const [brake, setBrake] = useState(0);
  const [clutch, setClutch] = useState(0);
  const [steering, setSteering] = useState(12);
  const [carDamage, setCarDamage] = useState(12);
  const [driverDamage, setDriverDamage] = useState(4);
  const [cargoDamage, setCargoDamage] = useState(7);
  const [heading, setHeading] = useState(38);
  const [gearIndex, setGearIndex] = useState(4);

  const viewportAspect = viewportRatio === '32:9' ? '32 / 9' : viewportRatio === '21:9' ? '21 / 9' : '16 / 9';
  const viewportWidth = viewportRatio === '32:9'
    ? 'min(72vw, calc(67vh * 32 / 9))'
    : viewportRatio === '21:9'
      ? 'min(72vw, calc(67vh * 21 / 9))'
      : 'min(72vw, calc(67vh * 16 / 9))';

  const gear = GEARS[gearIndex] ?? 'N';
  const rpmDanger = rpm >= 84;

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
        >
          <div className="absolute bottom-[5.7%] left-[4.8%]">
            <Radar heading={heading} />
          </div>

          <div className="absolute bottom-[5.7%] right-[4.8%]">
            <div className="grid grid-cols-[80px_112px] grid-rows-[auto_auto] items-end gap-x-[15px] gap-y-[11px]">
              {/* 3. Driver inputs — directly above the primary driving readout. */}
              <div className="col-start-2 row-start-1 border-b border-white/6 pb-[8px]">
                <div className="grid gap-y-[4px]">
                  <Meter label="GAS" value={throttle} />
                  <Meter label="BRK" value={brake} />
                  <Meter label="CLT" value={clutch} />
                  <SteeringMeter value={steering} />
                </div>
              </div>

              {/* 2. Persistent condition / resource block — left of the primary readout. */}
              <div className="col-start-1 row-start-2 self-end border-r border-white/6 pr-[10px]">
                <div className="grid gap-y-[4px]">
                  <Meter label="CAR" value={carDamage} tone="danger" />
                  <Meter label="DRV" value={driverDamage} tone="danger" />
                  <Meter label="LOAD" value={cargoDamage} tone="danger" />
                  <Meter label="FUEL" value={fuel} />
                </div>
              </div>

              {/* 1. Primary driving readout — fixed to the bottom-right corner. */}
              <div className="col-start-2 row-start-2">
                <div className="flex items-end justify-between gap-[10px]">
                  <motion.div
                    key={gear}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.12 }}
                    className="font-mono text-[38px] font-light leading-[0.76] text-white/76"
                  >
                    {gear}
                  </motion.div>

                  <div className="flex items-baseline gap-[4px] font-mono">
                    <span className="text-[21px] font-light leading-none text-white/58">{speed}</span>
                    <span className="text-[6px] uppercase tracking-[0.14em] text-white/16">km/h</span>
                  </div>
                </div>

                <div className="mt-[7px] flex items-center gap-[5px]">
                  <span className="font-mono text-[6px] uppercase tracking-[0.12em] text-white/16">rpm</span>
                  <div className="h-px flex-1 bg-white/7">
                    <motion.div
                      animate={{ width: `${rpm}%` }}
                      transition={{ duration: 0.12 }}
                      className={`h-full ${rpmDanger ? 'bg-[#9c1414]/72' : 'bg-white/34'}`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute right-[8vw] top-[23vh] z-20 w-[5.4vw]">
        <div className="mb-[0.9vh] font-sans text-[0.82vh] uppercase tracking-[0.2em] text-white/16">
          {lang === 'ru' ? 'параметры' : 'parameters'}
        </div>

        <div className="flex flex-col gap-[0.9vh]">
          <LabSlider label={lang === 'ru' ? 'Скорость' : 'Speed'} value={speed} onChange={setSpeed} max={220} />
          <LabSlider label="RPM" value={rpm} onChange={setRpm} suffix="%" />

          <div>
            <div className="mb-[0.35vh] flex items-center justify-between font-sans">
              <span className="text-[0.82vh] uppercase tracking-[0.16em] text-white/24">
                {lang === 'ru' ? 'Передача' : 'Gear'}
              </span>
              <span className="font-mono text-[0.86vh] text-white/36">{gear}</span>
            </div>
            <div className="grid grid-cols-4 gap-[2px]">
              {GEARS.map((item, index) => (
                <button
                  key={item}
                  onClick={() => setGearIndex(index)}
                  className={`border py-[0.28vh] font-mono text-[0.78vh] transition-colors ${
                    gearIndex === index
                      ? 'border-[#9c1414]/55 bg-[#9c1414]/8 text-[#bdbdbd]'
                      : 'border-white/8 text-[#444] hover:border-white/16 hover:text-[#888]'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <LabSlider label={lang === 'ru' ? 'Газ' : 'Throttle'} value={throttle} onChange={setThrottle} suffix="%" />
          <LabSlider label={lang === 'ru' ? 'Тормоз' : 'Brake'} value={brake} onChange={setBrake} suffix="%" />
          <LabSlider label={lang === 'ru' ? 'Сцепление' : 'Clutch'} value={clutch} onChange={setClutch} suffix="%" />
          <LabSlider label={lang === 'ru' ? 'Руль' : 'Steering'} value={steering} onChange={setSteering} suffix="%" min={-100} max={100} />

          <LabSlider label={lang === 'ru' ? 'Машина' : 'Car dmg'} value={carDamage} onChange={setCarDamage} suffix="%" />
          <LabSlider label={lang === 'ru' ? 'Водитель' : 'Driver dmg'} value={driverDamage} onChange={setDriverDamage} suffix="%" />
          <LabSlider label={lang === 'ru' ? 'Груз' : 'Cargo dmg'} value={cargoDamage} onChange={setCargoDamage} suffix="%" />
          <LabSlider label={lang === 'ru' ? 'Топливо' : 'Fuel'} value={fuel} onChange={setFuel} suffix="%" />
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
