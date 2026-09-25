import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { Language } from './App';

interface VehicleInterfacePrototypeProps {
  onBack: () => void;
  lang: Language;
  embedded?: boolean;
  viewportRatio?: '16:9' | '21:9' | '32:9';
}

type RadarMode = 'map' | 'cars' | 'direction';

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
    <div className="grid grid-cols-[30px_1fr] items-center gap-[5px] font-mono text-[7px]">
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
  const offset = (normalized / 100) * 28;

  return (
    <div className="grid grid-cols-[30px_1fr] items-center gap-[5px] font-mono text-[7px]">
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

function ArrowHead({
  angle,
  radius,
  className,
  size = 7,
}: {
  angle: number;
  radius: number;
  className: string;
  size?: number;
}) {
  const radians = ((angle - 90) * Math.PI) / 180;
  const x = Math.cos(radians) * radius;
  const y = Math.sin(radians) * radius;

  return (
    <motion.i
      animate={{ x, y, rotate: angle }}
      transition={{ duration: 0.16, ease: 'easeOut' }}
      className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${className}`}
      style={{
        width: 0,
        height: 0,
        borderLeft: `${size / 2}px solid transparent`,
        borderRight: `${size / 2}px solid transparent`,
        borderBottom: `${size}px solid currentColor`,
      }}
    />
  );
}

function DirectionRadar({ heading }: { heading: number }) {
  const targetAngle = 72;
  const pursuers = [214, 304];

  return (
    <div className="relative h-[116px] w-[116px]">
      <div className="absolute left-1/2 top-1/2 h-[3px] w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/42" />

      <ArrowHead angle={0} radius={42} size={6} className="text-white/28" />
      <span className="absolute left-1/2 top-[5px] -translate-x-1/2 font-mono text-[8px] tracking-[0.12em] text-white/28">N</span>

      <ArrowHead angle={targetAngle - heading} radius={34} size={9} className="text-[#9c1414]/82" />

      {pursuers.map((angle, index) => (
        <ArrowHead
          key={angle}
          angle={angle - heading}
          radius={index === 0 ? 43 : 48}
          size={7}
          className="text-white/38"
        />
      ))}

      <motion.div
        animate={{ rotate: heading }}
        transition={{ duration: 0.16, ease: 'easeOut' }}
        className="absolute left-1/2 top-1/2 h-[16px] w-[12px] -translate-x-1/2 -translate-y-1/2"
      >
        <i className="absolute left-1/2 top-0 h-0 w-0 -translate-x-1/2 border-x-[3.5px] border-b-[9px] border-x-transparent border-b-white/64" />
      </motion.div>

      <div className="absolute bottom-[2px] left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[7px] tracking-[0.1em] text-white/22">
        {cardinalFromHeading(heading)}
      </div>
    </div>
  );
}

function MapRadar({ heading, showCars }: { heading: number; showCars: boolean }) {
  return (
    <div className="relative h-[116px] w-[116px]">
      <div className="absolute inset-0 overflow-hidden rounded-full border border-white/12 bg-black/10">
        <motion.div
          animate={{ rotate: -heading }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="absolute left-1/2 top-1/2 h-[150px] w-[150px] -translate-x-1/2 -translate-y-1/2"
        >
          {/* Road network only; no FOV / sight-sector lines. */}
          <i className="absolute left-[68px] top-[-22px] h-[194px] w-[2px] rotate-[18deg] bg-white/10" />
          <i className="absolute left-[-20px] top-[72px] h-[2px] w-[190px] -rotate-[12deg] bg-white/8" />
          <i className="absolute left-[31px] top-[19px] h-[108px] w-[2px] -rotate-[42deg] bg-white/7" />
          <i className="absolute left-[92px] top-[48px] h-[2px] w-[58px] rotate-[28deg] bg-white/7" />
          <i className="absolute left-[13px] top-[109px] h-[2px] w-[74px] rotate-[11deg] bg-white/6" />

          {showCars && (
            <>
              <i className="absolute left-[95px] top-[40px] h-[5px] w-[3px] rotate-[28deg] bg-white/42" />
              <i className="absolute left-[35px] top-[104px] h-[5px] w-[3px] -rotate-[18deg] bg-[#9c1414]/64" />
              <i className="absolute left-[112px] top-[93px] h-[5px] w-[3px] rotate-[71deg] bg-white/28" />
            </>
          )}
        </motion.div>

        <div className="absolute left-1/2 top-1/2 h-[12px] w-[9px] -translate-x-1/2 -translate-y-1/2">
          <i className="absolute left-1/2 top-0 h-0 w-0 -translate-x-1/2 border-x-[4px] border-b-[10px] border-x-transparent border-b-white/62" />
        </div>
      </div>

      <div className="absolute -top-[18px] left-1/2 flex -translate-x-1/2 items-center gap-[6px]">
        <motion.div
          animate={{ rotate: heading }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="relative h-[10px] w-[10px]"
        >
          <i className="absolute left-1/2 top-0 h-0 w-0 -translate-x-1/2 border-x-[2.5px] border-b-[7px] border-x-transparent border-b-white/42" />
        </motion.div>
        <span className="font-mono text-[8px] tracking-[0.1em] text-white/28">{cardinalFromHeading(heading)}</span>
      </div>
    </div>
  );
}

function Radar({ heading, mode }: { heading: number; mode: RadarMode }) {
  if (mode === 'direction') return <DirectionRadar heading={heading} />;
  return <MapRadar heading={heading} showCars={mode === 'cars'} />;
}

function PrimaryReadout({
  speed,
  rpm,
  gear,
}: {
  speed: number;
  rpm: number;
  gear: string;
}) {
  const rpmDanger = rpm >= 84;

  return (
    <div className="grid h-[48px] w-[126px] grid-cols-[38px_78px] items-center gap-[10px]">
      <motion.div
        key={gear}
        initial={{ opacity: 0, y: -3 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.1 }}
        className="flex h-full items-center justify-start font-mono text-[39px] font-light leading-none text-white/76"
      >
        {gear}
      </motion.div>

      <div className="flex h-full w-[78px] flex-col justify-center">
        <div className="flex w-full items-baseline justify-start gap-[3px] font-mono">
          <span className="text-[21px] font-light leading-none text-white/60">{speed}</span>
          <span className="text-[6px] uppercase tracking-[0.08em] text-white/16">km/h</span>
        </div>

        <div className="mt-[6px] w-[78px]">
          <div className="mb-[3px] flex w-full items-center justify-between font-mono text-[6px] uppercase tracking-[0.1em] text-white/16">
            <span>rpm</span>
            <span>{rpm}</span>
          </div>
          <div className="h-px w-full bg-white/7">
            <motion.div
              animate={{ width: `${rpm}%` }}
              transition={{ duration: 0.12 }}
              className={`h-full ${rpmDanger ? 'bg-[#9c1414]/72' : 'bg-white/34'}`}
            />
          </div>
        </div>
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
  const [showInputs, setShowInputs] = useState(true);
  const [radarMode, setRadarMode] = useState<RadarMode>('map');

  const viewportAspect = viewportRatio === '32:9' ? '32 / 9' : viewportRatio === '21:9' ? '21 / 9' : '16 / 9';
  const viewportWidth = viewportRatio === '32:9'
    ? 'min(72vw, calc(67vh * 32 / 9))'
    : viewportRatio === '21:9'
      ? 'min(72vw, calc(67vh * 21 / 9))'
      : 'min(72vw, calc(67vh * 16 / 9))';

  const gear = GEARS[gearIndex] ?? 'N';

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
          <div className="absolute bottom-[6.2%] left-[5.2%]">
            <Radar heading={heading} mode={radarMode} />
          </div>

          <div className="absolute bottom-[5.7%] right-[4.8%]">
            <div className="grid grid-cols-[82px_128px] grid-rows-[auto_auto] items-end gap-[12px]">
              <AnimatePresence initial={false}>
                {showInputs && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.15 }}
                    className="col-start-2 row-start-1 w-full pb-[2px]"
                  >
                    <div className="grid w-full gap-y-[4px]">
                      <Meter label="GAS" value={throttle} />
                      <Meter label="BRK" value={brake} />
                      <Meter label="CLT" value={clutch} />
                      <SteeringMeter value={steering} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="col-start-1 row-start-2 w-full self-end">
                <div className="grid w-full gap-y-[4px]">
                  <Meter label="CAR" value={carDamage} tone="danger" />
                  <Meter label="DRV" value={driverDamage} tone="danger" />
                  <Meter label="LOAD" value={cargoDamage} tone="danger" />
                  <Meter label="FUEL" value={fuel} />
                </div>
              </div>

              <div className="col-start-2 row-start-2">
                <PrimaryReadout speed={speed} rpm={rpm} gear={gear} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="vehicle-controls-scroll absolute bottom-[17vh] right-[3.5vw] top-[21vh] z-20 w-[8vw] min-w-[132px] overflow-y-auto pr-[18px]">
        <div className="mb-[1vh] font-sans text-[0.82vh] uppercase tracking-[0.2em] text-white/16">
          {lang === 'ru' ? 'параметры' : 'parameters'}
        </div>

        <div className="flex flex-col gap-[1.05vh]">
          <label className="flex cursor-pointer items-center justify-between gap-[8px] font-sans">
            <span className="text-[0.82vh] uppercase tracking-[0.14em] text-white/24">
              {lang === 'ru' ? 'Показывать ввод' : 'Show inputs'}
            </span>
            <input
              type="checkbox"
              checked={showInputs}
              onChange={(event) => setShowInputs(event.target.checked)}
              className="h-[11px] w-[11px] cursor-pointer accent-[#9c1414]"
            />
          </label>

          <label className="block font-sans">
            <span className="mb-[0.4vh] block text-[0.82vh] uppercase tracking-[0.14em] text-white/24">
              {lang === 'ru' ? 'Радар' : 'Radar'}
            </span>
            <div className="relative">
              <select
                value={radarMode}
                onChange={(event) => setRadarMode(event.target.value as RadarMode)}
                className="w-full appearance-none border border-white/10 bg-[#111] px-[7px] py-[5px] pr-[22px] font-sans text-[0.86vh] uppercase tracking-[0.08em] text-white/48 outline-none transition-colors hover:border-white/18 focus:border-[#9c1414]/45"
              >
                <option value="map">{lang === 'ru' ? 'Карта' : 'Map'}</option>
                <option value="cars">{lang === 'ru' ? 'Машины' : 'Cars'}</option>
                <option value="direction">{lang === 'ru' ? 'Направления' : 'Directions'}</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-[6px] top-1/2 h-[10px] w-[10px] -translate-y-1/2 text-white/26" strokeWidth={1.4} />
            </div>
          </label>

          <div className="my-[0.15vh] h-px bg-white/6" />

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

          <div className="my-[0.15vh] h-px bg-white/6" />

          <LabSlider label={lang === 'ru' ? 'Газ' : 'Throttle'} value={throttle} onChange={setThrottle} suffix="%" />
          <LabSlider label={lang === 'ru' ? 'Тормоз' : 'Brake'} value={brake} onChange={setBrake} suffix="%" />
          <LabSlider label={lang === 'ru' ? 'Сцепление' : 'Clutch'} value={clutch} onChange={setClutch} suffix="%" />
          <LabSlider label={lang === 'ru' ? 'Руль' : 'Steering'} value={steering} onChange={setSteering} suffix="%" min={-100} max={100} />

          <div className="my-[0.15vh] h-px bg-white/6" />

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
