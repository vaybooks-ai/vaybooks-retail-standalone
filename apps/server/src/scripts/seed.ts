import { PrismaClient } from '@prisma/client';
import { seedDatabase, resetDatabase } from '../seeds';

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  const shouldReset = args.includes('--reset');

  try {
    if (shouldReset) {
      await resetDatabase(prisma);
    }
    
    await seedDatabase(prisma);
    
    console.log('\n✨ Seed completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
