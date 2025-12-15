import { initContract } from '@ts-rest/core'
import { z } from 'zod'

const c = initContract()

const WatchlistSchema = z.array(
  z.object({
    ticker: z.string(),
    createdAt: z.string().datetime(),
  })
)

export const watchlistContract = c.router({
  // Get user's watchlist
  getWatchlist: {
    method: 'GET',
    path: '/watchlist',
    responses: {
      200: z.object({
        watchlist: WatchlistSchema,
      }),
      401: z.object({ error: z.string() }),
      500: z.object({ error: z.string() }),
    },
  },

  // Add ticker to watchlist
  addToWatchlist: {
    method: 'POST',
    path: '/watchlist',
    body: z.object({
      ticker: z.string().min(1),
    }),
    responses: {
      201: z.object({
        ticker: z.string(),
        createdAt: z.string().datetime(),
      }),
      400: z.object({ error: z.string() }),
      401: z.object({ error: z.string() }),
      409: z.object({ error: z.string() }),
      500: z.object({ error: z.string() }),
    },
  },

  // Remove ticker from watchlist
  removeFromWatchlist: {
    method: 'DELETE',
    path: '/watchlist/:ticker',
    responses: {
      200: z.object({
        message: z.string(),
      }),
      400: z.object({ error: z.string() }),
      401: z.object({ error: z.string() }),
      404: z.object({ error: z.string() }),
      500: z.object({ error: z.string() }),
    },
  },

  // Clear entire watchlist
  clearWatchlist: {
    method: 'DELETE',
    path: '/watchlist',
    responses: {
      200: z.object({
        message: z.string(),
      }),
      401: z.object({ error: z.string() }),
      500: z.object({ error: z.string() }),
    },
  },
})

export type WatchlistContract = typeof watchlistContract
