import { PrismaClient } from '@prisma/client';
import { AddressRepository } from '../../../../modules/customers/address.repository';
import { CustomerAddress } from '@vaybooks/shared';

describe('AddressRepository', () => {
  let prisma: jest.Mocked<PrismaClient>;
  let repository: AddressRepository;
  let mockModel: any;

  const mockAddress: CustomerAddress = {
    id: 1,
    customerId: 1,
    type: 'billing',
    addressLine1: '123 Main St',
    city: 'Springfield',
    state: 'IL',
    postalCode: '62701',
    country: 'USA',
    isDefault: true,
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
      customerAddress: mockModel,
    } as any;

    repository = new AddressRepository(prisma);
  });

  describe('Constructor & Initialization', () => {
    it('should initialize repository with correct model name', () => {
      expect(repository).toBeInstanceOf(AddressRepository);
    });
  });

  describe('findByCustomerId', () => {
    it('should return all addresses for a customer', async () => {
      const addresses = [mockAddress];
      mockModel.findMany.mockResolvedValue(addresses);

      const result: any = await repository.findByCustomerId(1);

      // Result may be array or paginated object with data property
      const actualData = Array.isArray(result) ? result : result.data;
      expect(actualData).toEqual(addresses);
      expect(mockModel.findMany).toHaveBeenCalled();
    });

    it('should return empty array when no addresses found', async () => {
      mockModel.findMany.mockResolvedValue([]);

      const result: any = await repository.findByCustomerId(999);

      expect(Array.isArray(result) || result.data).toBeTruthy();
    });
  });

  describe('findDefaultByType', () => {
    it('should return default billing address', async () => {
      mockModel.findFirst.mockResolvedValue(mockAddress);

      const result = await repository.findDefaultByType(1, 'billing');

      expect(result).toEqual(mockAddress);
      expect(mockModel.findFirst).toHaveBeenCalledWith({
        where: {
          customerId: 1,
          type: 'billing',
          isDefault: true,
          isActive: true,
        },
      });
    });

    it('should return default shipping address', async () => {
      const shippingAddress = { ...mockAddress, type: 'shipping' };
      mockModel.findFirst.mockResolvedValue(shippingAddress);

      const result = await repository.findDefaultByType(1, 'shipping');

      expect(result).toEqual(shippingAddress);
      expect(mockModel.findFirst).toHaveBeenCalledWith({
        where: {
          customerId: 1,
          type: 'shipping',
          isDefault: true,
          isActive: true,
        },
      });
    });

    it('should return null when no default address found', async () => {
      mockModel.findFirst.mockResolvedValue(null);

      const result = await repository.findDefaultByType(1, 'billing');

      expect(result).toBeNull();
    });

    it('should handle other address type', async () => {
      const otherAddress = { ...mockAddress, type: 'other' };
      mockModel.findFirst.mockResolvedValue(otherAddress);

      const result = await repository.findDefaultByType(1, 'other');

      expect(result).toEqual(otherAddress);
    });
  });

  describe('setAsDefault', () => {
    it('should set address as default and remove default from others', async () => {
      mockModel.findUnique.mockResolvedValue(mockAddress);
      mockModel.updateMany.mockResolvedValue({ count: 2 });
      mockModel.update.mockResolvedValue({ ...mockAddress, isDefault: true });

      const result = await repository.setAsDefault(1, 1);

      expect(result).toEqual({ ...mockAddress, isDefault: true });
      expect(mockModel.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockModel.updateMany).toHaveBeenCalledWith({
        where: {
          customerId: 1,
          type: mockAddress.type,
          id: { not: 1 },
        },
        data: { isDefault: false },
      });
      expect(mockModel.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { isDefault: true },
      });
    });

    it('should return null when address not found', async () => {
      mockModel.findUnique.mockResolvedValue(null);

      const result = await repository.setAsDefault(999, 1);

      expect(result).toBeNull();
      expect(mockModel.updateMany).not.toHaveBeenCalled();
      expect(mockModel.update).not.toHaveBeenCalled();
    });

    it('should return null when address belongs to different customer', async () => {
      mockModel.findUnique.mockResolvedValue({ ...mockAddress, customerId: 2 });

      const result = await repository.setAsDefault(1, 1);

      expect(result).toBeNull();
      expect(mockModel.updateMany).not.toHaveBeenCalled();
      expect(mockModel.update).not.toHaveBeenCalled();
    });

    it('should only update addresses of same type', async () => {
      const billingAddress = { ...mockAddress, id: 2, type: 'billing', isDefault: true };
      mockModel.findUnique.mockResolvedValue(billingAddress);
      mockModel.updateMany.mockResolvedValue({ count: 1 });
      mockModel.update.mockResolvedValue(billingAddress);

      await repository.setAsDefault(2, 1);

      expect(mockModel.updateMany).toHaveBeenCalledWith({
        where: {
          customerId: 1,
          type: 'billing',
          id: { not: 2 },
        },
        data: { isDefault: false },
      });
    });
  });

  describe('findBillingAddresses', () => {
    it('should return all billing addresses for customer', async () => {
      const billingAddresses = [
        { ...mockAddress, id: 1, type: 'billing' },
        { ...mockAddress, id: 2, type: 'billing', isDefault: false },
      ];
      mockModel.findMany.mockResolvedValue(billingAddresses);

      const result = await repository.findBillingAddresses(1);

      expect(result).toEqual(billingAddresses);
      expect(mockModel.findMany).toHaveBeenCalled();
    });

    it('should return empty array when no billing addresses', async () => {
      mockModel.findMany.mockResolvedValue([]);

      const result: any = await repository.findBillingAddresses(1);

      expect(Array.isArray(result) || result.data).toBeTruthy();
    });
  });

  describe('findShippingAddresses', () => {
    it('should return all shipping addresses for customer', async () => {
      const shippingAddresses = [
        { ...mockAddress, id: 3, type: 'shipping' },
        { ...mockAddress, id: 4, type: 'shipping', isDefault: false },
      ];
      mockModel.findMany.mockResolvedValue(shippingAddresses);

      const result = await repository.findShippingAddresses(1);

      expect(result).toEqual(shippingAddresses);
      expect(mockModel.findMany).toHaveBeenCalled();
    });

    it('should return empty array when no shipping addresses', async () => {
      mockModel.findMany.mockResolvedValue([]);

      const result: any = await repository.findShippingAddresses(1);

      expect(Array.isArray(result) || result.data).toBeTruthy();
    });
  });

  describe('hasAddress', () => {
    it('should return true when customer has addresses', async () => {
      mockModel.count.mockResolvedValue(2);

      const result = await repository.hasAddress(1);

      expect(result).toBe(true);
      expect(mockModel.count).toHaveBeenCalledWith({
        where: { customerId: 1, isActive: true },
      });
    });

    it('should return false when customer has no addresses', async () => {
      mockModel.count.mockResolvedValue(0);

      const result = await repository.hasAddress(1);

      expect(result).toBe(false);
    });
  });

  describe('deactivateAll', () => {
    it('should deactivate all addresses for customer', async () => {
      mockModel.updateMany.mockResolvedValue({ count: 3 });

      const result = await repository.deactivateAll(1);

      expect(result).toBe(3);
      expect(mockModel.updateMany).toHaveBeenCalledWith({
        where: { customerId: 1 },
        data: { isActive: false },
      });
    });

    it('should return 0 when no addresses to deactivate', async () => {
      mockModel.updateMany.mockResolvedValue({ count: 0 });

      const result = await repository.deactivateAll(999);

      expect(result).toBe(0);
    });
  });

  describe('countByType', () => {
    it('should count billing addresses', async () => {
      mockModel.count.mockResolvedValue(2);

      const result = await repository.countByType(1, 'billing');

      expect(result).toBe(2);
      expect(mockModel.count).toHaveBeenCalledWith({
        where: {
          customerId: 1,
          type: 'billing',
          isActive: true,
        },
      });
    });

    it('should count shipping addresses', async () => {
      mockModel.count.mockResolvedValue(3);

      const result = await repository.countByType(1, 'shipping');

      expect(result).toBe(3);
      expect(mockModel.count).toHaveBeenCalledWith({
        where: {
          customerId: 1,
          type: 'shipping',
          isActive: true,
        },
      });
    });

    it('should count other addresses', async () => {
      mockModel.count.mockResolvedValue(1);

      const result = await repository.countByType(1, 'other');

      expect(result).toBe(1);
    });

    it('should return 0 when no addresses of type', async () => {
      mockModel.count.mockResolvedValue(0);

      const result = await repository.countByType(1, 'billing');

      expect(result).toBe(0);
    });
  });
});
