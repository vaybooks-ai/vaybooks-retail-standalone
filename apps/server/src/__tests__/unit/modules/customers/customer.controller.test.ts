import { Request, Response } from 'express';
import { CustomerController } from '../../../../modules/customers/customer.controller';
import { CustomerService } from '../../../../modules/customers/customer.service';
import {
  createCustomerFixture,
  createCustomerDTOFixture,
  createUpdateCustomerDTOFixture,
  CUSTOMER_SAMPLES,
} from '../../../fixtures/customer.fixtures';

// Mock the CustomerService
jest.mock('../../../../modules/customers/customer.service');

describe('CustomerController', () => {
  let controller: CustomerController;
  let mockService: jest.Mocked<CustomerService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock service
    mockService = {
      getAllCustomers: jest.fn(),
      getCustomerById: jest.fn(),
      getCustomerDetail: jest.fn(),
      getCustomerByCode: jest.fn(),
      createCustomer: jest.fn(),
      updateCustomer: jest.fn(),
      deleteCustomer: jest.fn(),
      generateCustomerCode: jest.fn(),
      getTopCustomers: jest.fn(),
      updateCustomerBalance: jest.fn(),
      checkCreditLimit: jest.fn(),
      getCustomersWithBalance: jest.fn(),
      getActiveCustomers: jest.fn(),
      getCustomersByType: jest.fn(),
      searchCustomers: jest.fn(),
      getCustomerStats: jest.fn(),
      bulkUpdateStatus: jest.fn(),
      bulkImportCustomers: jest.fn(),
      isCodeUnique: jest.fn(),
      isEmailUnique: jest.fn(),
      deleteWithRelations: jest.fn(),
    } as any;

    // Create controller with mocked service
    controller = new CustomerController(null as any);
    (controller as any).service = mockService;

    // Create mock request and response
    mockRequest = {
      body: {},
      params: {},
      query: {},
    } as any;
    (mockRequest as any).user = { id: 1 };

    mockResponse = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  describe('list', () => {
    it('should return paginated customers', async () => {
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
      mockRequest.query = { page: '1', limit: '20' };
      mockService.getAllCustomers.mockResolvedValue(mockResult);

      // Act
      await controller.list(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: CUSTOMER_SAMPLES,
        total: 3,
        page: 1,
        limit: 20,
        pagination: mockResult.pagination,
      });
    });

    it('should apply search filter', async () => {
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
      mockRequest.query = { search: 'test' };
      mockService.getAllCustomers.mockResolvedValue(mockResult as any);

      // Act
      await controller.list(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockService.getAllCustomers).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'test' }),
        expect.any(Object)
      );
    });

    it('should handle errors', async () => {
      // Arrange
      const error = new Error('Database error');
      mockService.getAllCustomers.mockRejectedValue(error);

      // Act
      await controller.list(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should parse pagination parameters', async () => {
      // Arrange
      mockRequest.query = { page: '2', limit: '10' };
      mockService.getAllCustomers.mockResolvedValue({
        data: [],
        pagination: {
          page: 2,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: true,
        },
      });

      // Act
      await controller.list(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockService.getAllCustomers).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({ page: 2, limit: 10 })
      );
    });
  });

  describe('get', () => {
    it('should return customer by ID', async () => {
      // Arrange
      const customer = createCustomerFixture();
      mockRequest.params = { id: '1' };
      mockService.getCustomerById.mockResolvedValue(customer);

      // Act
      await controller.get(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: customer,
      });
    });

    it('should return customer detail when includeDetail flag is set', async () => {
      // Arrange
      const customer = createCustomerFixture();
      mockRequest.params = { id: '1' };
      mockRequest.query = { includeDetail: 'true' };
      mockService.getCustomerDetail.mockResolvedValue(customer as any);

      // Act
      await controller.get(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockService.getCustomerDetail).toHaveBeenCalledWith(1);
    });

    it('should handle errors', async () => {
      // Arrange
      const error = new Error('Customer not found');
      mockRequest.params = { id: '999' };
      mockService.getCustomerById.mockRejectedValue(error);

      // Act
      await controller.get(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getByCode', () => {
    it('should return customer by code', async () => {
      // Arrange
      const customer = createCustomerFixture();
      mockRequest.params = { code: 'CUST001' };
      mockService.getCustomerByCode.mockResolvedValue(customer);

      // Act
      await controller.getByCode(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: customer,
      });
    });

    it('should return 404 when customer not found', async () => {
      // Arrange
      mockRequest.params = { code: 'NONEXISTENT' };
      mockService.getCustomerByCode.mockResolvedValue(null);

      // Act
      await controller.getByCode(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Customer not found',
      });
    });

    it('should handle errors', async () => {
      // Arrange
      const error = new Error('Database error');
      mockRequest.params = { code: 'CUST001' };
      mockService.getCustomerByCode.mockRejectedValue(error);

      // Act
      await controller.getByCode(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('create', () => {
    it('should create customer with valid data', async () => {
      // Arrange
      const data = createCustomerDTOFixture();
      const created = createCustomerFixture();
      mockRequest.body = data;
      (mockRequest as any).user = { id: 1 };
      mockService.createCustomer.mockResolvedValue(created);

      // Act
      await controller.create(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: created,
        message: 'Customer created successfully',
      });
    });

    it('should extract userId from request', async () => {
      // Arrange
      const data = createCustomerDTOFixture();
      mockRequest.body = data;
      (mockRequest as any).user = { id: 5 };
      mockService.createCustomer.mockResolvedValue(createCustomerFixture());

      // Act
      await controller.create(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockService.createCustomer).toHaveBeenCalledWith(data, 5);
    });

    it('should handle errors', async () => {
      // Arrange
      const error = new Error('Validation error');
      mockRequest.body = createCustomerDTOFixture();
      mockService.createCustomer.mockRejectedValue(error);

      // Act
      await controller.create(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('update', () => {
    it('should update customer with valid data', async () => {
      // Arrange
      const updateData = createUpdateCustomerDTOFixture();
      const updated = createCustomerFixture(updateData);
      mockRequest.params = { id: '1' };
      mockRequest.body = updateData;
      (mockRequest as any).user = { id: 1 };
      mockService.updateCustomer.mockResolvedValue(updated);

      // Act
      await controller.update(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: updated,
        message: 'Customer updated successfully',
      });
    });

    it('should extract userId from request', async () => {
      // Arrange
      const updateData = createUpdateCustomerDTOFixture();
      mockRequest.params = { id: '1' };
      mockRequest.body = updateData;
      (mockRequest as any).user = { id: 3 };
      mockService.updateCustomer.mockResolvedValue(createCustomerFixture());

      // Act
      await controller.update(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockService.updateCustomer).toHaveBeenCalledWith(1, updateData, 3);
    });

    it('should handle errors', async () => {
      // Arrange
      const error = new Error('Customer not found');
      mockRequest.params = { id: '999' };
      mockRequest.body = createUpdateCustomerDTOFixture();
      mockService.updateCustomer.mockRejectedValue(error);

      // Act
      await controller.update(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('delete', () => {
    it('should delete customer successfully', async () => {
      // Arrange
      mockRequest.params = { id: '1' };
      mockService.deleteCustomer.mockResolvedValue(true);

      // Act
      await controller.delete(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Customer deleted successfully',
      });
    });

    it('should handle errors', async () => {
      // Arrange
      const error = new Error('Cannot delete customer with balance');
      mockRequest.params = { id: '1' };
      mockService.deleteCustomer.mockRejectedValue(error);

      // Act
      await controller.delete(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('generateCode', () => {
    it('should generate code with default prefix', async () => {
      // Arrange
      mockRequest.query = {};
      mockService.generateCustomerCode.mockResolvedValue('CUST001');

      // Act
      await controller.generateCode(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: { code: 'CUST001' },
      });
    });

    it('should generate code with custom prefix', async () => {
      // Arrange
      mockRequest.query = { prefix: 'CUSTOM' };
      mockService.generateCustomerCode.mockResolvedValue('CUSTOM001');

      // Act
      await controller.generateCode(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockService.generateCustomerCode).toHaveBeenCalledWith('CUSTOM');
    });

    it('should handle errors', async () => {
      // Arrange
      const error = new Error('Generation failed');
      mockRequest.query = {};
      mockService.generateCustomerCode.mockRejectedValue(error);

      // Act
      await controller.generateCode(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getTopCustomers', () => {
    it('should return top customers with default limit', async () => {
      // Arrange
      mockRequest.query = {};
      mockService.getTopCustomers.mockResolvedValue(CUSTOMER_SAMPLES);

      // Act
      await controller.getTopCustomers(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: CUSTOMER_SAMPLES,
      });
    });

    it('should apply custom limit', async () => {
      // Arrange
      mockRequest.query = { limit: '5' };
      mockService.getTopCustomers.mockResolvedValue([CUSTOMER_SAMPLES[0]] as any);

      // Act
      await controller.getTopCustomers(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockService.getTopCustomers).toHaveBeenCalledWith(5);
    });
  });

  describe('updateBalance', () => {
    it('should update customer balance', async () => {
      // Arrange
      const updated = createCustomerFixture({ currentBalance: 1000 });
      mockRequest.params = { id: '1' };
      mockRequest.body = { amount: 1000 };
      mockService.updateCustomerBalance.mockResolvedValue(updated);

      // Act
      await controller.updateBalance(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: updated,
        message: 'Balance updated successfully',
      });
    });

    it('should return 400 when amount is missing', async () => {
      // Arrange
      mockRequest.params = { id: '1' };
      mockRequest.body = {};

      // Act
      await controller.updateBalance(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Amount is required',
      });
    });

    it('should handle errors', async () => {
      // Arrange
      const error = new Error('Update failed');
      mockRequest.params = { id: '1' };
      mockRequest.body = { amount: 1000 };
      mockService.updateCustomerBalance.mockRejectedValue(error);

      // Act
      await controller.updateBalance(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('bulkImport', () => {
    it('should import customers successfully', async () => {
      // Arrange
      const customers = [
        createCustomerDTOFixture({ code: 'CUST001' }),
        createCustomerDTOFixture({ code: 'CUST002' }),
      ];
      mockRequest.body = { customers };
      (mockRequest as any).user = { id: 1 };
      mockService.bulkImportCustomers.mockResolvedValue({
        successCount: 2,
        failedCount: 0,
        errors: [],
      });

      // Act
      await controller.bulkImport(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: { successCount: 2, failedCount: 0, errors: [] },
        message: 'Imported 2 customers successfully',
      });
    });

    it('should return 400 when customers is not an array', async () => {
      // Arrange
      mockRequest.body = { customers: 'not-an-array' };

      // Act
      await controller.bulkImport(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid data format. Expected array of customers',
      });
    });

    it('should handle errors', async () => {
      // Arrange
      const error = new Error('Import failed');
      mockRequest.body = { customers: [] };
      mockService.bulkImportCustomers.mockRejectedValue(error);

      // Act
      await controller.bulkImport(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getActive', () => {
    it('should return active customers', async () => {
      // Arrange
      mockRequest.query = { page: '1', limit: '20' };
      mockService.getActiveCustomers.mockResolvedValue(CUSTOMER_SAMPLES);

      // Act
      await controller.getActive(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: CUSTOMER_SAMPLES,
      });
    });

    it('should apply pagination options', async () => {
      // Arrange
      mockRequest.query = { page: '2', limit: '10' };
      mockService.getActiveCustomers.mockResolvedValue([]);

      // Act
      await controller.getActive(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockService.getActiveCustomers).toHaveBeenCalledWith({
        page: 2,
        limit: 10,
      });
    });
  });

  describe('getByType', () => {
    it('should return customers by type', async () => {
      // Arrange
      mockRequest.params = { type: 'retail' };
      mockRequest.query = { page: '1', limit: '20' };
      mockService.getCustomersByType.mockResolvedValue([CUSTOMER_SAMPLES[0]] as any);

      // Act
      await controller.getByType(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: [CUSTOMER_SAMPLES[0]],
      });
    });

    it('should return 400 for invalid customer type', async () => {
      // Arrange
      mockRequest.params = { type: 'invalid' };
      mockRequest.query = {};

      // Act
      await controller.getByType(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid customer type. Must be retail, wholesale, or distributor',
      });
    });

    it('should handle errors', async () => {
      // Arrange
      const error = new Error('Query failed');
      mockRequest.params = { type: 'retail' };
      mockRequest.query = {};
      mockService.getCustomersByType.mockRejectedValue(error);

      // Act
      await controller.getByType(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getWithBalance', () => {
    it('should return customers with balance', async () => {
      // Arrange
      mockRequest.query = { page: '1', limit: '20' };
      mockService.getCustomersWithBalance.mockResolvedValue([CUSTOMER_SAMPLES[0]] as any);

      // Act
      await controller.getWithBalance(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: [CUSTOMER_SAMPLES[0]],
      });
    });

    it('should apply pagination options', async () => {
      // Arrange
      mockRequest.query = { page: '2', limit: '10' };
      mockService.getCustomersWithBalance.mockResolvedValue([]);

      // Act
      await controller.getWithBalance(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockService.getCustomersWithBalance).toHaveBeenCalledWith({
        page: 2,
        limit: 10,
      });
    });
  });

  describe('checkCreditLimit', () => {
    it('should check credit limit successfully', async () => {
      // Arrange
      mockRequest.body = { customerId: 1, amount: 5000 };
      mockService.checkCreditLimit.mockResolvedValue(true);

      // Act
      await controller.checkCreditLimit(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: { canPurchase: true },
        message: 'Customer can make this purchase',
      });
    });

    it('should return 400 when customerId is missing', async () => {
      // Arrange
      mockRequest.body = { amount: 5000 };

      // Act
      await controller.checkCreditLimit(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'customerId and amount are required',
      });
    });

    it('should return 400 when amount is missing', async () => {
      // Arrange
      mockRequest.body = { customerId: 1 };

      // Act
      await controller.checkCreditLimit(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should handle errors', async () => {
      // Arrange
      const error = new Error('Check failed');
      mockRequest.body = { customerId: 1, amount: 5000 };
      mockService.checkCreditLimit.mockRejectedValue(error);

      // Act
      await controller.checkCreditLimit(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getStats', () => {
    it('should return customer statistics', async () => {
      // Arrange
      const stats = {
        addressCount: 2,
        customFieldCount: 3,
        totalAddresses: 2,
        totalCustomFields: 3,
        defaultBillingAddress: { id: 1 },
        defaultShippingAddress: { id: 2 },
      };
      mockRequest.params = { id: '1' };
      mockService.getCustomerStats.mockResolvedValue(stats);

      // Act
      await controller.getStats(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: stats,
      });
    });

    it('should return 404 when customer not found', async () => {
      // Arrange
      mockRequest.params = { id: '999' };
      mockService.getCustomerStats.mockResolvedValue(null);

      // Act
      await controller.getStats(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Customer not found',
      });
    });

    it('should handle errors', async () => {
      // Arrange
      const error = new Error('Query failed');
      mockRequest.params = { id: '1' };
      mockService.getCustomerStats.mockRejectedValue(error);

      // Act
      await controller.getStats(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('bulkUpdateStatus', () => {
    it('should update status for multiple customers', async () => {
      // Arrange
      mockRequest.body = { ids: [1, 2, 3], isActive: true };
      mockService.bulkUpdateStatus.mockResolvedValue(3);

      // Act
      await controller.bulkUpdateStatus(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: { updatedCount: 3 },
        message: 'Updated 3 customers',
      });
    });

    it('should return 400 when ids is not an array', async () => {
      // Arrange
      mockRequest.body = { ids: 'not-array', isActive: true };

      // Act
      await controller.bulkUpdateStatus(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'ids (array) and isActive (boolean) are required',
      });
    });

    it('should return 400 when isActive is missing', async () => {
      // Arrange
      mockRequest.body = { ids: [1, 2, 3] };

      // Act
      await controller.bulkUpdateStatus(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should handle errors', async () => {
      // Arrange
      const error = new Error('Update failed');
      mockRequest.body = { ids: [1, 2, 3], isActive: true };
      mockService.bulkUpdateStatus.mockRejectedValue(error);

      // Act
      await controller.bulkUpdateStatus(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('checkUniqueCode', () => {
    it('should check if code is unique', async () => {
      // Arrange
      mockRequest.body = { code: 'UNIQUE001' };
      mockRequest.query = {};
      mockService.isCodeUnique.mockResolvedValue(true);

      // Act
      await controller.checkUniqueCode(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: { isUnique: true },
      });
    });

    it('should exclude specified customer ID', async () => {
      // Arrange
      mockRequest.body = { code: 'CUST001' };
      mockRequest.params = { id: '1' };
      mockService.isCodeUnique.mockResolvedValue(true);

      // Act
      await controller.checkUniqueCode(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockService.isCodeUnique).toHaveBeenCalledWith('CUST001', 1);
    });

    it('should return 400 when code is missing', async () => {
      // Arrange
      mockRequest.body = {};
      mockRequest.query = {};

      // Act
      await controller.checkUniqueCode(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Code is required',
      });
    });

    it('should handle errors', async () => {
      // Arrange
      const error = new Error('Check failed');
      mockRequest.body = { code: 'CUST001' };
      mockRequest.query = {};
      mockService.isCodeUnique.mockRejectedValue(error);

      // Act
      await controller.checkUniqueCode(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('checkUniqueEmail', () => {
    it('should check if email is unique', async () => {
      // Arrange
      mockRequest.body = { email: 'unique@example.com' };
      mockRequest.query = {};
      mockService.isEmailUnique.mockResolvedValue(true);

      // Act
      await controller.checkUniqueEmail(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: { isUnique: true },
      });
    });

    it('should exclude specified customer ID', async () => {
      // Arrange
      mockRequest.body = { email: 'test@example.com' };
      mockRequest.params = { id: '1' };
      mockService.isEmailUnique.mockResolvedValue(true);

      // Act
      await controller.checkUniqueEmail(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockService.isEmailUnique).toHaveBeenCalledWith('test@example.com', 1);
    });

    it('should return 400 when email is missing', async () => {
      // Arrange
      mockRequest.body = {};
      mockRequest.query = {};

      // Act
      await controller.checkUniqueEmail(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Email is required',
      });
    });

    it('should handle errors', async () => {
      // Arrange
      const error = new Error('Check failed');
      mockRequest.body = { email: 'test@example.com' };
      mockRequest.query = {};
      mockService.isEmailUnique.mockRejectedValue(error);

      // Act
      await controller.checkUniqueEmail(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});