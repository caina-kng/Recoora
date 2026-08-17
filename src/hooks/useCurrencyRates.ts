import { useState, useEffect, useCallback, useRef } from 'react';
import { SupportedCurrency } from '../types';

const RATES_CACHE_KEY = 'recorra_exchange_rates_v2';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes cache

// Baseline fallback rates relative to EUR (in case API is offline or initial render)
const FALLBACK_RATES: Record<SupportedCurrency, number> = {
  EUR: 1.0,
  USD: 1.08,
  BRL: 6.10,
};

interface RatesCacheData {
  base: 'EUR';
  rates: Record<SupportedCurrency, number>;
  timestamp: number;
  date?: string;
}

export function convertCurrency(
  amount: number,
  from: SupportedCurrency,
  to: SupportedCurrency,
  rates: Record<SupportedCurrency, number> = FALLBACK_RATES
): number {
  if (!amount || isNaN(amount)) return 0;
  if (from === to) return amount;

  const fromRate = rates[from] || FALLBACK_RATES[from] || 1;
  const toRate = rates[to] || FALLBACK_RATES[to] || 1;

  // Convert from source currency to base EUR, then base EUR to target currency
  const inEUR = amount / fromRate;
  return inEUR * toRate;
}

export function useCurrencyRates() {
  const [rates, setRates] = useState<Record<SupportedCurrency, number>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(RATES_CACHE_KEY);
        if (cached) {
          const parsed: RatesCacheData = JSON.parse(cached);
          if (parsed.rates && typeof parsed.rates.BRL === 'number' && typeof parsed.rates.USD === 'number') {
            return parsed.rates;
          }
        }
      } catch (err) {
        console.error('Error reading currency cache:', err);
      }
    }
    return FALLBACK_RATES;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(RATES_CACHE_KEY);
        if (cached) {
          const parsed: RatesCacheData = JSON.parse(cached);
          if (parsed.timestamp) {
            return new Date(parsed.timestamp);
          }
        }
      } catch {
        // ignore
      }
    }
    return null;
  });

  const isFetchingRef = useRef(false);

  const fetchRates = useCallback(async (forceRefresh = false) => {
    if (isFetchingRef.current) return;

    // Check cache validity unless force refresh
    if (!forceRefresh && typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(RATES_CACHE_KEY);
        if (cached) {
          const parsed: RatesCacheData = JSON.parse(cached);
          const now = Date.now();
          if (now - parsed.timestamp < CACHE_TTL_MS && parsed.rates?.BRL && parsed.rates?.USD) {
            setRates(parsed.rates);
            setLastUpdated(new Date(parsed.timestamp));
            setIsLoading(false);
            setIsError(false);
            return;
          }
        }
      } catch {
        // Continue to fetch
      }
    }

    isFetchingRef.current = true;
    setIsLoading(true);
    setIsError(false);
    setErrorMessage(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000); // 7s timeout

    try {
      // Primary endpoint: Frankfurter API
      let response: Response | null = null;
      try {
        response = await fetch('https://api.frankfurter.app/latest?from=EUR&to=BRL,USD', {
          signal: controller.signal,
        });
      } catch (e) {
        // Fallback endpoint if primary fails
        try {
          response = await fetch('https://api.frankfurter.dev/v1/latest?from=EUR&to=BRL,USD', {
            signal: controller.signal,
          });
        } catch {
          // both failed
        }
      }

      clearTimeout(timeoutId);

      if (response && response.ok) {
        const data = await response.json();
        if (data.rates && typeof data.rates.BRL === 'number' && typeof data.rates.USD === 'number') {
          const newRates: Record<SupportedCurrency, number> = {
            EUR: 1.0,
            BRL: data.rates.BRL,
            USD: data.rates.USD,
          };

          setRates(newRates);
          const now = new Date();
          setLastUpdated(now);
          setIsError(false);

          try {
            const cacheData: RatesCacheData = {
              base: 'EUR',
              rates: newRates,
              timestamp: Date.now(),
              date: data.date,
            };
            localStorage.setItem(RATES_CACHE_KEY, JSON.stringify(cacheData));
          } catch (storageErr) {
            console.error('Error saving rates to localStorage:', storageErr);
          }
          return;
        }
      }

      throw new Error('Formato de resposta inesperado da API de câmbio.');
    } catch (err: any) {
      console.warn('Currency API error, using fallback or cached rates:', err);
      setIsError(true);
      setErrorMessage(
        err.name === 'AbortError'
          ? 'Tempo limite de conexão com o serviço de câmbio.'
          : 'Não foi possível obter taxas de câmbio em tempo real no momento.'
      );
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchRates(false);
  }, [fetchRates]);

  const convert = useCallback(
    (amount: number, from: SupportedCurrency, to: SupportedCurrency): number => {
      return convertCurrency(amount, from, to, rates);
    },
    [rates]
  );

  const getExchangeRate = useCallback(
    (from: SupportedCurrency, to: SupportedCurrency): number => {
      return convertCurrency(1, from, to, rates);
    },
    [rates]
  );

  return {
    rates,
    isLoading,
    isError,
    errorMessage,
    lastUpdated,
    isUsingFallback: isError || !lastUpdated,
    convert,
    getExchangeRate,
    fetchRates,
    refreshRates: () => fetchRates(true),
  };
}
