import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';

export type HudViewportRatio = '16:9' | '21:9' | '32:9';

interface ScaledHudCanvasProps {
  ratio: HudViewportRatio;
  children: ReactNode;
}

const DESIGN_HEIGHT = 720;

function getDesignWidth(ratio: HudViewportRatio) {
  if (ratio === '32:9') return 2560;
  if (ratio === '21:9') return 1680;
  return 1280;
}

export function ScaledHudCanvas({ ratio, children }: ScaledHudCanvasProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const designWidth = useMemo(() => getDesignWidth(ratio), [ratio]);
  const [layout, setLayout] = useState({ scale: 1, left: 0, top: 0 });

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const update = () => {
      const rect = host.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const scale = Math.min(rect.width / designWidth, rect.height / DESIGN_HEIGHT);
      const left = (rect.width - designWidth * scale) * 0.5;
      const top = (rect.height - DESIGN_HEIGHT * scale) * 0.5;
      setLayout({ scale, left, top });
    };

    update();

    const observer = new ResizeObserver(update);
    observer.observe(host);
    return () => observer.disconnect();
  }, [designWidth]);

  return (
    <div ref={hostRef} className="absolute inset-0 overflow-hidden">
      <div
        className="absolute origin-top-left"
        style={{
          width: designWidth,
          height: DESIGN_HEIGHT,
          left: layout.left,
          top: layout.top,
          transform: `scale(${layout.scale})`,
          containerType: 'inline-size',
        }}
      >
        {children}
      </div>
    </div>
  );
}
