import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { Bell, ChartBar, LayoutGrid, Settings, Sparkles, Users } from 'lucide-react';

interface DashboardShellProps {
  children: ReactNode;
  userName: string;
}

const navItems = [
  { label: 'Overview', icon: ChartBar, href: '#overview' },
  { label: 'Insights', icon: Sparkles, href: '#insights' },
  { label: 'Analytics', icon: LayoutGrid, href: '#analytics' },
  { label: 'Team', icon: Users, href: '#team' },
  { label: 'Settings', icon: Settings, href: '/dashboard/settings' },
];

export function DashboardShell({ children, userName }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(124,92,255,0.18),_transparent_20%),radial-gradient(circle_at_10%_80%,rgba(255,96,150,0.14),transparent_18%),linear-gradient(180deg,#070b16_0%,#090f1b_100%)] text-white">
      <div className="mx-auto flex min-h-screen max-w-[1600px] gap-6 px-6 py-8 xl:px-12">
        <aside className="w-full max-w-[300px] space-y-6 rounded-[34px] border border-white/10 bg-white/5 p-6 shadow-glow backdrop-blur-xl lg:block hidden">
          <div className="space-y-3">
            <div className="rounded-3xl bg-violet-500/10 p-4 text-violet-200 ring-1 ring-violet-500/10">
              <p className="text-xs uppercase tracking-[0.3em] text-violet-200/70">Welcome back</p>
              <p className="mt-2 text-2xl font-semibold">{userName}</p>
            </div>
            <p className="text-sm text-slate-300">SpendWise AI gives you a command center for SaaS spend, budget leaks, and growth-ready optimization.</p>
          </div>

          <nav className="space-y-3">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-white"
              >
                <item.icon className="h-5 w-5 text-violet-300" />
                {item.label}
              </a>
            ))}
          </nav>

          <div className="rounded-3xl bg-white/5 p-4 ring-1 ring-white/10">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Quick action</p>
            <button className="mt-3 w-full rounded-3xl bg-violet-400/10 px-4 py-3 text-sm font-semibold text-violet-100 transition hover:bg-violet-400/20">Run audit</button>
          </div>
        </aside>

        <main className="flex-1 space-y-6">
          <header className="flex flex-col gap-4 rounded-[34px] border border-white/10 bg-white/5 p-6 shadow-glow backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-slate-400">Dashboard</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">SaaS spend intelligence suite</h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button className="inline-flex items-center gap-2 rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition hover:border-violet-400/20 hover:bg-white/10">
                <Bell className="h-4 w-4" /> Alerts
              </button>
              <button className="rounded-3xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400">Create recommendation</button>
            </div>
          </header>

          {children}
        </main>
      </div>
    </div>
  );
}
