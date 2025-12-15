import { Store } from '@tanstack/store';

interface WatchlistState {
  items: Set<string>;
  priority: 'high' | 'low';
}

// Initialize store with localStorage persistence
const getInitialWatchlist = (): Set<string> => {
  if (typeof window === 'undefined') return new Set();
  try {
    const saved = localStorage.getItem('watchlist');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  } catch {
    return new Set();
  }
};

export const watchlistStore = new Store<WatchlistState>({
  items: getInitialWatchlist(),
  priority: 'high',
});

// Subscribe to changes and persist to localStorage
watchlistStore.subscribe(
  () => {
    const state = watchlistStore.state;
    try {
      localStorage.setItem('watchlist', JSON.stringify(Array.from(state.items)));
    } catch (error) {
      console.error('Failed to save watchlist:', error);
    }
  }
);

// Helpers
export const watchlistHelpers = {
  add: (symbol: string) => {
    watchlistStore.setState((prev) => ({
      ...prev,
      items: new Set([...prev.items, symbol.toUpperCase()]),
    }));
  },

  remove: (symbol: string) => {
    watchlistStore.setState((prev) => {
      const next = new Set(prev.items);
      next.delete(symbol.toUpperCase());
      return { ...prev, items: next };
    });
  },

  has: (symbol: string): boolean => {
    const state = watchlistStore.state;
    return state.items.has(symbol.toUpperCase());
  },

  getAll: (): string[] => {
    return Array.from(watchlistStore.state.items);
  },

  clear: () => {
    watchlistStore.setState((prev) => ({
      ...prev,
      items: new Set(),
    }));
  },
};
