import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiClient } from '../api/client';
import type { HistoricalDataPoint, Asset } from '../api/types';

export type TimePeriod = '1W' | '1M' | '3M' | '6M' | '1Y';

function getDateFromPeriod(period: TimePeriod): string {
  const date = new Date();
  switch (period) {
    case '1W':
      date.setDate(date.getDate() - 7);
      break;
    case '1M':
      date.setMonth(date.getMonth() - 1);
      break;
    case '3M':
      date.setMonth(date.getMonth() - 3);
      break;
    case '6M':
      date.setMonth(date.getMonth() - 6);
      break;
    case '1Y':
      date.setFullYear(date.getFullYear() - 1);
      break;
  }
  return date.toISOString().split('T')[0];
}

interface UseHistoricalDataParams {
  period: TimePeriod;
  assets: Asset[];
  positionQuantities: Map<string, number>;
}

interface UseHistoricalDataResult {
  data: HistoricalDataPoint[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useHistoricalData({
  period,
  assets,
  positionQuantities,
}: UseHistoricalDataParams): UseHistoricalDataResult {
  const [data, setData] = useState<HistoricalDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const assetsMapById = useMemo(() => {
    return new Map(assets.map(a => [a.id, a]));
  }, [assets]);

  const quantitiesKey = useMemo(() => {
    const entries = Array.from(positionQuantities.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    return JSON.stringify(entries);
  }, [positionQuantities]);

  const fetchHistoricalData = useCallback(async () => {
    if (assets.length === 0 || positionQuantities.size === 0) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const fromDate = getDateFromPeriod(period);
      const toDate = new Date().toISOString().split('T')[0];

      const assetNames = assets
        .filter(a => positionQuantities.has(a.id))
        .map(a => a.name)
        .join(',');

      const prices = await apiClient.getPrices({
        from: fromDate,
        to: toDate,
        assets: assetNames
      });

      const pricesByDate = new Map<string, Map<string, number>>();
      prices.forEach((price) => {
        const date = price.asOf || toDate;
        if (!pricesByDate.has(date)) {
          pricesByDate.set(date, new Map());
        }
        pricesByDate.get(date)!.set(price.asset, price.price);
      });

      const historicalData: HistoricalDataPoint[] = [];
      const sortedDates = Array.from(pricesByDate.keys()).sort();

      sortedDates.forEach((date) => {
        const datePrices = pricesByDate.get(date)!;
        let totalValue = 0;

        positionQuantities.forEach((quantity, assetId) => {
          const asset = assetsMapById.get(assetId);
          if (asset) {
            const price = datePrices.get(asset.name) || 0;
            totalValue += quantity * price;
          }
        });

        historicalData.push({ date, value: totalValue });
      });

      setData(historicalData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch historical data');
    } finally {
      setIsLoading(false);
    }
  }, [period, assetsMapById, quantitiesKey]);

  useEffect(() => {
    fetchHistoricalData();
  }, [fetchHistoricalData]);

  return { data, isLoading, error, refetch: fetchHistoricalData };
}
