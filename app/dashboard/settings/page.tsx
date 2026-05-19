'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';

export default function SettingsPage() {
  const [workspaceName, setWorkspaceName] = useState('SpendWise Labs');
  const [notifications, setNotifications] = useState(true);

  return (
    <DashboardShell userName="Avery">
      <div className="grid gap-6">
        <section className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-glow backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Workspace settings</p>
              <h2 className="mt-2 text-3xl font-semibold text-white">Manage your workspace</h2>
            </div>
            <button className="rounded-3xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400">Save changes</button>
          </div>
          <div className="mt-8 grid gap-6">
            <div className="grid gap-3 rounded-[28px] bg-slate-950/70 p-5">
              <label className="text-sm text-slate-300">Workspace name</label>
              <input value={workspaceName} onChange={(event) => setWorkspaceName(event.target.value)} className="rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none" />
            </div>
            <div className="rounded-[28px] bg-slate-950/70 p-5">
              <p className="text-sm text-slate-400">Notifications</p>
              <div className="mt-4 flex items-center gap-4">
                <button onClick={() => setNotifications(true)} className={`rounded-full px-4 py-2 text-sm transition ${notifications ? 'bg-violet-500 text-white' : 'bg-white/5 text-slate-300'}`}>Enabled</button>
                <button onClick={() => setNotifications(false)} className={`rounded-full px-4 py-2 text-sm transition ${!notifications ? 'bg-violet-500 text-white' : 'bg-white/5 text-slate-300'}`}>Paused</button>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-glow backdrop-blur-xl">
          <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Billing</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Plan', value: 'Growth' },
              { label: 'Billing cycle', value: 'Monthly' },
              { label: 'Next invoice', value: 'May 30' },
            ].map((item) => (
              <div key={item.label} className="rounded-3xl bg-slate-950/70 p-5">
                <p className="text-sm text-slate-400">{item.label}</p>
                <p className="mt-3 text-xl font-semibold text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
