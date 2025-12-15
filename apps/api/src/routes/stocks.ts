import { finnhubClient } from '../finnhub';
import { logger } from '../logger';
import { StockQuote, Stock } from '@stocks/contracts';

interface SymbolParams {
  symbol: string;
}

interface SearchQuery {
  q?: string;
  sortBy?: 'symbol' | 'name';
  sortOrder?: 'asc' | 'desc';
  page?: string | number;
}

interface PopularQuery {
  limit?: string;
}

interface HistoricalQuery {
  resolution?: string;
  count?: string;
}

const POPULAR_STOCKS = [
  'AAPL',
  'GOOGL',
  'MSFT',
  'AMZN',
  'TSLA',
  'META',
  'NVDA',
  'BA',
];

export const stocksRouteHandlers = {
  getQuote: async ({ params }: { params: SymbolParams }) => {
    const { symbol } = params;
    if (!symbol) {
      return { status: 400, body: { error: 'Symbol is required' } } as const;
    }

    if (!process.env.FINNHUB_API_KEY) {
      return {
        status: 500,
        body: { error: 'FINNHUB_API_KEY is not set. Configure it to enable market data.' },
      } as const;
    }

    try {
      const quote = await finnhubClient.getQuote(symbol);
      if (quote?.c == null) {
        return {
          status: 404,
          body: { error: `Quote not found for symbol: ${symbol}` },
        } as const;
      }

      return { status: 200, body: quote } as const;
    } catch (error) {
      logger.warn(`Failed to fetch quote for ${symbol}`);
      return {
        status: 500,
        body: { error: 'Upstream Finnhub request failed. Check FINNHUB_API_KEY and network access.' },
      } as const;
    }
  },

  searchStocks: async ({ query }: { query: SearchQuery }) => {
    const { q } = query;
    
    // If query is empty, return empty results instead of error
    if (!q || q.trim().length < 1) {
      return {
        status: 200 as const,
        body: {
          results: [] as Stock[],
          total: 0,
        },
      };
    }

    if (!process.env.FINNHUB_API_KEY) {
      return {
        status: 500 as const,
        body: { error: 'FINNHUB_API_KEY is not set. Configure it to enable market data.' },
      } as const;
    }

    try {
      const results = await finnhubClient.searchStocks(q);
      return {
        status: 200 as const,
        body: {
          results: [...results],
          total: results.length,
        },
      };
    } catch {
      return {
        status: 500 as const,
        body: { error: 'Upstream Finnhub request failed. Check FINNHUB_API_KEY and network access.' },
      } as const;
    }
  },

  getPopular: async ({ query }: { query: PopularQuery }) => {
    if (!process.env.FINNHUB_API_KEY) {
      logger.warn('FINNHUB_API_KEY is not set; returning empty popular stocks list');
      return { status: 200 as const, body: { stocks: [] } };
    }

    const parsedLimit = Number.parseInt(query.limit || '8', 10);
    const limit = Number.isFinite(parsedLimit) ? parsedLimit : 8;
    const safeLimit = Math.max(1, Math.min(POPULAR_STOCKS.length, limit));
    const symbols = POPULAR_STOCKS.slice(0, safeLimit);

    const quotes = await Promise.all(
      symbols.map(async (symbol) => {
        try {
          const quote = await finnhubClient.getQuote(symbol);
          return { symbol, quote };
        } catch (error) {
          logger.warn(`Failed to fetch quote for ${symbol}`);
          return null;
        }
      })
    );

    const stocks = quotes.filter(
      (item): item is { symbol: string; quote: StockQuote } => item !== null
    );

    return {
      status: 200 as const,
      body: { stocks },
    };
  },

  getProfile: async ({ params }: { params: SymbolParams }) => {
    const { symbol } = params;
    if (!symbol) {
      return { status: 400, body: { error: 'Symbol is required' } } as const;
    }

    if (!process.env.FINNHUB_API_KEY) {
      return {
        status: 500,
        body: { error: 'FINNHUB_API_KEY is not set. Configure it to enable market data.' },
      } as const;
    }

    try {
      const profile = await finnhubClient.getCompanyProfile(symbol);
      if (!profile?.ticker) {
        return {
          status: 404,
          body: { error: `Profile not found for symbol: ${symbol}` },
        } as const;
      }
      return { status: 200, body: profile } as const;
    } catch {
      return {
        status: 500,
        body: { error: 'Upstream Finnhub request failed. Check FINNHUB_API_KEY and network access.' },
      } as const;
    }
  },

  getHistorical: async ({ params, query }: { params: SymbolParams; query: HistoricalQuery }) => {
    const { symbol } = params;
    if (!symbol) {
      return { status: 400, body: { error: 'Symbol is required' } } as const;
    }

    if (!process.env.FINNHUB_API_KEY) {
      return {
        status: 500,
        body: { error: 'FINNHUB_API_KEY is not set. Configure it to enable market data.' },
      } as const;
    }

    const resolution = query.resolution || 'D';
    const parsedCount = Number.parseInt(query.count || '30', 10);
    const count = Number.isFinite(parsedCount) ? parsedCount : 30;

    try {
      const data = await finnhubClient.getCandles(
        symbol,
        resolution as 'D' | 'W' | 'M',
        count
      );

      if (!data?.c) {
        return {
          status: 404,
          body: { error: `Historical data not found for symbol: ${symbol}` },
        } as const;
      }

      return { status: 200, body: data } as const;
    } catch {
      return {
        status: 500,
        body: { error: 'Upstream Finnhub request failed. Check FINNHUB_API_KEY and network access.' },
      } as const;
    }
  },
};
