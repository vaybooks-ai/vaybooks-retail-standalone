import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

let prisma: PrismaClient | null = null;

/**
 * Setup test database
 */
export async function setupTestDatabase(): Promise<PrismaClient> {
  const testDbPath = path.join(__dirname, '../../../test.db');
  
  // Set test database URL
  process.env.DATABASE_URL = `file:${testDbPath}`;
  
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: `file:${testDbPath}`,
      },
    },
  });

  // Run migrations
  await prisma.$executeRawUnsafe('PRAGMA foreign_keys = ON');
  
  return prisma;
}

/**
 * Teardown test database
 */
export async function teardownTestDatabase(client: PrismaClient): Promise<void> {
  await client.$disconnect();
  
  // Clean up test database file
  const testDbPath = path.join(__dirname, '../../../test.db');
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }
}

/**
 * Reset database (clear all data)
 */
export async function resetDatabase(client: PrismaClient): Promise<void> {
  // Delete all data in reverse order of dependencies
  await client.customerCustomField.deleteMany({});
  await client.customerAddress.deleteMany({});
  await client.customer.deleteMany({});
  await client.masterData.deleteMany({});
  await client.user.deleteMany({});
}

/**
 * Get test database instance
 */
export function getTestDatabase(): PrismaClient {
  if (!prisma) {
    throw new Error('Test database not initialized. Call setupTestDatabase first.');
  }
  return prisma;
}
