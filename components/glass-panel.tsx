import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GlassPanelProps {
  title?: string;
  className?: string;
  children: ReactNode;
}

export function GlassPanel({ title, className = '', children }: GlassPanelProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-xl shadow-glow ${className}`}
    >
      {title ? (
        <div className="border-b border-white/10 px-6 py-5 text-sm uppercase tracking-[0.24em] text-slate-400">
          {title}
        </div>
      ) : null}
      <div className="px-6 py-6">{children}</div>
    </motion.section>
  );
}
