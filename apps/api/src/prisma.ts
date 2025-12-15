import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // Reuse the Prisma Client in development
  const globalWithPrisma = global as unknown as { prisma: PrismaClient };
  if (!globalWithPrisma.prisma) {
    globalWithPrisma.prisma = new PrismaClient();
  }
  prisma = globalWithPrisma.prisma;
}

prisma.$connect().then(() => {
  logger.info('✅ Database connected');
}).catch((error: Error) => {
  logger.error('❌ Database connection failed:', error);
  process.exit(1);
});

export { prisma };
