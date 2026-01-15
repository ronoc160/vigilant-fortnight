import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { usePortfolio } from './usePortfolio';
import { server } from '../test/setup';
import { http, HttpResponse } from 'msw';
import type { Asset } from '../api/types';

const mockAssets: Asset[] = [
  { id: 'aapl', name: 'Apple', type: 'stock' },
  { id: 'googl', name: 'Google', type: 'stock' },
  { id: 'btc', name: 'Bitcoin', type: 'crypto' },
  { id: 'usd', name: 'USD', type: 'fiat' },
];

const mockAssetsMap = new Map(mockAssets.map((a) => [a.id, a]));

describe('usePortfolio', () => {
  it('returns initial loading state', () => {
    const { result } = renderHook(() =>
      usePortfolio({
        assets: mockAssets,
        assetsMap: mockAssetsMap,
      })
    );

    expect(result.current.isLoading).toBe(true);
    expect(result.current.portfolio).toBeNull();
    expect(result.current.enrichedPositions).toEqual([]);
    expect(result.current.summary).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('does not fetch when assets are empty', async () => {
    const { result } = renderHook(() =>
      usePortfolio({
        assets: [],
        assetsMap: new Map(),
      })
    );

    expect(result.current.isLoading).toBe(true);
    expect(result.current.portfolio).toBeNull();
  });

  it('fetches portfolio when assets are provided', async () => {
    const { result } = renderHook(() =>
      usePortfolio({
        assets: mockAssets,
        assetsMap: mockAssetsMap,
      })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.portfolio).toBeTruthy();
    expect(result.current.error).toBeNull();
  });

  it('enriches positions with asset details', async () => {
    const { result } = renderHook(() =>
      usePortfolio({
        assets: mockAssets,
        assetsMap: mockAssetsMap,
      })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.enrichedPositions.length).toBeGreaterThan(0);

    result.current.enrichedPositions.forEach((position) => {
      expect(position).toHaveProperty('assetDetails');
      expect(position).toHaveProperty('currentPrice');
      expect(position).toHaveProperty('value');
      expect(position).toHaveProperty('percentageOfPortfolio');
    });
  });

  it('calculates position values correctly', async () => {
    const { result } = renderHook(() =>
      usePortfolio({
        assets: mockAssets,
        assetsMap: mockAssetsMap,
      })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    result.current.enrichedPositions.forEach((position) => {
      expect(position.value).toBe(position.quantity * position.currentPrice);
    });
  });

  it('calculates percentages that sum to 100', async () => {
    const { result } = renderHook(() =>
      usePortfolio({
        assets: mockAssets,
        assetsMap: mockAssetsMap,
      })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    if (result.current.enrichedPositions.length > 0) {
      const totalPercentage = result.current.enrichedPositions.reduce(
        (sum, pos) => sum + pos.percentageOfPortfolio,
        0
      );
      expect(totalPercentage).toBeCloseTo(100, 1);
    }
  });

  it('generates portfolio summary', async () => {
    const { result } = renderHook(() =>
      usePortfolio({
        assets: mockAssets,
        assetsMap: mockAssetsMap,
      })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.summary).toBeTruthy();
    expect(result.current.summary).toHaveProperty('totalValue');
    expect(result.current.summary).toHaveProperty('byAssetClass');
    expect(result.current.summary).toHaveProperty('byAsset');
  });

  it('groups positions by asset class in summary', async () => {
    const { result } = renderHook(() =>
      usePortfolio({
        assets: mockAssets,
        assetsMap: mockAssetsMap,
      })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    if (result.current.summary) {
      result.current.summary.byAssetClass.forEach((item) => {
        expect(['stock', 'crypto', 'fiat']).toContain(item.type);
        expect(item).toHaveProperty('value');
        expect(item).toHaveProperty('percentage');
      });
    }
  });

  it('calculates total value correctly', async () => {
    const { result } = renderHook(() =>
      usePortfolio({
        assets: mockAssets,
        assetsMap: mockAssetsMap,
      })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    if (result.current.summary) {
      const calculatedTotal = result.current.enrichedPositions.reduce(
        (sum, pos) => sum + pos.value,
        0
      );
      expect(result.current.summary.totalValue).toBeCloseTo(calculatedTotal, 2);
    }
  });

  it('handles API error', async () => {
    server.use(
      http.get('/api/portfolios', () => {
        return HttpResponse.json({ message: 'Server error' }, { status: 500 });
      })
    );

    const { result } = renderHook(() =>
      usePortfolio({
        assets: mockAssets,
        assetsMap: mockAssetsMap,
      })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.portfolio).toBeNull();
  });

  it('provides refetch function', async () => {
    const { result } = renderHook(() =>
      usePortfolio({
        assets: mockAssets,
        assetsMap: mockAssetsMap,
      })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(typeof result.current.refetch).toBe('function');
  });

  it('refetches when refetch is called', async () => {
    const { result } = renderHook(() =>
      usePortfolio({
        assets: mockAssets,
        assetsMap: mockAssetsMap,
      })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const initialPortfolio = result.current.portfolio;

    await result.current.refetch();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.portfolio).toBeTruthy();
  });

  it('handles missing asset in assetsMap gracefully', async () => {
    const incompleteMap = new Map([['aapl', mockAssets[0]]]);

    const { result } = renderHook(() =>
      usePortfolio({
        assets: mockAssets,
        assetsMap: incompleteMap,
      })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.enrichedPositions.length).toBeGreaterThan(0);
  });

  it('returns null summary when no enriched positions', () => {
    const { result } = renderHook(() =>
      usePortfolio({
        assets: [],
        assetsMap: new Map(),
      })
    );

    expect(result.current.summary).toBeNull();
  });

  it('byAsset in summary matches individual positions', async () => {
    const { result } = renderHook(() =>
      usePortfolio({
        assets: mockAssets,
        assetsMap: mockAssetsMap,
      })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    if (result.current.summary) {
      expect(result.current.summary.byAsset.length).toBe(
        result.current.enrichedPositions.length
      );
    }
  });

  it('supports asOf parameter for historical portfolio', async () => {
    const { result } = renderHook(() =>
      usePortfolio({
        assets: mockAssets,
        assetsMap: mockAssetsMap,
        asOf: '2024-01-01',
      })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.portfolio).toBeTruthy();
  });
});
