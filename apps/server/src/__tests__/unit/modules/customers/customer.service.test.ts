import { CustomerService } from '../../../../modules/customers/customer.service';
import { CustomerRepository } from '../../../../modules/customers/customer.repository';
import {
  createCustomerFixture,
  createCustomerDTOFixture,
  createUpdateCustomerDTOFixture,
  CUSTOMER_SAMPLES,
} from '../../../fixtures/customer.fixtures';

// Mock the CustomerRepository
jest.mock('../../../../modules/customers/customer.repository');

describe('CustomerService', () => {
  let service: CustomerService;
  let mockRepository: jest.Mocked<CustomerRepository>;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Create mock repository
    mockRepository = {
      findById: jest.fn(),
      findByCode: jest.fn(),
      findByEmail: jest.fn(),
      findDetailById: jest.fn(),
      findPaginated: jest.fn(),
      searchCustomers: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      isEmailUnique: jest.fn(),
      isCodeUnique: jest.fn(),
      generateNextCode: jest.fn(),
      getTopCustomersByCredit: jest.fn(),
      updateBalance: jest.fn(),
      findWithBalance: jest.fn(),
      findActive: jest.fn(),
      findByType: jest.fn(),
      getCustomerStats: jest.fn(),
      bulkUpdateStatus: jest.fn(),
      deleteWithRelations: jest.fn(),
    } as any;

    // Create service with mocked repository
    service = new CustomerService(null as any);
    (service as any).repository = mockRepository;

    // Mock console.log
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Constructor & Initialization', () => {
    it('should initialize service with repository', () => {
      expect(service).toBeDefined();
      expect((service as any).repository).toBeDefined();
    });
  });

  describe('getAllCustomers', () => {
    it('should return paginated customers without filters', async () => {
      // Arrange
      const mockResult = {
        data: CUSTOMER_SAMPLES,
        pagination: {
          page: 1,
          limit: 20,
          total: 3,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };
      mockRepository.findPaginated.mockResolvedValue(mockResult);

      // Act
      const result = await service.getAllCustomers();

      // Assert
      expect(result).toEqual(mockResult);
      expect(mockRepository.findPaginated).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
        sortBy: 'name',
        sortOrder: 'asc',
      });
    });

    it('should call searchCustomers when filters are provided', async () => {
      // Arrange
      const filters = { search: 'test' };
      const mockResult = {
        data: [CUSTOMER_SAMPLES[0]],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };
      mockRepository.searchCustomers.mockResolvedValue(mockResult as any);

      // Act
      const result = await service.getAllCustomers(filters);

      // Assert
      expect(result).toEqual(mockResult);
      expect(mockRepository.searchCustomers).toHaveBeenCalled();
    });

    it('should apply custom pagination options', async () => {
      // Arrange
      const mockResult = {
        data: CUSTOMER_SAMPLES,
        pagination: {
          page: 2,
          limit: 10,
          total: 3,
          totalPages: 1,
          hasNext: false,
          hasPrev: true,
        },
      };
      mockRepository.findPaginated.mockResolvedValue(mockResult);

      // Act
      await service.getAllCustomers(undefined, { page: 2, limit: 10, sortBy: 'code', sortOrder: 'desc' });

      // Assert
      expect(mockRepository.findPaginated).toHaveBeenCalledWith({
        page: 2,
        limit: 10,
        sortBy: 'code',
        sortOrder: 'desc',
      });
    });
  });

  describe('getCustomerById', () => {
    it('should return customer when found', async () => {
      // Arrange
      const customer = createCustomerFixture();
      mockRepository.findById.mockResolvedValue(customer);

      // Act
      const result = await service.getCustomerById(1);

      // Assert
      expect(result).toEqual(customer);
      expect(mockRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should throw error when customer not found', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getCustomerById(999)).rejects.toThrow('Customer with ID 999 not found');
    });
  });

  describe('getCustomerDetail', () => {
    it('should return customer with relationships', async () => {
      // Arrange
      const customer = createCustomerFixture();
      mockRepository.findDetailById.mockResolvedValue(customer as any);

      // Act
      const result = await service.getCustomerDetail(1);

      // Assert
      expect(result).toEqual(customer);
      expect(mockRepository.findDetailById).toHaveBeenCalledWith(1);
    });

    it('should throw error when customer not found', async () => {
      // Arrange
      mockRepository.findDetailById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getCustomerDetail(999)).rejects.toThrow('Customer with ID 999 not found');
    });
  });

  describe('getCustomerByCode', () => {
    it('should return customer by code', async () => {
      // Arrange
      const customer = createCustomerFixture();
      mockRepository.findByCode.mockResolvedValue(customer);

      // Act
      const result = await service.getCustomerByCode('CUST001');

      // Assert
      expect(result).toEqual(customer);
      expect(mockRepository.findByCode).toHaveBeenCalledWith('CUST001');
    });

    it('should return null when code not found', async () => {
      // Arrange
      mockRepository.findByCode.mockResolvedValue(null);

      // Act
      const result = await service.getCustomerByCode('NONEXISTENT');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('createCustomer', () => {
    it('should create customer with valid data', async () => {
      // Arrange
      const data = createCustomerDTOFixture();
      const createdCustomer = createCustomerFixture();
      mockRepository.findByCode.mockResolvedValue(null);
      mockRepository.isEmailUnique.mockResolvedValue(true);
      mockRepository.create.mockResolvedValue(createdCustomer);

      // Act
      const result = await service.createCustomer(data, 1);

      // Assert
      expect(result).toEqual(createdCustomer);
      expect(mockRepository.findByCode).toHaveBeenCalledWith(data.code);
      expect(mockRepository.isEmailUnique).toHaveBeenCalledWith(data.email);
      expect(mockRepository.create).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Customer created'));
    });

    it('should throw error for duplicate code', async () => {
      // Arrange
      const data = createCustomerDTOFixture();
      mockRepository.findByCode.mockResolvedValue(createCustomerFixture());

      // Act & Assert
      await expect(service.createCustomer(data)).rejects.toThrow('already exists');
    });

    it('should throw error for duplicate email', async () => {
      // Arrange
      const data = createCustomerDTOFixture();
      mockRepository.findByCode.mockResolvedValue(null);
      mockRepository.isEmailUnique.mockResolvedValue(false);

      // Act & Assert
      await expect(service.createCustomer(data)).rejects.toThrow('already exists');
    });

    it('should uppercase customer code', async () => {
      // Arrange
      const data = createCustomerDTOFixture({ code: 'cust001' });
      const createdCustomer = createCustomerFixture({ code: 'CUST001' });
      mockRepository.findByCode.mockResolvedValue(null);
      mockRepository.isEmailUnique.mockResolvedValue(true);
      mockRepository.create.mockResolvedValue(createdCustomer);

      // Act
      await service.createCustomer(data, 1);

      // Assert
      expect(mockRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        code: 'CUST001',
      }));
    });

    it('should set default values', async () => {
      // Arrange
      const data = createCustomerDTOFixture({
        creditLimit: undefined,
        creditTermsDays: undefined,
        taxExempt: undefined,
      });
      const createdCustomer = createCustomerFixture();
      mockRepository.findByCode.mockResolvedValue(null);
      mockRepository.isEmailUnique.mockResolvedValue(true);
      mockRepository.create.mockResolvedValue(createdCustomer);

      // Act
      await service.createCustomer(data, 1);

      // Assert
      expect(mockRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        creditLimit: 0,
        creditTermsDays: 0,
        taxExempt: false,
        isActive: true,
        customerType: 'retail',
        currentBalance: 0,
      }));
    });

    it('should skip email validation if email not provided', async () => {
      // Arrange
      const data = createCustomerDTOFixture({ email: undefined });
      const createdCustomer = createCustomerFixture();
      mockRepository.findByCode.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(createdCustomer);

      // Act
      await service.createCustomer(data, 1);

      // Assert
      expect(mockRepository.isEmailUnique).not.toHaveBeenCalled();
    });
  });

  describe('updateCustomer', () => {
    it('should update customer with valid data', async () => {
      // Arrange
      const existing = createCustomerFixture();
      const updateData = createUpdateCustomerDTOFixture();
      const updated = createCustomerFixture(updateData);
      mockRepository.findById.mockResolvedValue(existing);
      mockRepository.isEmailUnique.mockResolvedValue(true);
      mockRepository.update.mockResolvedValue(updated);

      // Act
      const result = await service.updateCustomer(1, updateData, 1);

      // Assert
      expect(result).toEqual(updated);
      expect(mockRepository.update).toHaveBeenCalledWith(1, expect.objectContaining(updateData));
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Customer updated'));
    });

    it('should throw error when customer not found', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.updateCustomer(999, {})).rejects.toThrow('Customer with ID 999 not found');
    });

    it('should validate email uniqueness when email is changed', async () => {
      // Arrange
      const existing = createCustomerFixture({ email: 'old@example.com' });
      const updateData = createUpdateCustomerDTOFixture({ email: 'new@example.com' });
      const updated = createCustomerFixture(updateData);
      mockRepository.findById.mockResolvedValue(existing);
      mockRepository.isEmailUnique.mockResolvedValue(true);
      mockRepository.update.mockResolvedValue(updated);

      // Act
      await service.updateCustomer(1, updateData, 1);

      // Assert
      expect(mockRepository.isEmailUnique).toHaveBeenCalledWith('new@example.com', 1);
    });

    it('should throw error if new email already exists', async () => {
      // Arrange
      const existing = createCustomerFixture({ email: 'old@example.com' });
      const updateData = createUpdateCustomerDTOFixture({ email: 'duplicate@example.com' });
      mockRepository.findById.mockResolvedValue(existing);
      mockRepository.isEmailUnique.mockResolvedValue(false);

      // Act & Assert
      await expect(service.updateCustomer(1, updateData)).rejects.toThrow('already exists');
    });

    it('should skip email validation if email not changed', async () => {
      // Arrange
      const existing = createCustomerFixture({ email: 'test@example.com' });
      const updateData = createUpdateCustomerDTOFixture({ email: 'test@example.com' });
      const updated = createCustomerFixture(updateData);
      mockRepository.findById.mockResolvedValue(existing);
      mockRepository.update.mockResolvedValue(updated);

      // Act
      await service.updateCustomer(1, updateData, 1);

      // Assert
      expect(mockRepository.isEmailUnique).not.toHaveBeenCalled();
    });
  });

  describe('deleteCustomer', () => {
    it('should soft delete customer with zero balance', async () => {
      // Arrange
      const customer = createCustomerFixture({ currentBalance: 0 });
      mockRepository.findById.mockResolvedValue(customer);
      mockRepository.update.mockResolvedValue(createCustomerFixture({ isActive: false }));

      // Act
      const result = await service.deleteCustomer(1);

      // Assert
      expect(result).toBe(true);
      expect(mockRepository.update).toHaveBeenCalledWith(1, { isActive: false });
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Customer deactivated'));
    });

    it('should throw error when customer not found', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.deleteCustomer(999)).rejects.toThrow('Customer with ID 999 not found');
    });

    it('should throw error when customer has outstanding balance', async () => {
      // Arrange
      const customer = createCustomerFixture({ currentBalance: 1000 });
      mockRepository.findById.mockResolvedValue(customer);

      // Act & Assert
      await expect(service.deleteCustomer(1)).rejects.toThrow('Cannot delete customer with outstanding balance');
    });
  });

  describe('generateCustomerCode', () => {
    it('should generate code with default prefix', async () => {
      // Arrange
      mockRepository.generateNextCode.mockResolvedValue('CUST001');

      // Act
      const result = await service.generateCustomerCode();

      // Assert
      expect(result).toBe('CUST001');
      expect(mockRepository.generateNextCode).toHaveBeenCalledWith('CUST');
    });

    it('should generate code with custom prefix', async () => {
      // Arrange
      mockRepository.generateNextCode.mockResolvedValue('CUSTOM001');

      // Act
      const result = await service.generateCustomerCode('CUSTOM');

      // Assert
      expect(result).toBe('CUSTOM001');
      expect(mockRepository.generateNextCode).toHaveBeenCalledWith('CUSTOM');
    });
  });

  describe('getTopCustomers', () => {
    it('should return top customers with default limit', async () => {
      // Arrange
      mockRepository.getTopCustomersByCredit.mockResolvedValue(CUSTOMER_SAMPLES);

      // Act
      const result = await service.getTopCustomers();

      // Assert
      expect(result).toEqual(CUSTOMER_SAMPLES);
      expect(mockRepository.getTopCustomersByCredit).toHaveBeenCalledWith(10);
    });

    it('should return top customers with custom limit', async () => {
      // Arrange
      mockRepository.getTopCustomersByCredit.mockResolvedValue([CUSTOMER_SAMPLES[0]] as any);

      // Act
      await service.getTopCustomers(5);

      // Assert
      expect(mockRepository.getTopCustomersByCredit).toHaveBeenCalledWith(5);
    });
  });

  describe('updateCustomerBalance', () => {
    it('should update customer balance', async () => {
      // Arrange
      const updated = createCustomerFixture({ currentBalance: 1000 });
      mockRepository.updateBalance.mockResolvedValue(updated);

      // Act
      const result = await service.updateCustomerBalance(1, 1000);

      // Assert
      expect(result).toEqual(updated);
      expect(mockRepository.updateBalance).toHaveBeenCalledWith(1, 1000);
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('balance updated'));
    });

    it('should return null when update fails', async () => {
      // Arrange
      mockRepository.updateBalance.mockResolvedValue(null);

      // Act
      const result = await service.updateCustomerBalance(1, 1000);

      // Assert
      expect(result).toBeNull();
      expect(console.log).not.toHaveBeenCalled();
    });
  });

  describe('checkCreditLimit', () => {
    it('should return true when customer has no credit limit', async () => {
      // Arrange
      const customer = createCustomerFixture({ creditLimit: 0 });
      mockRepository.findById.mockResolvedValue(customer);

      // Act
      const result = await service.checkCreditLimit(1, 5000);

      // Assert
      expect(result).toBe(true);
    });

    it('should return true when purchase is within credit limit', async () => {
      // Arrange
      const customer = createCustomerFixture({ creditLimit: 10000, currentBalance: 2000 });
      mockRepository.findById.mockResolvedValue(customer);

      // Act
      const result = await service.checkCreditLimit(1, 5000);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when purchase exceeds credit limit', async () => {
      // Arrange
      const customer = createCustomerFixture({ creditLimit: 10000, currentBalance: 8000 });
      mockRepository.findById.mockResolvedValue(customer);

      // Act
      const result = await service.checkCreditLimit(1, 5000);

      // Assert
      expect(result).toBe(false);
    });

    it('should throw error when customer not found', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.checkCreditLimit(999, 5000)).rejects.toThrow('Customer with ID 999 not found');
    });
  });

  describe('getCustomersWithBalance', () => {
    it('should return customers with outstanding balance', async () => {
      // Arrange
      const customers = [CUSTOMER_SAMPLES[0]];
      mockRepository.findWithBalance.mockResolvedValue(customers as any);

      // Act
      const result = await service.getCustomersWithBalance();

      // Assert
      expect(result).toEqual(customers);
      expect(mockRepository.findWithBalance).toHaveBeenCalled();
    });

    it('should apply pagination options', async () => {
      // Arrange
      mockRepository.findWithBalance.mockResolvedValue([]);

      // Act
      await service.getCustomersWithBalance({ page: 2, limit: 10 });

      // Assert
      expect(mockRepository.findWithBalance).toHaveBeenCalledWith({ page: 2, limit: 10 });
    });
  });

  describe('getActiveCustomers', () => {
    it('should return active customers', async () => {
      // Arrange
      mockRepository.findActive.mockResolvedValue(CUSTOMER_SAMPLES);

      // Act
      const result = await service.getActiveCustomers();

      // Assert
      expect(result).toEqual(CUSTOMER_SAMPLES);
      expect(mockRepository.findActive).toHaveBeenCalled();
    });
  });

  describe('getCustomersByType', () => {
    it('should return customers by type', async () => {
      // Arrange
      const retailCustomers = [CUSTOMER_SAMPLES[0]];
      mockRepository.findByType.mockResolvedValue(retailCustomers as any);

      // Act
      const result = await service.getCustomersByType('retail');

      // Assert
      expect(result).toEqual(retailCustomers);
      expect(mockRepository.findByType).toHaveBeenCalledWith('retail', undefined);
    });

    it('should apply pagination options', async () => {
      // Arrange
      mockRepository.findByType.mockResolvedValue([]);

      // Act
      await service.getCustomersByType('wholesale', { page: 1, limit: 20 });

      // Assert
      expect(mockRepository.findByType).toHaveBeenCalledWith('wholesale', { page: 1, limit: 20 });
    });
  });

  describe('searchCustomers', () => {
    it('should search customers with filters', async () => {
      // Arrange
      const mockResult = {
        data: [CUSTOMER_SAMPLES[0]],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };
      mockRepository.searchCustomers.mockResolvedValue(mockResult as any);

      // Act
      const result = await service.searchCustomers({ search: 'test' });

      // Assert
      expect(result).toEqual(mockResult);
      expect(mockRepository.searchCustomers).toHaveBeenCalled();
    });
  });

  describe('getCustomerStats', () => {
    it('should return customer statistics', async () => {
      // Arrange
      const stats = {
        totalAddresses: 2,
        totalCustomFields: 3,
        defaultBillingAddress: { id: 1 },
        defaultShippingAddress: { id: 2 },
      };
      mockRepository.getCustomerStats.mockResolvedValue(stats);

      // Act
      const result = await service.getCustomerStats(1);

      // Assert
      expect(result).toEqual(stats);
      expect(mockRepository.getCustomerStats).toHaveBeenCalledWith(1);
    });

    it('should return null when customer not found', async () => {
      // Arrange
      mockRepository.getCustomerStats.mockResolvedValue(null);

      // Act
      const result = await service.getCustomerStats(999);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('bulkUpdateStatus', () => {
    it('should update status for multiple customers', async () => {
      // Arrange
      mockRepository.bulkUpdateStatus.mockResolvedValue(3);

      // Act
      const result = await service.bulkUpdateStatus([1, 2, 3], true);

      // Assert
      expect(result).toBe(3);
      expect(mockRepository.bulkUpdateStatus).toHaveBeenCalledWith([1, 2, 3], true);
    });
  });

  describe('bulkImportCustomers', () => {
    it('should import multiple customers successfully', async () => {
      // Arrange
      const customers = [
        createCustomerDTOFixture({ code: 'CUST001' }),
        createCustomerDTOFixture({ code: 'CUST002' }),
      ];
      mockRepository.findByCode.mockResolvedValue(null);
      mockRepository.isEmailUnique.mockResolvedValue(true);
      mockRepository.create.mockResolvedValue(createCustomerFixture());

      // Act
      const result = await service.bulkImportCustomers(customers, 1);

      // Assert
      expect(result.success).toBe(2);
      expect(result.failed).toBe(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle partial failures in bulk import', async () => {
      // Arrange
      const customers = [
        createCustomerDTOFixture({ code: 'CUST001' }),
        createCustomerDTOFixture({ code: 'CUST002' }),
      ];
      mockRepository.findByCode
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(createCustomerFixture()); // Second one fails
      mockRepository.isEmailUnique.mockResolvedValue(true);
      mockRepository.create.mockResolvedValue(createCustomerFixture());

      // Act
      const result = await service.bulkImportCustomers(customers, 1);

      // Assert
      expect(result.success).toBe(1);
      expect(result.failed).toBe(1);
      expect(result.errors).toHaveLength(1);
    });
  });

  describe('isCodeUnique', () => {
    it('should return true when code is unique', async () => {
      // Arrange
      mockRepository.isCodeUnique.mockResolvedValue(true);

      // Act
      const result = await service.isCodeUnique('UNIQUE001');

      // Assert
      expect(result).toBe(true);
      expect(mockRepository.isCodeUnique).toHaveBeenCalledWith('UNIQUE001', undefined);
    });

    it('should exclude specified customer ID', async () => {
      // Arrange
      mockRepository.isCodeUnique.mockResolvedValue(true);

      // Act
      await service.isCodeUnique('CUST001', 1);

      // Assert
      expect(mockRepository.isCodeUnique).toHaveBeenCalledWith('CUST001', 1);
    });
  });

  describe('isEmailUnique', () => {
    it('should return true when email is unique', async () => {
      // Arrange
      mockRepository.isEmailUnique.mockResolvedValue(true);

      // Act
      const result = await service.isEmailUnique('unique@example.com');

      // Assert
      expect(result).toBe(true);
      expect(mockRepository.isEmailUnique).toHaveBeenCalledWith('unique@example.com', undefined);
    });

    it('should exclude specified customer ID', async () => {
      // Arrange
      mockRepository.isEmailUnique.mockResolvedValue(true);

      // Act
      await service.isEmailUnique('test@example.com', 1);

      // Assert
      expect(mockRepository.isEmailUnique).toHaveBeenCalledWith('test@example.com', 1);
    });
  });

  describe('deleteWithRelations', () => {
    it('should delete customer with all relations', async () => {
      // Arrange
      const customer = createCustomerFixture();
      mockRepository.findById.mockResolvedValue(customer);
      mockRepository.deleteWithRelations.mockResolvedValue(true);

      // Act
      const result = await service.deleteWithRelations(1);

      // Assert
      expect(result).toBe(true);
      expect(mockRepository.deleteWithRelations).toHaveBeenCalledWith(1);
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Customer deleted'));
    });

    it('should throw error when customer not found', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.deleteWithRelations(999)).rejects.toThrow('Customer with ID 999 not found');
    });
  });
});
