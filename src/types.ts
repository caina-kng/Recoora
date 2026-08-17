export type BillingCycle = 'monthly' | 'yearly' | 'weekly';

export type SubscriptionCategory =
  | 'streaming'
  | 'saude'
  | 'software'
  | 'educacao'
  | 'produtividade'
  | 'jogos'
  | 'financas'
  | 'outros';

export type SubscriptionStatus = 'active' | 'paused' | 'cancelled';

export type SupportedCurrency = 'BRL' | 'USD' | 'EUR';

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  currency: SupportedCurrency;
  billingCycle: BillingCycle;
  nextBillingDate: string; // ISO date format YYYY-MM-DD
  category: SubscriptionCategory;
  status: SubscriptionStatus;
  isTrial: boolean;
  trialEndsAt: string | null; // ISO date format YYYY-MM-DD
  notes?: string;
  color?: string; // Hex or tailwind color accent
  website?: string;
  previousAmount?: number;
  createdAt: string;
}

export interface CategoryInfo {
  id: SubscriptionCategory;
  label: string;
  iconName: string;
  color: string;
  bgLight: string;
  bgDark: string;
  textColor: string;
  borderColor: string;
}

export type SortOption = 'date_asc' | 'date_desc' | 'amount_desc' | 'amount_asc' | 'name_asc';

export interface FilterOptions {
  category: string; // 'all' or specific category
  status: string; // 'all', 'active', 'paused', 'cancelled', 'trial'
  searchQuery: string;
  sortBy: SortOption;
  billingCycle: string; // 'all', 'monthly', 'yearly', 'weekly'
}

export interface UserProfile {
  name: string;
  age: number;
  email: string;
  createdAt: string;
}

