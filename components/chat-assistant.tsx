'use client';

import { useState, FormEvent } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { ChatMessage, Subscription } from '@/types';

interface ChatAssistantProps {
  subscriptions: Subscription[];
}

export function ChatAssistant({ subscriptions }: ChatAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Ask me how to cut subscription waste, consolidate tools, or forecast SaaS spend.' },
  ]);
  const [input, setInput] = useState('How can I reduce my SaaS costs?');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const userMessage: ChatMessage = { role: 'user', content: input.trim() };
    if (!userMessage.content) return;

    setMessages((current) => [...current, userMessage]);
    setInput('');
    setIsLoading(true);

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [...messages, userMessage], subscriptions }),
    });

    const payload = await response.json();
    setMessages((current) => [...current, { role: 'assistant', content: payload.answers?.[0] ?? 'I have an update for you.' }]);
    setIsLoading(false);
  };

  return (
    <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-glow backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-slate-400">AI advisor</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">Conversational SaaS coach</h3>
        </div>
        <MessageCircle className="h-6 w-6 text-violet-300" />
      </div>
      <div className="mt-6 space-y-4">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`rounded-3xl p-4 ${message.role === 'assistant' ? 'bg-slate-900/70 text-slate-100' : 'bg-violet-500/10 text-white'} `}
          >
            <p className="text-sm text-slate-200">{message.content}</p>
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} className="mt-6 flex gap-3">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask SpendWise AI..."
          className="flex-1 rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-violet-400/60"
        />
        <button disabled={isLoading} className="inline-flex items-center gap-2 rounded-3xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition enabled:hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60">
          <Send className="h-4 w-4" /> Send
        </button>
      </form>
      <p className="mt-4 text-xs text-slate-500">You can ask things like “Which subscriptions overlap?”, “How much can I save annually?”, or “Which tools should I downgrade?”.</p>
    </div>
  );
}
