import { PrismaClient } from '@prisma/client';
import { Redis } from 'ioredis';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Redis client (optional - used for caching)
let redisClient: Redis | null = null;

export const connectRedis = async (): Promise<void> => {
  try {
    redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      maxRetriesPerRequest: 3,
    });

    // Test connection
    await redisClient.ping();
    console.log('✅ Redis connected successfully');
  } catch (error) {
    console.warn('⚠️  Redis connection failed, caching disabled:', error);
    redisClient = null; // Disable Redis if connection fails
  }
};

export const getRedis = (): Redis | null => {
  return redisClient;
};

// Proxy redis methods to avoid null errors
export const redis = {
  get: async (key: string): Promise<string | null> => {
    if (!redisClient) return null;
    return redisClient.get(key);
  },
  setex: async (key: string, ttl: number, value: string): Promise<boolean> => {
    if (!redisClient) return false;
    return redisClient.setex(key, ttl, value);
  },
  // Add other methods as needed (del, keys, etc.)
};

export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  await prisma.$disconnect();
  if (redisClient) {
    await redisClient.quit();
  }
};

export const enableShutdownHooks = (prismaClient: PrismaClient): void => {
  process.on('beforeExit', async () => {
    await prismaClient.$disconnect();
    if (redisClient) await redisClient.quit();
  });

  process.on('SIGINT', async () => {
    await prismaClient.$disconnect();
    if (redisClient) await redisClient.quit();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await prismaClient.$disconnect();
    if (redisClient) await redisClient.quit();
    process.exit(0);
  });
};

enableShutdownHooks(prisma);
