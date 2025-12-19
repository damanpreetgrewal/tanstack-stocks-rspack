import { prisma } from '../prisma';
import { logger } from '../logger';
import { AuthenticatedRequest } from '../middleware';

interface WatchlistParams {
  ticker?: string;
}

interface AddToWatchlistBody {
  ticker: string;
}

export const watchlistRouteHandlers = {
  getWatchlist: async ({ req }: { req: AuthenticatedRequest }) => {
    const userId = req.user?.id;

    if (!userId) {
      return { status: 401, body: { error: 'Unauthorized - Please login' } } as const;
    }

    try {
      const watchlistItems = await prisma.watchlist.findMany({
        where: { userId },
        select: {
          ticker: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return {
        status: 200,
        body: {
          watchlist: watchlistItems.map(item => ({
            ticker: item.ticker,
            createdAt: item.createdAt.toISOString(),
          })),
        },
      } as const;
    } catch (error) {
      logger.error('Error fetching watchlist:', error);
      return {
        status: 500,
        body: { error: 'Failed to fetch watchlist' },
      } as const;
    }
  },

  addToWatchlist: async ({
    req,
    body,
  }: {
    body: AddToWatchlistBody;
    req: AuthenticatedRequest;
  }) => {
    const userId = req.user?.id;
    const { ticker } = body;

    if (!userId) {
      return { status: 401, body: { error: 'Unauthorized - Please login' } } as const;
    }

    if (!ticker || ticker.trim() === '') {
      return { status: 400, body: { error: 'Ticker is required' } } as const;
    }

    try {
      // Check if ticker already exists in watchlist
      const existing = await prisma.watchlist.findUnique({
        where: {
          userId_ticker: {
            userId,
            ticker: ticker.toUpperCase(),
          },
        },
      });

      if (existing) {
        return {
          status: 409,
          body: { error: 'Ticker already in watchlist' },
        } as const;
      }

      const watchlistItem = await prisma.watchlist.create({
        data: {
          userId,
          ticker: ticker.toUpperCase(),
        },
        select: {
          ticker: true,
          createdAt: true,
        },
      });

      return {
        status: 201,
        body: {
          ticker: watchlistItem.ticker,
          createdAt: watchlistItem.createdAt.toISOString(),
        },
      } as const;
    } catch (error) {
      logger.error('Error adding to watchlist:', error);
      return {
        status: 500,
        body: { error: 'Failed to add to watchlist' },
      } as const;
    }
  },

  removeFromWatchlist: async ({ params, req }: { params: WatchlistParams; req: AuthenticatedRequest }) => {
    const userId = req.user?.id;
    const { ticker } = params;

    if (!userId) {
      return { status: 401, body: { error: 'Unauthorized - Please login' } } as const;
    }

    if (!ticker) {
      return { status: 400, body: { error: 'Ticker is required' } } as const;
    }

    try {
      const watchlistItem = await prisma.watchlist.findUnique({
        where: {
          userId_ticker: {
            userId,
            ticker: ticker.toUpperCase(),
          },
        },
      });

      if (!watchlistItem) {
        return {
          status: 404,
          body: { error: 'Ticker not found in watchlist' },
        } as const;
      }

      await prisma.watchlist.delete({
        where: {
          id: watchlistItem.id,
        },
      });

      return {
        status: 200,
        body: { message: 'Ticker removed from watchlist' },
      } as const;
    } catch (error) {
      logger.error('Error removing from watchlist:', error);
      return {
        status: 500,
        body: { error: 'Failed to remove from watchlist' },
      } as const;
    }
  },

  clearWatchlist: async ({ req }: { req: AuthenticatedRequest }) => {
    const userId = req.user?.id;

    if (!userId) {
      return { status: 401, body: { error: 'Unauthorized - Please login' } } as const;
    }

    try {
      await prisma.watchlist.deleteMany({
        where: { userId },
      });

      return {
        status: 200,
        body: { message: 'Watchlist cleared' },
      } as const;
    } catch (error) {
      logger.error('Error clearing watchlist:', error);
      return {
        status: 500,
        body: { error: 'Failed to clear watchlist' },
      } as const;
    }
  },
};
