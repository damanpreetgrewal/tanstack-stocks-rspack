import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { portfolioApiClient } from './api-client';
import { CreatePortfolio, UpdatePortfolio, AddTransaction } from '@stocks/contracts';
import { notify } from './notifications';

/**
 * Fetch all user portfolios
 */
export function usePortfolios(options = {}) {
  return useQuery({
    queryKey: ['portfolios'],
    queryFn: async () => {
      const response = await portfolioApiClient.getPortfolios();
      if (response.status !== 200) {
        throw new Error('Failed to fetch portfolios');
      }
      return response.body;
    },
    ...options,
  });
}

/**
 * Fetch single portfolio with metrics
 */
export function usePortfolio(id: string | undefined, options = {}) {
  return useQuery({
    queryKey: ['portfolio', id],
    queryFn: async () => {
      if (!id) throw new Error('Portfolio ID required');
      const response = await portfolioApiClient.getPortfolio({ params: { id } });
      if (response.status !== 200) {
        throw new Error('Failed to fetch portfolio');
      }
      return response.body;
    },
    enabled: !!id,
    ...options,
  });
}

/**
 * Fetch portfolio holdings with real-time prices
 */
export function usePortfolioHoldings(id: string | undefined, options = {}) {
  return useQuery({
    queryKey: ['portfolio', id, 'holdings'],
    queryFn: async () => {
      if (!id) throw new Error('Portfolio ID required');
      const response = await portfolioApiClient.getHoldings({ params: { id } });
      if (response.status !== 200) {
        throw new Error('Failed to fetch holdings');
      }
      return response.body;
    },
    enabled: !!id,
    refetchInterval: 10000, // 10 seconds for real-time updates
    ...options,
  });
}

/**
 * Fetch portfolio transactions
 */
export function usePortfolioTransactions(id: string | undefined, options = {}) {
  return useQuery({
    queryKey: ['portfolio', id, 'transactions'],
    queryFn: async () => {
      if (!id) throw new Error('Portfolio ID required');
      const response = await portfolioApiClient.getTransactions({ params: { id } });
      if (response.status !== 200) {
        throw new Error('Failed to fetch transactions');
      }
      return response.body;
    },
    enabled: !!id,
    ...options,
  });
}

/**
 * Fetch portfolio metrics
 */
export function usePortfolioMetrics(id: string | undefined, options = {}) {
  return useQuery({
    queryKey: ['portfolio', id, 'metrics'],
    queryFn: async () => {
      if (!id) throw new Error('Portfolio ID required');
      const response = await portfolioApiClient.getMetrics({ params: { id } });
      if (response.status !== 200) {
        throw new Error('Failed to fetch metrics');
      }
      return response.body;
    },
    enabled: !!id,
    refetchInterval: 10000, // 10 seconds for real-time updates
    ...options,
  });
}

/**
 * Create new portfolio mutation
 */
export function useCreatePortfolio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePortfolio) => {
      const response = await portfolioApiClient.createPortfolio({ body: data });
      if (response.status !== 201) {
        throw new Error('Failed to create portfolio');
      }
      return response.body;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
      notify.success('Portfolio created successfully');
    },
    onError: (error: Error) => {
      notify.error(error.message || 'Failed to create portfolio');
    },
  });
}

/**
 * Update portfolio mutation
 */
export function useUpdatePortfolio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdatePortfolio }) => {
      const response = await portfolioApiClient.updatePortfolio({
        params: { id },
        body: data,
      });
      if (response.status !== 200) {
        throw new Error('Failed to update portfolio');
      }
      return response.body;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio', variables.id] });
      notify.success('Portfolio updated successfully');
    },
    onError: (error: Error) => {
      notify.error(error.message || 'Failed to update portfolio');
    },
  });
}

/**
 * Delete portfolio mutation
 */
export function useDeletePortfolio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await portfolioApiClient.deletePortfolio({ params: { id } });
      if (response.status !== 200) {
        throw new Error('Failed to delete portfolio');
      }
      return response.body;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
      notify.success('Portfolio deleted successfully');
    },
    onError: (error: Error) => {
      notify.error(error.message || 'Failed to delete portfolio');
    },
  });
}

/**
 * Add transaction mutation
 */
export function useAddTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ portfolioId, data }: { portfolioId: string; data: AddTransaction }) => {
      const response = await portfolioApiClient.addTransaction({
        params: { id: portfolioId },
        body: data,
      });
      if (response.status !== 201) {
        throw new Error('Failed to add transaction');
      }
      return response.body;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['portfolio', variables.portfolioId] });
      queryClient.invalidateQueries({ queryKey: ['portfolio', variables.portfolioId, 'holdings'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio', variables.portfolioId, 'transactions'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio', variables.portfolioId, 'metrics'] });
      notify.success('Transaction added successfully');
    },
    onError: (error: Error) => {
      notify.error(error.message || 'Failed to add transaction');
    },
  });
}

/**
 * Delete transaction mutation
 */
export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ portfolioId, transactionId }: { portfolioId: string; transactionId: string }) => {
      const response = await portfolioApiClient.deleteTransaction({
        params: { id: portfolioId, transactionId },
      });
      if (response.status !== 200) {
        throw new Error('Failed to delete transaction');
      }
      return response.body;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['portfolio', variables.portfolioId] });
      queryClient.invalidateQueries({ queryKey: ['portfolio', variables.portfolioId, 'holdings'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio', variables.portfolioId, 'transactions'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio', variables.portfolioId, 'metrics'] });
      notify.success('Transaction deleted successfully');
    },
    onError: (error: Error) => {
      notify.error(error.message || 'Failed to delete transaction');
    },
  });
}
