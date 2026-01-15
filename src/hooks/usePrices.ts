import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../api/client';
import type { Price } from '../api/types';

interface UsePricesParams {
  asset?: string;
  asOf?: string;
  from?: string;
  to?: string;
}

interface UsePricesResult {
  prices: Price[];
  pricesMap: Map<string, number>;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function usePrices(params?: UsePricesParams): UsePricesResult {
  const [prices, setPrices] = useState<Price[]>([]);
  const [pricesMap, setPricesMap] = useState<Map<string, number>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiClient.getPrices(params);
      setPrices(data);
      setPricesMap(new Map(data.map((p) => [p.asset, p.price])));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch prices');
    } finally {
      setIsLoading(false);
    }
  }, [params?.asset, params?.asOf, params?.from, params?.to]);

  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  return { prices, pricesMap, isLoading, error, refetch: fetchPrices };
}
