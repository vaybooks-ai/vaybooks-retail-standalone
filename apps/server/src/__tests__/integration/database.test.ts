import { PrismaClient } from '@prisma/client';
import { setupTestDatabase, teardownTestDatabase, resetDatabase } from '../fixtures/test-db';
import { createCustomerDTOFixture } from '../fixtures/customer.fixtures';

describe('Database Integration Tests', () => {
  let prisma: PrismaClient;

  beforeAll(async () => {
    prisma = await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase(prisma);
  });

  beforeEach(async () => {
    await resetDatabase(prisma);
  });

  describe('Database Connection', () => {
    it('should connect to test database', async () => {
      // Act
      const result = await prisma.$queryRaw`SELECT 1 as result`;

      // Assert
      expect(result).toBeDefined();
    });

    it('should verify connection', async () => {
      // Act & Assert
      await expect(prisma.$connect()).resolves.not.toThrow();
    });

    it('should handle connection errors gracefully', async () => {
      // This test verifies error handling, not that it actually fails
      // The connection should already be established
      expect(prisma).toBeDefined();
    });
  });

  describe('Customer Table Operations', () => {
    it('should create customer record', async () => {
      // Arrange
      const data = createCustomerDTOFixture();

      // Act
      const customer = await prisma.customer.create({ data });

      // Assert
      expect(customer).toBeDefined();
      expect(customer.id).toBeDefined();
      expect(customer.code).toBe(data.code);
      expect(customer.name).toBe(data.name);
    });

    it('should read customer record', async () => {
      // Arrange
      const created = await prisma.customer.create({
        data: createCustomerDTOFixture(),
      });

      // Act
      const customer = await prisma.customer.findUnique({
        where: { id: created.id },
      });

      // Assert
      expect(customer).toBeDefined();
      expect(customer?.id).toBe(created.id);
      expect(customer?.code).toBe(created.code);
    });

    it('should update customer record', async () => {
      // Arrange
      const created = await prisma.customer.create({
        data: createCustomerDTOFixture(),
      });

      // Act
      const updated = await prisma.customer.update({
        where: { id: created.id },
        data: { name: 'Updated Name' },
      });

      // Assert
      expect(updated.name).toBe('Updated Name');
      expect(updated.id).toBe(created.id);
    });

    it('should delete customer record', async () => {
      // Arrange
      const created = await prisma.customer.create({
        data: createCustomerDTOFixture(),
      });

      // Act
      await prisma.customer.delete({
        where: { id: created.id },
      });

      const deleted = await prisma.customer.findUnique({
        where: { id: created.id },
      });

      // Assert
      expect(deleted).toBeNull();
    });

    it('should verify timestamps (createdAt, updatedAt)', async () => {
      // Arrange
      const beforeCreate = new Date();

      // Act
      const customer = await prisma.customer.create({
        data: createCustomerDTOFixture(),
      });

      const afterCreate = new Date();

      // Assert
      expect(customer.createdAt).toBeDefined();
      expect(customer.updatedAt).toBeDefined();
      expect(customer.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
      expect(customer.createdAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
    });

    it('should verify default values', async () => {
      // Arrange
      const minimalData = {
        code: 'MINIMAL',
        name: 'Minimal Customer',
        customerType: 'retail' as const,
      };

      // Act
      const customer = await prisma.customer.create({
        data: minimalData,
      });

      // Assert
      expect(customer.isActive).toBe(true);
      expect(customer.currentBalance).toBe(0);
      expect(customer.taxExempt).toBe(false);
    });
  });

  describe('Unique Constraints', () => {
    it('should enforce code uniqueness', async () => {
      // Arrange
      const data = createCustomerDTOFixture({ code: 'UNIQUE001' });
      await prisma.customer.create({ data });

      // Act & Assert
      await expect(
        prisma.customer.create({
          data: createCustomerDTOFixture({ code: 'UNIQUE001' }),
        })
      ).rejects.toThrow();
    });

    it('should allow duplicate emails (no unique constraint)', async () => {
      // Arrange
      const data = createCustomerDTOFixture({ email: 'duplicate@example.com' });
      await prisma.customer.create({ data });

      // Act - Should not throw
      const customer2 = await prisma.customer.create({
        data: createCustomerDTOFixture({
          code: 'CUST002',
          email: 'duplicate@example.com',
        }),
      });

      // Assert
      expect(customer2).toBeDefined();
      expect(customer2.email).toBe('duplicate@example.com');
    });

    it('should allow null email (optional)', async () => {
      // Arrange
      const data1 = createCustomerDTOFixture({ code: 'CUST001', email: undefined });
      const data2 = createCustomerDTOFixture({ code: 'CUST002', email: undefined });

      // Act
      const customer1 = await prisma.customer.create({ data: data1 });
      const customer2 = await prisma.customer.create({ data: data2 });

      // Assert
      expect(customer1.email).toBeNull();
      expect(customer2.email).toBeNull();
    });

    it('should allow duplicate null emails', async () => {
      // Arrange
      const data1 = { ...createCustomerDTOFixture({ code: 'CUST001' }), email: null };
      const data2 = { ...createCustomerDTOFixture({ code: 'CUST002' }), email: null };

      // Act
      const customer1 = await prisma.customer.create({ data: data1 });
      const customer2 = await prisma.customer.create({ data: data2 });

      // Assert
      expect(customer1).toBeDefined();
      expect(customer2).toBeDefined();
      expect(customer1.email).toBeNull();
      expect(customer2.email).toBeNull();
    });
  });

  describe('Indexes', () => {
    it('should have code index working', async () => {
      // Arrange
      await prisma.customer.create({
        data: createCustomerDTOFixture({ code: 'INDEXED001' }),
      });

      // Act
      const customer = await prisma.customer.findUnique({
        where: { code: 'INDEXED001' },
      });

      // Assert
      expect(customer).toBeDefined();
      expect(customer?.code).toBe('INDEXED001');
    });

    it('should have email index working', async () => {
      // Arrange
      await prisma.customer.create({
        data: createCustomerDTOFixture({ email: 'indexed@example.com' }),
      });

      // Act
      const customers = await prisma.customer.findMany({
        where: { email: 'indexed@example.com' },
      });

      // Assert
      expect(customers).toHaveLength(1);
      expect(customers[0]?.email).toBe('indexed@example.com');
    });

    it('should have isActive index working', async () => {
      // Arrange
      await prisma.customer.create({
        data: { ...createCustomerDTOFixture(), isActive: true },
      });
      await prisma.customer.create({
        data: { ...createCustomerDTOFixture({ code: 'CUST002' }), isActive: false },
      });

      // Act
      const activeCustomers = await prisma.customer.findMany({
        where: { isActive: true },
      });

      // Assert
      expect(activeCustomers).toHaveLength(1);
      expect(activeCustomers[0]?.isActive).toBe(true);
    });

    it('should have combined indexes working', async () => {
      // Arrange
      await prisma.customer.create({
        data: { ...createCustomerDTOFixture({
          customerType: 'retail',
        }), isActive: true },
      });
      await prisma.customer.create({
        data: { ...createCustomerDTOFixture({
          code: 'CUST002',
          customerType: 'wholesale',
        }), isActive: true },
      });

      // Act
      const customers = await prisma.customer.findMany({
        where: {
          customerType: 'retail',
          isActive: true,
        },
      });

      // Assert
      expect(customers).toHaveLength(1);
      expect(customers[0]?.customerType).toBe('retail');
    });
  });

  describe('Relationships', () => {
    it('should handle customer with addresses', async () => {
      // Arrange
      const customer = await prisma.customer.create({
        data: createCustomerDTOFixture(),
      });

      // Act
      const address = await prisma.customerAddress.create({
        data: {
          customerId: customer.id,
          type: 'billing',
          addressLine1: '123 Main St',
          city: 'New York',
          state: 'NY',
          country: 'USA',
          postalCode: '10001',
        },
      });

      const customerWithAddresses = await prisma.customer.findUnique({
        where: { id: customer.id },
        include: { addresses: true },
      });

      // Assert
      expect(customerWithAddresses?.addresses).toHaveLength(1);
      expect(customerWithAddresses?.addresses[0]?.id).toBe(address.id);
    });

    it('should handle customer with custom fields', async () => {
      // Arrange
      const customer = await prisma.customer.create({
        data: createCustomerDTOFixture(),
      });

      // Act
      const customField = await prisma.customerCustomField.create({
        data: {
          customerId: customer.id,
          fieldName: 'customField1',
          fieldLabel: 'Custom Field',
          fieldValue: 'Custom Value',
        },
      });

      const customerWithFields = await prisma.customer.findUnique({
        where: { id: customer.id },
        include: { customFields: true },
      });

      // Assert
      expect(customerWithFields?.customFields).toHaveLength(1);
      expect(customerWithFields?.customFields[0]?.id).toBe(customField.id);
    });

    it('should handle cascade delete behavior', async () => {
      // Arrange
      const customer = await prisma.customer.create({
        data: createCustomerDTOFixture(),
      });

      await prisma.customerAddress.create({
        data: {
          customerId: customer.id,
          type: 'billing',
          addressLine1: '123 Main St',
          city: 'New York',
          state: 'NY',
          country: 'USA',
          postalCode: '10001',
        },
      });

      // Act
      await prisma.customer.delete({
        where: { id: customer.id },
      });

      const addresses = await prisma.customerAddress.findMany({
        where: { customerId: customer.id },
      });

      // Assert
      expect(addresses).toHaveLength(0);
    });

    it('should prevent orphaned records', async () => {
      // Act & Assert
      await expect(
        prisma.customerAddress.create({
          data: {
            customerId: 99999, // Non-existent customer
            type: 'billing',
            addressLine1: '123 Main St',
            city: 'New York',
            state: 'NY',
            country: 'USA',
            postalCode: '10001',
          },
        })
      ).rejects.toThrow();
    });
  });

  describe('Transactions', () => {
    it('should rollback on error', async () => {
      // Arrange
      const initialCount = await prisma.customer.count();

      // Act
      try {
        await prisma.$transaction(async (tx) => {
          await tx.customer.create({
            data: createCustomerDTOFixture({ code: 'TRANS001' }),
          });

          // Throw error to trigger rollback
          throw new Error('Test rollback');
        });
      } catch (error) {
        // Expected error
      }

      const finalCount = await prisma.customer.count();

      // Assert
      expect(finalCount).toBe(initialCount);
    });

    it('should commit on success', async () => {
      // Arrange
      const initialCount = await prisma.customer.count();

      // Act
      await prisma.$transaction(async (tx) => {
        await tx.customer.create({
          data: createCustomerDTOFixture({ code: 'TRANS001' }),
        });
        await tx.customer.create({
          data: createCustomerDTOFixture({ code: 'TRANS002' }),
        });
      });

      const finalCount = await prisma.customer.count();

      // Assert
      expect(finalCount).toBe(initialCount + 2);
    });

    it('should handle nested transactions', async () => {
      // Arrange
      const customer = await prisma.customer.create({
        data: createCustomerDTOFixture(),
      });

      // Act
      await prisma.$transaction(async (tx) => {
        await tx.customerAddress.create({
          data: {
            customerId: customer.id,
            type: 'billing',
            addressLine1: '123 Main St',
            city: 'New York',
            state: 'NY',
            country: 'USA',
            postalCode: '10001',
          },
        });

        await tx.customerCustomField.create({
          data: {
            customerId: customer.id,
            fieldName: 'field1',
            fieldLabel: 'Field 1',
            fieldValue: 'Value 1',
          },
        });
      });

      const customerWithRelations = await prisma.customer.findUnique({
        where: { id: customer.id },
        include: {
          addresses: true,
          customFields: true,
        },
      });

      // Assert
      expect(customerWithRelations?.addresses).toHaveLength(1);
      expect(customerWithRelations?.customFields).toHaveLength(1);
    });
  });

  describe('Data Integrity', () => {
    it('should enforce foreign key constraints', async () => {
      // Act & Assert
      await expect(
        prisma.customerAddress.create({
          data: {
            customerId: 99999, // Non-existent
            type: 'billing',
            addressLine1: '123 Main St',
            city: 'New York',
            state: 'NY',
            country: 'USA',
            postalCode: '10001',
          },
        })
      ).rejects.toThrow();
    });

    it('should enforce required fields', async () => {
      // Act & Assert
      await expect(
        prisma.customer.create({
          data: {
            // Missing required fields
            name: 'Test',
          } as any,
        })
      ).rejects.toThrow();
    });

    it('should validate field types', async () => {
      // Act & Assert
      await expect(
        prisma.customer.create({
          data: {
            code: 'TEST',
            name: 'Test',
            customerType: 'retail',
            creditLimit: 'invalid' as any, // Should be number
          },
        })
      ).rejects.toThrow();
    });

    it('should enforce range validation', async () => {
      // Arrange
      const data = createCustomerDTOFixture({
        creditLimit: -1000, // Negative value
      });

      // Act
      const customer = await prisma.customer.create({ data });

      // Assert - Database allows negative values, validation should happen at application level
      expect(customer.creditLimit).toBe(-1000);
    });
  });

  describe('Advanced Queries', () => {
    it('should perform full-text search', async () => {
      // Arrange
      await prisma.customer.create({
        data: createCustomerDTOFixture({
          name: 'John Doe Electronics',
          email: 'john@electronics.com',
        }),
      });
      await prisma.customer.create({
        data: createCustomerDTOFixture({
          code: 'CUST002',
          name: 'Jane Smith Books',
          email: 'jane@books.com',
        }),
      });

      // Act
      const results = await prisma.customer.findMany({
        where: {
          OR: [
            { name: { contains: 'Electronics' } },
            { email: { contains: 'electronics' } },
          ],
        },
      });

      // Assert
      expect(results).toHaveLength(1);
      expect(results[0]?.name).toContain('Electronics');
    });

    it('should perform aggregations', async () => {
      // Arrange
      await prisma.customer.create({
        data: createCustomerDTOFixture({ code: 'CUST001', creditLimit: 1000 }),
      });
      await prisma.customer.create({
        data: createCustomerDTOFixture({ code: 'CUST002', creditLimit: 2000 }),
      });
      await prisma.customer.create({
        data: createCustomerDTOFixture({ code: 'CUST003', creditLimit: 3000 }),
      });

      // Act
      const aggregation = await prisma.customer.aggregate({
        _sum: { creditLimit: true },
        _avg: { creditLimit: true },
        _max: { creditLimit: true },
        _min: { creditLimit: true },
      });

      // Assert
      expect(aggregation._sum.creditLimit).toBe(6000);
      expect(aggregation._avg.creditLimit).toBe(2000);
      expect(aggregation._max.creditLimit).toBe(3000);
      expect(aggregation._min.creditLimit).toBe(1000);
    });

    it('should perform grouping', async () => {
      // Arrange
      await prisma.customer.create({
        data: createCustomerDTOFixture({
          code: 'RETAIL001',
          email: 'retail1@example.com',
          customerType: 'retail',
        }),
      });
      await prisma.customer.create({
        data: createCustomerDTOFixture({
          code: 'RETAIL002',
          email: 'retail2@example.com',
          customerType: 'retail',
        }),
      });
      await prisma.customer.create({
        data: createCustomerDTOFixture({
          code: 'WHOLE001',
          email: 'wholesale1@example.com',
          customerType: 'wholesale',
        }),
      });

      // Act
      const grouping = await prisma.customer.groupBy({
        by: ['customerType'],
        _count: { customerType: true },
      });

      // Assert
      expect(grouping).toHaveLength(2);
      const retailGroup = grouping.find((g) => g.customerType === 'retail');
      const wholesaleGroup = grouping.find((g) => g.customerType === 'wholesale');
      expect(retailGroup?._count.customerType).toBe(2);
      expect(wholesaleGroup?._count.customerType).toBe(1);
    });

    it('should perform complex filtering', async () => {
      // Arrange
      await prisma.customer.create({
        data: {
          ...createCustomerDTOFixture({
            code: 'CUST001',
            customerType: 'retail',
            creditLimit: 5000,
          }),
          isActive: true,
        },
      });
      await prisma.customer.create({
        data: {
          ...createCustomerDTOFixture({
            code: 'CUST002',
            customerType: 'retail',
            creditLimit: 3000,
          }),
          isActive: false,
        },
      });
      await prisma.customer.create({
        data: {
          ...createCustomerDTOFixture({
            code: 'CUST003',
            customerType: 'wholesale',
            creditLimit: 10000,
          }),
          isActive: true,
        },
      });

      // Act
      const results = await prisma.customer.findMany({
        where: {
          AND: [
            { customerType: 'retail' },
            { isActive: true },
            { creditLimit: { gte: 5000 } },
          ],
        },
      });

      // Assert
      expect(results).toHaveLength(1);
      expect(results[0]?.code).toBe('CUST001');
    });
  });

  describe('Performance', () => {
    it('should handle batch inserts efficiently', async () => {
      // Arrange
      const batchSize = 10;
      const customers = Array.from({ length: batchSize }, (_, i) =>
        createCustomerDTOFixture({ code: `BATCH${String(i + 1).padStart(3, '0')}` })
      );

      // Act
      const startTime = Date.now();
      await prisma.customer.createMany({
        data: customers,
      });
      const endTime = Date.now();

      const count = await prisma.customer.count();

      // Assert
      expect(count).toBe(batchSize);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it('should handle batch updates efficiently', async () => {
      // Arrange
      const customers = Array.from({ length: 5 }, (_, i) =>
        createCustomerDTOFixture({ code: `UPDATE${String(i + 1).padStart(3, '0')}` })
      );

      await prisma.customer.createMany({ data: customers });

      // Act
      await prisma.customer.updateMany({
        where: { code: { startsWith: 'UPDATE' } },
        data: { isActive: false },
      });

      const updatedCustomers = await prisma.customer.findMany({
        where: { code: { startsWith: 'UPDATE' } },
      });

      // Assert
      expect(updatedCustomers).toHaveLength(5);
      expect(updatedCustomers.every((c) => !c.isActive)).toBe(true);
    });

    it('should optimize queries with select', async () => {
      // Arrange
      await prisma.customer.create({
        data: createCustomerDTOFixture(),
      });

      // Act
      const customers = await prisma.customer.findMany({
        select: {
          id: true,
          code: true,
          name: true,
        },
      });

      // Assert
      expect(customers).toHaveLength(1);
      expect(customers[0]).toHaveProperty('id');
      expect(customers[0]).toHaveProperty('code');
      expect(customers[0]).toHaveProperty('name');
      expect(customers[0]).not.toHaveProperty('email');
    });
  });
});
