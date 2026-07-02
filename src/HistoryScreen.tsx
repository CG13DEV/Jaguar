import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Images, X } from 'lucide-react';
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
      date: '20 Января',
      title: 'Зиндан',
      description: 'Тремя днями раньше Дрон сидит внизу,\nгде время течет по капле. Он находит щель,\nвыбирается наружу и почти верит дороге.\nНо между зинданом и парковкой остается провал.',
      offsetDays: -3,
    },
    {
      id: 's2',
      year: '1995',
      date: '23 Января',
      title: 'Ягуар',
      description: 'Белый ягуар в багажнике товар.\nБелый товар в целофане\nИ это не детское питание.',
      offsetDays: 0,
    },
    {
      id: 's3',
      year: '1995',
      date: '24 Января',
      title: 'Стоянка',
      description: 'Выходим к стоянке\nРомчик хромает\nПодходим к машинам\nМеня ломает.',
      offsetDays: 1,
    },
    {
      id: 's4',
      year: '1995',
      date: '25 Января',
      title: 'Кегельбан',
      description: 'Ромчик ждал в кегельбане\nВозможно там его бригаднички?',
      offsetDays: 2,
    },
    {
      id: 's5',
      year: '1995',
      date: '26 Января',
      title: 'Притон',
      description: 'Дрона видели в последний раз там в притоне.',
      offsetDays: 3,
    },
    {
      id: 's6',
      year: '1995',
      date: '27 Января',
      title: 'Красный кирпичный дом',
      description: 'Входим без стука, ноги не вытираем, вынимаем стволы.',
      offsetDays: 4,
    },
    {
      id: 's7',
      year: '1995',
      date: '28 Января',
      title: 'Декаданс',
      description: 'А все ли дома? Лицо жены хозяина нам знакомо.',
      offsetDays: 5,
    }
  ],
  en: [
    {
      id: 's1',
      year: '1995',
      date: 'January 20',
      title: 'Zindan',
      description: 'Three days earlier, Dron is locked below,\nwhere time drips instead of moving. He finds a gap,\ngets outside, and almost believes in the road.\nBetween the pit and the parking lot, something is missing.',
      offsetDays: -3,
    },
    {
      id: 's2',
      year: '1995',
      date: 'January 23',
      title: 'Jaguar',
      description: 'White Jaguar, goods in the trunk.\nWhite goods wrapped in cellophane.\nAnd this is not baby food.',
      offsetDays: 0,
    },
    {
      id: 's3',
      year: '1995',
      date: 'January 24',
      title: 'Parking Lot',
      description: 'We step out to the parking lot.\nRomchik is limping.\nWe walk up to the cars.\nSomething breaks inside me.',
      offsetDays: 1,
    },
    {
      id: 's4',
      year: '1995',
      date: 'January 25',
      title: 'Bowling Alley',
      description: 'Romchik was waiting at the bowling alley.\nMaybe his brigade boys are there?',
      offsetDays: 2,
    },
    {
      id: 's5',
      year: '1995',
      date: 'January 26',
      title: 'Den',
      description: 'Dron was last seen there, in the den.',
      offsetDays: 3,
    },
    {
      id: 's6',
      year: '1995',
      date: 'January 27',
      title: 'Red Brick House',
      description: 'We enter without knocking, do not wipe our feet, and pull out the guns.',
      offsetDays: 4,
    },
    {
      id: 's7',
      year: '1995',
      date: 'January 28',
      title: 'Decadence',
      description: "Is everybody home? The host's wife's face looks familiar.",
      offsetDays: 5,
    }
  ]
};

const TIMELINE_START_POSITION = 50;
const TIMELINE_DAY_STEP = 10;
const DEFAULT_MEDIA_INTERVAL_MS = 6000;

const getEventPosition = (offsetDays: number) => TIMELINE_START_POSITION + offsetDays * TIMELINE_DAY_STEP;

const getMediaInterval = () => {
  const value = Number(import.meta.env.VITE_FEATURE_MEDIA_INTERVAL_MS);
  return Number.isFinite(value) && value >= 1000 ? value : DEFAULT_MEDIA_INTERVAL_MS;
};

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

const EventMedia = ({ media }: { media: MediaItem }) => {
  const cdnBase = import.meta.env.VITE_CDN_URL || '';
  const src = cdnBase ? `${cdnBase}${media.src}` : media.src;

  if (media.type === 'video') {
    return (
      <motion.video
        key={media.src}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
        autoPlay
        loop
        muted
        playsInline
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
  const events = eventsDict[lang];
  const activeEvent = events[selectedEventIndex];
  const mediaItems = useDiscoveredStoryMedia(activeEvent.id);
  const activeMedia = mediaItems[mediaIndex] || mediaItems[0];
  const hasGallery = mediaItems.length > 1;
  const mediaAutoAdvanceMs = getMediaInterval();

  const moveMedia = useCallback((direction: number) => {
    setMediaIndex(prev => {
      if (mediaItems.length < 2) return 0;
      return (prev + direction + mediaItems.length) % mediaItems.length;
    });
  }, [mediaItems.length]);

  useEffect(() => {
    setMediaIndex(0);
    setIsGalleryOpen(false);
  }, [selectedEventIndex]);

  useEffect(() => {
    if (!hasGallery && isGalleryOpen) {
      setIsGalleryOpen(false);
    }
  }, [hasGallery, isGalleryOpen]);

  useEffect(() => {
    if (mediaIndex >= mediaItems.length) {
      setMediaIndex(0);
    }
  }, [mediaIndex, mediaItems.length]);

  useEffect(() => {
    if (isGalleryOpen || mediaItems.length < 2) return;

    const intervalId = window.setInterval(() => {
      setMediaIndex(prev => (prev + 1) % mediaItems.length);
    }, mediaAutoAdvanceMs);

    return () => window.clearInterval(intervalId);
  }, [isGalleryOpen, mediaAutoAdvanceMs, mediaItems.length]);

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
        if (hasGallery) {
          setIsGalleryOpen(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGalleryOpen, moveMedia, onBack, events.length, hasGallery]);

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
        {activeMedia && (
          <motion.div
            key={activeMedia.src}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 z-0"
          >
            <EventMedia media={activeMedia} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dark gradient overlay at the bottom for menu buttons */}
      <div className="absolute bottom-0 left-0 right-0 h-[35%] bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d]/80 to-transparent pointer-events-none"></div>
      <div className="absolute top-0 left-0 right-0 h-[35%] bg-gradient-to-b from-[#0d0d0d] via-[#0d0d0d]/80 to-transparent pointer-events-none"></div>

      {hasGallery && (
        <button
          onClick={() => setIsGalleryOpen(prev => !prev)}
          className="group absolute left-[8vw] top-[6vh] z-30 flex items-center gap-[1vw] text-[#666] transition-colors duration-300 hover:text-[#c0c0c0] focus:outline-none"
          aria-label={isGalleryOpen ? (lang === 'ru' ? 'Закрыть галерею' : 'Close gallery') : (lang === 'ru' ? 'Открыть галерею' : 'Open gallery')}
        >
          {isGalleryOpen ? (
            <X className="h-[2.5vh] w-[2.5vh]" strokeWidth={1.8} />
          ) : (
            <Images className="h-[2.5vh] w-[2.5vh]" strokeWidth={1.8} />
          )}
          <span className="font-oswald text-[2.5vh] uppercase tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {isGalleryOpen ? (lang === 'ru' ? 'Закрыть' : 'Close') : (lang === 'ru' ? 'Галерея' : 'Gallery')}
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
            className="relative z-10 w-full flex flex-col items-center pt-[8vh]"
          >
            {/* Date */}
            <div className="text-[#a0a0a0] font-oswald text-[3.5vh] leading-none font-light" style={{ transform: 'scaleY(1.2)' }}>
              {activeEvent.year}
            </div>
            <div className="text-[#808080] font-oswald text-[1.8vh] uppercase mt-[1.5vh] tracking-wide font-light" style={{ transform: 'scaleY(1.2)' }}>
              {activeEvent.date}
            </div>

            {/* Timeline */}
            <div className="relative w-[50%] h-[1px] bg-[#555] mt-[6vh] mb-[6vh] flex items-center">
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

            {/* Title */}
            <div className="font-oswald text-[6vh] text-[#d0d0d0] font-light mb-[4vh] tracking-wide" style={{ transform: 'scaleY(1.2)' }}>
              {activeEvent.title}
            </div>

            {/* Separator */}
            <div className="w-[35%] h-[1px] bg-[#555] mb-[4vh]"></div>

            {/* Description */}
            <div className="text-white font-sans font-medium text-center leading-[1.4] whitespace-pre-line text-[2.2vh] max-w-[40%] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              {activeEvent.description}
              </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isGalleryOpen && (
          <motion.div
            key="event-gallery-controls"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="pointer-events-none absolute inset-0 z-20 flex items-center justify-between px-[8vw]"
          >
            <button
              onClick={() => moveMedia(-1)}
              className="pointer-events-auto flex h-[12vh] w-[5vw] min-w-[44px] items-center justify-center text-[#666] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] transition-colors duration-300 hover:text-[#c0c0c0] focus:outline-none"
              aria-label={lang === 'ru' ? 'Предыдущий кадр' : 'Previous frame'}
            >
              <ChevronLeft className="h-[6vh] w-[6vh]" strokeWidth={1.15} />
            </button>

            <div className="pointer-events-auto absolute bottom-[5vh] left-1/2 flex -translate-x-1/2 items-center gap-3">
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
