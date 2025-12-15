import axios from 'axios';
import { StockQuote, Stock } from '@stocks/contracts';
import { logger } from './logger';

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
const client = axios.create({
  baseURL: FINNHUB_BASE_URL,
});

function getApiToken() {
  const token = process.env.FINNHUB_API_KEY;
  if (!token) {
    logger.warn('⚠️  FINNHUB_API_KEY not set. API calls will fail.');
  }
  return token;
}

export const finnhubClient = {
  async getQuote(symbol: string): Promise<StockQuote> {
    try {
      const { data } = await client.get('/quote', {
        params: { token: getApiToken(), symbol: symbol.toUpperCase() },
      });
      return data;
    } catch (error) {
      logger.error(`Error fetching quote for ${symbol}:`);
      throw error;
    }
  },

  async searchStocks(query: string): Promise<Stock[]> {
    try {
      const { data } = await client.get('/search', {
        params: { token: getApiToken(), q: query },
      });
      return data.result || [];
    } catch (error) {
      logger.error(`Error searching stocks for "${query}":`, error);
      throw error;
    }
  },

  async getCompanyProfile(symbol: string) {
    try {
      const { data } = await client.get('/stock/profile2', {
        params: { token: getApiToken(), symbol: symbol.toUpperCase() },
      });
      return data;
    } catch (error) {
      logger.error(`Error fetching profile for ${symbol}:`);
      throw error;
    }
  },

  async getCandles(
    symbol: string,
    resolution: 'D' | 'W' | 'M' = 'D',
    count: number = 30
  ) {
    try {
      const { data } = await client.get('/stock/candle', {
        params: {
          token: getApiToken(),
          symbol: symbol.toUpperCase(),
          resolution,
          count,
        },
      });
      return data;
    } catch (error) {
      logger.error(`Error fetching candles for ${symbol}:`);
      throw error;
    }
  },
};
