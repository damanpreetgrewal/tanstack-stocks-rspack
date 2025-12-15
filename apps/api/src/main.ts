import './env';

import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createExpressEndpoints } from '@ts-rest/express';
import { stocksContract } from '@stocks/contracts';
import { stocksRouteHandlers } from './routes/stocks';
import { errorHandler } from './errors';
import { logger } from './logger';

const app: Express = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Trust proxy
app.set('trust proxy', 1);

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

// Health check
app.get('/health', (_, res) => {
  res.json({ status: 'ok' });
});

// API Routes
const apiRouter = express.Router();

createExpressEndpoints(
  stocksContract,
  {
    getQuote: stocksRouteHandlers.getQuote,
    searchStocks: stocksRouteHandlers.searchStocks,
    getPopular: stocksRouteHandlers.getPopular,
    getProfile: stocksRouteHandlers.getProfile,
    getHistorical: stocksRouteHandlers.getHistorical,
  },
  apiRouter
);

app.use('/api', apiRouter);

// 404 handler
app.use((_, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Error handler
app.use(errorHandler);

// Start server
const PORT_NUMBER = typeof PORT === 'string' ? Number.parseInt(PORT, 10) : PORT;

app.listen(PORT_NUMBER, () => {
  logger.info(`🚀 Server running on http://localhost:${PORT_NUMBER}`);
  logger.info(`📚 Stocks API endpoints available at /api`);
});
