import { defineConfig } from '@prisma/client';

export const prismaConfig = defineConfig({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});
