import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

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
};

export const enableShutdownHooks = (prismaClient: PrismaClient): void => {
  process.on('beforeExit', async () => {
    await prismaClient.$disconnect();
  });

  process.on('SIGINT', async () => {
    await prismaClient.$disconnect();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await prismaClient.$disconnect();
    process.exit(0);
  });
};

enableShutdownHooks(prisma);
