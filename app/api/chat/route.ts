import { NextResponse } from 'next/server';
import { generateChatResponse } from '@/lib/ai-engine';
import { Subscription, ChatMessage } from '@/types';

export async function POST(request: Request) {
  const body = await request.json();
  const subscriptions = (body.subscriptions ?? []) as Subscription[];
  const messages = (body.messages ?? []) as ChatMessage[];

  if (!Array.isArray(messages)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const response = await generateChatResponse(messages, subscriptions);
  return NextResponse.json(response);
}
