import { ReactNode } from 'react';

interface SectionHeaderProps {
  title: string;
  description: string;
  badge?: string;
  children?: ReactNode;
}

export function SectionHeader({ title, description, badge, children }: SectionHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        {badge ? <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-violet-200">{badge}</span> : null}
        <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h2>
      </div>
      <p className="max-w-2xl text-sm text-slate-300 sm:text-base">{description}</p>
      {children}
    </div>
  );
}
