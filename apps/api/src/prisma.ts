import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

let prisma: PrismaClient;

const logQueries = process.env.PRISMA_LOG_QUERIES === 'true';

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    log: logQueries ? ['error', 'warn', 'query'] : ['error', 'warn'],
  });
} else {
  // Reuse the Prisma Client in development
  const globalWithPrisma = global as unknown as { prisma: PrismaClient };
  if (!globalWithPrisma.prisma) {
    globalWithPrisma.prisma = new PrismaClient({
      log: logQueries ? ['info', 'error', 'warn', 'query'] : ['info', 'error', 'warn'],
    });
  }
  prisma = globalWithPrisma.prisma;
}

prisma.$connect().then(() => {
  logger.info('✅ Database connected successfully');
}).catch((error: Error) => {
  logger.error('❌ Database connection failed:', {
    message: error.message,
    stack: error.stack,
    databaseUrl: process.env.DATABASE_URL ? '***REDACTED***' : 'NOT_SET',
  });
  process.exit(1);
});

export { prisma };
