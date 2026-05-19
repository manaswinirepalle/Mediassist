import { NextResponse } from 'next/server';
import { generateRecommendations } from '@/lib/ai-engine';
import { Subscription } from '@/types';

export async function POST(request: Request) {
  const body = await request.json();
  const subscriptions = (body.subscriptions ?? []) as Subscription[];

  if (!Array.isArray(subscriptions)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const payload = generateRecommendations(subscriptions);
  return NextResponse.json(payload);
}
