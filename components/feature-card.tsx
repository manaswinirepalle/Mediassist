import { ReactNode } from 'react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: ReactNode;
}

export function FeatureCard({ title, description, icon }: FeatureCardProps) {
  return (
    <article className="group cursor-default rounded-[28px] border border-white/10 bg-white/5 p-6 transition duration-300 hover:-translate-y-1 hover:border-violet-400/20 hover:bg-white/10">
      <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-violet-500/10 text-violet-200 shadow-sm shadow-violet-500/10">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-300">{description}</p>
    </article>
  );
}
