import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../api/client';
import type { Asset } from '../api/types';

interface UseAssetsResult {
  assets: Asset[];
  assetsMap: Map<string, Asset>;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useAssets(): UseAssetsResult {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [assetsMap, setAssetsMap] = useState<Map<string, Asset>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssets = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiClient.getAssets();
      setAssets(data);
      setAssetsMap(new Map(data.map((a) => [a.id, a])));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch assets');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  return { assets, assetsMap, isLoading, error, refetch: fetchAssets };
}
