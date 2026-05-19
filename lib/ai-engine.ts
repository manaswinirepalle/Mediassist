import { ChatMessage, RecommendationResponse, Subscription } from '@/types';

const getRedundantCategories = (subscriptions: Subscription[]) => {
  const categories = subscriptions.reduce<Record<string, number>>((acc, sub) => {
    acc[sub.category] = (acc[sub.category] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(categories).filter(([, count]) => count > 2).map(([category]) => category);
};

const buildInsight = (title: string, description: string, savings: number, priority: 'High' | 'Medium' | 'Low'): RecommendationResponse['insights'][number] => ({
  title,
  description,
  savings,
  priority,
});

export const generateRecommendations = (subscriptions: Subscription[]): RecommendationResponse => {
  const totalMonthly = subscriptions.reduce((sum, sub) => sum + sub.monthlyCost, 0);
  const unused = subscriptions.filter((sub) => !sub.active || sub.usage === 'Quarterly');
  const lowRoi = subscriptions.filter((sub) => sub.roiScore < 5);
  const overlap = getRedundantCategories(subscriptions);

  const insights = [
    ...unused.slice(0, 3).map((sub) =>
      buildInsight(
        `Inactive subscription: ${sub.name}`,
        `Your team still pays for ${sub.name} while usage is low or inactive. Review seat access and cancel unused licenses.`,
        Math.round(sub.monthlyCost * 0.9),
        'High',
      ),
    ),
    ...lowRoi.slice(0, 2).map((sub) =>
      buildInsight(
        `${sub.name} has weak ROI`,
        `The ${sub.plan} plan of ${sub.name} is underused relative to spend. Consider a lower tier or team cleanup.`,
        Math.round(sub.monthlyCost * 0.6),
        'Medium',
      ),
    ),
  ];

  if (overlap.length) {
    insights.push(
      buildInsight(
        'Functional overlap detected',
        `Multiple tools in ${overlap.join(', ')} share the same capability. Consolidating can reduce complexity and costs.`,
        500,
        'High',
      ),
    );
  }

  if (subscriptions.length > 0) {
    insights.push(
      buildInsight(
        'Plan optimization opportunity',
        'Analyze your premium plans for users with low weekly or monthly activity, then downgrade to match real team demand.',
        Math.round(totalMonthly * 0.12),
        'Medium',
      ),
    );
  }

  return {
    insights,
    annualSavings: Math.round(totalMonthly * 10),
    overlapTools: overlap,
    suggestions: [
      'Review seat allocation for inactive users and reduce waste by 18%.',
      'Consolidate overlapping subscription categories into one tool per team.',
      'Move low-engagement teams to usage-based or starter plans.',
    ],
  };
};

export const generateChatResponse = async (messages: ChatMessage[], subscriptions: Subscription[]) => {
  const prompt = messages.map((message) => `${message.role === 'user' ? 'User' : 'Assistant'}: ${message.content}`).join('\n');

  if (process.env.OPENAI_API_KEY) {
    try {
      const completion = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are SpendWise AI, a financial audit assistant that gives concise subscription spend optimization advice.' },
            ...messages,
          ],
          max_tokens: 320,
        }),
      });
      const payload = await completion.json();
      return {
        answers: [payload.choices?.[0]?.message?.content?.trim() ?? 'I have recommendations ready.'],
      };
    } catch {
      // fallback to local inference
    }
  }

  const costs = subscriptions.reduce((sum, sub) => sum + sub.monthlyCost, 0);
  const inactiveSeats = subscriptions.filter((sub) => sub.usage === 'Monthly' || sub.usage === 'Quarterly').length;
  const overlap = getRedundantCategories(subscriptions);

  const baseResponse = `Your current SaaS portfolio spends ${costs} USD monthly. I see ${inactiveSeats} lower-engagement tools and ${overlap.length} overlapping categories.`;
  const advice = [
    baseResponse,
    inactiveSeats > 2 ? 'Start by reclaiming seats from tools with weak team usage.' : 'Focus on premium plan optimization and yearly discounts for top tools.',
    overlap.length ? `Evaluate ${overlap.join(', ')} and consolidate where workflows intersect.` : 'Maintain efficiency by centralizing workflows around one core collaboration stack.',
  ];

  return { answers: advice };
};
