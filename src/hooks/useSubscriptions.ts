import { useState, useEffect, useMemo } from 'react';
import { Subscription, FilterOptions, SupportedCurrency } from '../types';
import { INITIAL_SUBSCRIPTIONS } from '../data/initialData';
import { advanceBillingDate, getDaysUntil, getMonthlyEquivalent } from '../utils/calculations';

const STORAGE_KEY = 'recorra_subscriptions_v2';
const CURRENCY_KEY = 'recorra_preferred_currency';
const ONBOARDING_KEY = 'recorra_onboarding_completed';

export function useSubscriptions(convertFn?: (amount: number, from: SupportedCurrency, to: SupportedCurrency) => number) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved !== null) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            return parsed;
          }
        }
        const onboardingDone = localStorage.getItem(ONBOARDING_KEY) === 'true';
        if (!onboardingDone) {
          return [];
        }
      } catch (err) {
        console.error('Error loading subscriptions from localStorage:', err);
      }
    }
    return INITIAL_SUBSCRIPTIONS;
  });

  const [preferredCurrency, setPreferredCurrency] = useState<SupportedCurrency>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(CURRENCY_KEY) as SupportedCurrency;
      if (saved && ['BRL', 'USD', 'EUR'].includes(saved)) {
        return saved;
      }
    }
    return 'BRL';
  });

  const [filters, setFilters] = useState<FilterOptions>({
    category: 'all',
    status: 'all',
    searchQuery: '',
    sortBy: 'date_asc',
    billingCycle: 'all',
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(subscriptions));
    } catch (err) {
      console.error('Error saving subscriptions to localStorage:', err);
    }
  }, [subscriptions]);

  useEffect(() => {
    try {
      localStorage.setItem(CURRENCY_KEY, preferredCurrency);
    } catch (err) {
      console.error('Error saving preferred currency:', err);
    }
  }, [preferredCurrency]);

  const addSubscription = (newSub: Omit<Subscription, 'id' | 'createdAt'>) => {
    const subscription: Subscription = {
      ...newSub,
      id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    setSubscriptions((prev) => [subscription, ...prev]);
    return subscription;
  };

  const updateSubscription = (id: string, updatedFields: Partial<Subscription>) => {
    setSubscriptions((prev) =>
      prev.map((sub) => {
        if (sub.id === id) {
          return {
            ...sub,
            ...updatedFields,
            previousAmount: updatedFields.amount !== undefined && updatedFields.amount !== sub.amount ? sub.amount : sub.previousAmount,
          };
        }
        return sub;
      })
    );
  };

  const deleteSubscription = (id: string) => {
    setSubscriptions((prev) => prev.filter((sub) => sub.id !== id));
  };

  const toggleStatus = (id: string) => {
    setSubscriptions((prev) =>
      prev.map((sub) => {
        if (sub.id === id) {
          const nextStatus = sub.status === 'active' ? 'paused' : 'active';
          return { ...sub, status: nextStatus };
        }
        return sub;
      })
    );
  };

  const markAsPaid = (id: string) => {
    setSubscriptions((prev) =>
      prev.map((sub) => {
        if (sub.id === id) {
          const nextDate = advanceBillingDate(sub.nextBillingDate, sub.billingCycle);
          return { ...sub, nextBillingDate: nextDate };
        }
        return sub;
      })
    );
  };

  const convertTrialToPaid = (id: string) => {
    setSubscriptions((prev) =>
      prev.map((sub) => {
        if (sub.id === id) {
          return { ...sub, isTrial: false, trialEndsAt: null, status: 'active' };
        }
        return sub;
      })
    );
  };

  const resetToSampleData = () => {
    setSubscriptions(INITIAL_SUBSCRIPTIONS);
  };

  const clearAllSubscriptions = () => {
    setSubscriptions([]);
  };

  const importSubscriptions = (newList: Subscription[]) => {
    if (Array.isArray(newList)) {
      setSubscriptions(newList);
    }
  };

  // Filter and sort subscriptions
  const filteredSubscriptions = useMemo(() => {
    return subscriptions
      .filter((sub) => {
        // Search filter
        if (filters.searchQuery.trim()) {
          const query = filters.searchQuery.toLowerCase().trim();
          const matchName = sub.name.toLowerCase().includes(query);
          const matchNotes = sub.notes?.toLowerCase().includes(query) || false;
          if (!matchName && !matchNotes) return false;
        }

        // Category filter
        if (filters.category !== 'all' && sub.category !== filters.category) {
          return false;
        }

        // Status filter
        if (filters.status !== 'all') {
          if (filters.status === 'trial') {
            if (!sub.isTrial) return false;
          } else if (filters.status === 'urgent') {
            if (sub.status !== 'active') return false;
            const days = getDaysUntil(sub.nextBillingDate);
            if (days < 0 || days > 3) return false;
          } else if (sub.status !== filters.status) {
            return false;
          }
        }

        // Billing Cycle filter
        if (filters.billingCycle !== 'all' && sub.billingCycle !== filters.billingCycle) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const getSubMonthlyInPreferred = (sub: Subscription) => {
          const rawAmount = sub.amount;
          const subCurr = sub.currency || preferredCurrency;
          const converted = convertFn ? convertFn(rawAmount, subCurr, preferredCurrency) : rawAmount;
          return getMonthlyEquivalent(converted, sub.billingCycle);
        };

        switch (filters.sortBy) {
          case 'date_asc':
            return new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime();
          case 'date_desc':
            return new Date(b.nextBillingDate).getTime() - new Date(a.nextBillingDate).getTime();
          case 'amount_desc':
            return getSubMonthlyInPreferred(b) - getSubMonthlyInPreferred(a);
          case 'amount_asc':
            return getSubMonthlyInPreferred(a) - getSubMonthlyInPreferred(b);
          case 'name_asc':
            return a.name.localeCompare(b.name, 'pt-BR');
          default:
            return 0;
        }
      });
  }, [subscriptions, filters, preferredCurrency, convertFn]);

  // Urgent upcoming renewals (Active & next 3 days)
  const urgentRenewals = useMemo(() => {
    return subscriptions
      .filter((sub) => sub.status === 'active')
      .map((sub) => ({
        ...sub,
        daysUntil: getDaysUntil(sub.nextBillingDate),
      }))
      .filter((sub) => sub.daysUntil >= 0 && sub.daysUntil <= 3)
      .sort((a, b) => a.daysUntil - b.daysUntil);
  }, [subscriptions]);

  // Active trials
  const activeTrials = useMemo(() => {
    return subscriptions
      .filter((sub) => sub.isTrial && sub.status !== 'cancelled')
      .map((sub) => ({
        ...sub,
        daysUntilTrialEnd: sub.trialEndsAt ? getDaysUntil(sub.trialEndsAt) : getDaysUntil(sub.nextBillingDate),
      }))
      .sort((a, b) => a.daysUntilTrialEnd - b.daysUntilTrialEnd);
  }, [subscriptions]);

  return {
    subscriptions,
    filteredSubscriptions,
    urgentRenewals,
    activeTrials,
    filters,
    setFilters,
    preferredCurrency,
    setPreferredCurrency,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    toggleStatus,
    markAsPaid,
    convertTrialToPaid,
    resetToSampleData,
    clearAllSubscriptions,
    importSubscriptions,
  };
}
