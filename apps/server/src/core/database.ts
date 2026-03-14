import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export async function initializeDatabase(): Promise<void> {
  try {
    // Test connection
    await prisma.$connect();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Failed to connect to database:', error);
    throw error;
  }
}

export async function closeDatabase(): Promise<void> {
  await prisma.$disconnect();
}
