import { PrismaClient } from '@prisma/client';
import { config } from '../config';

// Global prisma instance
declare global {
  var prisma: PrismaClient | undefined;
}

// Create Prisma client instance
export const prisma = globalThis.prisma || new PrismaClient({
  log: config.nodeEnv === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Prevent multiple instances in development
if (config.nodeEnv === 'development') {
  globalThis.prisma = prisma;
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

// Database connection test
export const testDatabaseConnection = async (): Promise<boolean> => {
  try {
    await prisma.$connect();
    return true;
  } catch (error) {
    return false;
  }
}; 