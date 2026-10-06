import { motion } from 'motion/react';

export function HudMeter({
  label,
  value,
  tone = 'neutral',
}: {
  label: string;
  value: number;
  tone?: 'neutral' | 'danger';
}) {
  return (
    <div className="grid grid-cols-[30px_58px] items-center gap-[5px] font-mono text-[7px]">
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
