import { z } from 'zod';
export declare const StockSchema: z.ZodObject<{
    symbol: z.ZodString;
    description: z.ZodString;
    displaySymbol: z.ZodString;
    type: z.ZodString;
}, "strip", z.ZodTypeAny, {
    symbol: string;
    description: string;
    type: string;
    displaySymbol: string;
}, {
    symbol: string;
    description: string;
    type: string;
    displaySymbol: string;
}>;
export declare const StockQuoteSchema: z.ZodObject<{
    c: z.ZodNumber;
    h: z.ZodNumber;
    l: z.ZodNumber;
    o: z.ZodNumber;
    pc: z.ZodNumber;
    t: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    o: number;
    t: number;
    c: number;
    h: number;
    l: number;
    pc: number;
}, {
    o: number;
    t: number;
    c: number;
    h: number;
    l: number;
    pc: number;
}>;
export declare const CompanyProfileSchema: z.ZodObject<{
    country: z.ZodOptional<z.ZodString>;
    currency: z.ZodOptional<z.ZodString>;
    estimateRevenue: z.ZodOptional<z.ZodNumber>;
    finnhubIndustry: z.ZodOptional<z.ZodString>;
    ipo: z.ZodOptional<z.ZodString>;
    logo: z.ZodOptional<z.ZodString>;
    marketCapitalization: z.ZodOptional<z.ZodNumber>;
    name: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    shareOutstanding: z.ZodOptional<z.ZodNumber>;
    ticker: z.ZodString;
    weburl: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    ticker: string;
    country?: string | undefined;
    currency?: string | undefined;
    estimateRevenue?: number | undefined;
    finnhubIndustry?: string | undefined;
    ipo?: string | undefined;
    logo?: string | undefined;
    marketCapitalization?: number | undefined;
    phone?: string | undefined;
    shareOutstanding?: number | undefined;
    weburl?: string | undefined;
}, {
    name: string;
    ticker: string;
    country?: string | undefined;
    currency?: string | undefined;
    estimateRevenue?: number | undefined;
    finnhubIndustry?: string | undefined;
    ipo?: string | undefined;
    logo?: string | undefined;
    marketCapitalization?: number | undefined;
    phone?: string | undefined;
    shareOutstanding?: number | undefined;
    weburl?: string | undefined;
}>;
export type Stock = z.infer<typeof StockSchema>;
export type StockQuote = z.infer<typeof StockQuoteSchema>;
export type CompanyProfile = z.infer<typeof CompanyProfileSchema>;
