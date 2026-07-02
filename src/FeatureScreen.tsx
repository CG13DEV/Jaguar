import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language } from './App';

export interface MediaItem {
  type: 'image' | 'video';
  src: string;
}

export interface SubFeature {
  id: string;
  title: string;
  description: string;
  media?: MediaItem[];
}

export interface FeatureGroup {
  id: string;
  title: string;
  subFeatures: SubFeature[];
}

interface FeatureScreenProps {
  groups: FeatureGroup[];
  onBack: () => void;
  lang?: Language;
}

const checkMediaFile = (url: string, isVideo: boolean) => new Promise<boolean>((resolve) => {
  if (isVideo) {
    const vid = document.createElement('video');
    vid.onloadedmetadata = () => resolve(true);
    vid.onerror = () => resolve(false);
    vid.src = url;
  } else {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  }
});

function useDiscoveredMedia(id: string): MediaItem[] {
  const [items, setItems] = useState<MediaItem[]>([
    { type: 'video', src: `/features/${id}_1.mp4` }
  ]);

  useEffect(() => {
    let isMounted = true;
    const discover = async () => {
      const cdnBase = import.meta.env.VITE_CDN_URL || '';
      
      const checks = Array.from({length: 6}, (_, i) => i + 1).map(async (index) => {
        // Try fetch HEAD first for speed if possible
        const tryExt = async (ext: string, isVid: boolean) => {
          const path = `/features/${id}_${index}.${ext}`;
          const url = cdnBase ? `${cdnBase}${path}` : path;
          try {
            const res = await fetch(url, { method: 'HEAD' });
            if (res.ok) return path;
          } catch (e) {
            // Fallback to DOM check if CORS fails HEAD request
            const works = await checkMediaFile(url, isVid);
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
      if (isMounted) {
        const valid = results.filter(Boolean).sort((a, b) => a!.index - b!.index);
        if (valid.length > 0) {
          setItems(valid.map(v => ({ type: v!.type as 'video'|'image', src: v!.src })));
        } else {
          // Defaults if none found
          setItems([
            { type: 'video', src: `/features/${id}_1.mp4` },
            { type: 'image', src: `/features/${id}_2.jpg` }
          ]);
        }
      }
    };
    discover();
    return () => { isMounted = false; };
  }, [id]);

  return items;
}

const BackgroundMedia = ({ media }: { media: MediaItem }) => {
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
        className="absolute inset-0 w-full h-full object-cover z-0"
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
      className="absolute inset-0 w-full h-full object-cover z-0"
      src={src}
      alt=""
    />
  );
};

export function FeatureScreen({ groups, onBack, lang = 'ru' }: FeatureScreenProps) {
  const [groupIndex, setGroupIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [mediaIndex, setMediaIndex] = useState(0);

  useEffect(() => {
    setMediaIndex(0);
  }, [groupIndex, subIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onBack();
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        setGroupIndex(prev => {
          if (prev < groups.length - 1) {
            setSubIndex(0);
            return prev + 1;
          }
          return prev;
        });
      } else if (e.key === 'ArrowLeft' || e.key === 'a') {
        setGroupIndex(prev => {
          if (prev > 0) {
            setSubIndex(0);
            return prev - 1;
          }
          return prev;
        });
      } else if (e.key === 'ArrowDown' || e.key === 's') {
        setSubIndex(prev => Math.min(prev + 1, groups[groupIndex].subFeatures.length - 1));
      } else if (e.key === 'ArrowUp' || e.key === 'w') {
        setSubIndex(prev => Math.max(prev - 1, 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBack, groups.length, groupIndex]);

  const activeGroup = groups[groupIndex];
  const activeSubFeature = activeGroup.subFeatures[subIndex];

  const discoveredMedia = useDiscoveredMedia(activeSubFeature.id);
  const mediaItems: MediaItem[] = activeSubFeature.media || discoveredMedia;
  const activeMedia = mediaItems[mediaIndex] || mediaItems[0];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="absolute inset-0 bg-[#0a0f0d] flex flex-col items-center justify-start overflow-hidden font-oswald select-none"
    >
      {/* Background Media */}
      <AnimatePresence>
        <BackgroundMedia key={activeMedia.src} media={activeMedia} />
      </AnimatePresence>

      {/* Top gradient for text readability */}
      <div className="absolute z-10 top-0 left-0 right-0 h-[45%] bg-gradient-to-b from-[#0d0d0d] via-[#0d0d0d]/80 to-transparent pointer-events-none"></div>

      {/* Main Content (Top aligned) */}
      <div className="relative z-10 w-full flex flex-col items-center pt-[8vh]">
        {/* Group Title */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`group-${groupIndex}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.4 }}
            className="mb-[1vh]"
          >
            <div className="font-oswald text-[5vh] text-[#d0d0d0] font-light tracking-wide text-center uppercase" style={{ transform: 'scaleY(1.2)' }}>
              {activeGroup.title}
            </div>
          </motion.div>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div
            key={`sub-${groupIndex}-${subIndex}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center w-full max-w-[55vw]"
          >
            {/* SubFeature Title */}
            <div className="font-sans text-[2.5vh] text-[#9c1414] font-medium tracking-widest uppercase mb-[3vh]">
              {activeSubFeature.title}
            </div>

            {/* Separator */}
            <div className="w-[30%] h-[1px] bg-gradient-to-r from-transparent via-[#9c1414] to-transparent mb-[4vh]"></div>

            {/* Description */}
            <div className="text-[#f0f0f0] font-sans font-medium text-center leading-[1.5] whitespace-pre-line text-[2.2vh] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              {activeSubFeature.description}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Left side vertical indicators for media */}
      <div className="absolute left-[4vw] top-1/2 -translate-y-1/2 flex flex-col gap-[1.5vh] z-10">
        {mediaItems.map((item, idx) => {
          const isActive = idx === mediaIndex;
          return (
            <div
              key={idx}
              className="flex items-center cursor-pointer py-2 group relative"
              onClick={() => setMediaIndex(idx)}
            >
              <div className="w-[20px] flex justify-center">
                {isActive ? (
                  <div className="w-[10px] h-[10px] bg-[#9c1414] rounded-full ring-2 ring-[#9c1414] ring-offset-2 ring-offset-[#0d0d0d] transition-all duration-300 shadow-[0_0_8px_rgba(156,20,20,0.8)]"></div>
                ) : (
                  <div className="w-[6px] h-[6px] bg-[#444] rounded-full group-hover:bg-[#666] transition-colors duration-300"></div>
                )}
              </div>
              {item.type === 'video' && (
                <div className={`absolute left-[24px] text-[1.4vh] ${isActive ? 'text-[#9c1414] drop-shadow-[0_0_5px_rgba(156,20,20,0.8)]' : 'text-[#444] group-hover:text-[#666]'} transition-colors duration-300`}>
                  ▶
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Right side vertical indicators for sub-features */}
      <div className="absolute right-[4vw] top-1/2 -translate-y-1/2 flex flex-col gap-[1.5vh] z-10">
        {activeGroup.subFeatures.map((_, idx) => {
          const isActive = idx === subIndex;
          return (
            <div
              key={idx}
              className="flex items-center justify-center cursor-pointer p-2"
              onClick={() => setSubIndex(idx)}
            >
              {isActive ? (
                <div className="w-[10px] h-[10px] bg-[#9c1414] rounded-full ring-2 ring-[#9c1414] ring-offset-2 ring-offset-[#0d0d0d] transition-all duration-300"></div>
              ) : (
                <div className="w-[6px] h-[6px] bg-[#444] rounded-full hover:bg-[#666] transition-colors duration-300"></div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom horizontal indicators for groups */}
      <div className="absolute bottom-[10vh] left-1/2 -translate-x-1/2 flex gap-[1vw] z-10">
        {groups.map((_, idx) => {
          const isActive = idx === groupIndex;
          return (
            <div
              key={idx}
              className="flex items-center justify-center cursor-pointer px-[1vw] py-[1vh]"
              onClick={() => {
                setGroupIndex(idx);
                setSubIndex(0);
              }}
            >
              {isActive ? (
                <div className="w-[4vw] h-[3px] bg-[#9c1414] transition-all duration-300 shadow-[0_0_10px_rgba(156,20,20,0.8)]"></div>
              ) : (
                <div className="w-[3vw] h-[2px] bg-[#444] hover:bg-[#666] transition-all duration-300"></div>
              )}
            </div>
          );
        })}
      </div>

      {/* Back Button */}
      <div className="absolute bottom-[6vh] right-[8vw] z-10">
        <button
          onClick={onBack}
          className="group flex items-center gap-[1vw] text-[#666] hover:text-[#c0c0c0] transition-colors duration-300 focus:outline-none"
        >
          <div className="border border-[#333] group-hover:border-[#666] px-[0.6vw] py-[0.2vh] text-[1.4vh] font-mono tracking-wider transition-colors duration-300 bg-[#0d0d0d]/50 backdrop-blur-sm">
            ESC
          </div>
          <span className="font-oswald text-[2.5vh] uppercase tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {lang === 'ru' ? 'Назад' : 'Back'}
          </span>
        </button>
      </div>
    </motion.div>
  );
}
