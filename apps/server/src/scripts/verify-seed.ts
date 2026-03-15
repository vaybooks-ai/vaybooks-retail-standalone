import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verify() {
  try {
    const customerCount = await prisma.customer.count();
    const masterDataCount = await prisma.masterData.count();
    const addressCount = await prisma.customerAddress.count();
    
    console.log('\n📊 Database Verification:');
    console.log('========================');
    console.log(`✓ Customers: ${customerCount}`);
    console.log(`✓ Master Data: ${masterDataCount}`);
    console.log(`✓ Addresses: ${addressCount}`);
    
    // Show sample data
    console.log('\n📋 Sample Master Data (Customer Status):');
    const statuses = await prisma.masterData.findMany({
      where: { dataType: 'customerStatus' },
      orderBy: { displayOrder: 'asc' },
    });
    statuses.forEach(s => console.log(`  - ${s.value} (order: ${s.displayOrder})`));
    
    console.log('\n👥 Sample Customers:');
    const customers = await prisma.customer.findMany({
      take: 5,
      select: {
        code: true,
        name: true,
        customerType: true,
        creditLimit: true,
      },
    });
    customers.forEach(c => 
      console.log(`  - ${c.code}: ${c.name} (${c.customerType}, limit: ${c.creditLimit})`)
    );
    
    console.log('\n✅ Verification complete!\n');
  } catch (error) {
    console.error('❌ Error during verification:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verify();
