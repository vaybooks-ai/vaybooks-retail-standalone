import { PrismaClient } from '@prisma/client';
import { seedMasterData } from './master-data.seed';
import { seedCustomers } from './customers.seed';
import { seedAddresses } from './addresses.seed';

/**
 * Main seed function that orchestrates all seeding operations
 */
export async function seedDatabase(prisma: PrismaClient): Promise<void> {
  console.log('🌱 Starting database seed...');
  
  try {
    console.log('📋 Seeding master data...');
    await seedMasterData(prisma);
    
    console.log('👥 Seeding customers...');
    await seedCustomers(prisma);
    
    console.log('📍 Seeding addresses...');
    await seedAddresses(prisma);
    
    console.log('✅ Database seed completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

/**
 * Reset database by deleting all data in reverse order of dependencies
 */
export async function resetDatabase(prisma: PrismaClient): Promise<void> {
  console.log('🔄 Resetting database...');
  
  try {
    // Delete in reverse order of dependencies
    console.log('  🗑️ Deleting customer custom fields...');
    await prisma.customerCustomField.deleteMany({});
    
    console.log('  🗑️ Deleting customer addresses...');
    await prisma.customerAddress.deleteMany({});
    
    console.log('  🗑️ Deleting customers...');
    await prisma.customer.deleteMany({});
    
    console.log('  🗑️ Deleting master data...');
    await prisma.masterData.deleteMany({});
    
    console.log('  🗑️ Deleting users...');
    await prisma.user.deleteMany({});
    
    console.log('✅ Database reset completed!');
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    throw error;
  }
}

// Export individual seed functions for selective seeding
export { seedMasterData } from './master-data.seed';
export { seedCustomers } from './customers.seed';
export { seedAddresses } from './addresses.seed';
