import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Language } from './App';

type InventoryTab = 'items' | 'info';
type InfoKind = 'note' | 'notebook' | 'phone';

interface InventoryInterfacePrototypeProps {
  onBack: () => void;
  lang: Language;
  embedded?: boolean;
  viewportRatio?: '16:9' | '21:9' | '32:9';
}

const ITEMS = [
  { id: 'pistol', ru: 'Пистолет', en: 'Pistol', span: 2, count: '7', typeRu: 'Оружие', typeEn: 'Weapon', descRu: 'Надёжный самозарядный пистолет. Магазин на 8 патронов.', descEn: 'A reliable semi-automatic pistol. 8-round magazine.' },
  { id: 'ammo', ru: 'Патроны 9×19', en: '9×19 Ammo', span: 1, count: '24', typeRu: 'Боеприпасы', typeEn: 'Ammunition', descRu: 'Пистолетные патроны.', descEn: 'Handgun ammunition.' },
  { id: 'knife', ru: 'Нож', en: 'Knife', span: 1, count: '', typeRu: 'Оружие', typeEn: 'Weapon', descRu: 'Складной нож. Подходит для ближнего боя и взаимодействий.', descEn: 'Folding knife. Useful for close combat and interactions.' },
  { id: 'med', ru: 'Аптечка', en: 'Medkit', span: 1, count: '1', typeRu: 'Лечение', typeEn: 'Recovery', descRu: 'Базовый набор первой помощи.', descEn: 'Basic first aid kit.' },
  { id: 'stash', ru: 'Пакет', en: 'Bag', span: 1, count: '3', typeRu: 'Расходник', typeEn: 'Consumable', descRu: 'Расходный предмет.', descEn: 'Consumable item.' },
  { id: 'keys', ru: 'Ключи', en: 'Keys', span: 1, count: '', typeRu: 'Ключевой предмет', typeEn: 'Key item', descRu: 'Связка ключей. Один из них помечен синей изолентой.', descEn: 'A ring of keys. One is marked with blue tape.' },
  { id: 'shells', ru: '12 калибр', en: '12 Gauge', span: 1, count: '5', typeRu: 'Боеприпасы', typeEn: 'Ammunition', descRu: 'Ружейные патроны 12 калибра.', descEn: '12 gauge shotgun shells.' },
];

const INFO = [
  {
    id: 'garage-note',
    kind: 'note' as InfoKind,
    ru: 'Записка из гаража',
    en: 'Garage note',
    date: '14.02.1997',
    bodyRu: 'Ключи от второго бокса снова не оставлять в конторе. Если приедет Серый — пусть сначала позвонит.',
    bodyEn: 'Do not leave the keys to bay two in the office again. If Grey shows up, make him call first.',
  },
  {
    id: 'notebook',
    kind: 'notebook' as InfoKind,
    ru: 'Записная книжка',
    en: 'Pocket notebook',
    date: '—',
    bodyRu: 'Несколько адресов, телефонов и коротких пометок. Часть страниц вырвана. На полях трижды обведён один и тот же номер.',
    bodyEn: 'Several addresses, phone numbers and short notes. Some pages are missing. One number is circled three times.',
  },
  {
    id: 'phone',
    kind: 'phone' as InfoKind,
    ru: 'Телефон',
    en: 'Phone',
    date: '18.02.1997',
    bodyRu: 'В памяти остались два пропущенных звонка и три сообщения.',
    bodyEn: 'Two missed calls and three messages remain in memory.',
  },
];

function ItemGlyph({ id }: { id: string }) {
  if (id === 'pistol') return (
    <div className="relative h-[34px] w-[92px]">
      <div className="absolute left-[6px] top-[5px] h-[12px] w-[62px] border-b-2 border-r-2 border-white/35 skew-x-[-12deg]" />
      <div className="absolute left-[52px] top-[16px] h-[17px] w-[12px] -skew-x-[8deg] border-l-2 border-white/28" />
    </div>
  );
  if (id === 'ammo') return <div className="flex items-end gap-[3px]">{Array.from({ length: 5 }, (_, i) => <span key={i} className="h-[25px] w-[4px] rounded-t-full border border-white/28" />)}</div>;
  if (id === 'knife') return <div className="h-[2px] w-[54px] rotate-[-18deg] bg-white/35 shadow-[12px_5px_0_-1px_rgba(255,255,255,0.16)]" />;
  if (id === 'med') return <div className="flex h-[34px] w-[46px] items-center justify-center border border-white/24"><span className="text-[20px] text-[#9c1414]/75">+</span></div>;
  if (id === 'keys') return <div className="h-[26px] w-[26px] rounded-full border border-white/28 after:absolute after:ml-[21px] after:mt-[10px] after:h-[2px] after:w-[27px] after:bg-white/25" />;
  if (id === 'shells') return <div className="flex gap-[4px]"><span className="h-[30px] w-[8px] rounded-[2px] border border-white/28 border-b-[#9c1414]/60" /><span className="h-[30px] w-[8px] rounded-[2px] border border-white/28 border-b-[#9c1414]/60" /></div>;
  return <div className="h-[25px] w-[34px] rotate-[-5deg] border border-white/22" />;
}

function CategoryMark({ kind }: { kind: InfoKind }) {
  if (kind === 'phone') return <div className="h-[24px] w-[14px] rounded-[2px] border border-white/28"><div className="mx-auto mt-[3px] h-[13px] w-[8px] border border-white/12" /></div>;
  if (kind === 'notebook') return <div className="h-[24px] w-[19px] border border-white/28 border-l-2" />;
  return <div className="h-[23px] w-[18px] rotate-[3deg] border border-white/24" />;
}

export function InventoryInterfacePrototype({
  onBack,
  lang,
  embedded = false,
  viewportRatio = '16:9',
}: InventoryInterfacePrototypeProps) {
  const [tab, setTab] = useState<InventoryTab>('items');
  const [selectedItem, setSelectedItem] = useState(0);
  const [selectedInfo, setSelectedInfo] = useState(0);

  const activeItem = ITEMS[selectedItem] ?? ITEMS[0];
  const activeInfo = useMemo(() => INFO[selectedInfo] ?? INFO[0], [selectedInfo]);

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
      <div className={embedded ? 'hidden' : 'absolute left-[6vw] top-[5vh]'}>
        <h1 className="text-[7vh] font-light uppercase leading-none tracking-tight text-[#c0c0c0]">
          {lang === 'ru' ? 'Интерфейсы' : 'Interfaces'}
        </h1>
      </div>

      <div className="absolute inset-x-0 top-[17vh] flex justify-center">
        <div
          className="relative overflow-hidden border border-white/10 bg-black shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
          style={{ width: viewportWidth, aspectRatio: viewportAspect }}
        >
          <div className="absolute left-1/2 top-[5%] z-20 flex -translate-x-1/2 items-center gap-[28px]">
            {(['items', 'info'] as InventoryTab[]).map((item) => (
              <button
                key={item}
                onClick={() => setTab(item)}
                className={`group relative flex h-[34px] min-w-[74px] items-center justify-center px-[8px] font-sans text-[9px] uppercase tracking-[0.25em] transition-colors ${
                  tab === item ? 'text-white/72' : 'text-white/24 hover:text-white/48'
                }`}
              >
                {item === 'items' ? (lang === 'ru' ? 'Предметы' : 'Items') : (lang === 'ru' ? 'Инфо' : 'Info')}
                {tab === item && <div className="absolute bottom-0 left-1/2 h-[2px] w-[24px] -translate-x-1/2 bg-white/60" />}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait" initial={false}>
            {tab === 'items' ? (
              <motion.div
                key="items"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0"
              >
                <div className="absolute left-[4.5%] top-[28%] w-[18%]">
                  <div className="mb-[10px] font-sans text-[8px] uppercase tracking-[0.26em] text-white/18">
                    {lang === 'ru' ? 'быстрый доступ' : 'shortcuts'}
                  </div>
                  <div className="grid grid-cols-3 grid-rows-3 gap-[5px]">
                    <div className="col-start-2 row-start-1 flex aspect-square items-center justify-center border border-white/16 bg-white/[0.015]"><ItemGlyph id="pistol" /></div>
                    <div className="col-start-1 row-start-2 flex aspect-square items-center justify-center border border-white/10 bg-white/[0.01]"><span className="font-mono text-[9px] text-white/18">1</span></div>
                    <div className="col-start-2 row-start-2 flex aspect-square items-center justify-center border border-white/10 bg-white/[0.01]"><span className="font-mono text-[9px] text-white/18">2</span></div>
                    <div className="col-start-3 row-start-2 flex aspect-square items-center justify-center border border-white/10 bg-white/[0.01]"><ItemGlyph id="knife" /></div>
                    <div className="col-start-2 row-start-3 flex aspect-square items-center justify-center border border-white/10 bg-white/[0.01]"><span className="font-mono text-[9px] text-white/18">3</span></div>
                  </div>
                </div>

                <div className="absolute right-[5%] top-[18%] w-[47%]">
                  <div className="mb-[7px] flex items-baseline justify-between">
                    <span className="font-sans text-[9px] uppercase tracking-[0.24em] text-white/22">
                      {lang === 'ru' ? 'инвентарь' : 'inventory'}
                    </span>
                    <span className="font-mono text-[8px] tracking-[0.16em] text-white/16">08 / 12</span>
                  </div>

                  <div className="grid grid-cols-4 auto-rows-[62px] gap-[5px]">
                    {ITEMS.map((item, index) => {
                      const active = index === selectedItem;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setSelectedItem(index)}
                          className={`relative flex items-center justify-center border bg-white/[0.012] transition-colors ${
                            item.span === 2 ? 'col-span-2' : 'col-span-1'
                          } ${
                            active ? 'border-white/62 bg-white/[0.035]' : 'border-white/13 hover:border-white/30'
                          }`}
                        >
                          <ItemGlyph id={item.id} />
                          {item.count && (
                            <span className="absolute bottom-[5px] right-[6px] font-mono text-[9px] text-white/55">{item.count}</span>
                          )}
                          {active && <span className="absolute left-0 top-0 h-[2px] w-full bg-white/40" />}
                        </button>
                      );
                    })}

                    {Array.from({ length: 4 }, (_, index) => (
                      <div key={`empty-${index}`} className="border border-white/8 bg-white/[0.006]" />
                    ))}
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeItem.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="mt-[16px]"
                    >
                      <div className="border-t border-white/13 pt-[11px]">
                        <div className="text-[16px] font-light text-white/72">{lang === 'ru' ? activeItem.ru : activeItem.en}</div>
                        <div className="mt-[2px] font-sans text-[8px] uppercase tracking-[0.22em] text-white/22">
                          {lang === 'ru' ? activeItem.typeRu : activeItem.typeEn}
                        </div>
                        <div className="mt-[8px] max-w-[92%] font-sans text-[10px] leading-[1.5] text-white/32">
                          {lang === 'ru' ? activeItem.descRu : activeItem.descEn}
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="absolute right-[31%] top-[41%] z-30 min-w-[118px] border border-white/16 bg-[#111]/95 py-[4px] shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
                  {(lang === 'ru' ? ['Использовать', 'Осмотреть', 'Объединить', 'Выбросить'] : ['Use', 'Examine', 'Combine', 'Discard']).map((action, index) => (
                    <div
                      key={action}
                      className={`px-[12px] py-[5px] font-sans text-[9px] ${index === 1 ? 'bg-white/12 text-white/74' : 'text-white/34'}`}
                    >
                      {action}
                    </div>
                  ))}
                </div>

                <div className="absolute bottom-[4.5%] right-[5%] flex gap-[18px] font-sans text-[8px] uppercase tracking-[0.18em] text-white/22">
                  <span><b className="mr-[5px] font-mono text-white/45">E</b>{lang === 'ru' ? 'выбрать' : 'confirm'}</span>
                  <span><b className="mr-[5px] font-mono text-white/45">F</b>{lang === 'ru' ? 'осмотреть' : 'examine'}</span>
                  <span><b className="mr-[5px] font-mono text-white/45">ESC</b>{lang === 'ru' ? 'закрыть' : 'close'}</span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="info"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0"
              >
                <div className="absolute left-[7%] top-[20%] w-[27%]">
                  <div className="mb-[9px] font-sans text-[8px] uppercase tracking-[0.25em] text-white/18">
                    {lang === 'ru' ? 'найденная информация' : 'collected information'}
                  </div>
                  <div className="flex flex-col">
                    {INFO.map((entry, index) => {
                      const active = index === selectedInfo;
                      return (
                        <button
                          key={entry.id}
                          onClick={() => setSelectedInfo(index)}
                          className={`flex items-center gap-[12px] border-b border-white/8 px-[8px] py-[10px] text-left transition-colors ${
                            active ? 'bg-white/[0.035] text-white/72' : 'text-white/34 hover:bg-white/[0.018] hover:text-white/52'
                          }`}
                        >
                          <div className="flex w-[28px] justify-center"><CategoryMark kind={entry.kind} /></div>
                          <div>
                            <div className="font-sans text-[8px] uppercase tracking-[0.2em] text-white/18">{entry.kind}</div>
                            <div className="mt-[2px] text-[12px]">{lang === 'ru' ? entry.ru : entry.en}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="absolute right-[6%] top-[19%] bottom-[8%] w-[51%] border-l border-white/10 pl-[5%]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeInfo.id}
                      initial={{ opacity: 0, y: 7 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -7 }}
                      transition={{ duration: 0.18 }}
                    >
                      <div className="font-mono text-[8px] tracking-[0.2em] text-white/18">{activeInfo.date}</div>
                      <div className="mt-[7px] text-[24px] font-light uppercase leading-none text-white/72">
                        {lang === 'ru' ? activeInfo.ru : activeInfo.en}
                      </div>
                      <div className="my-[18px] h-px w-[44px] bg-white/22" />

                      <div className="max-w-[86%] font-sans text-[10px] leading-[1.7] text-white/36">
                        {lang === 'ru' ? activeInfo.bodyRu : activeInfo.bodyEn}
                      </div>

                      {activeInfo.kind === 'phone' && (
                        <div className="mt-[20px] max-w-[90%] border-t border-white/10 pt-[12px] font-sans">
                          <div className="mb-[8px] text-[8px] uppercase tracking-[0.23em] text-white/18">
                            {lang === 'ru' ? 'журнал телефона' : 'phone log'}
                          </div>
                          {[
                            [lang === 'ru' ? 'Пропущенный · Витя' : 'Missed · Vitya', '23:41'],
                            [lang === 'ru' ? 'SMS · «ты где?»' : 'SMS · “where are you?”', '23:48'],
                            [lang === 'ru' ? 'SMS · «не едь сюда»' : 'SMS · “don’t come here”', '23:52'],
                          ].map(([label, time]) => (
                            <div key={label} className="flex justify-between border-b border-white/7 py-[6px] text-[9px] text-white/38">
                              <span>{label}</span>
                              <span className="font-mono text-white/18">{time}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
