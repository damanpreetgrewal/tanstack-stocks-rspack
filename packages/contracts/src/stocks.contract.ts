import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import {
  StockSchema,
  StockQuoteSchema,
  CompanyProfileSchema,
} from './common';

const c = initContract();

export const stocksContract = c.router({
  // Get stock quote
  getQuote: {
    method: 'GET',
    path: '/stocks/:symbol/quote',
    responses: {
      200: StockQuoteSchema,
      400: z.object({ error: z.string() }),
      404: z.object({ error: z.string() }),
      500: z.object({ error: z.string() }),
    },
  },

  // Search stocks
  searchStocks: {
    method: 'GET',
    path: '/stocks/search',
    query: z.object({
      q: z.string().trim().default(''),
      sortBy: z.enum(['symbol', 'name']).default('symbol'),
      sortOrder: z.enum(['asc', 'desc']).default('asc'),
      page: z.coerce.number().int().min(1).default(1),
    }),
    responses: {
      200: z.object({
        results: z.array(StockSchema),
        total: z.number(),
      }),
      400: z.object({ error: z.string() }),
      500: z.object({ error: z.string() }),
    },
  },

  // Get popular stocks
  getPopular: {
    method: 'GET',
    path: '/stocks/popular',
    query: z.object({
      limit: z.string().default('8'),
    }),
    responses: {
      200: z.object({
        stocks: z.array(
          z.object({
            symbol: z.string(),
            quote: StockQuoteSchema,
          })
        ),
      }),
      500: z.object({ error: z.string() }),
    },
  },

  // Get company profile
  getProfile: {
    method: 'GET',
    path: '/stocks/:symbol/profile',
    responses: {
      200: CompanyProfileSchema,
      400: z.object({ error: z.string() }),
      404: z.object({ error: z.string() }),
      500: z.object({ error: z.string() }),
    },
  },

  // Get historical data
  getHistorical: {
    method: 'GET',
    path: '/stocks/:symbol/historical',
    query: z.object({
      resolution: z.enum(['D', 'W', 'M']).default('D'),
      count: z.string().default('30'),
    }),
    responses: {
      200: z.object({
        t: z.array(z.number()),
        o: z.array(z.number()),
        h: z.array(z.number()),
        l: z.array(z.number()),
        c: z.array(z.number()),
        v: z.array(z.number()),
      }),
      400: z.object({ error: z.string() }),
      404: z.object({ error: z.string() }),
      500: z.object({ error: z.string() }),
    },
  },
});

export type StocksContract = typeof stocksContract;
