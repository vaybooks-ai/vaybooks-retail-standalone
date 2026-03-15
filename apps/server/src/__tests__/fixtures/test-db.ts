import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';

let prisma: PrismaClient | null = null;

/**
 * Setup test database
 */
export async function setupTestDatabase(): Promise<PrismaClient> {
  const testDbPath = path.join(__dirname, '../../../test.db');
  
  // Delete existing test database
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }
  
  // Set test database URL
  process.env.DATABASE_URL = `file:${testDbPath}`;
  
  // Push schema to test database using Prisma CLI
  try {
    execSync('pnpm prisma db push --skip-generate', {
      cwd: path.join(__dirname, '../../..'),
      stdio: 'ignore',
      env: { ...process.env, DATABASE_URL: `file:${testDbPath}` },
    });
  } catch (error) {
    console.error('Failed to push schema to test database:', error);
  }
  
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: `file:${testDbPath}`,
      },
    },
  });

  // Enable foreign keys
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
    try {
      // Wait a bit for file handles to be released on Windows
      await new Promise(resolve => setTimeout(resolve, 100));
      fs.unlinkSync(testDbPath);
    } catch (error) {
      // Ignore file deletion errors in teardown - file may still be locked
      // The file will be deleted on next test run anyway
    }
  }
}

/**
 * Reset database (clear all data)
 */
export async function resetDatabase(client: PrismaClient): Promise<void> {
  // Delete all data in reverse order of dependencies
  // Try to delete from each table, ignore errors if table doesn't exist
  try {
    await client.customerCustomField.deleteMany({});
  } catch (error) {
    // Table might not exist yet, ignore
  }
  try {
    await client.customerAddress.deleteMany({});
  } catch (error) {
    // Table might not exist yet, ignore
  }
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
