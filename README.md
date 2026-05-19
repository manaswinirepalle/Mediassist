# SpendWise AI

SpendWise AI is a premium, futuristic SaaS analytics and optimization platform built with Next.js 14, TypeScript, Tailwind CSS, Framer Motion, and Supabase-ready authentication.

## Features

- Landing page with startup-grade branding and investor-ready messaging
- Protected dashboard with subscription audit flows
- AI recommendation engine for cost reduction and tool consolidation
- Interactive charts showing category, department, and forecast analytics
- Conversational AI assistant for SaaS spend questions
- PDF report export for audit-ready summaries
- Supabase-compatible Google OAuth and email magic link sign-in

## Local setup

1. Navigate to the app folder:

```bash
cd "c:\Users\MANASWINI\Downloads\mediassist_ai (1)\spendwise-ai"
```

2. Install dependencies:

```bash
npm install
```

3. Copy environment variables:

```bash
copy .env.example .env.local
```

4. Add Supabase credentials and optional OpenAI key to `.env.local`.

5. Start the dev server:

```bash
npm run dev
```

6. Open `http://localhost:3000`

## Build and validation

```bash
npm run build
npm run lint
npm run typecheck
```

## Deployment

- Frontend: Vercel
- Backend: Next.js API routes are ready to deploy on Vercel or Render
- Connect environment variables in Vercel dashboard using `vercel.json`

### Recommended Vercel env vars

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`

## Folder structure

- `app/` — App Router pages and API routes
- `components/` — Reusable interface components
- `lib/` — AI engine, Supabase client, and utility helpers
- `types/` — Shared TypeScript models

## Notes

This app is designed for SaaS audit demos and investor-ready presentation. The AI assistant uses a local fallback when OpenAI is not configured, and Supabase authentication is enabled via environment variables.
