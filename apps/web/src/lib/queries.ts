import { useQuery } from '@tanstack/react-query';
import { apiClient } from './api-client';

/**
 * Fetch stock quote with real-time updates
 */
export function useStockQuote(symbol: string | undefined, options = {}) {
  return useQuery({
    queryKey: ['stock', 'quote', symbol],
    queryFn: async () => {
      if (!symbol) throw new Error('Symbol required');
      const response = await apiClient.getQuote({ params: { symbol } });
      if (response.status !== 200) {
        throw new Error('Failed to fetch quote');
      }
      return response.body;
    },
    enabled: !!symbol,
    refetchInterval: 10000, // 10 seconds
    ...options,
  });
}

/**
 * Search stocks by query
 */
export function useSearchStocks(query: string, options = {}) {
  return useQuery({
    queryKey: ['stocks', 'search', query],
    queryFn: async () => {
      if (!query) return { results: [], total: 0 };
      const response = await apiClient.searchStocks({ query: { q: query } });
      if (response.status !== 200) {
        throw new Error('Failed to search stocks');
      }
      return response.body;
    },
    enabled: query.length > 0,
    staleTime: 30 * 1000, // 30 seconds
    ...options,
  });
}

/**
 * Fetch popular stocks for dashboard
 */
export function usePopularStocks(limit = 8, options = {}) {
  return useQuery({
    queryKey: ['stocks', 'popular', limit],
    queryFn: async () => {
      const response = await apiClient.getPopular({ query: { limit: limit.toString() } });
      if (response.status !== 200) {
        throw new Error('Failed to fetch popular stocks');
      }
      return response.body;
    },
    ...options,
  });
}

/**
 * Fetch company profile
 */
export function useCompanyProfile(symbol: string | undefined, options = {}) {
  return useQuery({
    queryKey: ['stock', 'profile', symbol],
    queryFn: async () => {
      if (!symbol) throw new Error('Symbol required');
      const response = await apiClient.getProfile({ params: { symbol } });
      if (response.status !== 200) {
        throw new Error('Failed to fetch profile');
      }
      return response.body;
    },
    enabled: !!symbol,
    staleTime: 60 * 60 * 1000, // 1 hour
    ...options,
  });
}

/**
 * Fetch historical candle data
 */
export function useHistoricalData(
  symbol: string | undefined,
  resolution: 'D' | 'W' | 'M' = 'D',
  count: number = 30,
  options = {}
) {
  return useQuery({
    queryKey: ['stock', 'historical', symbol, resolution, count],
    queryFn: async () => {
      if (!symbol) throw new Error('Symbol required');
      const response = await apiClient.getHistorical({
        params: { symbol },
        query: { resolution, count: count.toString() },
      });
      if (response.status !== 200) {
        throw new Error('Failed to fetch historical data');
      }
      return response.body;
    },
    enabled: !!symbol,
    staleTime: 60 * 60 * 1000, // 1 hour
    ...options,
  });
}
