import { Subscription, SupportedCurrency, SubscriptionCategory } from '../types';

export const CURRENCY_SYMBOLS: Record<SupportedCurrency, string> = {
  BRL: 'R$',
  USD: '$',
  EUR: '€',
};

export function formatCurrency(amount: number, currency: SupportedCurrency = 'BRL'): string {
  try {
    return new Intl.NumberFormat(currency === 'BRL' ? 'pt-BR' : currency === 'USD' ? 'en-US' : 'de-DE', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    const symbol = CURRENCY_SYMBOLS[currency] || 'R$';
    return `${symbol} ${amount.toFixed(2).replace('.', ',')}`;
  }
}

/**
 * Calculates the monthly cost equivalent of a subscription.
 */
export function getMonthlyEquivalent(amount: number, billingCycle: Subscription['billingCycle']): number {
  switch (billingCycle) {
    case 'weekly':
      return amount * (52 / 12);
    case 'yearly':
      return amount / 12;
    case 'monthly':
    default:
      return amount;
  }
}

/**
 * Calculates the yearly cost equivalent of a subscription.
 */
export function getYearlyEquivalent(amount: number, billingCycle: Subscription['billingCycle']): number {
  switch (billingCycle) {
    case 'weekly':
      return amount * 52;
    case 'yearly':
      return amount;
    case 'monthly':
    default:
      return amount * 12;
  }
}

/**
 * Calculates total active monthly spend and annual projection.
 */
export function calculateTotals(subscriptions: Subscription[]) {
  let monthlyTotal = 0;
  let activeCount = 0;
  let pausedCount = 0;
  let trialCount = 0;

  subscriptions.forEach((sub) => {
    if (sub.status === 'active') {
      monthlyTotal += getMonthlyEquivalent(sub.amount, sub.billingCycle);
      activeCount++;
      if (sub.isTrial) {
        trialCount++;
      }
    } else if (sub.status === 'paused') {
      pausedCount++;
    }
  });

  const yearlyTotal = monthlyTotal * 12;

  return {
    monthlyTotal,
    yearlyTotal,
    activeCount,
    pausedCount,
    trialCount,
    totalCount: subscriptions.length,
  };
}

/**
 * Calculates days remaining until a specific date string (YYYY-MM-DD).
 */
export function getDaysUntil(dateString: string): number {
  if (!dateString) return 999;
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const [year, month, day] = dateString.split('-').map(Number);
  const targetDate = new Date(year, month - 1, day);
  targetDate.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Returns formatted relative label for days until date (in Portuguese).
 */
export function getRelativeDateLabel(days: number): { label: string; urgency: 'urgent' | 'warning' | 'normal' | 'overdue' } {
  if (days < 0) {
    return { label: `Venceu há ${Math.abs(days)} ${Math.abs(days) === 1 ? 'dia' : 'dias'}`, urgency: 'overdue' };
  }
  if (days === 0) {
    return { label: 'Vence hoje!', urgency: 'urgent' };
  }
  if (days === 1) {
    return { label: 'Vence amanhã', urgency: 'urgent' };
  }
  if (days <= 3) {
    return { label: `Em ${days} dias`, urgency: 'urgent' };
  }
  if (days <= 7) {
    return { label: `Em ${days} dias`, urgency: 'warning' };
  }
  return { label: `Em ${days} dias`, urgency: 'normal' };
}

/**
 * Format date string YYYY-MM-DD to DD/MM/YYYY
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '-';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateString;
}

/**
 * Advances billing date to the next cycle.
 */
export function advanceBillingDate(currentDateStr: string, cycle: Subscription['billingCycle']): string {
  const [year, month, day] = currentDateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);

  if (cycle === 'monthly') {
    d.setMonth(d.getMonth() + 1);
  } else if (cycle === 'yearly') {
    d.setFullYear(d.getFullYear() + 1);
  } else if (cycle === 'weekly') {
    d.setDate(d.getDate() + 7);
  }

  const newYear = d.getFullYear();
  const newMonth = String(d.getMonth() + 1).padStart(2, '0');
  const newDay = String(d.getDate()).padStart(2, '0');
  return `${newYear}-${newMonth}-${newDay}`;
}

export interface CategoryBreakdownItem {
  category: SubscriptionCategory;
  amount: number;
  percentage: number;
  count: number;
}

/**
 * Groups active monthly costs by category.
 */
export function getCategoryBreakdown(subscriptions: Subscription[]): CategoryBreakdownItem[] {
  const map = new Map<SubscriptionCategory, { amount: number; count: number }>();

  let totalMonthly = 0;

  subscriptions.forEach((sub) => {
    if (sub.status !== 'active') return;
    const monthlyCost = getMonthlyEquivalent(sub.amount, sub.billingCycle);
    totalMonthly += monthlyCost;

    const current = map.get(sub.category) || { amount: 0, count: 0 };
    map.set(sub.category, {
      amount: current.amount + monthlyCost,
      count: current.count + 1,
    });
  });

  const result: CategoryBreakdownItem[] = [];

  map.forEach((value, category) => {
    result.push({
      category,
      amount: value.amount,
      percentage: totalMonthly > 0 ? (value.amount / totalMonthly) * 100 : 0,
      count: value.count,
    });
  });

  return result.sort((a, b) => b.amount - a.amount);
}
