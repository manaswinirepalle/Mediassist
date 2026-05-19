'use client';

import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { Subscription } from '@/types';
import { extractCategoryTotals, extractDepartmentTotals, formatCurrency, getForecastData } from '@/lib/util';

const categoryColors = ['#8b5cf6', '#ec4899', '#38bdf8', '#fbbf24', '#7dd3fc'];

interface AnalyticsPanelProps {
  subscriptions: Subscription[];
}

export function AnalyticsPanel({ subscriptions }: AnalyticsPanelProps) {
  const categoryTotals = extractCategoryTotals(subscriptions);
  const departmentTotals = extractDepartmentTotals(subscriptions);
  const forecastData = getForecastData(subscriptions);
  const total = subscriptions.reduce((sum, sub) => sum + sub.monthlyCost, 0);

  const categoryData = Object.entries(categoryTotals).map(([name, value]) => ({ name, value }));
  const departmentData = Object.entries(departmentTotals).map(([name, value]) => ({ name, value }));

  return (
    <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
      <div className="grid gap-6">
        <section className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-glow backdrop-blur-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Spend forecast</p>
              <h3 className="mt-3 text-2xl font-semibold text-white">$ {formatCurrency(total)} monthly</h3>
            </div>
            <div className="rounded-3xl bg-violet-500/10 px-4 py-3 text-sm text-violet-100">+18% trend</div>
          </div>
          <div className="mt-6 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData} margin={{ top: 0, right: -16, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="forecast" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#9333ea" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#9333ea" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8' }} />
                <YAxis tickFormatter={(value) => `$${value}`} tickLine={false} axisLine={false} tick={{ fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ background: '#0b1122', borderRadius: 24, borderColor: 'rgba(255,255,255,0.12)' }} formatter={(value: number) => [`$${value}`, 'Projected']} />
                <Area type="monotone" dataKey="amount" stroke="#8b5cf6" fill="url(#forecast)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="grid gap-6 rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-glow backdrop-blur-xl xl:grid-cols-2">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Category distribution</p>
            <div className="mt-6 h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} dataKey="value" nameKey="name" outerRadius={100} innerRadius={56} stroke="transparent">
                    {categoryData.map((entry, index) => (
                      <Cell key={entry.name} fill={categoryColors[index % categoryColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#0b1122', borderRadius: 20, borderColor: 'rgba(255,255,255,0.12)' }} formatter={(value: number) => [`$${value}`, 'Category']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Department spend</p>
            <div className="mt-6 h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8' }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: '#94a3b8' }} />
                  <Tooltip contentStyle={{ background: '#0b1122', borderRadius: 20, borderColor: 'rgba(255,255,255,0.12)' }} formatter={(value: number) => [`$${value}`, 'Department']} />
                  <Bar dataKey="value" fill="#f472b6" radius={[12, 12, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-glow backdrop-blur-xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Spend heatmap</p>
            <h3 className="mt-3 text-2xl font-semibold text-white">Department risk score</h3>
          </div>
          <div className="rounded-3xl bg-slate-900/70 px-4 py-3 text-sm text-slate-300">Real-time pulse</div>
        </div>
        <div className="mt-8 space-y-4">
          {departmentData.slice(0, 4).map((item, index) => (
            <div key={item.name} className="flex items-center justify-between gap-4 rounded-3xl bg-slate-900/50 px-5 py-4">
              <div>
                <p className="font-semibold text-white">{item.name}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-500">Spend impact</p>
              </div>
              <span className="rounded-full bg-violet-500/10 px-4 py-2 text-sm text-violet-100">{formatCurrency(item.value)}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
