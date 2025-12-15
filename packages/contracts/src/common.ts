import { z } from 'zod'

// Stock base schema
export const StockSchema = z.object({
  symbol: z.string(),
  description: z.string(),
  displaySymbol: z.string(),
  type: z.string(),
})

// Stock quote schema
export const StockQuoteSchema = z.object({
  c: z.number().describe('Current price'),
  h: z.number().describe('High price'),
  l: z.number().describe('Low price'),
  o: z.number().describe('Open price'),
  pc: z.number().describe('Previous close'),
  t: z.number().describe('Timestamp'),
})

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
})

export type Stock = z.infer<typeof StockSchema>;
export type StockQuote = z.infer<typeof StockQuoteSchema>;
export type CompanyProfile = z.infer<typeof CompanyProfileSchema>;
