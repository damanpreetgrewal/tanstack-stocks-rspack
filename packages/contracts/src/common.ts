import { z } from 'zod';

// Common response wrapper
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.unknown().optional(),
});

// Pagination
export const PaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  total: z.number().int().min(0),
  pages: z.number().int().min(1),
});

// Stock base schema
export const StockSchema = z.object({
  symbol: z.string(),
  description: z.string(),
  displaySymbol: z.string(),
  type: z.string(),
});

// Stock quote schema
export const StockQuoteSchema = z.object({
  c: z.number().describe('Current price'),
  h: z.number().describe('High price'),
  l: z.number().describe('Low price'),
  o: z.number().describe('Open price'),
  pc: z.number().describe('Previous close'),
  t: z.number().describe('Timestamp'),
});

// Company profile schema
export const CompanyProfileSchema = z.object({
  country: z.string().optional(),
  currency: z.string().optional(),
  estimateRevenue: z.number().optional(),
  finnhubIndustry: z.string().optional(),
  ipo: z.string().optional(),
  logo: z.string().optional(),
  marketCapitalization: z.number().optional(),
  name: z.string(),
  phone: z.string().optional(),
  shareOutstanding: z.number().optional(),
  ticker: z.string(),
  weburl: z.string().optional(),
});

// Filter/sort schemas
export const StocksFilterSchema = z.object({
  search: z.string().optional().default(''),
  sortBy: z.enum(['symbol', 'price', 'change']).default('symbol'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export type Stock = z.infer<typeof StockSchema>;
export type StockQuote = z.infer<typeof StockQuoteSchema>;
export type CompanyProfile = z.infer<typeof CompanyProfileSchema>;
export type StocksFilter = z.infer<typeof StocksFilterSchema>;
