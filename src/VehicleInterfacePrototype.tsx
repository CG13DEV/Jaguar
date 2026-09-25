import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Language } from './App';
import { getHashBoolean, getHashEnum, getHashNumber, replaceHashParams } from './routeState';
import { ScaledHudCanvas } from './ScaledHudCanvas';

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
        <span className="text-[0.82vh] max-md:text-[10px] uppercase tracking-[0.16em] text-white/24">{label}</span>
        <span className="font-mono text-[0.86vh] max-md:text-[10px] text-white/36">{value}{suffix}</span>
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

function MapRadar({
  heading,
  targetDirection,
  timer,
}: {
  heading: number;
  targetDirection: number;
  timer: number;
}) {
  const relativeTarget = targetDirection - heading;

  return (
    <div className="relative h-[132px] w-[132px]">
      <svg
        viewBox="0 0 132 132"
        className="pointer-events-none absolute inset-0 h-full w-full -rotate-90"
        aria-hidden="true"
      >
        <circle
          cx="66"
          cy="66"
          r="62"
          fill="none"
          stroke="rgba(255,255,255,0.055)"
          strokeWidth="1"
        />
        <motion.circle
          cx="66"
          cy="66"
          r="62"
          fill="none"
          stroke="rgba(156,20,20,0.72)"
          strokeWidth="1.5"
          strokeLinecap="round"
          pathLength="100"
          strokeDasharray="100"
          animate={{ strokeDashoffset: 100 - timer }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        />
      </svg>

      <div className="absolute left-1/2 top-1/2 h-[116px] w-[116px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full border border-white/12 bg-black/10">
        <motion.div
          animate={{ rotate: -heading }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="absolute left-1/2 top-1/2 h-[150px] w-[150px] -translate-x-1/2 -translate-y-1/2"
        >
          <i className="absolute left-[68px] top-[-22px] h-[194px] w-[2px] rotate-[18deg] bg-white/10" />
          <i className="absolute left-[-20px] top-[72px] h-[2px] w-[190px] -rotate-[12deg] bg-white/8" />
          <i className="absolute left-[31px] top-[19px] h-[108px] w-[2px] -rotate-[42deg] bg-white/7" />
          <i className="absolute left-[92px] top-[48px] h-[2px] w-[58px] rotate-[28deg] bg-white/7" />
          <i className="absolute left-[13px] top-[109px] h-[2px] w-[74px] rotate-[11deg] bg-white/6" />

          <i className="absolute left-[95px] top-[40px] h-[5px] w-[3px] rotate-[28deg] bg-white/42" />
          <i className="absolute left-[35px] top-[104px] h-[5px] w-[3px] -rotate-[18deg] bg-[#9c1414]/64" />
          <i className="absolute left-[112px] top-[93px] h-[5px] w-[3px] rotate-[71deg] bg-white/28" />
        </motion.div>

        <div className="absolute left-1/2 top-1/2 h-[12px] w-[9px] -translate-x-1/2 -translate-y-1/2">
          <i className="absolute left-1/2 top-0 h-0 w-0 -translate-x-1/2 border-x-[4px] border-b-[10px] border-x-transparent border-b-white/62" />
        </div>
      </div>

      <motion.div
        animate={{ rotate: relativeTarget }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="absolute left-1/2 top-[-30px] h-[13px] w-[13px] -translate-x-1/2"
      >
        <i className="absolute left-1/2 top-0 h-0 w-0 -translate-x-1/2 border-x-[3px] border-b-[9px] border-x-transparent border-b-[#9c1414]/82" />
      </motion.div>
    </div>
  );
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
    <div className="grid h-[48px] w-max grid-cols-[24px_max-content] items-center gap-x-[12px]">
      <motion.div
        key={gear}
        initial={{ opacity: 0, y: -3 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.1 }}
        className="flex h-full w-[24px] items-center justify-center font-mono text-[39px] font-light leading-none text-white/76"
      >
        {gear}
      </motion.div>

      <div className="flex h-full w-max flex-col items-end justify-center">
        <div className="relative w-max whitespace-nowrap font-mono">
          <div aria-hidden="true" className="invisible flex items-baseline gap-[6px]">
            <span className="text-[21px] font-light leading-none">220</span>
            <span className="text-[6px] uppercase tracking-[0.06em]">km/h</span>
          </div>

          <div className="absolute inset-0 flex items-baseline justify-end gap-[6px]">
            <span className="text-[21px] font-light leading-none text-white/60">{speed}</span>
            <span className="text-[6px] uppercase tracking-[0.06em] text-white/16">km/h</span>
          </div>
        </div>

        <div className="mt-[6px] w-full">
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
  const initialGear = getHashEnum('gear', GEARS, '3');
  const [speed, setSpeed] = useState(() => getHashNumber('speed', 72, 0, 220));
  const [rpm, setRpm] = useState(() => getHashNumber('rpm', 42, 0, 100));
  const [fuel, setFuel] = useState(() => getHashNumber('fuel', 68, 0, 100));
  const [throttle, setThrottle] = useState(() => getHashNumber('throttle', 36, 0, 100));
  const [brake, setBrake] = useState(() => getHashNumber('brake', 0, 0, 100));
  const [clutch, setClutch] = useState(() => getHashNumber('clutch', 0, 0, 100));
  const [steering, setSteering] = useState(() => getHashNumber('steering', 12, -100, 100));
  const [carDamage, setCarDamage] = useState(() => getHashNumber('car', 12, 0, 100));
  const [driverDamage, setDriverDamage] = useState(() => getHashNumber('driver', 4, 0, 100));
  const [cargoDamage, setCargoDamage] = useState(() => getHashNumber('cargo', 7, 0, 100));
  const [heading, setHeading] = useState(() => getHashNumber('heading', 38, 0, 359));
  const [gearIndex, setGearIndex] = useState(() => Math.max(0, GEARS.indexOf(initialGear)));
  const [showInputs, setShowInputs] = useState(() => getHashBoolean('inputs', true));
  const [targetDirection, setTargetDirection] = useState(() => getHashNumber('target', 72, 0, 359));
  const [timer, setTimer] = useState(() => getHashNumber('timer', 68, 0, 100));

  const viewportAspect = viewportRatio === '32:9' ? '32 / 9' : viewportRatio === '21:9' ? '21 / 9' : '16 / 9';
  const viewportWidth = viewportRatio === '32:9'
    ? 'min(72vw, calc(67vh * 32 / 9))'
    : viewportRatio === '21:9'
      ? 'min(72vw, calc(67vh * 21 / 9))'
      : 'min(72vw, calc(67vh * 16 / 9))';

  const gear = GEARS[gearIndex] ?? 'N';

  useEffect(() => {
    replaceHashParams({
      speed,
      rpm,
      fuel,
      throttle,
      brake,
      clutch,
      steering,
      car: carDamage,
      driver: driverDamage,
      cargo: cargoDamage,
      heading,
      gear,
      inputs: showInputs,
      target: targetDirection,
      timer,
    });
  }, [
    brake,
    carDamage,
    cargoDamage,
    clutch,
    driverDamage,
    fuel,
    gear,
    heading,
    rpm,
    showInputs,
    speed,
    steering,
    targetDirection,
    throttle,
    timer,
  ]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 overflow-hidden bg-[#0d0d0d] font-oswald select-none max-md:overflow-y-auto max-md:overscroll-contain"
    >
      <div className={embedded ? 'hidden' : 'absolute left-[8vw] top-[5vh]'}>
        <h1 className="text-[7vh] font-light uppercase leading-none tracking-tight text-[#c0c0c0]">
          {lang === 'ru' ? 'Интерфейсы' : 'Interfaces'}
        </h1>
      </div>

      <div className="absolute inset-x-0 top-[17vh] flex justify-center max-md:relative max-md:inset-auto max-md:top-auto max-md:mt-[118px] max-md:px-3">
        <div
          id="hud-preview-viewport"
          className="relative overflow-hidden border border-white/10 bg-black shadow-[0_24px_80px_rgba(0,0,0,0.55)] max-md:!w-full"
          style={{ width: viewportWidth, aspectRatio: viewportAspect }}
        >
          <ScaledHudCanvas ratio={viewportRatio}>
          <div className="absolute bottom-[6.2%] left-[5.2%]">
            <MapRadar heading={heading} targetDirection={targetDirection} timer={timer} />
          </div>

          <div className="absolute bottom-[5.7%] right-[4.8%]">
            <div className="grid grid-cols-[82px_auto] grid-rows-[auto_auto] items-end gap-[12px]">
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

              <div className="col-start-1 row-start-2 h-[48px] w-full self-end">
                <div className="grid h-full w-full grid-rows-4 content-between">
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
          </ScaledHudCanvas>
      </div>

      <div className="vehicle-controls-scroll absolute bottom-[17vh] right-[3.5vw] top-[21vh] z-20 w-[8vw] min-w-[132px] overflow-y-auto pr-[18px] max-md:relative max-md:inset-auto max-md:mx-3 max-md:mt-5 max-md:w-auto max-md:min-w-0 max-md:overflow-visible max-md:pr-0 max-md:pb-[96px]">
        <div className="mb-[1vh] font-sans text-[0.82vh] max-md:text-[10px] uppercase tracking-[0.2em] text-white/16">
          {lang === 'ru' ? 'параметры' : 'parameters'}
        </div>

        <div className="flex flex-col gap-[1.05vh]">
          <label className="flex cursor-pointer items-center justify-between gap-[8px] font-sans">
            <span className="text-[0.82vh] max-md:text-[10px] uppercase tracking-[0.14em] text-white/24">
              {lang === 'ru' ? 'Показывать ввод' : 'Show inputs'}
            </span>
            <input
              type="checkbox"
              checked={showInputs}
              onChange={(event) => setShowInputs(event.target.checked)}
              className="h-[11px] w-[11px] cursor-pointer accent-[#9c1414]"
            />
          </label>


          <div className="my-[0.15vh] h-px bg-white/6" />

          <LabSlider label={lang === 'ru' ? 'Скорость' : 'Speed'} value={speed} onChange={setSpeed} max={220} />
          <LabSlider label="RPM" value={rpm} onChange={setRpm} suffix="%" />

          <div>
            <div className="mb-[0.35vh] flex items-center justify-between font-sans">
              <span className="text-[0.82vh] max-md:text-[10px] uppercase tracking-[0.16em] text-white/24">
                {lang === 'ru' ? 'Передача' : 'Gear'}
              </span>
              <span className="font-mono text-[0.86vh] max-md:text-[10px] text-white/36">{gear}</span>
            </div>
            <div className="grid grid-cols-4 gap-[6px]">
              {GEARS.map((item, index) => (
                <button
                  key={item}
                  onClick={() => setGearIndex(index)}
                  className={`border py-[0.28vh] font-mono text-[0.78vh] max-md:text-[10px] transition-colors ${
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
          <LabSlider label={lang === 'ru' ? 'Цель' : 'Target'} value={targetDirection} onChange={setTargetDirection} suffix="°" max={359} />
          <LabSlider label={lang === 'ru' ? 'Таймер' : 'Timer'} value={timer} onChange={setTimer} suffix="%" />
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
