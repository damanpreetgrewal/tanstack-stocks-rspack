import { initContract } from '@ts-rest/core';
import { z } from 'zod';

const c = initContract();

// Transaction type enum
export const TransactionTypeSchema = z.enum(['BUY', 'SELL']);

// Base schemas
export const PortfolioSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  isDefault: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const TransactionSchema = z.object({
  id: z.string(),
  portfolioId: z.string(),
  symbol: z.string(),
  type: TransactionTypeSchema,
  quantity: z.number(),
  price: z.number(),
  commission: z.number(),
  notes: z.string().nullable(),
  transactionDate: z.string().datetime(),
  createdAt: z.string().datetime(),
});

// Holdings schema
export const HoldingSchema = z.object({
  symbol: z.string(),
  quantity: z.number(),
  averageCost: z.number(),
  currentPrice: z.number(),
  totalCost: z.number(),
  currentValue: z.number(),
  gainLoss: z.number(),
  gainLossPercent: z.number(),
  portfolioWeight: z.number(),
});

// Metrics schema
export const PortfolioMetricsSchema = z.object({
  totalValue: z.number(),
  totalCost: z.number(),
  totalGainLoss: z.number(),
  totalGainLossPercent: z.number(),
  dayChange: z.number(),
  dayChangePercent: z.number(),
});

// Input schemas
const CreatePortfolioSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  isDefault: z.boolean().default(false),
});

const UpdatePortfolioSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  isDefault: z.boolean().optional(),
});

const AddTransactionSchema = z.object({
  symbol: z.string().min(1).toUpperCase(),
  type: TransactionTypeSchema,
  quantity: z.number().positive(),
  price: z.number().positive(),
  commission: z.number().min(0).default(0),
  notes: z.string().max(500).optional(),
  transactionDate: z.string().datetime(),
});

export const portfolioContract = c.router({
  // Get all user portfolios
  getPortfolios: {
    method: 'GET',
    path: '/portfolios',
    responses: {
      200: z.object({
        portfolios: z.array(PortfolioSchema),
      }),
      401: z.object({ error: z.string() }),
      500: z.object({ error: z.string() }),
    },
  },

  // Create new portfolio
  createPortfolio: {
    method: 'POST',
    path: '/portfolios',
    body: CreatePortfolioSchema,
    responses: {
      201: PortfolioSchema,
      400: z.object({ error: z.string() }),
      401: z.object({ error: z.string() }),
      500: z.object({ error: z.string() }),
    },
  },

  // Get portfolio details with metrics
  getPortfolio: {
    method: 'GET',
    path: '/portfolios/:id',
    responses: {
      200: z.object({
        portfolio: PortfolioSchema,
        metrics: PortfolioMetricsSchema,
      }),
      400: z.object({ error: z.string() }),
      401: z.object({ error: z.string() }),
      404: z.object({ error: z.string() }),
      500: z.object({ error: z.string() }),
    },
  },

  // Update portfolio
  updatePortfolio: {
    method: 'PUT',
    path: '/portfolios/:id',
    body: UpdatePortfolioSchema,
    responses: {
      200: PortfolioSchema,
      400: z.object({ error: z.string() }),
      401: z.object({ error: z.string() }),
      404: z.object({ error: z.string() }),
      500: z.object({ error: z.string() }),
    },
  },

  // Delete portfolio
  deletePortfolio: {
    method: 'DELETE',
    path: '/portfolios/:id',
    responses: {
      200: z.object({ message: z.string() }),
      400: z.object({ error: z.string() }),
      401: z.object({ error: z.string() }),
      404: z.object({ error: z.string() }),
      500: z.object({ error: z.string() }),
    },
  },

  // Add transaction
  addTransaction: {
    method: 'POST',
    path: '/portfolios/:id/transactions',
    body: AddTransactionSchema,
    responses: {
      201: TransactionSchema,
      400: z.object({ error: z.string() }),
      401: z.object({ error: z.string() }),
      404: z.object({ error: z.string() }),
      500: z.object({ error: z.string() }),
    },
  },

  // Get all transactions for portfolio
  getTransactions: {
    method: 'GET',
    path: '/portfolios/:id/transactions',
    responses: {
      200: z.object({
        transactions: z.array(TransactionSchema),
      }),
      400: z.object({ error: z.string() }),
      401: z.object({ error: z.string() }),
      404: z.object({ error: z.string() }),
      500: z.object({ error: z.string() }),
    },
  },

  // Delete transaction
  deleteTransaction: {
    method: 'DELETE',
    path: '/portfolios/:id/transactions/:transactionId',
    responses: {
      200: z.object({ message: z.string() }),
      400: z.object({ error: z.string() }),
      401: z.object({ error: z.string() }),
      404: z.object({ error: z.string() }),
      500: z.object({ error: z.string() }),
    },
  },

  // Get current holdings
  getHoldings: {
    method: 'GET',
    path: '/portfolios/:id/holdings',
    responses: {
      200: z.object({
        holdings: z.array(HoldingSchema),
      }),
      400: z.object({ error: z.string() }),
      401: z.object({ error: z.string() }),
      404: z.object({ error: z.string() }),
      500: z.object({ error: z.string() }),
    },
  },

  // Get portfolio metrics
  getMetrics: {
    method: 'GET',
    path: '/portfolios/:id/metrics',
    responses: {
      200: PortfolioMetricsSchema,
      400: z.object({ error: z.string() }),
      401: z.object({ error: z.string() }),
      404: z.object({ error: z.string() }),
      500: z.object({ error: z.string() }),
    },
  },
});

export type PortfolioContract = typeof portfolioContract;
export type Portfolio = z.infer<typeof PortfolioSchema>;
export type Transaction = z.infer<typeof TransactionSchema>;
export type Holding = z.infer<typeof HoldingSchema>;
export type PortfolioMetrics = z.infer<typeof PortfolioMetricsSchema>;
export type TransactionType = z.infer<typeof TransactionTypeSchema>;
export type CreatePortfolio = z.infer<typeof CreatePortfolioSchema>;
export type UpdatePortfolio = z.infer<typeof UpdatePortfolioSchema>;
export type AddTransaction = z.infer<typeof AddTransactionSchema>;
