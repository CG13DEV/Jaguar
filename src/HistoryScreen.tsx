import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Images, Volume2, VolumeX, X } from 'lucide-react';
import { Language } from './App';

interface HistoryScreenProps {
  onBack: () => void;
  lang: Language;
}

interface MediaItem {
  type: 'image' | 'video';
  src: string;
}

const eventsDict = {
  ru: [
    {
      id: 's1',
      year: '1995',
      date: '20 января',
      title: 'Зиндан',
      description: 'Скрытое событие из прошлого: Дрон оказывается в подземном заточении.',
      levelDescription: 'Побег Дрона объединяет рукопашный бой в тесных коридорах, перестрелку и автомобильный финал. Эта глава показывает события до основной линии и меняет взгляд на дальнейшие поиски.',
      unlockCondition: 'Скрытая глава открывается после прохождения «Притона».',
      offsetDays: -3,
    },
    {
      id: 's2',
      year: '1995',
      date: '23 января',
      title: 'Ягуар',
      description: 'Белый «Ягуар», товар в багажнике и звонок Ромчика запускают цепочку событий.',
      levelDescription: 'Отправная точка основной линии: игрок ведёт машину, перевозит груз и избегает лишнего внимания. Остановки, звонки и встречи знакомят с героями и правилами причинно-следственного мира.',
      offsetDays: 0,
    },
    {
      id: 's3',
      year: '1995',
      date: '24 января',
      title: 'Стоянка',
      description: 'Встреча с Ромчиком превращает обычную сделку в личный счёт.',
      levelDescription: 'Первая развилка истории. Можно уйти от давления на машине и запустить погоню, зачистить стоянку и выйти на кегельбан либо привлечь полицию шумной перестрелкой. Выбор определяет следующий маршрут.',
      unlockCondition: 'Открывается после события «Ягуар».',
      offsetDays: 1,
    },
    {
      id: 's4',
      year: '1995',
      date: '25 января',
      title: 'Кегельбан',
      description: 'Старый кегельбан хранит людей Ромчика и следующую зацепку.',
      levelDescription: 'Закрытая боевая локация с несколькими волнами противников и информатором. Аккуратный допрос даёт верный адрес, а гибель или ложь информатора отправляет игрока по более опасной ветке.',
      unlockCondition: 'Открывается после зачистки «Стоянки» и выбора пути за информацией.',
      offsetDays: 2,
    },
    {
      id: 's5',
      year: '1995',
      date: '26 января',
      title: 'Притон',
      description: 'Последнее известное место Дрона и вход в скрытую линию прошлого.',
      levelDescription: 'Игрок исследует комнаты, работает с уликами и разговаривает с людьми, которые видели слишком много. Найденные детали связывают основную линию с побегом Дрона из зиндана.',
      unlockCondition: 'Открывается через альтернативную ветку после «Стоянки».',
      offsetDays: 3,
    },
    {
      id: 's6',
      year: '1995',
      date: '27 января',
      title: 'Красный кирпичный дом',
      description: 'Краснокирпичный коттедж становится точкой мести и расплаты.',
      levelDescription: 'Многоэтажный тактический штурм с меняющимися позициями врагов, уликами и разными исходами финального допроса. Быстрое прохождение позволяет перехватить беглеца и открыть дополнительное событие прошлого.',
      unlockCondition: 'Открывается по верной наводке из «Кегельбана» либо через более сложный ложный след.',
      offsetDays: 4,
    },
    {
      id: 's7',
      year: '1995',
      date: '28 января',
      title: 'Декаданс',
      description: 'Знакомое лицо в доме открывает ещё одну сторону конфликта.',
      levelDescription: 'Дополнительная глава о связях и мотивах персонажей. Она дополняет основную линию, показывает последствия прежних решений и помогает собрать цельную картину событий.',
      unlockCondition: 'Открывается через дополнительную ветку «Кегельбана».',
      offsetDays: 5,
    }
  ],
  en: [
    {
      id: 's1',
      year: '1995',
      date: 'January 20',
      title: 'Zindan',
      description: 'A hidden event from the past: Dron is trapped in an underground prison.',
      levelDescription: 'Dron\'s escape combines hand-to-hand combat in tight corridors, a shootout, and a driving finale. The chapter reveals what happened before the main timeline and reframes the search that follows.',
      unlockCondition: 'This hidden chapter unlocks after completing “The Den.”',
      offsetDays: -3,
    },
    {
      id: 's2',
      year: '1995',
      date: 'January 23',
      title: 'Jaguar',
      description: 'A white Jaguar, cargo in the trunk, and Romchik\'s call set the story in motion.',
      levelDescription: 'The starting point of the main timeline: drive the car, transport the cargo, and avoid unwanted attention. Stops, calls, and meetings introduce the cast and the rules of a persistent, cause-and-effect world.',
      offsetDays: 0,
    },
    {
      id: 's3',
      year: '1995',
      date: 'January 24',
      title: 'Parking Lot',
      description: 'The meeting with Romchik turns a routine deal into a personal score.',
      levelDescription: 'The story\'s first major branch. Escape by car and trigger a chase, clear the lot to reach the bowling alley, or draw police attention with a loud firefight. The choice determines the next route.',
      unlockCondition: 'Unlocked after the “Jaguar” event.',
      offsetDays: 1,
    },
    {
      id: 's4',
      year: '1995',
      date: 'January 25',
      title: 'Bowling Alley',
      description: 'The old bowling alley holds Romchik\'s people and the next lead.',
      levelDescription: 'An enclosed combat location with several enemy waves and an informant. A controlled interrogation reveals the real address; killing the informant or accepting a lie sends the player down a more dangerous branch.',
      unlockCondition: 'Unlocked after clearing “Parking Lot” and choosing to pursue the lead.',
      offsetDays: 2,
    },
    {
      id: 's5',
      year: '1995',
      date: 'January 26',
      title: 'Den',
      description: 'Dron\'s last known location and the entrance to a hidden past timeline.',
      levelDescription: 'Search the rooms, work with evidence, and question people who saw too much. The recovered details connect the main story to Dron\'s escape from the zindan.',
      unlockCondition: 'Unlocked through an alternate branch after “Parking Lot.”',
      offsetDays: 3,
    },
    {
      id: 's6',
      year: '1995',
      date: 'January 27',
      title: 'Red Brick House',
      description: 'The red-brick cottage becomes the point of revenge and reckoning.',
      levelDescription: 'A multi-floor tactical assault with shifting enemy positions, evidence, and several outcomes to the final interrogation. A fast completion lets the player intercept a fleeing gang member and reveal another event in the past.',
      unlockCondition: 'Unlocked by the true lead from “Bowling Alley,” or reached through a harder false trail.',
      offsetDays: 4,
    },
    {
      id: 's7',
      year: '1995',
      date: 'January 28',
      title: 'Decadence',
      description: 'A familiar face in the house reveals another side of the conflict.',
      levelDescription: 'An additional chapter about the characters\' connections and motives. It expands the main timeline, follows the consequences of earlier choices, and helps complete the larger picture.',
      unlockCondition: 'Unlocked through the optional “Bowling Alley” branch.',
      offsetDays: 5,
    }
  ]
};

const TIMELINE_START_POSITION = 50;
const TIMELINE_DAY_STEP = 10;

const getEventPosition = (offsetDays: number) => TIMELINE_START_POSITION + offsetDays * TIMELINE_DAY_STEP;

const checkMediaFile = (url: string, isVideo: boolean) => new Promise<boolean>((resolve) => {
  if (isVideo) {
    const vid = document.createElement('video');
    vid.onloadedmetadata = () => resolve(true);
    vid.onerror = () => resolve(false);
    vid.src = url;
    return;
  }

  const img = new Image();
  img.onload = () => resolve(true);
  img.onerror = () => resolve(false);
  img.src = url;
});

function useDiscoveredStoryMedia(id: string): MediaItem[] {
  const [items, setItems] = useState<MediaItem[]>([]);

  useEffect(() => {
    let isMounted = true;
    const discover = async () => {
      const cdnBase = import.meta.env.VITE_CDN_URL || '';

      const checks = Array.from({ length: 6 }, (_, i) => i + 1).map(async (index) => {
        const tryExt = async (ext: string, isVideo: boolean) => {
          const path = `/history/${id}_${index}.${ext}`;
          const url = cdnBase ? `${cdnBase}${path}` : path;

          try {
            const res = await fetch(url, { method: 'HEAD' });
            if (res.ok) return path;
          } catch (e) {
            const works = await checkMediaFile(url, isVideo);
            if (works) return path;
          }

          return null;
        };

        const png = await tryExt('png', false);
        if (png) return { index, type: 'image', src: png } as const;

        const mp4 = await tryExt('mp4', true);
        if (mp4) return { index, type: 'video', src: mp4 } as const;

        const webm = await tryExt('webm', true);
        if (webm) return { index, type: 'video', src: webm } as const;

        const jpg = await tryExt('jpg', false);
        if (jpg) return { index, type: 'image', src: jpg } as const;

        return null;
      });

      const results = await Promise.all(checks);
      if (!isMounted) return;

      const valid = results.filter(Boolean).sort((a, b) => a!.index - b!.index);
      setItems(valid.map(v => ({ type: v!.type as 'video' | 'image', src: v!.src })));
    };

    discover();
    return () => { isMounted = false; };
  }, [id]);

  return items;
}

const EventMedia = ({ media, isMuted }: { media: MediaItem; isMuted: boolean }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cdnBase = import.meta.env.VITE_CDN_URL || '';
  const src = cdnBase ? `${cdnBase}${media.src}` : media.src;

  useEffect(() => {
    if (media.type !== 'video') return;
    videoRef.current?.play().catch(() => {});
  }, [isMuted, media.src, media.type]);

  if (media.type === 'video') {
    return (
      <motion.video
        ref={videoRef}
        key={media.src}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
        autoPlay
        loop
        muted={isMuted}
        playsInline
        onCanPlay={(event) => { event.currentTarget.play().catch(() => {}); }}
        className="absolute inset-0 h-full w-full object-cover"
        src={src}
      />
    );
  }

  return (
    <motion.img
      key={media.src}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="absolute inset-0 h-full w-full object-cover"
      src={src}
      alt=""
    />
  );
};

export function HistoryScreen({ onBack, lang }: HistoryScreenProps) {
  const [selectedEventIndex, setSelectedEventIndex] = useState(1);
  const [mediaIndex, setMediaIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isDemoMuted, setIsDemoMuted] = useState(true);
  const events = eventsDict[lang];
  const activeEvent = events[selectedEventIndex];
  const mediaItems = useDiscoveredStoryMedia(activeEvent.id);
  const activeMedia = mediaItems[mediaIndex] || mediaItems[0];
  const hasDemo = mediaItems.length > 0;
  const hasMultipleMedia = mediaItems.length > 1;

  const openDemo = useCallback(() => {
    if (!hasDemo) return;
    setIsDemoMuted(true);
    setIsGalleryOpen(true);
  }, [hasDemo]);

  const toggleDemo = useCallback(() => {
    if (isGalleryOpen) {
      setIsGalleryOpen(false);
    } else {
      openDemo();
    }
  }, [isGalleryOpen, openDemo]);

  const moveMedia = useCallback((direction: number) => {
    setMediaIndex(prev => {
      if (mediaItems.length < 2) return 0;
      return (prev + direction + mediaItems.length) % mediaItems.length;
    });
  }, [mediaItems.length]);

  useEffect(() => {
    setMediaIndex(0);
    setIsGalleryOpen(false);
    setIsDemoMuted(true);
  }, [selectedEventIndex]);

  useEffect(() => {
    if (!hasDemo && isGalleryOpen) {
      setIsGalleryOpen(false);
    }
  }, [hasDemo, isGalleryOpen]);

  useEffect(() => {
    if (mediaIndex >= mediaItems.length) {
      setMediaIndex(0);
    }
  }, [mediaIndex, mediaItems.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isGalleryOpen) {
          setIsGalleryOpen(false);
        } else {
          onBack();
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'a') {
        if (isGalleryOpen) {
          moveMedia(-1);
        } else {
          setSelectedEventIndex((prev) => (prev > 0 ? prev - 1 : prev));
        }
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        if (isGalleryOpen) {
          moveMedia(1);
        } else {
          setSelectedEventIndex((prev) => (prev < events.length - 1 ? prev + 1 : prev));
        }
      } else if (e.key === 'Enter') {
        if (hasDemo) {
          openDemo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGalleryOpen, moveMedia, onBack, events.length, hasDemo, openDemo]);

  const cdnBase = import.meta.env.VITE_CDN_URL || '';
  const mapUrl = cdnBase ? `${cdnBase}/map.png` : '/map.png';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 bg-[#0a0f0d] flex flex-col items-center select-none overflow-hidden"
      style={{
        backgroundImage: `url(${mapUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <AnimatePresence>
        {isGalleryOpen && activeMedia && (
          <motion.div
            key={activeMedia.src}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 z-0"
          >
            <EventMedia media={activeMedia} isMuted={isDemoMuted} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dark gradient overlay at the bottom for menu buttons */}
      <div className="absolute bottom-0 left-0 right-0 h-[35%] bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d]/80 to-transparent pointer-events-none"></div>
      <div className="absolute top-0 left-0 right-0 h-[35%] bg-gradient-to-b from-[#0d0d0d] via-[#0d0d0d]/80 to-transparent pointer-events-none"></div>

      {hasDemo && (
        <button
          onClick={toggleDemo}
          className="group absolute left-[8vw] top-[6vh] z-30 flex items-center gap-[1vw] text-[#666] transition-colors duration-300 hover:text-[#c0c0c0] focus:outline-none"
          aria-label={isGalleryOpen ? (lang === 'ru' ? 'Закрыть демо' : 'Close demo') : (lang === 'ru' ? 'Открыть демо' : 'Open demo')}
        >
          {isGalleryOpen ? (
            <X className="h-[2.5vh] w-[2.5vh]" strokeWidth={1.8} />
          ) : (
            <Images className="h-[2.5vh] w-[2.5vh]" strokeWidth={1.8} />
          )}
          <span className="font-oswald text-[2.5vh] uppercase tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {isGalleryOpen ? (lang === 'ru' ? 'Закрыть' : 'Close') : (lang === 'ru' ? 'Демо' : 'Demo')}
          </span>
        </button>
      )}

      {isGalleryOpen && activeMedia?.type === 'video' && (
        <button
          onClick={() => setIsDemoMuted(prev => !prev)}
          className="group absolute bottom-[5vh] left-1/2 z-30 flex -translate-x-1/2 items-center gap-[1vw] text-[#666] transition-colors duration-300 hover:text-[#c0c0c0] focus:outline-none"
          aria-label={isDemoMuted ? (lang === 'ru' ? 'Включить звук' : 'Turn sound on') : (lang === 'ru' ? 'Выключить звук' : 'Turn sound off')}
        >
          {isDemoMuted ? (
            <VolumeX className="h-[2.5vh] w-[2.5vh]" strokeWidth={1.8} />
          ) : (
            <Volume2 className="h-[2.5vh] w-[2.5vh]" strokeWidth={1.8} />
          )}
          <span className="font-oswald text-[2.5vh] uppercase tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {isDemoMuted ? (lang === 'ru' ? 'Звук' : 'Sound') : (lang === 'ru' ? 'Без звука' : 'Mute')}
          </span>
        </button>
      )}

      <AnimatePresence>
        {!isGalleryOpen && (
          <motion.div
            key="event-copy"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="relative z-10 flex h-full w-full flex-col items-center overflow-hidden px-[6vw] pb-[14vh] pt-[8vh]"
          >
            {/* Date */}
            <div className="text-[#a0a0a0] font-oswald text-[3.5vh] leading-none font-light" style={{ transform: 'scaleY(1.2)' }}>
              {activeEvent.year}
            </div>
            <div className="text-[#808080] font-oswald text-[1.8vh] uppercase mt-[1.5vh] tracking-wide font-light" style={{ transform: 'scaleY(1.2)' }}>
              {activeEvent.date}
            </div>

            {/* Timeline */}
            <div className="relative mt-[5vh] mb-[5vh] flex h-[1px] w-full max-w-[760px] min-w-[260px] items-center bg-[#555]">
              {events.map((ev, idx) => {
                const isActive = idx === selectedEventIndex;
                return (
                  <div
                    key={idx}
                    className="absolute flex items-center justify-center cursor-pointer p-2"
                    style={{ left: `${getEventPosition(ev.offsetDays)}%`, transform: 'translateX(-50%)' }}
                    onClick={() => setSelectedEventIndex(idx)}
                  >
                    {isActive ? (
                      <div className="w-[12px] h-[12px] bg-[#d0d0d0] rounded-full border-[3px] border-[#222] ring-1 ring-[#d0d0d0]"></div>
                    ) : (
                      <div className="w-[6px] h-[6px] bg-[#888] rounded-full hover:bg-[#ccc] transition-colors"></div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex min-h-0 w-full max-w-[760px] flex-1 flex-col items-center text-center">
              <div className="font-oswald text-[4.8vh] leading-[1.05] text-[#d0d0d0] font-light tracking-wide sm:text-[6vh]" style={{ transform: 'scaleY(1.2)' }}>
                {activeEvent.title}
              </div>

              <div className="mt-[3vh] h-[1px] w-full max-w-[420px] bg-gradient-to-r from-transparent via-[#9c1414] to-transparent"></div>

              <div className="mt-[3vh] whitespace-pre-line text-center font-sans text-[2.05vh] font-medium leading-[1.45] text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] sm:text-[2.15vh]">
                {activeEvent.description}
              </div>

              <div className="mt-[4vh] flex min-h-0 w-full flex-1 flex-col gap-[2.8vh] overflow-y-auto pr-[1.5vw] text-left">
                <div className="border-t border-[#555] pt-[2vh]">
                  <div className="mb-[1vh] font-oswald text-[1.55vh] uppercase tracking-widest text-[#9c1414]">
                    {lang === 'ru' ? 'Описание уровня' : 'Level Description'}
                  </div>
                  <div className="font-sans text-[1.8vh] leading-[1.5] text-[#e0e0e0] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] sm:text-[1.85vh]">
                    {activeEvent.levelDescription}
                  </div>
                </div>

                {activeEvent.unlockCondition && (
                  <div className="border-t border-[#555] pt-[2vh]">
                    <div className="mb-[1vh] font-oswald text-[1.55vh] uppercase tracking-widest text-[#9c1414]">
                      {lang === 'ru' ? 'Разблокировка' : 'Unlock Condition'}
                    </div>
                    <div className="font-sans text-[1.8vh] leading-[1.5] text-[#e0e0e0] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] sm:text-[1.85vh]">
                      {activeEvent.unlockCondition}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isGalleryOpen && activeMedia && (
          <motion.div
            key="event-gallery-controls"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="pointer-events-none absolute inset-0 z-20 flex items-center justify-between px-[8vw]"
          >
            {hasMultipleMedia && (
              <>
                <button
                  onClick={() => moveMedia(-1)}
                  className="pointer-events-auto flex h-[12vh] w-[5vw] min-w-[44px] items-center justify-center text-[#666] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] transition-colors duration-300 hover:text-[#c0c0c0] focus:outline-none"
                  aria-label={lang === 'ru' ? 'Предыдущий кадр' : 'Previous frame'}
                >
                  <ChevronLeft className="h-[6vh] w-[6vh]" strokeWidth={1.15} />
                </button>

                <div className={`pointer-events-auto absolute left-1/2 flex -translate-x-1/2 items-center gap-3 ${activeMedia.type === 'video' ? 'bottom-[11vh]' : 'bottom-[5vh]'}`}>
                  {mediaItems.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setMediaIndex(idx)}
                      className={`h-[10px] rounded-full transition-all duration-300 focus:outline-none ${idx === mediaIndex ? 'w-[34px] bg-[#9c1414] shadow-[0_0_10px_rgba(156,20,20,0.8)]' : 'w-[10px] bg-[#555] hover:bg-[#777]'}`}
                      aria-label={`${lang === 'ru' ? 'Кадр' : 'Frame'} ${idx + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => moveMedia(1)}
                  className="pointer-events-auto flex h-[12vh] w-[5vw] min-w-[44px] items-center justify-center text-[#666] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] transition-colors duration-300 hover:text-[#c0c0c0] focus:outline-none"
                  aria-label={lang === 'ru' ? 'Следующий кадр' : 'Next frame'}
                >
                  <ChevronRight className="h-[6vh] w-[6vh]" strokeWidth={1.15} />
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back Button */}
      <div className={`absolute bottom-[6vh] right-[8vw] z-30 transition-opacity duration-300 ${isGalleryOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <button
          onClick={onBack}
          className="group flex items-center gap-[1vw] text-[#666] hover:text-[#c0c0c0] transition-colors duration-300 focus:outline-none"
        >
          <div className="border border-[#333] group-hover:border-[#666] px-[0.6vw] py-[0.2vh] text-[1.4vh] font-mono tracking-wider transition-colors duration-300">
            ESC
          </div>
          <span className="font-oswald text-[2.5vh] uppercase tracking-wider">
            {lang === 'ru' ? 'Назад' : 'Back'}
          </span>
        </button>
      </div>
    </motion.div>
  );
}
