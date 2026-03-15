import { PrismaClient } from '@prisma/client';
import { CustomerRepository } from '../../../../modules/customers/customer.repository';
import { Customer } from '@vaybooks/shared';

describe('CustomerRepository', () => {
  let prisma: jest.Mocked<PrismaClient>;
  let repository: CustomerRepository;
  let mockModel: any;

  const mockCustomer: Customer = {
    id: 1,
    code: 'CUST001',
    name: 'Test Customer',
    email: 'test@example.com',
    phone: '1234567890',
    mobile: '9876543210',
    taxNumber: 'TAX123',
    taxExempt: false,
    creditLimit: 10000,
    creditTermsDays: 30,
    currentBalance: 1500,
    customerType: 'retail',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  beforeEach(() => {
    mockModel = {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
    };

    prisma = {
      customer: mockModel,
    } as any;

    repository = new CustomerRepository(prisma);
  });

  describe('Constructor & Initialization', () => {
    it('should initialize repository with correct model name', () => {
      expect(repository).toBeInstanceOf(CustomerRepository);
    });
  });

  describe('findByCode', () => {
    it('should return customer by code', async () => {
      mockModel.findFirst.mockResolvedValue(mockCustomer);

      const result = await repository.findByCode('CUST001');

      expect(result).toEqual(mockCustomer);
      expect(mockModel.findFirst).toHaveBeenCalledWith({
        where: { code: 'CUST001' },
      });
    });

    it('should return null when code not found', async () => {
      mockModel.findFirst.mockResolvedValue(null);

      const result = await repository.findByCode('INVALID');

      expect(result).toBeNull();
    });

    it('should be case-sensitive', async () => {
      mockModel.findFirst.mockResolvedValue(null);

      await repository.findByCode('cust001');

      expect(mockModel.findFirst).toHaveBeenCalledWith({
        where: { code: 'cust001' },
      });
    });
  });

  describe('findByEmail', () => {
    it('should return customer by email', async () => {
      mockModel.findFirst.mockResolvedValue(mockCustomer);

      const result = await repository.findByEmail('test@example.com');

      expect(result).toEqual(mockCustomer);
      expect(mockModel.findFirst).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return null when email not found', async () => {
      mockModel.findFirst.mockResolvedValue(null);

      const result = await repository.findByEmail('notfound@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findDetailById', () => {
    it('should return customer with addresses and custom fields', async () => {
      const detailedCustomer = {
        ...mockCustomer,
        addresses: [
          { id: 1, customerId: 1, type: 'billing', isActive: true, isDefault: true },
          { id: 2, customerId: 1, type: 'shipping', isActive: true, isDefault: false },
        ],
        customFields: [
          { id: 1, customerId: 1, fieldName: 'Tax ID', displayOrder: 0 },
        ],
      };
      mockModel.findUnique.mockResolvedValue(detailedCustomer);

      const result = await repository.findDetailById(1);

      expect(result).toEqual(detailedCustomer);
      expect(mockModel.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          addresses: {
            where: { isActive: true },
            orderBy: { isDefault: 'desc' },
          },
          customFields: {
            orderBy: { displayOrder: 'asc' },
          },
        },
      });
    });

    it('should return null when customer not found', async () => {
      mockModel.findUnique.mockResolvedValue(null);

      const result = await repository.findDetailById(999);

      expect(result).toBeNull();
    });

    it('should filter inactive addresses', async () => {
      await repository.findDetailById(1);

      expect(mockModel.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            addresses: expect.objectContaining({
              where: { isActive: true },
            }),
          }),
        })
      );
    });
  });

  describe('searchCustomers', () => {
    it('should search by text across multiple fields', async () => {
      mockModel.findMany.mockResolvedValue([mockCustomer]);
      mockModel.count.mockResolvedValue(1);

      const result = await repository.searchCustomers(
        { search: 'test' },
        { page: 1, limit: 10 }
      );

      expect(result.data).toEqual([mockCustomer]);
      expect(mockModel.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { name: { contains: 'test' } },
              { code: { contains: 'test' } },
              { email: { contains: 'test' } },
              { phone: { contains: 'test' } },
              { mobile: { contains: 'test' } },
            ]),
          }),
        })
      );
    });

    it('should filter by isActive status', async () => {
      mockModel.findMany.mockResolvedValue([mockCustomer]);
      mockModel.count.mockResolvedValue(1);

      await repository.searchCustomers(
        { isActive: true },
        { page: 1, limit: 10 }
      );

      expect(mockModel.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: true,
          }),
        })
      );
    });

    it('should filter by customerType', async () => {
      mockModel.findMany.mockResolvedValue([mockCustomer]);
      mockModel.count.mockResolvedValue(1);

      await repository.searchCustomers(
        { customerType: 'retail' },
        { page: 1, limit: 10 }
      );

      expect(mockModel.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            customerType: 'retail',
          }),
        })
      );
    });

    it('should filter by taxExempt status', async () => {
      mockModel.findMany.mockResolvedValue([mockCustomer]);
      mockModel.count.mockResolvedValue(1);

      await repository.searchCustomers(
        { taxExempt: true },
        { page: 1, limit: 10 }
      );

      expect(mockModel.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            taxExempt: true,
          }),
        })
      );
    });

    it('should filter by credit limit range', async () => {
      mockModel.findMany.mockResolvedValue([mockCustomer]);
      mockModel.count.mockResolvedValue(1);

      await repository.searchCustomers(
        { creditLimitMin: 5000, creditLimitMax: 15000 },
        { page: 1, limit: 10 }
      );

      expect(mockModel.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            creditLimit: { gte: 5000, lte: 15000 },
          }),
        })
      );
    });

    it('should filter customers with balance', async () => {
      mockModel.findMany.mockResolvedValue([mockCustomer]);
      mockModel.count.mockResolvedValue(1);

      await repository.searchCustomers(
        { hasBalance: true },
        { page: 1, limit: 10 }
      );

      expect(mockModel.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            currentBalance: { gt: 0 },
          }),
        })
      );
    });

    it('should filter customers without balance', async () => {
      mockModel.findMany.mockResolvedValue([]);
      mockModel.count.mockResolvedValue(0);

      await repository.searchCustomers(
        { hasBalance: false },
        { page: 1, limit: 10 }
      );

      expect(mockModel.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            currentBalance: 0,
          }),
        })
      );
    });

    it('should search by address location (city)', async () => {
      mockModel.findMany.mockResolvedValue([mockCustomer]);
      mockModel.count.mockResolvedValue(1);

      await repository.searchCustomers(
        { city: 'Springfield' },
        { page: 1, limit: 10 }
      );

      expect(mockModel.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            addresses: {
              some: {
                isActive: true,
                city: 'Springfield',
              },
            },
          }),
        })
      );
    });

    it('should search by address location (state)', async () => {
      mockModel.findMany.mockResolvedValue([mockCustomer]);
      mockModel.count.mockResolvedValue(1);

      await repository.searchCustomers(
        { state: 'IL' },
        { page: 1, limit: 10 }
      );

      expect(mockModel.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            addresses: {
              some: {
                isActive: true,
                state: 'IL',
              },
            },
          }),
        })
      );
    });

    it('should search by address location (country)', async () => {
      mockModel.findMany.mockResolvedValue([mockCustomer]);
      mockModel.count.mockResolvedValue(1);

      await repository.searchCustomers(
        { country: 'USA' },
        { page: 1, limit: 10 }
      );

      expect(mockModel.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            addresses: {
              some: {
                isActive: true,
                country: 'USA',
              },
            },
          }),
        })
      );
    });

    it('should return paginated results', async () => {
      mockModel.findMany.mockResolvedValue([mockCustomer]);
      mockModel.count.mockResolvedValue(25);

      const result = await repository.searchCustomers(
        {},
        { page: 2, limit: 10 }
      );

      // Check pagination metadata (may be at top level or in pagination object)
      const pagination = result.pagination || result;
      expect(pagination.total).toBe(25);
      expect(pagination.page).toBe(2);
      expect(pagination.limit).toBe(10);
      expect(pagination.totalPages).toBe(3);
    });
  });

  describe('findActive', () => {
    it('should return all active customers', async () => {
      mockModel.findMany.mockResolvedValue([mockCustomer]);

      const result = await repository.findActive();

      expect(result).toEqual([mockCustomer]);
      expect(mockModel.findMany).toHaveBeenCalled();
    });

    it('should apply pagination options', async () => {
      mockModel.findMany.mockResolvedValue([mockCustomer]);

      await repository.findActive({ page: 2, limit: 50 });

      expect(mockModel.findMany).toHaveBeenCalled();
    });
  });

  describe('findWithBalance', () => {
    it('should return customers with outstanding balance', async () => {
      mockModel.findMany.mockResolvedValue([mockCustomer]);

      const result = await repository.findWithBalance();

      expect(result).toEqual([mockCustomer]);
      expect(mockModel.findMany).toHaveBeenCalled();
    });

    it('should apply pagination options', async () => {
      mockModel.findMany.mockResolvedValue([mockCustomer]);

      await repository.findWithBalance({ page: 1, limit: 20 });

      expect(mockModel.findMany).toHaveBeenCalled();
    });
  });

  describe('isCodeUnique', () => {
    it('should return true when code is unique', async () => {
      mockModel.count.mockResolvedValue(0);

      const result = await repository.isCodeUnique('CUST999');

      expect(result).toBe(true);
      expect(mockModel.count).toHaveBeenCalledWith({
        where: { code: 'CUST999' },
      });
    });

    it('should return false when code exists', async () => {
      mockModel.count.mockResolvedValue(1);

      const result = await repository.isCodeUnique('CUST001');

      expect(result).toBe(false);
    });

    it('should exclude specified customer ID', async () => {
      mockModel.count.mockResolvedValue(0);

      await repository.isCodeUnique('CUST001', 1);

      expect(mockModel.count).toHaveBeenCalledWith({
        where: { code: 'CUST001', id: { not: 1 } },
      });
    });
  });

  describe('isEmailUnique', () => {
    it('should return true when email is unique', async () => {
      mockModel.count.mockResolvedValue(0);

      const result = await repository.isEmailUnique('unique@example.com');

      expect(result).toBe(true);
      expect(mockModel.count).toHaveBeenCalledWith({
        where: { email: 'unique@example.com' },
      });
    });

    it('should return false when email exists', async () => {
      mockModel.count.mockResolvedValue(1);

      const result = await repository.isEmailUnique('test@example.com');

      expect(result).toBe(false);
    });

    it('should exclude specified customer ID', async () => {
      mockModel.count.mockResolvedValue(0);

      await repository.isEmailUnique('test@example.com', 1);

      expect(mockModel.count).toHaveBeenCalledWith({
        where: { email: 'test@example.com', id: { not: 1 } },
      });
    });

    it('should return true for empty email', async () => {
      const result = await repository.isEmailUnique('');

      expect(result).toBe(true);
      expect(mockModel.count).not.toHaveBeenCalled();
    });
  });

  describe('generateNextCode', () => {
    it('should generate first code when no customers exist', async () => {
      mockModel.findFirst.mockResolvedValue(null);

      const result = await repository.generateNextCode('CUST');

      expect(result).toBe('CUST001');
    });

    it('should increment existing code', async () => {
      mockModel.findFirst.mockResolvedValue({ code: 'CUST005' });

      const result = await repository.generateNextCode('CUST');

      expect(result).toBe('CUST006');
    });

    it('should handle custom prefix', async () => {
      mockModel.findFirst.mockResolvedValue(null);

      const result = await repository.generateNextCode('CLI');

      expect(result).toBe('CLI001');
    });

    it('should maintain zero padding', async () => {
      mockModel.findFirst.mockResolvedValue({ code: 'CUST099' });

      const result = await repository.generateNextCode('CUST');

      expect(result).toBe('CUST100');
    });

    it('should query with correct filter', async () => {
      mockModel.findFirst.mockResolvedValue(null);

      await repository.generateNextCode('CUST');

      expect(mockModel.findFirst).toHaveBeenCalledWith({
        where: { code: { startsWith: 'CUST' } },
        orderBy: { code: 'desc' },
        select: { code: true },
      });
    });
  });

  describe('updateBalance', () => {
    it('should update customer balance by adding amount', async () => {
      mockModel.findUnique.mockResolvedValue(mockCustomer);
      mockModel.update.mockResolvedValue({
        ...mockCustomer,
        currentBalance: 2000,
      });

      const result = await repository.updateBalance(1, 500);

      expect(result).toEqual({ ...mockCustomer, currentBalance: 2000 });
      expect(mockModel.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { currentBalance: 2000 },
      });
    });

    it('should handle negative amounts (payments)', async () => {
      mockModel.findUnique.mockResolvedValue(mockCustomer);
      mockModel.update.mockResolvedValue({
        ...mockCustomer,
        currentBalance: 1000,
      });

      const result = await repository.updateBalance(1, -500);

      expect(result?.currentBalance).toBe(1000);
    });

    it('should return null when customer not found', async () => {
      mockModel.findUnique.mockResolvedValue(null);

      const result = await repository.updateBalance(999, 100);

      expect(result).toBeNull();
      expect(mockModel.update).not.toHaveBeenCalled();
    });
  });

  describe('getCustomerStats', () => {
    it('should return customer statistics', async () => {
      const stats = {
        addresses: [
          { type: 'billing', isDefault: true, isActive: true },
          { type: 'shipping', isDefault: true, isActive: true },
        ],
        customFields: [
          { fieldName: 'Field1' },
          { fieldName: 'Field2' },
        ],
      };
      mockModel.findUnique.mockResolvedValue(stats);

      const result = await repository.getCustomerStats(1);

      expect(result).toEqual({
        addressCount: 2,
        customFieldCount: 2,
        totalAddresses: 2,
        totalCustomFields: 2,
        defaultBillingAddress: stats.addresses[0],
        defaultShippingAddress: stats.addresses[1],
      });
    });

    it('should return null when customer not found', async () => {
      mockModel.findUnique.mockResolvedValue(null);

      const result = await repository.getCustomerStats(999);

      expect(result).toBeNull();
    });

    it('should handle no default addresses', async () => {
      mockModel.findUnique.mockResolvedValue({
        addresses: [{ type: 'other', isDefault: false, isActive: true }],
        customFields: [],
      });

      const result = await repository.getCustomerStats(1);

      expect(result?.defaultBillingAddress).toBeNull();
      expect(result?.defaultShippingAddress).toBeNull();
    });
  });

  describe('getTopCustomersByCredit', () => {
    it('should return top customers by credit limit', async () => {
      const customers = [
        { ...mockCustomer, id: 1, creditLimit: 50000 },
        { ...mockCustomer, id: 2, creditLimit: 30000 },
        { ...mockCustomer, id: 3, creditLimit: 20000 },
      ];
      mockModel.findMany.mockResolvedValue(customers);

      const result = await repository.getTopCustomersByCredit(10);

      expect(result).toEqual(customers);
      expect(mockModel.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { creditLimit: 'desc' },
        take: 10,
      });
    });

    it('should use default limit of 10', async () => {
      mockModel.findMany.mockResolvedValue([]);

      await repository.getTopCustomersByCredit();

      expect(mockModel.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 10 })
      );
    });
  });

  describe('findByType', () => {
    it('should return customers by retail type', async () => {
      mockModel.findMany.mockResolvedValue([mockCustomer]);

      const result = await repository.findByType('retail');

      expect(result).toEqual([mockCustomer]);
      expect(mockModel.findMany).toHaveBeenCalled();
    });

    it('should return customers by wholesale type', async () => {
      mockModel.findMany.mockResolvedValue([]);

      await repository.findByType('wholesale');

      expect(mockModel.findMany).toHaveBeenCalled();
    });

    it('should return customers by distributor type', async () => {
      mockModel.findMany.mockResolvedValue([]);

      await repository.findByType('distributor');

      expect(mockModel.findMany).toHaveBeenCalled();
    });
  });

  describe('bulkUpdateStatus', () => {
    it('should update status for multiple customers', async () => {
      mockModel.updateMany.mockResolvedValue({ count: 3 });

      const result = await repository.bulkUpdateStatus([1, 2, 3], false);

      expect(result).toBe(3);
      expect(mockModel.updateMany).toHaveBeenCalledWith({
        where: { id: { in: [1, 2, 3] } },
        data: { isActive: false },
      });
    });

    it('should activate customers', async () => {
      mockModel.updateMany.mockResolvedValue({ count: 2 });

      await repository.bulkUpdateStatus([4, 5], true);

      expect(mockModel.updateMany).toHaveBeenCalledWith({
        where: { id: { in: [4, 5] } },
        data: { isActive: true },
      });
    });

    it('should return 0 when no customers updated', async () => {
      mockModel.updateMany.mockResolvedValue({ count: 0 });

      const result = await repository.bulkUpdateStatus([999], true);

      expect(result).toBe(0);
    });
  });

  describe('deleteWithRelations', () => {
    it('should delete customer successfully', async () => {
      mockModel.delete.mockResolvedValue(mockCustomer);

      const result = await repository.deleteWithRelations(1);

      expect(result).toBe(true);
      expect(mockModel.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should return false when customer not found', async () => {
      mockModel.delete.mockRejectedValue({ code: 'P2025' });

      const result = await repository.deleteWithRelations(999);

      expect(result).toBe(false);
    });

    it('should throw error for other database errors', async () => {
      const error = new Error('Database error');
      mockModel.delete.mockRejectedValue(error);

      await expect(repository.deleteWithRelations(1)).rejects.toThrow('Database error');
    });
  });
});
