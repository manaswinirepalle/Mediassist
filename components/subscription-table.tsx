'use client';

import { useState, FormEvent } from 'react';
import { Plus, TrendingDown, Zap } from 'lucide-react';
import { Subscription } from '@/types';
import { formatCurrency } from '@/lib/util';

interface SubscriptionTableProps {
  subscriptions: Subscription[];
  onAdd: (subscription: Subscription) => void;
}

const planOptions = ['Starter', 'Growth', 'Business', 'Enterprise'] as const;
const usageOptions = ['Daily', 'Weekly', 'Monthly', 'Quarterly'] as const;
const departmentOptions = ['Engineering', 'Marketing', 'Finance', 'Operations', 'Design'] as const;

export function SubscriptionTable({ subscriptions, onAdd }: SubscriptionTableProps) {
  const [name, setName] = useState('Avalanche CRM');
  const [category, setCategory] = useState('Productivity');
  const [monthlyCost, setMonthlyCost] = useState(149);
  const [teamSeats, setTeamSeats] = useState(22);
  const [plan, setPlan] = useState<typeof planOptions[number]>('Growth');
  const [usage, setUsage] = useState<typeof usageOptions[number]>('Weekly');
  const [department, setDepartment] = useState<typeof departmentOptions[number]>('Engineering');
  const [roiScore, setRoiScore] = useState(6);
  const [active, setActive] = useState(true);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onAdd({
      id: crypto.randomUUID(),
      name,
      category,
      monthlyCost,
      teamSeats,
      plan,
      usage,
      department,
      roiScore,
      active,
    });
    setName('Orbit task suite');
    setMonthlyCost(89);
    setTeamSeats(14);
  };

  return (
    <div className="grid gap-6">
      <section className="overflow-hidden rounded-[32px] border border-white/10 bg-white/5 shadow-glow backdrop-blur-xl">
        <div className="border-b border-white/10 px-6 py-5 text-sm uppercase tracking-[0.24em] text-slate-400">Subscription manager</div>
        <div className="p-6">
          <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
            <div>
              <div className="mb-4 flex items-center gap-3 text-sm text-slate-300">
                <Zap className="h-5 w-5 text-violet-300" />
                Build a curated portfolio of all team subscriptions.
              </div>
              <table className="min-w-full text-left text-sm text-slate-300">
                <thead className="border-b border-white/10 text-slate-400">
                  <tr>
                    <th className="pb-3 pr-6 py-3">Tool</th>
                    <th className="pb-3 pr-6 py-3">Category</th>
                    <th className="pb-3 pr-6 py-3">Spend</th>
                    <th className="pb-3 py-3">ROI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {subscriptions.map((sub) => (
                    <tr key={sub.id} className="transition hover:bg-white/5">
                      <td className="py-4 pr-6 font-medium text-white">{sub.name}</td>
                      <td className="py-4 pr-6">{sub.category}</td>
                      <td className="py-4 pr-6 text-violet-200">{formatCurrency(sub.monthlyCost)}</td>
                      <td className="py-4 text-slate-300">{sub.roiScore}/10</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <form onSubmit={handleSubmit} className="rounded-[28px] border border-white/10 bg-slate-950/30 p-6 shadow-inner shadow-white/5">
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Tool name</label>
                  <input value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none transition focus:border-violet-300/70" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">Category</label>
                    <input value={category} onChange={(event) => setCategory(event.target.value)} className="w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">Monthly spend</label>
                    <input type="number" value={monthlyCost} min={0} onChange={(event) => setMonthlyCost(Number(event.target.value))} className="w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none" />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">Team seats</label>
                    <input type="number" value={teamSeats} min={1} onChange={(event) => setTeamSeats(Number(event.target.value))} className="w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">ROI score</label>
                    <input type="number" value={roiScore} min={1} max={10} onChange={(event) => setRoiScore(Number(event.target.value))} className="w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none" />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">Plan tier</label>
                    <select value={plan} onChange={(event) => setPlan(event.target.value as typeof planOptions[number])} className="w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none">
                      {planOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">Usage</label>
                    <select value={usage} onChange={(event) => setUsage(event.target.value as typeof usageOptions[number])} className="w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none">
                      {usageOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Department</label>
                  <select value={department} onChange={(event) => setDepartment(event.target.value as typeof departmentOptions[number])} className="w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none">
                    {departmentOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <input id="active" type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} className="h-4 w-4 rounded border-white/15 bg-slate-900 text-violet-500 focus:ring-violet-400" />
                  <label htmlFor="active" className="text-sm text-slate-300">Active subscription</label>
                </div>
                <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-3xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400">
                  <Plus className="h-4 w-4" /> Add subscription
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
      <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-glow backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Executive summary</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">Operational savings preview</h3>
          </div>
          <div className="rounded-3xl bg-slate-900/60 px-4 py-2 text-sm text-slate-300">Tap create for audit-ready guidance</div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl bg-slate-950/60 p-5">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Total tools</p>
            <p className="mt-3 text-3xl font-semibold text-white">{subscriptions.length}</p>
          </div>
          <div className="rounded-3xl bg-slate-950/60 p-5">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Average ROI</p>
            <p className="mt-3 text-3xl font-semibold text-white">{(subscriptions.reduce((sum, sub) => sum + sub.roiScore, 0) / Math.max(subscriptions.length, 1)).toFixed(1)}/10</p>
          </div>
          <div className="rounded-3xl bg-slate-950/60 p-5">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Optimization score</p>
            <p className="mt-3 flex items-center gap-2 text-3xl font-semibold text-white"><TrendingDown className="h-5 w-5 text-emerald-400" />{Math.max(76 - subscriptions.filter((sub) => sub.roiScore < 6).length * 4, 42)}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
