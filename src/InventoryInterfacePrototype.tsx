import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Language } from './App';

type InventoryTab = 'items' | 'info';
type InfoKind = 'note' | 'notebook' | 'phone';

interface InventoryInterfacePrototypeProps {
  onBack: () => void;
  lang: Language;
  embedded?: boolean;
}

const ITEMS = [
  { id: 'pistol', ru: 'Пистолет', en: 'Pistol', size: '2x1', metaRu: '7 патронов', metaEn: '7 rounds' },
  { id: 'mag', ru: 'Магазин', en: 'Magazine', size: '1x1', metaRu: '8 патронов', metaEn: '8 rounds' },
  { id: 'knife', ru: 'Нож', en: 'Knife', size: '1x1', metaRu: 'Холодное оружие', metaEn: 'Melee weapon' },
  { id: 'med', ru: 'Аптечка', en: 'Medkit', size: '1x1', metaRu: 'Восстанавливает здоровье', metaEn: 'Restores health' },
  { id: 'stash', ru: 'Пакет', en: 'Bag', size: '1x1', metaRu: 'Расходник', metaEn: 'Consumable' },
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
    bodyRu: 'В памяти остались два пропущенных звонка и три сообщения. Последнее SMS отправлено за несколько минут до того, как телефон был брошен.',
    bodyEn: 'Two missed calls and three messages remain in memory. The final SMS was sent minutes before the phone was abandoned.',
  },
];

function ItemGlyph({ id }: { id: string }) {
  if (id === 'pistol') return <div className="h-[14px] w-[54px] border-b-2 border-r-2 border-white/35 skew-x-[-12deg]" />;
  if (id === 'mag') return <div className="h-[30px] w-[10px] border border-white/30 bg-white/5" />;
  if (id === 'knife') return <div className="h-[2px] w-[48px] rotate-[-18deg] bg-white/35" />;
  if (id === 'med') return <div className="flex h-[32px] w-[42px] items-center justify-center border border-white/25"><span className="text-[18px] text-[#9c1414]/75">+</span></div>;
  return <div className="h-[24px] w-[32px] rotate-[-5deg] border border-white/22" />;
}

export function InventoryInterfacePrototype({ onBack, lang, embedded = false }: InventoryInterfacePrototypeProps) {
  const [tab, setTab] = useState<InventoryTab>('items');
  const [selectedItem, setSelectedItem] = useState(0);
  const [selectedInfo, setSelectedInfo] = useState(0);
  const activeItem = ITEMS[selectedItem];
  const activeInfo = useMemo(() => INFO[selectedInfo] ?? INFO[0], [selectedInfo]);

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
            {lang === 'ru' ? 'инвентарь / информация / прототип' : 'inventory / information / prototype'}
          </span>
        </div>
      </div>

      <div className="absolute left-1/2 top-[16vh] flex -translate-x-1/2 items-center gap-[2vw]">
        {(['items', 'info'] as InventoryTab[]).map((item) => (
          <button
            key={item}
            onClick={() => setTab(item)}
            className={`relative px-[0.3vw] pb-[0.8vh] text-[2.1vh] uppercase tracking-[0.16em] transition-colors ${
              tab === item ? 'text-[#c8c8c8]' : 'text-[#555] hover:text-[#999]'
            }`}
          >
            {item === 'items'
              ? (lang === 'ru' ? 'Инвентарь' : 'Inventory')
              : (lang === 'ru' ? 'Информация' : 'Information')}
            {tab === item && <motion.div layoutId="inventory-tab" className="absolute inset-x-0 bottom-0 h-[2px] bg-[#9c1414]" />}
          </button>
        ))}
      </div>

      <div className="absolute inset-x-[6vw] bottom-[13vh] top-[22vh] overflow-hidden border border-white/10 bg-black">
        <AnimatePresence mode="wait">
          {tab === 'items' ? (
            <motion.div
              key="items"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              className="grid h-full grid-cols-[1.35fr_0.65fr]"
            >
              <div className="border-r border-white/10 p-[4vh]">
                <div className="mb-[2.5vh] flex items-baseline justify-between">
                  <div className="text-[1.5vh] uppercase tracking-[0.24em] text-white/35">
                    {lang === 'ru' ? 'рюкзак' : 'backpack'}
                  </div>
                  <div className="font-mono text-[1.15vh] tracking-[0.14em] text-white/18">05 / 08</div>
                </div>

                <div className="grid h-[calc(100%-4vh)] grid-cols-4 grid-rows-2 gap-[7px]">
                  {Array.from({ length: 8 }, (_, index) => {
                    const item = ITEMS[index];
                    const selected = index === selectedItem;
                    return (
                      <button
                        key={index}
                        onClick={() => item && setSelectedItem(index)}
                        className={`relative flex min-h-[110px] items-center justify-center border transition-colors ${
                          selected && item
                            ? 'border-[#9c1414]/70 bg-[#9c1414]/5'
                            : 'border-white/10 bg-white/[0.015] hover:border-white/20'
                        }`}
                      >
                        {item ? (
                          <>
                            <ItemGlyph id={item.id} />
                            <span className="absolute bottom-[7px] left-[8px] font-mono text-[9px] uppercase tracking-[0.12em] text-white/24">
                              {item.size}
                            </span>
                            {selected && <span className="absolute right-[6px] top-[6px] h-[4px] w-[4px] bg-[#9c1414]" />}
                          </>
                        ) : (
                          <span className="text-[18px] text-white/[0.05]">·</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col justify-between p-[4vh]">
                <div>
                  <div className="mb-[1vh] font-sans text-[1.1vh] uppercase tracking-[0.26em] text-[#9c1414]">
                    {lang === 'ru' ? 'выбрано' : 'selected'}
                  </div>
                  <div className="text-[4.4vh] font-light uppercase leading-none text-white/76">
                    {lang === 'ru' ? activeItem.ru : activeItem.en}
                  </div>
                  <div className="mt-[1.4vh] font-sans text-[1.35vh] tracking-[0.06em] text-white/32">
                    {lang === 'ru' ? activeItem.metaRu : activeItem.metaEn}
                  </div>
                </div>

                <div className="space-y-[1vh] font-sans text-[1.15vh] uppercase tracking-[0.16em] text-white/26">
                  <div className="flex justify-between border-b border-white/8 pb-[0.8vh]"><span>{lang === 'ru' ? 'осмотреть' : 'examine'}</span><span className="font-mono">F</span></div>
                  <div className="flex justify-between border-b border-white/8 pb-[0.8vh]"><span>{lang === 'ru' ? 'использовать' : 'use'}</span><span className="font-mono">E</span></div>
                  <div className="flex justify-between"><span>{lang === 'ru' ? 'выбросить' : 'discard'}</span><span className="font-mono">DEL</span></div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="info"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              className="grid h-full grid-cols-[0.48fr_1.05fr_0.47fr]"
            >
              <div className="border-r border-white/10 p-[3.2vh]">
                <div className="mb-[2.2vh] text-[1.25vh] uppercase tracking-[0.24em] text-white/28">
                  {lang === 'ru' ? 'архив' : 'archive'}
                </div>

                <div className="flex flex-col gap-[4px]">
                  {INFO.map((entry, index) => (
                    <button
                      key={entry.id}
                      onClick={() => setSelectedInfo(index)}
                      className={`border-l-2 px-[1vw] py-[1.1vh] text-left transition-colors ${
                        selectedInfo === index
                          ? 'border-[#9c1414] bg-white/[0.025] text-white/74'
                          : 'border-transparent text-white/34 hover:bg-white/[0.015] hover:text-white/58'
                      }`}
                    >
                      <div className="font-sans text-[0.95vh] uppercase tracking-[0.22em] text-white/20">{entry.kind}</div>
                      <div className="mt-[0.3vh] text-[1.65vh] uppercase tracking-[0.06em]">{lang === 'ru' ? entry.ru : entry.en}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative overflow-hidden border-r border-white/10 p-[4.3vh]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeInfo.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                  >
                    <div className="mb-[1vh] font-mono text-[1.05vh] tracking-[0.18em] text-white/20">{activeInfo.date}</div>
                    <div className="text-[4.8vh] font-light uppercase leading-[1.05] text-white/78">
                      {lang === 'ru' ? activeInfo.ru : activeInfo.en}
                    </div>
                    <div className="my-[3vh] h-px w-[18%] bg-[#9c1414]/70" />

                    {activeInfo.kind !== 'phone' ? (
                      <div className="max-w-[88%] font-sans text-[1.65vh] font-light leading-[1.8] text-white/48">
                        {lang === 'ru' ? activeInfo.bodyRu : activeInfo.bodyEn}
                      </div>
                    ) : (
                      <div className="max-w-[88%]">
                        <div className="mb-[2.4vh] font-sans text-[1.45vh] leading-[1.7] text-white/42">
                          {lang === 'ru' ? activeInfo.bodyRu : activeInfo.bodyEn}
                        </div>
                        <div className="space-y-[0.6vh] border-l border-white/10 pl-[1.2vw] font-sans">
                          <div className="flex justify-between text-[1.2vh] text-white/46"><span>{lang === 'ru' ? 'Пропущенный: Витя' : 'Missed: Vitya'}</span><span className="font-mono text-white/20">23:41</span></div>
                          <div className="flex justify-between text-[1.2vh] text-white/46"><span>{lang === 'ru' ? 'SMS: «ты где?»' : 'SMS: “where are you?”'}</span><span className="font-mono text-white/20">23:48</span></div>
                          <div className="flex justify-between text-[1.2vh] text-white/46"><span>{lang === 'ru' ? 'SMS: «не едь сюда»' : 'SMS: “don’t come here”'}</span><span className="font-mono text-white/20">23:52</span></div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="flex flex-col justify-between p-[3.2vh]">
                <div>
                  <div className="text-[1.1vh] uppercase tracking-[0.24em] text-white/20">{lang === 'ru' ? 'тип' : 'type'}</div>
                  <div className="mt-[0.8vh] text-[2.1vh] uppercase text-white/55">
                    {activeInfo.kind === 'note'
                      ? (lang === 'ru' ? 'Записка' : 'Note')
                      : activeInfo.kind === 'notebook'
                        ? (lang === 'ru' ? 'Блокнот' : 'Notebook')
                        : (lang === 'ru' ? 'Телефон' : 'Phone')}
                  </div>
                </div>

                <div className="font-sans text-[1.1vh] leading-[1.65] text-white/24">
                  {lang === 'ru'
                    ? 'Информация хранится отдельно от предметов: записки, блокноты, телефоны, звонки и сообщения не занимают место в рюкзаке.'
                    : 'Information is stored separately from items: notes, notebooks, phones, calls and messages do not consume backpack space.'}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className={embedded ? "hidden" : "absolute bottom-[6vh] right-[6vw]"}>
        <button onClick={onBack} className="group flex items-center gap-[0.8vw] text-[#666] hover:text-[#c0c0c0]">
          <span className="border border-[#333] px-[0.6vw] py-[0.2vh] font-mono text-[1.2vh] tracking-wider group-hover:border-[#666]">ESC</span>
          <span className="text-[2vh] uppercase tracking-wider">{lang === 'ru' ? 'Назад' : 'Back'}</span>
        </button>
      </div>
    </motion.div>
  );
}
