import type { Asset, Portfolio, Price, ApiError } from './types';

const API_BASE_URL = '/api';

class ApiClient {
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error: ApiError = {
        message: `Request failed: ${response.statusText}`,
        status: response.status,
      };
      throw error;
    }

    return response.json();
  }

  async getAssets(): Promise<Asset[]> {
    return this.request<Asset[]>('/assets');
  }

  async getPrices(params?: {
    asset?: string;
    assets?: string;
    asOf?: string;
    from?: string;
    to?: string;
  }): Promise<Price[]> {
    const searchParams = new URLSearchParams();

    if (params?.assets) {
      searchParams.set('assets', params.assets);
    } else if (params?.asset) {
      searchParams.set('asset', params.asset);
    }
    if (params?.asOf) {
      searchParams.set('asOf', params.asOf);
    }
    if (params?.from) {
      searchParams.set('from', params.from);
    }
    if (params?.to) {
      searchParams.set('to', params.to);
    }

    const query = searchParams.toString();
    return this.request<Price[]>(`/prices${query ? `?${query}` : ''}`);
  }

  async getPortfolio(asOf?: string): Promise<Portfolio> {
    const query = asOf ? `?asOf=${asOf}` : '';
    return this.request<Portfolio>(`/portfolios${query}`);
  }
}

export const apiClient = new ApiClient();
