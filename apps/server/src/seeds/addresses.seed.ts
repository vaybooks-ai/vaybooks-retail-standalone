import { PrismaClient } from '@prisma/client';

/**
 * Seed customer addresses
 * Creates billing and shipping addresses for all customers
 */
export async function seedAddresses(prisma: PrismaClient): Promise<void> {
  console.log('  📍 Fetching customers...');
  
  // Get all customers
  const customers = await prisma.customer.findMany();
  
  if (customers.length === 0) {
    console.log('    ⚠️ No customers found. Please seed customers first.');
    return;
  }

  console.log(`  📍 Seeding addresses for ${customers.length} customers...`);

  // Sample cities and states in India
  const locations = [
    { city: 'Mumbai', state: 'Maharashtra', postalCode: '400001' },
    { city: 'Delhi', state: 'Delhi', postalCode: '110001' },
    { city: 'Bangalore', state: 'Karnataka', postalCode: '560001' },
    { city: 'Hyderabad', state: 'Telangana', postalCode: '500001' },
    { city: 'Chennai', state: 'Tamil Nadu', postalCode: '600001' },
    { city: 'Kolkata', state: 'West Bengal', postalCode: '700001' },
    { city: 'Pune', state: 'Maharashtra', postalCode: '411001' },
    { city: 'Ahmedabad', state: 'Gujarat', postalCode: '380001' },
    { city: 'Jaipur', state: 'Rajasthan', postalCode: '302001' },
    { city: 'Lucknow', state: 'Uttar Pradesh', postalCode: '226001' },
    { city: 'Chandigarh', state: 'Chandigarh', postalCode: '160001' },
    { city: 'Kochi', state: 'Kerala', postalCode: '682001' },
    { city: 'Indore', state: 'Madhya Pradesh', postalCode: '452001' },
    { city: 'Bhopal', state: 'Madhya Pradesh', postalCode: '462001' },
    { city: 'Coimbatore', state: 'Tamil Nadu', postalCode: '641001' },
  ];

  const streetPrefixes = [
    'MG Road', 'Park Street', 'Brigade Road', 'Commercial Street',
    'Nehru Place', 'Connaught Place', 'Anna Salai', 'Residency Road',
    'Station Road', 'Main Road', 'Market Street', 'Civil Lines',
    'Sadar Bazaar', 'Gandhi Nagar', 'Rajpath', 'Mall Road',
  ];

  const buildingTypes = [
    'Plaza', 'Complex', 'Tower', 'Building', 'Arcade',
    'Center', 'Chambers', 'House', 'Bhavan', 'Heights',
  ];

  let addressCount = 0;

  for (let i = 0; i < customers.length; i++) {
    const customer = customers[i];
    if (!customer) continue;
    
    const locationIndex = i % locations.length;
    const location = locations[locationIndex];
    if (!location) continue;
    
    // For billing and shipping, we'll use slightly different addresses
    const streetIndex = i % streetPrefixes.length;
    const buildingIndex = i % buildingTypes.length;

    try {
      // Delete existing addresses for this customer to ensure clean state
      await prisma.customerAddress.deleteMany({
        where: { customerId: customer.id },
      });

      // Create Billing Address
      await prisma.customerAddress.create({
        data: {
          customerId: customer.id,
          type: 'billing',
          label: 'Head Office',
          isDefault: true,
          addressLine1: `${Math.floor(Math.random() * 500) + 1}, ${streetPrefixes[streetIndex]}`,
          addressLine2: `${customer.name.split(' ')[0]} ${buildingTypes[buildingIndex]}`,
          city: location.city,
          state: location.state,
          country: 'India',
          postalCode: location.postalCode,
          contactPerson: customer.contactPerson,
          phone: customer.phone,
          email: customer.contactEmail || customer.email,
          notes: 'Primary billing address',
          isActive: true,
        },
      });
      addressCount++;

      // Create Shipping Address (can be same or different location)
      const shippingLocationIndex = (i + 3) % locations.length;
      const shippingLocation = locations[shippingLocationIndex];
      if (!shippingLocation) continue;
      const shippingStreetIndex = (streetIndex + 5) % streetPrefixes.length;
      const shippingBuildingIndex = (buildingIndex + 3) % buildingTypes.length;

      await prisma.customerAddress.create({
        data: {
          customerId: customer.id,
          type: 'shipping',
          label: 'Main Warehouse',
          isDefault: true,
          addressLine1: `${Math.floor(Math.random() * 500) + 1}, ${streetPrefixes[shippingStreetIndex]}`,
          addressLine2: `Warehouse ${buildingTypes[shippingBuildingIndex]}`,
          city: shippingLocation.city,
          state: shippingLocation.state,
          country: 'India',
          postalCode: shippingLocation.postalCode,
          contactPerson: customer.contactPerson,
          phone: customer.phone,
          email: customer.contactEmail || customer.email,
          notes: 'Primary shipping address',
          isActive: true,
        },
      });
      addressCount++;

      // For wholesale and distributor customers, add an additional shipping address
      if (customer.customerType === 'wholesale' || customer.customerType === 'distributor') {
        const secondaryLocationIndex = (i + 7) % locations.length;
        const secondaryLocation = locations[secondaryLocationIndex];
        if (!secondaryLocation) continue;
        const secondaryStreetIndex = (streetIndex + 8) % streetPrefixes.length;
        const secondaryBuildingIndex = (buildingIndex + 5) % buildingTypes.length;

        await prisma.customerAddress.create({
          data: {
            customerId: customer.id,
            type: 'shipping',
            label: 'Branch Office',
            isDefault: false,
            addressLine1: `${Math.floor(Math.random() * 500) + 1}, ${streetPrefixes[secondaryStreetIndex]}`,
            addressLine2: `Branch ${buildingTypes[secondaryBuildingIndex]}`,
            city: secondaryLocation.city,
            state: secondaryLocation.state,
            country: 'India',
            postalCode: secondaryLocation.postalCode,
            contactPerson: customer.contactPerson,
            phone: customer.mobile,
            email: customer.contactEmail || customer.email,
            notes: 'Secondary shipping location',
            isActive: true,
          },
        });
        addressCount++;
      }
    } catch (error) {
      console.error(`    ❌ Error creating addresses for customer ${customer.code}:`, error);
    }
  }

  console.log(`    ✓ Created ${addressCount} addresses for ${customers.length} customers`);
}
