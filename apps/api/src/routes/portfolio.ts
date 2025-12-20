import { prisma } from '../prisma';
import { logger } from '../logger';
import { AuthenticatedRequest } from '../middleware';
import { finnhubClient } from '../finnhub';
import {
  CreatePortfolio,
  UpdatePortfolio,
  AddTransaction,
  TransactionType,
} from '@stocks/contracts';

interface PortfolioParams {
  id?: string;
  transactionId?: string;
}

// Helper to calculate holdings from transactions
async function calculateHoldings(portfolioId: string) {
  const transactions = await prisma.transaction.findMany({
    where: { portfolioId },
    orderBy: { transactionDate: 'asc' },
  });

  const holdings = new Map<string, { quantity: number; totalCost: number }>();

  for (const tx of transactions) {
    const existing = holdings.get(tx.symbol) || { quantity: 0, totalCost: 0 };

    if (tx.type === 'BUY') {
      // Add to position
      holdings.set(tx.symbol, {
        quantity: existing.quantity + tx.quantity,
        totalCost: existing.totalCost + tx.quantity * tx.price + tx.commission,
      });
    } else if (tx.type === 'SELL') {
      // Reduce position
      const avgCost = existing.quantity > 0 ? existing.totalCost / existing.quantity : 0;
      const newQuantity = existing.quantity - tx.quantity;
      // When selling, reduce cost basis proportionally and subtract commission from remaining cost
      holdings.set(tx.symbol, {
        quantity: newQuantity,
        totalCost: Math.max(0, avgCost * newQuantity - tx.commission),
      });
    }
  }

  // Filter out zero or negative positions
  const activeHoldings = Array.from(holdings.entries())
    .filter(([, holding]) => holding.quantity > 0)
    .map(([symbol, holding]) => ({
      symbol,
      quantity: holding.quantity,
      averageCost: holding.totalCost / holding.quantity,
      totalCost: holding.totalCost,
    }));

  return activeHoldings;
}

// Helper to fetch current prices for holdings
async function enrichHoldingsWithPrices(
  holdings: Array<{ symbol: string; quantity: number; averageCost: number; totalCost: number }>,
  portfolioTotalValue: number
) {
  const enrichedHoldings = await Promise.all(
    holdings.map(async (holding) => {
      try {
        const quote = await finnhubClient.getQuote(holding.symbol);
        const currentPrice = quote.c;
        const currentValue = currentPrice * holding.quantity;
        const gainLoss = currentValue - holding.totalCost;
        const gainLossPercent = (gainLoss / holding.totalCost) * 100;
        const portfolioWeight =
          portfolioTotalValue > 0 ? (currentValue / portfolioTotalValue) * 100 : 0;

        return {
          symbol: holding.symbol,
          quantity: holding.quantity,
          averageCost: holding.averageCost,
          currentPrice,
          totalCost: holding.totalCost,
          currentValue,
          gainLoss,
          gainLossPercent,
          portfolioWeight,
        };
      } catch (error) {
        logger.error(`Error fetching price for ${holding.symbol}:`, error);
        // Return with zero current price on error
        return {
          symbol: holding.symbol,
          quantity: holding.quantity,
          averageCost: holding.averageCost,
          currentPrice: 0,
          totalCost: holding.totalCost,
          currentValue: 0,
          gainLoss: -holding.totalCost,
          gainLossPercent: -100,
          portfolioWeight: 0,
        };
      }
    })
  );

  return enrichedHoldings;
}

// Helper to calculate portfolio metrics
async function calculateMetrics(portfolioId: string) {
  const holdings = await calculateHoldings(portfolioId);

  if (holdings.length === 0) {
    return {
      totalValue: 0,
      totalCost: 0,
      totalGainLoss: 0,
      totalGainLossPercent: 0,
      dayChange: 0,
      dayChangePercent: 0,
    };
  }

  let totalValue = 0;
  let totalCost = 0;
  let totalDayChange = 0;

  for (const holding of holdings) {
    try {
      const quote = await finnhubClient.getQuote(holding.symbol);
      const currentPrice = quote.c;
      const previousClose = quote.pc;
      const currentValue = currentPrice * holding.quantity;
      const dayChange = (currentPrice - previousClose) * holding.quantity;

      totalValue += currentValue;
      totalCost += holding.totalCost;
      totalDayChange += dayChange;
    } catch (error) {
      logger.error(`Error fetching quote for ${holding.symbol}:`, error);
      totalCost += holding.totalCost;
    }
  }

  const totalGainLoss = totalValue - totalCost;
  const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;
  const previousTotalValue = totalValue - totalDayChange;
  const dayChangePercent = previousTotalValue > 0 ? (totalDayChange / previousTotalValue) * 100 : 0;

  return {
    totalValue,
    totalCost,
    totalGainLoss,
    totalGainLossPercent,
    dayChange: totalDayChange,
    dayChangePercent,
  };
}

export const portfolioRouteHandlers = {
  // Get all portfolios
  getPortfolios: async ({ req }: { req: AuthenticatedRequest }) => {
    const userId = req.user?.id;

    if (!userId) {
      return { status: 401, body: { error: 'Unauthorized - Please login' } } as const;
    }

    try {
      const portfolios = await prisma.portfolio.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      return {
        status: 200,
        body: {
          portfolios: portfolios.map((p) => ({
            id: p.id,
            userId: p.userId,
            name: p.name,
            description: p.description,
            isDefault: p.isDefault,
            createdAt: p.createdAt.toISOString(),
            updatedAt: p.updatedAt.toISOString(),
          })),
        },
      } as const;
    } catch (error) {
      logger.error('Error fetching portfolios:', error);
      return {
        status: 500,
        body: { error: 'Failed to fetch portfolios' },
      } as const;
    }
  },

  // Create portfolio
  createPortfolio: async ({
    req,
    body,
  }: {
    req: AuthenticatedRequest;
    body: CreatePortfolio;
  }) => {
    const userId = req.user?.id;

    if (!userId) {
      return { status: 401, body: { error: 'Unauthorized - Please login' } } as const;
    }

    try {
      // If this is set as default, unset other defaults
      if (body.isDefault) {
        await prisma.portfolio.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false },
        });
      }

      const portfolio = await prisma.portfolio.create({
        data: {
          userId,
          name: body.name,
          description: body.description || null,
          isDefault: body.isDefault,
        },
      });

      return {
        status: 201,
        body: {
          id: portfolio.id,
          userId: portfolio.userId,
          name: portfolio.name,
          description: portfolio.description,
          isDefault: portfolio.isDefault,
          createdAt: portfolio.createdAt.toISOString(),
          updatedAt: portfolio.updatedAt.toISOString(),
        },
      } as const;
    } catch (error) {
      logger.error('Error creating portfolio:', error);
      return {
        status: 500,
        body: { error: 'Failed to create portfolio' },
      } as const;
    }
  },

  // Get portfolio with metrics
  getPortfolio: async ({ req, params }: { req: AuthenticatedRequest; params: PortfolioParams }) => {
    const userId = req.user?.id;
    const { id } = params;

    if (!userId) {
      return { status: 401, body: { error: 'Unauthorized - Please login' } } as const;
    }

    if (!id) {
      return { status: 400, body: { error: 'Portfolio ID is required' } } as const;
    }

    try {
      const portfolio = await prisma.portfolio.findFirst({
        where: { id, userId },
      });

      if (!portfolio) {
        return {
          status: 404,
          body: { error: 'Portfolio not found' },
        } as const;
      }

      const metrics = await calculateMetrics(id);

      return {
        status: 200,
        body: {
          portfolio: {
            id: portfolio.id,
            userId: portfolio.userId,
            name: portfolio.name,
            description: portfolio.description,
            isDefault: portfolio.isDefault,
            createdAt: portfolio.createdAt.toISOString(),
            updatedAt: portfolio.updatedAt.toISOString(),
          },
          metrics,
        },
      } as const;
    } catch (error) {
      logger.error('Error fetching portfolio:', error);
      return {
        status: 500,
        body: { error: 'Failed to fetch portfolio' },
      } as const;
    }
  },

  // Update portfolio
  updatePortfolio: async ({
    req,
    params,
    body,
  }: {
    req: AuthenticatedRequest;
    params: PortfolioParams;
    body: UpdatePortfolio;
  }) => {
    const userId = req.user?.id;
    const { id } = params;

    if (!userId) {
      return { status: 401, body: { error: 'Unauthorized - Please login' } } as const;
    }

    if (!id) {
      return { status: 400, body: { error: 'Portfolio ID is required' } } as const;
    }

    try {
      const portfolio = await prisma.portfolio.findFirst({
        where: { id, userId },
      });

      if (!portfolio) {
        return {
          status: 404,
          body: { error: 'Portfolio not found' },
        } as const;
      }

      // If setting as default, unset other defaults
      if (body.isDefault) {
        await prisma.portfolio.updateMany({
          where: { userId, isDefault: true, id: { not: id } },
          data: { isDefault: false },
        });
      }

      const updated = await prisma.portfolio.update({
        where: { id },
        data: {
          name: body.name ?? portfolio.name,
          description: body.description !== undefined ? body.description : portfolio.description,
          isDefault: body.isDefault ?? portfolio.isDefault,
        },
      });

      return {
        status: 200,
        body: {
          id: updated.id,
          userId: updated.userId,
          name: updated.name,
          description: updated.description,
          isDefault: updated.isDefault,
          createdAt: updated.createdAt.toISOString(),
          updatedAt: updated.updatedAt.toISOString(),
        },
      } as const;
    } catch (error) {
      logger.error('Error updating portfolio:', error);
      return {
        status: 500,
        body: { error: 'Failed to update portfolio' },
      } as const;
    }
  },

  // Delete portfolio
  deletePortfolio: async ({ req, params }: { req: AuthenticatedRequest; params: PortfolioParams }) => {
    const userId = req.user?.id;
    const { id } = params;

    if (!userId) {
      return { status: 401, body: { error: 'Unauthorized - Please login' } } as const;
    }

    if (!id) {
      return { status: 400, body: { error: 'Portfolio ID is required' } } as const;
    }

    try {
      const portfolio = await prisma.portfolio.findFirst({
        where: { id, userId },
      });

      if (!portfolio) {
        return {
          status: 404,
          body: { error: 'Portfolio not found' },
        } as const;
      }

      await prisma.portfolio.delete({ where: { id } });

      // If deleted portfolio was default, set another as default
      if (portfolio.isDefault) {
        const nextPortfolio = await prisma.portfolio.findFirst({
          where: { userId },
          orderBy: { createdAt: 'asc' },
        });

        if (nextPortfolio) {
          await prisma.portfolio.update({
            where: { id: nextPortfolio.id },
            data: { isDefault: true },
          });
        }
      }

      return {
        status: 200,
        body: { message: 'Portfolio deleted successfully' },
      } as const;
    } catch (error) {
      logger.error('Error deleting portfolio:', error);
      return {
        status: 500,
        body: { error: 'Failed to delete portfolio' },
      } as const;
    }
  },

  // Add transaction
  addTransaction: async ({
    req,
    params,
    body,
  }: {
    req: AuthenticatedRequest;
    params: PortfolioParams;
    body: AddTransaction;
  }) => {
    const userId = req.user?.id;
    const { id } = params;

    if (!userId) {
      return { status: 401, body: { error: 'Unauthorized - Please login' } } as const;
    }

    if (!id) {
      return { status: 400, body: { error: 'Portfolio ID is required' } } as const;
    }

    try {
      const portfolio = await prisma.portfolio.findFirst({
        where: { id, userId },
      });

      if (!portfolio) {
        return {
          status: 404,
          body: { error: 'Portfolio not found' },
        } as const;
      }

      // Validate SELL transaction - check if user has enough shares
      if (body.type === 'SELL') {
        const holdings = await calculateHoldings(id);
        const holding = holdings.find((h) => h.symbol === body.symbol.toUpperCase());

        if (!holding || holding.quantity < body.quantity) {
          return {
            status: 400,
            body: {
              error: `Insufficient shares. You have ${holding?.quantity || 0} shares of ${body.symbol}`,
            },
          } as const;
        }
      }

      const transaction = await prisma.transaction.create({
        data: {
          portfolioId: id,
          symbol: body.symbol.toUpperCase(),
          type: body.type,
          quantity: body.quantity,
          price: body.price,
          commission: body.commission,
          notes: body.notes || null,
          transactionDate: new Date(body.transactionDate),
        },
      });

      return {
        status: 201,
        body: {
          id: transaction.id,
          portfolioId: transaction.portfolioId,
          symbol: transaction.symbol,
          type: transaction.type as TransactionType,
          quantity: transaction.quantity,
          price: transaction.price,
          commission: transaction.commission,
          notes: transaction.notes,
          transactionDate: transaction.transactionDate.toISOString(),
          createdAt: transaction.createdAt.toISOString(),
        },
      } as const;
    } catch (error) {
      logger.error('Error adding transaction:', error);
      return {
        status: 500,
        body: { error: 'Failed to add transaction' },
      } as const;
    }
  },

  // Get transactions
  getTransactions: async ({ req, params }: { req: AuthenticatedRequest; params: PortfolioParams }) => {
    const userId = req.user?.id;
    const { id } = params;

    if (!userId) {
      return { status: 401, body: { error: 'Unauthorized - Please login' } } as const;
    }

    if (!id) {
      return { status: 400, body: { error: 'Portfolio ID is required' } } as const;
    }

    try {
      const portfolio = await prisma.portfolio.findFirst({
        where: { id, userId },
      });

      if (!portfolio) {
        return {
          status: 404,
          body: { error: 'Portfolio not found' },
        } as const;
      }

      const transactions = await prisma.transaction.findMany({
        where: { portfolioId: id },
        orderBy: { transactionDate: 'desc' },
      });

      return {
        status: 200,
        body: {
          transactions: transactions.map((t) => ({
            id: t.id,
            portfolioId: t.portfolioId,
            symbol: t.symbol,
            type: t.type as TransactionType,
            quantity: t.quantity,
            price: t.price,
            commission: t.commission,
            notes: t.notes,
            transactionDate: t.transactionDate.toISOString(),
            createdAt: t.createdAt.toISOString(),
          })),
        },
      } as const;
    } catch (error) {
      logger.error('Error fetching transactions:', error);
      return {
        status: 500,
        body: { error: 'Failed to fetch transactions' },
      } as const;
    }
  },

  // Delete transaction
  deleteTransaction: async ({ req, params }: { req: AuthenticatedRequest; params: PortfolioParams }) => {
    const userId = req.user?.id;
    const { id, transactionId } = params;

    if (!userId) {
      return { status: 401, body: { error: 'Unauthorized - Please login' } } as const;
    }

    if (!id || !transactionId) {
      return { status: 400, body: { error: 'Portfolio ID and Transaction ID are required' } } as const;
    }

    try {
      const portfolio = await prisma.portfolio.findFirst({
        where: { id, userId },
      });

      if (!portfolio) {
        return {
          status: 404,
          body: { error: 'Portfolio not found' },
        } as const;
      }

      const transaction = await prisma.transaction.findFirst({
        where: { id: transactionId, portfolioId: id },
      });

      if (!transaction) {
        return {
          status: 404,
          body: { error: 'Transaction not found' },
        } as const;
      }

      await prisma.transaction.delete({ where: { id: transactionId } });

      return {
        status: 200,
        body: { message: 'Transaction deleted successfully' },
      } as const;
    } catch (error) {
      logger.error('Error deleting transaction:', error);
      return {
        status: 500,
        body: { error: 'Failed to delete transaction' },
      } as const;
    }
  },

  // Get holdings
  getHoldings: async ({ req, params }: { req: AuthenticatedRequest; params: PortfolioParams }) => {
    const userId = req.user?.id;
    const { id } = params;

    if (!userId) {
      return { status: 401, body: { error: 'Unauthorized - Please login' } } as const;
    }

    if (!id) {
      return { status: 400, body: { error: 'Portfolio ID is required' } } as const;
    }

    try {
      const portfolio = await prisma.portfolio.findFirst({
        where: { id, userId },
      });

      if (!portfolio) {
        return {
          status: 404,
          body: { error: 'Portfolio not found' },
        } as const;
      }

      const holdings = await calculateHoldings(id);

      // Calculate total value first for portfolio weights
      let totalValue = 0;
      for (const holding of holdings) {
        try {
          const quote = await finnhubClient.getQuote(holding.symbol);
          totalValue += quote.c * holding.quantity;
        } catch (error) {
          logger.error(`Error fetching price for ${holding.symbol}:`, error);
        }
      }

      const enrichedHoldings = await enrichHoldingsWithPrices(holdings, totalValue);

      return {
        status: 200,
        body: { holdings: enrichedHoldings },
      } as const;
    } catch (error) {
      logger.error('Error fetching holdings:', error);
      return {
        status: 500,
        body: { error: 'Failed to fetch holdings' },
      } as const;
    }
  },

  // Get metrics
  getMetrics: async ({ req, params }: { req: AuthenticatedRequest; params: PortfolioParams }) => {
    const userId = req.user?.id;
    const { id } = params;

    if (!userId) {
      return { status: 401, body: { error: 'Unauthorized - Please login' } } as const;
    }

    if (!id) {
      return { status: 400, body: { error: 'Portfolio ID is required' } } as const;
    }

    try {
      const portfolio = await prisma.portfolio.findFirst({
        where: { id, userId },
      });

      if (!portfolio) {
        return {
          status: 404,
          body: { error: 'Portfolio not found' },
        } as const;
      }

      const metrics = await calculateMetrics(id);

      return {
        status: 200,
        body: metrics,
      } as const;
    } catch (error) {
      logger.error('Error fetching metrics:', error);
      return {
        status: 500,
        body: { error: 'Failed to fetch metrics' },
      } as const;
    }
  },
};
