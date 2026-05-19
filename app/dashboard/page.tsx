'use client';

import { useEffect, useState } from 'react';
import { ArrowDownRight, Clock3, PieChart, ShieldUser, Sparkles } from 'lucide-react';
import { DashboardShell } from '@/components/dashboard-shell';
import { SubscriptionTable } from '@/components/subscription-table';
import { AnalyticsPanel } from '@/components/analytics-panel';
import { ChatAssistant } from '@/components/chat-assistant';
import { ReportButton } from '@/components/report-button';
import { supabase, isSupabaseConfigured } from '@/lib/supabase-client';
import { Subscription } from '@/types';

const initialSubscriptions: Subscription[] = [
  {
    id: '1',
    name: 'Nova CRM',
    category: 'Sales',
    monthlyCost: 420,
    teamSeats: 28,
    plan: 'Business',
    usage: 'Weekly',
    department: 'Marketing',
    roiScore: 7,
    active: true,
  },
  {
    id: '2',
    name: 'Atlas Analytics',
    category: 'Business Intelligence',
    monthlyCost: 620,
    teamSeats: 12,
    plan: 'Enterprise',
    usage: 'Monthly',
    department: 'Finance',
    roiScore: 5,
    active: true,
  },
  {
    id: '3',
    name: 'Echo Support',
    category: 'Customer Success',
    monthlyCost: 180,
    teamSeats: 36,
    plan: 'Growth',
    usage: 'Weekly',
    department: 'Operations',
    roiScore: 6,
    active: true,
  },
  {
    id: '4',
    name: 'Lumen Design',
    category: 'Design',
    monthlyCost: 96,
    teamSeats: 8,
    plan: 'Starter',
    usage: 'Quarterly',
    department: 'Design',
    roiScore: 4,
    active: false,
  },
];

export default function DashboardPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(initialSubscriptions);
  const [session, setSession] = useState<boolean>(false);
  const [insights, setInsights] = useState<string[]>([]);

  useEffect(() => {
    async function fetchSession() {
      if (!isSupabaseConfigured || !supabase) {
        setSession(true);
        return;
      }
      const { data } = await supabase.auth.getSession();
      setSession(Boolean(data.session));
    }
    fetchSession();
  }, []);

  useEffect(() => {
    async function fetchInsights() {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptions }),
      });
      const result = await response.json();
      setInsights(result.suggestions ?? []);
    }
    fetchInsights();
  }, [subscriptions]);

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-950 px-6 py-24 text-white sm:px-8 lg:px-12">
        <div className="mx-auto max-w-2xl rounded-[36px] border border-white/10 bg-white/5 p-10 text-center shadow-glow backdrop-blur-xl">
          <h1 className="text-4xl font-semibold">Sign in to access your SpendWise AI workspace</h1>
          <p className="mt-4 text-slate-300">Use the auth page to log in with Google or email and explore your subscription intelligence dashboard.</p>
          <a href="/auth" className="mt-8 inline-flex rounded-full bg-violet-500 px-6 py-4 text-sm font-semibold text-white transition hover:bg-violet-400">Go to sign-in</a>
        </div>
      </div>
    );
  }

  return (
    <DashboardShell userName="Avery" >
      <div className="grid gap-6">
        <section id="overview" className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-glow backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Executive pulse</p>
                <h2 className="mt-2 text-3xl font-semibold text-white">Your SaaS portfolio snapshot</h2>
              </div>
              <div className="rounded-3xl bg-violet-500/10 px-4 py-3 text-sm text-violet-100">Data refreshed</div>
            </div>
            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              <div className="rounded-3xl bg-slate-950/70 p-5">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Total spend</p>
                <p className="mt-3 text-3xl font-semibold text-white">$1,316</p>
              </div>
              <div className="rounded-3xl bg-slate-950/70 p-5">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Optimization score</p>
                <p className="mt-3 text-3xl font-semibold text-white">82%</p>
              </div>
              <div className="rounded-3xl bg-slate-950/70 p-5">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Actionable insights</p>
                <p className="mt-3 text-3xl font-semibold text-white">7</p>
              </div>
            </div>
          </div>
          <div className="grid gap-6">
            <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-glow backdrop-blur-xl">
              <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Fast metrics</p>
              <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between rounded-3xl bg-slate-950/70 px-5 py-4">
                  <div>
                    <p className="text-sm text-slate-400">Inactive seats</p>
                    <p className="mt-2 text-xl font-semibold text-white">17</p>
                  </div>
                  <ArrowDownRight className="h-5 w-5 text-emerald-400" />
                </div>
                <div className="flex items-center justify-between rounded-3xl bg-slate-950/70 px-5 py-4">
                  <div>
                    <p className="text-sm text-slate-400">Overlapping tools</p>
                    <p className="mt-2 text-xl font-semibold text-white">3</p>
                  </div>
                  <PieChart className="h-5 w-5 text-violet-300" />
                </div>
              </div>
            </div>
            <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-glow backdrop-blur-xl">
              <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Priority alert</p>
              <div className="mt-5 text-slate-300">
                <p>Upgrade or reclaim seats for inactive users in Lumen Design and Atlas Analytics to protect runway and reduce waste.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="insights" className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <SubscriptionTable subscriptions={subscriptions} onAdd={(item) => setSubscriptions((current) => [item, ...current])} />
          <div className="space-y-6">
            <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-glow backdrop-blur-xl">
              <p className="text-sm uppercase tracking-[0.25em] text-slate-400">AI recommendations</p>
              <h2 className="mt-4 text-2xl font-semibold text-white">Smart suggestions</h2>
              <ul className="mt-6 space-y-4 text-slate-300">
                {insights.map((insight, index) => (
                  <li key={index} className="rounded-3xl bg-slate-950/70 p-4">{insight}</li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap gap-3">
                <ReportButton subscriptions={subscriptions} />
                <button className="inline-flex items-center justify-center rounded-3xl border border-white/10 bg-slate-950/70 px-5 py-3 text-sm text-white transition hover:border-violet-400/20">View audit summary</button>
              </div>
            </div>
            <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-glow backdrop-blur-xl">
              <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Revenue operations</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {[
                  { label: 'Savings target', value: '18%', icon: ShieldUser },
                  { label: 'At-risk subscriptions', value: '4', icon: Clock3 },
                ].map((item) => (
                  <div key={item.label} className="rounded-3xl bg-slate-950/70 p-4">
                    <div className="flex items-center gap-3 text-violet-200">
                      <item.icon className="h-5 w-5" />
                      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">{item.label}</p>
                    </div>
                    <p className="mt-4 text-3xl font-semibold text-white">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="analytics" className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
          <AnalyticsPanel subscriptions={subscriptions} />
          <ChatAssistant subscriptions={subscriptions} />
        </section>
      </div>
    </DashboardShell>
  );
}
