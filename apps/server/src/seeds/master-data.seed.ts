import { PrismaClient } from '@prisma/client';

/**
 * Seed master data for the application
 * Includes: Customer Status, Payment Terms, Sales Reps, Customer Groups
 */
export async function seedMasterData(prisma: PrismaClient): Promise<void> {
  console.log('  📋 Seeding Customer Status...');
  
  // Customer Status
  const customerStatuses = [
    { dataType: 'customerStatus', value: 'Active', displayOrder: 1 },
    { dataType: 'customerStatus', value: 'Inactive', displayOrder: 2 },
    { dataType: 'customerStatus', value: 'Suspended', displayOrder: 3 },
    { dataType: 'customerStatus', value: 'Prospect', displayOrder: 4 },
  ];

  for (const status of customerStatuses) {
    await prisma.masterData.upsert({
      where: {
        dataType_value: {
          dataType: status.dataType,
          value: status.value,
        },
      },
      update: {
        displayOrder: status.displayOrder,
        isActive: true,
      },
      create: {
        dataType: status.dataType,
        value: status.value,
        label: status.value,
        description: `Customer status: ${status.value}`,
        displayOrder: status.displayOrder,
        isActive: true,
      },
    });
  }
  console.log(`    ✓ Created ${customerStatuses.length} customer statuses`);

  console.log('  💰 Seeding Payment Terms...');
  
  // Payment Terms
  const paymentTerms = [
    { dataType: 'paymentTerm', value: 'Net 30', description: '30 days from invoice date', displayOrder: 1 },
    { dataType: 'paymentTerm', value: 'Net 60', description: '60 days from invoice date', displayOrder: 2 },
    { dataType: 'paymentTerm', value: 'Net 90', description: '90 days from invoice date', displayOrder: 3 },
    { dataType: 'paymentTerm', value: 'COD', description: 'Cash on Delivery', displayOrder: 4 },
    { dataType: 'paymentTerm', value: 'Prepaid', description: 'Payment before delivery', displayOrder: 5 },
  ];

  for (const term of paymentTerms) {
    await prisma.masterData.upsert({
      where: {
        dataType_value: {
          dataType: term.dataType,
          value: term.value,
        },
      },
      update: {
        description: term.description,
        displayOrder: term.displayOrder,
        isActive: true,
      },
      create: {
        dataType: term.dataType,
        value: term.value,
        label: term.value,
        description: term.description,
        displayOrder: term.displayOrder,
        isActive: true,
      },
    });
  }
  console.log(`    ✓ Created ${paymentTerms.length} payment terms`);

  console.log('  👔 Seeding Sales Representatives...');
  
  // Sales Representatives
  const salesReps = [
    { dataType: 'salesRep', value: 'John Smith', displayOrder: 1 },
    { dataType: 'salesRep', value: 'Sarah Johnson', displayOrder: 2 },
    { dataType: 'salesRep', value: 'Mike Davis', displayOrder: 3 },
    { dataType: 'salesRep', value: 'Emily Wilson', displayOrder: 4 },
    { dataType: 'salesRep', value: 'Robert Brown', displayOrder: 5 },
  ];

  for (const rep of salesReps) {
    await prisma.masterData.upsert({
      where: {
        dataType_value: {
          dataType: rep.dataType,
          value: rep.value,
        },
      },
      update: {
        displayOrder: rep.displayOrder,
        isActive: true,
      },
      create: {
        dataType: rep.dataType,
        value: rep.value,
        label: rep.value,
        description: `Sales Representative: ${rep.value}`,
        displayOrder: rep.displayOrder,
        isActive: true,
      },
    });
  }
  console.log(`    ✓ Created ${salesReps.length} sales representatives`);

  console.log('  🏷️ Seeding Customer Groups...');
  
  // Customer Groups
  const customerGroups = [
    { dataType: 'customerGroup', value: 'Premium', description: 'Premium tier customers', displayOrder: 1 },
    { dataType: 'customerGroup', value: 'Standard', description: 'Standard tier customers', displayOrder: 2 },
    { dataType: 'customerGroup', value: 'Budget', description: 'Budget tier customers', displayOrder: 3 },
    { dataType: 'customerGroup', value: 'VIP', description: 'VIP tier customers', displayOrder: 4 },
  ];

  for (const group of customerGroups) {
    await prisma.masterData.upsert({
      where: {
        dataType_value: {
          dataType: group.dataType,
          value: group.value,
        },
      },
      update: {
        description: group.description,
        displayOrder: group.displayOrder,
        isActive: true,
      },
      create: {
        dataType: group.dataType,
        value: group.value,
        label: group.value,
        description: group.description,
        displayOrder: group.displayOrder,
        isActive: true,
      },
    });
  }
  console.log(`    ✓ Created ${customerGroups.length} customer groups`);
}
