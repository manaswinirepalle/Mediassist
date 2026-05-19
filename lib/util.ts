import { Subscription } from '@/types';

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);

export const extractCategoryTotals = (subscriptions: Subscription[]) =>
  subscriptions.reduce<Record<string, number>>((acc, sub) => {
    acc[sub.category] = (acc[sub.category] || 0) + sub.monthlyCost;
    return acc;
  }, {});

export const extractDepartmentTotals = (subscriptions: Subscription[]) =>
  subscriptions.reduce<Record<string, number>>((acc, sub) => {
    acc[sub.department] = (acc[sub.department] || 0) + sub.monthlyCost;
    return acc;
  }, {});

export const getForecastData = (subscriptions: Subscription[]) => {
  const total = subscriptions.reduce((sum, sub) => sum + sub.monthlyCost, 0);
  return [
    { month: 'Jan', amount: total * 0.96 },
    { month: 'Feb', amount: total * 1.02 },
    { month: 'Mar', amount: total * 1.08 },
    { month: 'Apr', amount: total * 1.13 },
    { month: 'May', amount: total * 1.19 },
    { month: 'Jun', amount: total * 1.24 },
  ];
};
