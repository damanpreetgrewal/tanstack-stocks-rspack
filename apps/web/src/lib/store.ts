import { Store } from '@tanstack/store';
import { config } from './config';

interface WatchlistState {
  items: Set<string>;
  priority: 'high' | 'low';
  isLoading: boolean;
  isInitialized: boolean;
}

// Initialize store
export const watchlistStore = new Store<WatchlistState>({
  items: new Set(),
  priority: 'high',
  isLoading: false,
  isInitialized: false,
});

export const watchlistAPI = {
  async fetchWatchlist(): Promise<string[]> {
    try {
      const response = await fetch(`${config.apiUrl}/watchlist`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch watchlist');
      const data = await response.json();
      return data.watchlist.map((item: { ticker: string }) => item.ticker);
    } catch (error) {
      console.error('Error fetching watchlist:', error);
      return [];
    }
  },

  async addTicker(ticker: string): Promise<void> {
    try {
      const response = await fetch(`${config.apiUrl}/watchlist`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker: ticker.toUpperCase() }),
      });

      if (response.status === 409) {
        return;
      }

      if (!response.ok) throw new Error('Failed to add ticker');
    } catch (error) {
      console.error('Error adding ticker:', error);
      throw error;
    }
  },

  async removeTicker(ticker: string): Promise<void> {
    try {
      const response = await fetch(`${config.apiUrl}/watchlist/${ticker.toUpperCase()}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to remove ticker');
    } catch (error) {
      console.error('Error removing ticker:', error);
      throw error;
    }
  },

  async clearWatchlist(): Promise<void> {
    try {
      const response = await fetch(`${config.apiUrl}/watchlist`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to clear watchlist');
    } catch (error) {
      console.error('Error clearing watchlist:', error);
      throw error;
    }
  },
};

// Initialize watchlist from database
export const initializeWatchlist = async (): Promise<void> => {
  // Guard: Don't initialize if already initialized or loading
  if (watchlistStore.state.isInitialized || watchlistStore.state.isLoading) {
    return;
  }

  watchlistStore.setState((prev) => ({
    ...prev,
    isLoading: true,
  }));

  try {
    const tickers = await watchlistAPI.fetchWatchlist();
    watchlistStore.setState((prev) => ({
      ...prev,
      items: new Set(tickers),
      isLoading: false,
      isInitialized: true,
    }));
  } catch (error) {
    console.error('Failed to initialize watchlist:', error);
    watchlistStore.setState((prev) => ({
      ...prev,
      isLoading: false,
      isInitialized: true,
    }));
  }
};

// Helpers
export const watchlistHelpers = {
  add: async (symbol: string) => {
    const uppercased = symbol.toUpperCase();
    watchlistStore.setState((prev) => ({
      ...prev,
      items: new Set([...prev.items, uppercased]),
    }));

    try {
      await watchlistAPI.addTicker(uppercased);
    } catch (error) {
      watchlistStore.setState((prev) => {
        const next = new Set(prev.items);
        next.delete(uppercased);
        return { ...prev, items: next };
      });
      throw error;
    }
  },

  remove: async (symbol: string) => {
    const uppercased = symbol.toUpperCase();
    watchlistStore.setState((prev) => {
      const next = new Set(prev.items);
      next.delete(uppercased);
      return { ...prev, items: next };
    });

    try {
      await watchlistAPI.removeTicker(uppercased);
    } catch (error) {
      watchlistStore.setState((prev) => ({
        ...prev,
        items: new Set([...prev.items, uppercased]),
      }));
      throw error;
    }
  },

  has: (symbol: string): boolean => {
    const state = watchlistStore.state;
    return state.items.has(symbol.toUpperCase());
  },

  getAll: (): string[] => {
    return Array.from(watchlistStore.state.items);
  },

  clear: async () => {
    const backup = Array.from(watchlistStore.state.items);
    watchlistStore.setState((prev) => ({
      ...prev,
      items: new Set(),
    }));

    try {
      await watchlistAPI.clearWatchlist();
    } catch (error) {
      watchlistStore.setState((prev) => ({
        ...prev,
        items: new Set(backup),
      }));
      throw error;
    }
  },

  isLoading: (): boolean => watchlistStore.state.isLoading,
  isInitialized: (): boolean => watchlistStore.state.isInitialized,
};