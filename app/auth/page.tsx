import { AuthForm } from '@/components/auth-form';

export default function AuthPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#070b16] px-6 py-14 sm:px-8 lg:px-12">
      <div className="w-full max-w-4xl">
        <div className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[40px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(124,92,255,0.16),transparent_20%),linear-gradient(180deg,rgba(15,23,42,0.96),rgba(15,23,42,0.8))] p-10 shadow-glow backdrop-blur-2xl">
            <p className="text-sm uppercase tracking-[0.28em] text-violet-200/70">Secure workspace access</p>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white">Sign in and start optimizing SaaS spend immediately.</h1>
            <p className="mt-5 max-w-xl text-slate-300">SpendWise AI uses secure sign-in flows to protect your budget intelligence and subscription data.</p>
          </div>
          <AuthForm />
        </div>
      </div>
    </main>
  );
}
