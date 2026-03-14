let prisma: any;

async function getPrismaClient() {
  if (!prisma) {
    try {
      // Dynamic import to avoid issues with Prisma client generation
      const { PrismaClient } = await import('@prisma/client') as any;
      prisma = new PrismaClient();
    } catch (error) {
      console.error('Failed to import Prisma client:', error);
      throw error;
    }
  }
  return prisma;
}

export async function initializeDatabase(): Promise<void> {
  try {
    const client = await getPrismaClient();
    // Test connection
    await client.$connect();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Failed to connect to database:', error);
    throw error;
  }
}

export async function closeDatabase(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect();
  }
}

export async function getPrisma() {
  return getPrismaClient();
}
