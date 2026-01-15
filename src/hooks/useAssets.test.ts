import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAssets } from './useAssets';
import { server } from '../test/setup';
import { http, HttpResponse } from 'msw';

describe('useAssets', () => {
  it('returns initial loading state', () => {
    const { result } = renderHook(() => useAssets());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.assets).toEqual([]);
    expect(result.current.assetsMap.size).toBe(0);
    expect(result.current.error).toBeNull();
  });

  it('fetches assets successfully', async () => {
    const { result } = renderHook(() => useAssets());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.assets.length).toBeGreaterThan(0);
    expect(result.current.error).toBeNull();
  });

  it('creates assetsMap with correct structure', async () => {
    const { result } = renderHook(() => useAssets());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.assetsMap.size).toBe(result.current.assets.length);

    result.current.assets.forEach((asset) => {
      expect(result.current.assetsMap.get(asset.id)).toEqual(asset);
    });
  });

  it('handles API error', async () => {
    server.use(
      http.get('*/assets', () => {
        return HttpResponse.json({ message: 'Internal server error' }, { status: 500 });
      })
    );

    const { result } = renderHook(() => useAssets());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.assets).toEqual([]);
  });

  it('handles network error', async () => {
    server.use(
      http.get('*/assets', () => {
        return HttpResponse.error();
      })
    );

    const { result } = renderHook(() => useAssets());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
  });

  it('provides refetch function', async () => {
    const { result } = renderHook(() => useAssets());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(typeof result.current.refetch).toBe('function');
  });

  it('refetches data when refetch is called', async () => {
    const { result } = renderHook(() => useAssets());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const initialAssets = result.current.assets;

    await result.current.refetch();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.assets).toHaveLength(initialAssets.length);
  });

  it('sets loading state during refetch', async () => {
    const { result } = renderHook(() => useAssets());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const refetchPromise = result.current.refetch();

    await refetchPromise;

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.assets.length).toBeGreaterThan(0);
  });

  it('clears error on successful refetch after error', async () => {
    server.use(
      http.get('*/assets', () => {
        return HttpResponse.json({ message: 'Error' }, { status: 500 });
      })
    );

    const { result } = renderHook(() => useAssets());

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });

    server.resetHandlers();

    await result.current.refetch();

    await waitFor(() => {
      expect(result.current.error).toBeNull();
    });

    expect(result.current.assets.length).toBeGreaterThan(0);
  });

  it('assets have required properties', async () => {
    const { result } = renderHook(() => useAssets());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    result.current.assets.forEach((asset) => {
      expect(asset).toHaveProperty('id');
      expect(asset).toHaveProperty('name');
      expect(asset).toHaveProperty('type');
      expect(['stock', 'crypto', 'fiat']).toContain(asset.type);
    });
  });
});
