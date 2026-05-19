import { ArrowRight, BarChart3, CircleDollarSign, Shield, Sparkles, Users, Zap } from 'lucide-react';
import { FeatureCard } from '@/components/feature-card';
import { SectionHeader } from '@/components/section-header';
import { AuthForm } from '@/components/auth-form';

const features = [
  {
    title: 'Deep spend diagnostics',
    description: 'Intelligent audit models that reveal hidden SaaS waste across teams, categories, and premium plans.',
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    title: 'AI recommendation engine',
    description: 'Cost-saving playbooks, replacement guidance, and plan downgrades delivered in one dashboard.',
    icon: <Sparkles className="h-5 w-5" />,
  },
  {
    title: 'Team-centric analytics',
    description: 'Heatmaps, forecasting, and department risk scores built for founders and finance leaders.',
    icon: <Users className="h-5 w-5" />,
  },
  {
    title: 'PDF reporting & audit-ready export',
    description: 'Generate premium executive reports for board reviews, finance syncs, and investor decks.',
    icon: <CircleDollarSign className="h-5 w-5" />,
  },
];

export default function HomePage() {
  return (
    <main className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(124,92,255,0.16),transparent_18%),radial-gradient(circle_at_80%_20%,rgba(255,155,120,0.12),transparent_16%)] px-6 py-10 sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-20">
        <section className="relative isolate overflow-hidden rounded-[42px] border border-white/10 bg-[#090d1b]/80 p-10 shadow-[0_0_120px_rgba(124,92,255,0.12)] backdrop-blur-2xl sm:p-12 lg:p-16">
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-violet-500/20 to-transparent opacity-60 blur-3xl" />
          <div className="relative grid gap-10 xl:grid-cols-[1.1fr_0.9fr] xl:items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-3 rounded-full border border-violet-400/20 bg-white/5 px-4 py-2 text-sm text-violet-200 shadow-sm shadow-violet-500/10 backdrop-blur-sm">
                <span className="rounded-full bg-violet-500 px-2.5 py-1 text-xs uppercase tracking-[0.26em] text-white">New</span>
                Launch-ready enterprise SaaS audit
              </div>
              <div className="space-y-5">
                <h1 className="max-w-3xl text-5xl font-semibold tracking-tighter text-white sm:text-6xl">SpendWise AI: AI-powered subscription intelligence and spending optimization.</h1>
                <p className="max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">A modern platform for individuals, startups, and companies to identify SaaS waste, optimize budgets, and act with AI-powered recommendations.</p>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <a href="#auth" className="inline-flex items-center justify-center gap-2 rounded-full bg-violet-500 px-6 py-4 text-sm font-semibold text-white transition hover:bg-violet-400">Get started now<ArrowRight className="h-4 w-4" /></a>
                <span className="text-sm text-slate-400">Trusted by finance teams at modern growth companies.</span>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {['$120K saved', '17 tools audited', '3X ROI', '24/7 AI insights'].map((stat) => (
                  <div key={stat} className="rounded-3xl border border-white/10 bg-white/5 px-4 py-5 text-center text-sm text-slate-300 shadow-glow">
                    <p className="font-semibold text-white">{stat}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative overflow-hidden rounded-[38px] border border-white/10 bg-slate-950/70 p-8 shadow-2xl shadow-violet-500/5">
              <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-violet-500/10 to-transparent" />
              <div className="rounded-[32px] border border-white/10 bg-[#101827]/90 p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Live audit preview</p>
                    <h2 className="mt-3 text-2xl font-semibold text-white">Subscription insights</h2>
                  </div>
                  <span className="rounded-3xl bg-violet-500/10 px-3 py-2 text-xs uppercase tracking-[0.24em] text-violet-200">Alpha</span>
                </div>
                <div className="mt-8 grid gap-5">
                  <div className="rounded-[30px] bg-slate-950/80 p-5 ring-1 ring-white/5">
                    <p className="text-sm uppercase tracking-[0.28em] text-slate-400">Spend leaks</p>
                    <div className="mt-4 flex items-end justify-between gap-4">
                      <div>
                        <p className="text-3xl font-semibold text-white">$12.8K</p>
                        <p className="mt-1 text-sm text-slate-400">Potential monthly savings</p>
                      </div>
                      <div className="rounded-3xl bg-violet-500/10 px-4 py-2 text-sm text-violet-100">+22%</div>
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-[30px] bg-slate-950/80 p-5">
                      <p className="text-sm uppercase tracking-[0.28em] text-slate-400">Underused seats</p>
                      <p className="mt-3 text-2xl font-semibold text-white">17</p>
                    </div>
                    <div className="rounded-[30px] bg-slate-950/80 p-5">
                      <p className="text-sm uppercase tracking-[0.28em] text-slate-400">Plan overlap</p>
                      <p className="mt-3 text-2xl font-semibold text-white">3 tools</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr] xl:items-center">
          <div className="space-y-8">
            <SectionHeader
              title="Why SpendWise AI"
              description="Designed for modern finance organizations, SpendWise AI blends premium design, smart SaaS analytics, and actionable recommendations into one launch-ready platform."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              {features.map((feature) => (
                <FeatureCard key={feature.title} title={feature.title} description={feature.description} icon={feature.icon} />
              ))}
            </div>
          </div>
          <div className="rounded-[40px] border border-white/10 bg-white/5 p-8 shadow-glow backdrop-blur-xl">
            <div className="mb-6 flex items-center justify-between gap-4 rounded-3xl bg-slate-950/70 px-5 py-4">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-slate-400">Startup-grade workflow</p>
                <h3 className="mt-2 text-xl font-semibold text-white">Core SaaS intelligence engine</h3>
              </div>
              <Shield className="h-6 w-6 text-violet-300" />
            </div>
            <div className="space-y-4 text-slate-300">
              <p>SpendWise AI helps founders and finance leads replace guesswork with precision insights on subscriptions, usage patterns, and renewal risk.</p>
              <p>Use the dashboard to act with confidence, export audit-grade reports, and chat with an AI financial advisor that understands SaaS portfolios.</p>
            </div>
          </div>
        </section>

        <section id="auth" className="grid gap-10 xl:grid-cols-[0.9fr_1.1fr] xl:items-start">
          <div className="space-y-6">
            <SectionHeader title="Dashboard, AI assistant, and reporting" description="From revenue operations to finance, every user gets elevated analytics paired with a premium, dark-mode experience." badge="Investor-ready" />
            <div className="grid gap-4 sm:grid-cols-2">
              <FeatureCard title="Smart audit workflow" description="Add subscriptions, assign teams, and get recommendations in under a minute." icon={<Zap className="h-5 w-5" />} />
              <FeatureCard title="Budget forecasting" description="Monthly and annual spend forecasting to help you plan runway and optimize renewals." icon={<BarChart3 className="h-5 w-5" />} />
            </div>
          </div>
          <AuthForm />
        </section>

        <section className="grid gap-8 lg:grid-cols-3">
          <div className="rounded-[36px] border border-white/10 bg-white/5 p-8 shadow-glow backdrop-blur-xl">
            <p className="text-sm uppercase tracking-[0.28em] text-slate-400">Pricing plan</p>
            <h3 className="mt-4 text-3xl font-semibold text-white">Growth</h3>
            <p className="mt-4 max-w-md text-slate-300">A premium plan for scaling startups and teams that need accurate spend governance and AI-backed recommendations.</p>
            <div className="mt-8 space-y-3 rounded-[28px] bg-slate-950/80 p-5 text-slate-300">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Monthly commitment</p>
              <p className="mt-3 text-4xl font-semibold text-white">$149</p>
              <p className="text-sm text-slate-400">Per workspace, up to 250 users.</p>
            </div>
            <a className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-violet-500 px-6 py-4 text-sm font-semibold text-white transition hover:bg-violet-400" href="#auth">
              Start free audit
            </a>
          </div>

          <div className="col-span-2 rounded-[36px] border border-white/10 bg-slate-950/70 p-8 shadow-glow backdrop-blur-xl">
            <p className="text-sm uppercase tracking-[0.28em] text-slate-400">Trusted by teams</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {['Design', 'Growth', 'Ops'].map((label) => (
                <div key={label} className="rounded-3xl bg-white/5 p-5">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-400">{label}</p>
                  <p className="mt-4 text-3xl font-semibold text-white">{Math.floor(Math.random() * 28) + 15}%</p>
                  <p className="mt-2 text-sm text-slate-300">Quarterly efficiency gain estimate</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer className="rounded-[32px] border border-white/10 bg-white/5 p-8 text-slate-300 shadow-glow backdrop-blur-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-slate-400">SpendWise AI</p>
              <p className="mt-3 max-w-2xl text-sm text-slate-300">Enterprise design, startup velocity, and AI-driven financial discipline for modern SaaS teams.</p>
            </div>
            <div className="flex flex-wrap gap-5 text-sm text-slate-400">
              <a href="#auth" className="transition hover:text-white">Try demo</a>
              <a href="#features" className="transition hover:text-white">Solutions</a>
              <a href="#" className="transition hover:text-white">Contact</a>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
