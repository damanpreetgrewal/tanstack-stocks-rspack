import { Store } from '@tanstack/store';

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

// Get user ID (you can replace this with actual auth logic)
const getUserId = (): string => {
  if (typeof window === 'undefined') return '';
  // Use a persistent user ID from localStorage or generate one
  let userId = localStorage.getItem('userId');
  if (!userId) {
    userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('userId', userId);
  }
  return userId;
};

// API client for watchlist
const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:3000/api';

export const watchlistAPI = {
  async fetchWatchlist(): Promise<string[]> {
    const userId = getUserId();
    if (!userId) throw new Error('No user ID available');

    try {
      const response = await fetch(`${API_URL}/watchlist/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch watchlist');
      const data = await response.json();
      return data.watchlist.map((item: { ticker: string }) => item.ticker);
    } catch (error) {
      console.error('Error fetching watchlist:', error);
      // Fallback to localStorage for offline mode
      const saved = localStorage.getItem('watchlist_backup');
      return saved ? JSON.parse(saved) : [];
    }
  },

  async addTicker(ticker: string): Promise<void> {
    const userId = getUserId();
    if (!userId) throw new Error('No user ID available');

    try {
      const response = await fetch(`${API_URL}/watchlist/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker: ticker.toUpperCase() }),
      });

      if (response.status === 409) {
        // Already in watchlist, silently handle
        return;
      }

      if (!response.ok) throw new Error('Failed to add ticker');
    } catch (error) {
      console.error('Error adding ticker:', error);
      throw error;
    }
  },

  async removeTicker(ticker: string): Promise<void> {
    const userId = getUserId();
    if (!userId) throw new Error('No user ID available');

    try {
      const response = await fetch(`${API_URL}/watchlist/${userId}/${ticker.toUpperCase()}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to remove ticker');
    } catch (error) {
      console.error('Error removing ticker:', error);
      throw error;
    }
  },

  async clearWatchlist(): Promise<void> {
    const userId = getUserId();
    if (!userId) throw new Error('No user ID available');

    try {
      const response = await fetch(`${API_URL}/watchlist/${userId}`, {
        method: 'DELETE',
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
    // Save as backup
    localStorage.setItem('watchlist_backup', JSON.stringify(tickers));
  } catch (error) {
    console.error('Failed to initialize watchlist:', error);
    // Try to restore from backup
    const backup = localStorage.getItem('watchlist_backup');
    if (backup) {
      const tickers = JSON.parse(backup);
      watchlistStore.setState((prev) => ({
        ...prev,
        items: new Set(tickers),
        isLoading: false,
        isInitialized: true,
      }));
    } else {
      watchlistStore.setState((prev) => ({
        ...prev,
        isLoading: false,
        isInitialized: true,
      }));
    }
  }
};

// Helpers
export const watchlistHelpers = {
  add: async (symbol: string) => {
    const uppercased = symbol.toUpperCase();
    // Optimistic update
    watchlistStore.setState((prev) => ({
      ...prev,
      items: new Set([...prev.items, uppercased]),
    }));

    try {
      await watchlistAPI.addTicker(uppercased);
    } catch (error) {
      // Rollback on error
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
    // Optimistic update
    watchlistStore.setState((prev) => {
      const next = new Set(prev.items);
      next.delete(uppercased);
      return { ...prev, items: next };
    });

    try {
      await watchlistAPI.removeTicker(uppercased);
    } catch (error) {
      // Rollback on error
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
    // Optimistic update
    watchlistStore.setState((prev) => ({
      ...prev,
      items: new Set(),
    }));

    try {
      await watchlistAPI.clearWatchlist();
    } catch (error) {
      // Rollback on error
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
