import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiClient } from '../api/client';
import type { Portfolio, Asset, EnrichedPosition, PortfolioSummary, AssetType } from '../api/types';

interface UsePortfolioParams {
  asOf?: string;
  assets: Asset[];
  assetsMap: Map<string, Asset>;
}

interface UsePortfolioResult {
  portfolio: Portfolio | null;
  enrichedPositions: EnrichedPosition[];
  summary: PortfolioSummary | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function usePortfolio({
  asOf,
  assets,
  assetsMap,
}: UsePortfolioParams): UsePortfolioResult {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPortfolio = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiClient.getPortfolio(asOf);
      setPortfolio(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch portfolio');
    } finally {
      setIsLoading(false);
    }
  }, [asOf]);

  useEffect(() => {
    if (assets.length > 0) {
      fetchPortfolio();
    }
  }, [fetchPortfolio, assets.length]);

  const enrichedPositions = useMemo((): EnrichedPosition[] => {
    if (!portfolio || assetsMap.size === 0) return [];

    const positions = portfolio.positions.map((pos) => {
      const assetDetails = assetsMap.get(pos.asset);
      const currentPrice = pos.price;
      const value = pos.quantity * currentPrice;

      return {
        ...pos,
        assetDetails: assetDetails || { id: pos.asset, name: 'Unknown', type: 'stock' as AssetType },
        currentPrice,
        value,
        percentageOfPortfolio: 0,
      };
    });

    const totalValue = positions.reduce((sum, pos) => sum + pos.value, 0);

    return positions.map((pos) => ({
      ...pos,
      percentageOfPortfolio: totalValue > 0 ? (pos.value / totalValue) * 100 : 0,
    }));
  }, [portfolio, assetsMap]);

  const summary = useMemo((): PortfolioSummary | null => {
    if (enrichedPositions.length === 0) return null;

    const totalValue = enrichedPositions.reduce((sum, pos) => sum + pos.value, 0);

    const byAssetClass = enrichedPositions.reduce(
      (acc, pos) => {
        const type = pos.assetDetails.type;
        if (!acc[type]) {
          acc[type] = 0;
        }
        acc[type] += pos.value;
        return acc;
      },
      {} as Record<AssetType, number>
    );

    const assetClassSummary = Object.entries(byAssetClass).map(([type, value]) => ({
      type: type as AssetType,
      value,
      percentage: totalValue > 0 ? (value / totalValue) * 100 : 0,
    }));

    const byAsset = enrichedPositions.map((pos) => ({
      asset: pos.assetDetails,
      value: pos.value,
      percentage: pos.percentageOfPortfolio,
    }));

    return {
      totalValue,
      byAssetClass: assetClassSummary,
      byAsset,
    };
  }, [enrichedPositions]);

  return {
    portfolio,
    enrichedPositions,
    summary,
    isLoading,
    error,
    refetch: fetchPortfolio,
  };
}
