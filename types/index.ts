export type PlanType = 'Starter' | 'Growth' | 'Business' | 'Enterprise';

export type UsageFrequency = 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly';

export type Department = 'Engineering' | 'Marketing' | 'Finance' | 'Operations' | 'Design';

export interface Subscription {
  id: string;
  name: string;
  category: string;
  monthlyCost: number;
  teamSeats: number;
  plan: PlanType;
  usage: UsageFrequency;
  department: Department;
  roiScore: number;
  active: boolean;
}

export interface AuditInsight {
  title: string;
  description: string;
  savings: number;
  priority: 'High' | 'Medium' | 'Low';
}

export interface RecommendationResponse {
  insights: AuditInsight[];
  annualSavings: number;
  overlapTools: string[];
  suggestions: string[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  answers: string[];
}
