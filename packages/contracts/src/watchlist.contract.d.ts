import { z } from 'zod';
export declare const watchlistContract: {
    getWatchlist: {
        method: "GET";
        path: "/watchlist";
        responses: {
            200: z.ZodObject<{
                watchlist: z.ZodArray<z.ZodObject<{
                    ticker: z.ZodString;
                    createdAt: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    createdAt: string;
                    ticker: string;
                }, {
                    createdAt: string;
                    ticker: string;
                }>, "many">;
            }, "strip", z.ZodTypeAny, {
                watchlist: {
                    createdAt: string;
                    ticker: string;
                }[];
            }, {
                watchlist: {
                    createdAt: string;
                    ticker: string;
                }[];
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
    addToWatchlist: {
        method: "POST";
        body: z.ZodObject<{
            ticker: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            ticker: string;
        }, {
            ticker: string;
        }>;
        path: "/watchlist";
        responses: {
            201: z.ZodObject<{
                ticker: z.ZodString;
                createdAt: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                createdAt: string;
                ticker: string;
            }, {
                createdAt: string;
                ticker: string;
            }>;
            400: z.ZodObject<{
                error: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                error: string;
            }, {
                error: string;
            }>;
            409: z.ZodObject<{
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
    removeFromWatchlist: {
        method: "DELETE";
        path: "/watchlist/:ticker";
        responses: {
            200: z.ZodObject<{
                message: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                message: string;
            }, {
                message: string;
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
    clearWatchlist: {
        method: "DELETE";
        path: "/watchlist";
        responses: {
            200: z.ZodObject<{
                message: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                message: string;
            }, {
                message: string;
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
};
export type WatchlistContract = typeof watchlistContract;
