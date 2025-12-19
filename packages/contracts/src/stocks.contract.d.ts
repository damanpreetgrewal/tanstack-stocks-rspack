import { z } from 'zod';
export declare const stocksContract: {
    getQuote: {
        method: "GET";
        path: "/stocks/:symbol/quote";
        responses: {
            200: z.ZodObject<{
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
            400: z.ZodObject<{
                error: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                error: string;
            }, {
                error: string;
            }>;
            404: z.ZodObject<{
                error: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                error: string;
            }, {
                error: string;
            }>;
            500: z.ZodObject<{
                error: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                error: string;
            }, {
                error: string;
            }>;
        };
    };
    searchStocks: {
        method: "GET";
        query: z.ZodObject<{
            q: z.ZodDefault<z.ZodString>;
            sortBy: z.ZodDefault<z.ZodEnum<["symbol", "name"]>>;
            sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
            page: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            q: string;
            sortBy: "symbol" | "name";
            sortOrder: "asc" | "desc";
            page: number;
        }, {
            q?: string | undefined;
            sortBy?: "symbol" | "name" | undefined;
            sortOrder?: "asc" | "desc" | undefined;
            page?: number | undefined;
        }>;
        path: "/stocks/search";
        responses: {
            200: z.ZodObject<{
                results: z.ZodArray<z.ZodObject<{
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
                }>, "many">;
                total: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                results: {
                    symbol: string;
                    description: string;
                    type: string;
                    displaySymbol: string;
                }[];
                total: number;
            }, {
                results: {
                    symbol: string;
                    description: string;
                    type: string;
                    displaySymbol: string;
                }[];
                total: number;
            }>;
            400: z.ZodObject<{
                error: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                error: string;
            }, {
                error: string;
            }>;
            500: z.ZodObject<{
                error: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                error: string;
            }, {
                error: string;
            }>;
        };
    };
    getPopular: {
        method: "GET";
        query: z.ZodObject<{
            limit: z.ZodDefault<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            limit: string;
        }, {
            limit?: string | undefined;
        }>;
        path: "/stocks/popular";
        responses: {
            200: z.ZodObject<{
                stocks: z.ZodArray<z.ZodObject<{
                    symbol: z.ZodString;
                    quote: z.ZodObject<{
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
                }, "strip", z.ZodTypeAny, {
                    symbol: string;
                    quote: {
                        o: number;
                        t: number;
                        c: number;
                        h: number;
                        l: number;
                        pc: number;
                    };
                }, {
                    symbol: string;
                    quote: {
                        o: number;
                        t: number;
                        c: number;
                        h: number;
                        l: number;
                        pc: number;
                    };
                }>, "many">;
            }, "strip", z.ZodTypeAny, {
                stocks: {
                    symbol: string;
                    quote: {
                        o: number;
                        t: number;
                        c: number;
                        h: number;
                        l: number;
                        pc: number;
                    };
                }[];
            }, {
                stocks: {
                    symbol: string;
                    quote: {
                        o: number;
                        t: number;
                        c: number;
                        h: number;
                        l: number;
                        pc: number;
                    };
                }[];
            }>;
            500: z.ZodObject<{
                error: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                error: string;
            }, {
                error: string;
            }>;
        };
    };
    getProfile: {
        method: "GET";
        path: "/stocks/:symbol/profile";
        responses: {
            200: z.ZodObject<{
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
            400: z.ZodObject<{
                error: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                error: string;
            }, {
                error: string;
            }>;
            404: z.ZodObject<{
                error: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                error: string;
            }, {
                error: string;
            }>;
            500: z.ZodObject<{
                error: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                error: string;
            }, {
                error: string;
            }>;
        };
    };
    getHistorical: {
        method: "GET";
        query: z.ZodObject<{
            resolution: z.ZodDefault<z.ZodEnum<["D", "W", "M"]>>;
            count: z.ZodDefault<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            resolution: "D" | "W" | "M";
            count: string;
        }, {
            resolution?: "D" | "W" | "M" | undefined;
            count?: string | undefined;
        }>;
        path: "/stocks/:symbol/historical";
        responses: {
            200: z.ZodObject<{
                t: z.ZodArray<z.ZodNumber, "many">;
                o: z.ZodArray<z.ZodNumber, "many">;
                h: z.ZodArray<z.ZodNumber, "many">;
                l: z.ZodArray<z.ZodNumber, "many">;
                c: z.ZodArray<z.ZodNumber, "many">;
                v: z.ZodArray<z.ZodNumber, "many">;
            }, "strip", z.ZodTypeAny, {
                o: number[];
                v: number[];
                t: number[];
                c: number[];
                h: number[];
                l: number[];
            }, {
                o: number[];
                v: number[];
                t: number[];
                c: number[];
                h: number[];
                l: number[];
            }>;
            400: z.ZodObject<{
                error: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                error: string;
            }, {
                error: string;
            }>;
            404: z.ZodObject<{
                error: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                error: string;
            }, {
                error: string;
            }>;
            500: z.ZodObject<{
                error: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                error: string;
            }, {
                error: string;
            }>;
        };
    };
};
export type StocksContract = typeof stocksContract;
