import { Store } from '@tanstack/store';

interface PortfolioStoreState {
  activePortfolioId: string | null;
  isInitialized: boolean;
}

const STORAGE_KEY = 'portfolio_active_id';

// Load from localStorage
function loadFromStorage(): string | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored;
  } catch {
    return null;
  }
}

// Save to localStorage
function saveToStorage(portfolioId: string | null) {
  try {
    if (portfolioId) {
      localStorage.setItem(STORAGE_KEY, portfolioId);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

// Initialize store
export const portfolioStore = new Store<PortfolioStoreState>({
  activePortfolioId: loadFromStorage(),
  isInitialized: false,
});

// Subscribe to changes and persist
portfolioStore.subscribe(() => {
  saveToStorage(portfolioStore.state.activePortfolioId);
});

// Helpers
export const portfolioHelpers = {
  setActivePortfolio: (portfolioId: string | null) => {
    portfolioStore.setState((prev) => ({
      ...prev,
      activePortfolioId: portfolioId,
    }));
  },

  getActivePortfolio: (): string | null => {
    return portfolioStore.state.activePortfolioId;
  },

  clearActivePortfolio: () => {
    portfolioStore.setState((prev) => ({
      ...prev,
      activePortfolioId: null,
    }));
  },

  initialize: () => {
    if (!portfolioStore.state.isInitialized) {
      portfolioStore.setState((prev) => ({
        ...prev,
        isInitialized: true,
      }));
    }
  },

  isInitialized: (): boolean => portfolioStore.state.isInitialized,
};
