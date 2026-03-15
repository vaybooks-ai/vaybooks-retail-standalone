import request from 'supertest';
import { Application } from 'express';
import { PrismaClient } from '@prisma/client';
import { createApp } from '../../app';
import { setupTestDatabase, teardownTestDatabase, resetDatabase } from '../fixtures/test-db';
import { createCustomerDTOFixture } from '../fixtures/customer.fixtures';

describe('Customer API Integration Tests', () => {
  let app: Application;
  let prisma: PrismaClient;

  beforeAll(async () => {
    prisma = await setupTestDatabase();
    app = createApp(prisma);
  });

  afterAll(async () => {
    await teardownTestDatabase(prisma);
  });

  beforeEach(async () => {
    await resetDatabase(prisma);
  });

  describe('GET /api/v1/customers', () => {
    it('should list all customers with pagination', async () => {
      // Arrange
      const customer = await prisma.customer.create({
        data: createCustomerDTOFixture(),
      });

      // Act
      const response = await request(app)
        .get('/api/v1/customers')
        .query({ page: 1, limit: 10 });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].code).toBe(customer.code);
    });

    it('should filter customers by search term', async () => {
      // Arrange
      await prisma.customer.create({
        data: createCustomerDTOFixture({ name: 'John Doe' }),
      });
      await prisma.customer.create({
        data: createCustomerDTOFixture({ code: 'CUST002', name: 'Jane Smith' }),
      });

      // Act
      const response = await request(app)
        .get('/api/v1/customers')
        .query({ search: 'John' });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('John Doe');
    });

    it('should filter customers by isActive', async () => {
      // Arrange
      await prisma.customer.create({
        data: createCustomerDTOFixture(),
      });
      await prisma.customer.create({
        data: { ...createCustomerDTOFixture({ code: 'CUST002' }), isActive: false },
      });

      // Act
      const response = await request(app)
        .get('/api/v1/customers')
        .query({ isActive: true });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].isActive).toBe(true);
    });

    it('should filter customers by hasBalance', async () => {
      // Arrange
      await prisma.customer.create({
        data: { ...createCustomerDTOFixture(), currentBalance: 100 },
      });
      await prisma.customer.create({
        data: createCustomerDTOFixture({ code: 'CUST002' }),
      });

      // Act
      const response = await request(app)
        .get('/api/v1/customers')
        .query({ hasBalance: true });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].currentBalance).toBeGreaterThan(0);
    });

    it('should filter customers by customerType', async () => {
      // Arrange
      await prisma.customer.create({
        data: createCustomerDTOFixture({ customerType: 'retail' }),
      });
      await prisma.customer.create({
        data: createCustomerDTOFixture({ code: 'CUST002', customerType: 'wholesale' }),
      });

      // Act
      const response = await request(app)
        .get('/api/v1/customers')
        .query({ customerType: 'retail' });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].customerType).toBe('retail');
    });

    it('should sort customers by different fields', async () => {
      // Arrange
      await prisma.customer.create({
        data: createCustomerDTOFixture({ code: 'CUST001', name: 'Charlie' }),
      });
      await prisma.customer.create({
        data: createCustomerDTOFixture({ code: 'CUST002', name: 'Alice' }),
      });
      await prisma.customer.create({
        data: createCustomerDTOFixture({ code: 'CUST003', name: 'Bob' }),
      });

      // Act
      const response = await request(app)
        .get('/api/v1/customers')
        .query({ sortBy: 'name', sortOrder: 'asc' });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(3);
      expect(response.body.data[0].name).toBe('Alice');
      expect(response.body.data[1].name).toBe('Bob');
      expect(response.body.data[2].name).toBe('Charlie');
    });

    it('should combine multiple filters', async () => {
      // Arrange
      await prisma.customer.create({
        data: createCustomerDTOFixture({
          name: 'Active Retail Customer',
          customerType: 'retail',
        }),
      });
      await prisma.customer.create({
        data: {
          ...createCustomerDTOFixture({
            code: 'CUST002',
            name: 'Inactive Retail Customer',
            customerType: 'retail',
          }),
          isActive: false,
        },
      });
      await prisma.customer.create({
        data: createCustomerDTOFixture({
          code: 'CUST003',
          name: 'Active Wholesale Customer',
          customerType: 'wholesale',
        }),
      });

      // Act
      const response = await request(app)
        .get('/api/v1/customers')
        .query({ customerType: 'retail', isActive: true });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('Active Retail Customer');
    });

    it('should validate response format', async () => {
      // Arrange
      await prisma.customer.create({
        data: createCustomerDTOFixture(),
      });

      // Act
      const response = await request(app)
        .get('/api/v1/customers');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('limit');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/v1/customers/:id', () => {
    it('should get customer by ID', async () => {
      // Arrange
      const customer = await prisma.customer.create({
        data: createCustomerDTOFixture(),
      });

      // Act
      const response = await request(app)
        .get(`/api/v1/customers/${customer.id}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(customer.id);
      expect(response.body.data.code).toBe(customer.code);
    });

    it('should get customer with detail flag', async () => {
      // Arrange
      const customer = await prisma.customer.create({
        data: createCustomerDTOFixture(),
      });

      // Act
      const response = await request(app)
        .get(`/api/v1/customers/${customer.id}`)
        .query({ detail: true });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(customer.id);
    });

    it('should return 404 for non-existent customer', async () => {
      // Act
      const response = await request(app)
        .get('/api/v1/customers/99999');

      // Assert
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('should include all required fields in response', async () => {
      // Arrange
      const customer = await prisma.customer.create({
        data: createCustomerDTOFixture(),
      });

      // Act
      const response = await request(app)
        .get(`/api/v1/customers/${customer.id}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('code');
      expect(response.body.data).toHaveProperty('name');
      expect(response.body.data).toHaveProperty('email');
      expect(response.body.data).toHaveProperty('customerType');
      expect(response.body.data).toHaveProperty('isActive');
    });
  });

  describe('GET /api/v1/customers/code/:code', () => {
    it('should get customer by code', async () => {
      // Arrange
      await prisma.customer.create({
        data: createCustomerDTOFixture({ code: 'TESTCODE' }),
      });

      // Act
      const response = await request(app)
        .get('/api/v1/customers/code/TESTCODE');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data.code).toBe('TESTCODE');
    });

    it('should return 404 for non-existent code', async () => {
      // Act
      const response = await request(app)
        .get('/api/v1/customers/code/NONEXISTENT');

      // Assert
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('should perform case-sensitive code matching', async () => {
      // Arrange
      await prisma.customer.create({
        data: createCustomerDTOFixture({ code: 'TESTCODE' }),
      });

      // Act
      const response = await request(app)
        .get('/api/v1/customers/code/testcode');

      // Assert
      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/v1/customers/generate-code', () => {
    it('should generate code with default prefix', async () => {
      // Act
      const response = await request(app)
        .get('/api/v1/customers/generate-code');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data.code).toMatch(/^CUST\d+$/);
    });

    it('should generate code with custom prefix', async () => {
      // Act
      const response = await request(app)
        .get('/api/v1/customers/generate-code')
        .query({ prefix: 'RETAIL' });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data.code).toMatch(/^RETAIL\d+$/);
    });

    it('should increment correctly', async () => {
      // Arrange
      await prisma.customer.create({
        data: createCustomerDTOFixture({ code: 'CUST001' }),
      });

      // Act
      const response = await request(app)
        .get('/api/v1/customers/generate-code');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data.code).toBe('CUST002');
    });
  });

  describe('GET /api/v1/customers/top', () => {
    it('should get top customers by credit limit', async () => {
      // Arrange
      await prisma.customer.create({
        data: createCustomerDTOFixture({ code: 'CUST001', creditLimit: 1000 }),
      });
      await prisma.customer.create({
        data: createCustomerDTOFixture({ code: 'CUST002', creditLimit: 5000 }),
      });
      await prisma.customer.create({
        data: createCustomerDTOFixture({ code: 'CUST003', creditLimit: 3000 }),
      });

      // Act
      const response = await request(app)
        .get('/api/v1/customers/top');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(3);
    });

    it('should respect limit parameter', async () => {
      // Arrange
      await prisma.customer.create({
        data: createCustomerDTOFixture({ code: 'CUST001', creditLimit: 1000 }),
      });
      await prisma.customer.create({
        data: createCustomerDTOFixture({ code: 'CUST002', creditLimit: 5000 }),
      });
      await prisma.customer.create({
        data: createCustomerDTOFixture({ code: 'CUST003', creditLimit: 3000 }),
      });

      // Act
      const response = await request(app)
        .get('/api/v1/customers/top')
        .query({ limit: 2 });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
    });

    it('should be ordered by credit limit descending', async () => {
      // Arrange
      await prisma.customer.create({
        data: createCustomerDTOFixture({ code: 'CUST001', creditLimit: 1000 }),
      });
      await prisma.customer.create({
        data: createCustomerDTOFixture({ code: 'CUST002', creditLimit: 5000 }),
      });
      await prisma.customer.create({
        data: createCustomerDTOFixture({ code: 'CUST003', creditLimit: 3000 }),
      });

      // Act
      const response = await request(app)
        .get('/api/v1/customers/top');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data[0].creditLimit).toBe(5000);
      expect(response.body.data[1].creditLimit).toBe(3000);
      expect(response.body.data[2].creditLimit).toBe(1000);
    });
  });

  describe('GET /api/v1/customers/active', () => {
    it('should get only active customers', async () => {
      // Arrange
      await prisma.customer.create({
        data: createCustomerDTOFixture(),
      });
      await prisma.customer.create({
        data: { ...createCustomerDTOFixture({ code: 'CUST002' }), isActive: false },
      });

      // Act
      const response = await request(app)
        .get('/api/v1/customers/active');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].isActive).toBe(true);
    });

    it('should support pagination', async () => {
      // Arrange
      await prisma.customer.create({
        data: createCustomerDTOFixture({ code: 'CUST001' }),
      });
      await prisma.customer.create({
        data: createCustomerDTOFixture({ code: 'CUST002' }),
      });

      // Act
      const response = await request(app)
        .get('/api/v1/customers/active')
        .query({ page: 1, limit: 1 });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
    });
  });

  describe('GET /api/v1/customers/type/:type', () => {
    it('should get customers by retail type', async () => {
      // Arrange
      await prisma.customer.create({
        data: createCustomerDTOFixture({ customerType: 'retail' }),
      });
      await prisma.customer.create({
        data: createCustomerDTOFixture({ code: 'CUST002', customerType: 'wholesale' }),
      });

      // Act
      const response = await request(app)
        .get('/api/v1/customers/type/retail');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].customerType).toBe('retail');
    });

    it('should get customers by wholesale type', async () => {
      // Arrange
      await prisma.customer.create({
        data: createCustomerDTOFixture({ customerType: 'wholesale' }),
      });
      await prisma.customer.create({
        data: createCustomerDTOFixture({ code: 'CUST002', customerType: 'retail' }),
      });

      // Act
      const response = await request(app)
        .get('/api/v1/customers/type/wholesale');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].customerType).toBe('wholesale');
    });

    it('should get customers by distributor type', async () => {
      // Arrange
      await prisma.customer.create({
        data: createCustomerDTOFixture({ customerType: 'distributor' }),
      });

      // Act
      const response = await request(app)
        .get('/api/v1/customers/type/distributor');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].customerType).toBe('distributor');
    });

    it('should return 400 for invalid type', async () => {
      // Act
      const response = await request(app)
        .get('/api/v1/customers/type/invalid');

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/v1/customers/balance', () => {
    it('should get customers with outstanding balance', async () => {
      // Arrange
      await prisma.customer.create({
        data: { ...createCustomerDTOFixture(), currentBalance: 100 },
      });
      await prisma.customer.create({
        data: createCustomerDTOFixture({ code: 'CUST002' }),
      });

      // Act
      const response = await request(app)
        .get('/api/v1/customers/balance');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].currentBalance).toBeGreaterThan(0);
    });

    it('should support pagination', async () => {
      // Arrange
      await prisma.customer.create({
        data: { ...createCustomerDTOFixture({ code: 'CUST001' }), currentBalance: 100 },
      });
      await prisma.customer.create({
        data: { ...createCustomerDTOFixture({ code: 'CUST002' }), currentBalance: 200 },
      });

      // Act
      const response = await request(app)
        .get('/api/v1/customers/balance')
        .query({ page: 1, limit: 1 });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
    });
  });

  describe('GET /api/v1/customers/:id/stats', () => {
    it('should get customer statistics', async () => {
      // Arrange
      const customer = await prisma.customer.create({
        data: createCustomerDTOFixture(),
      });

      // Act
      const response = await request(app)
        .get(`/api/v1/customers/${customer.id}/stats`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('addressCount');
      expect(response.body.data).toHaveProperty('customFieldCount');
    });

    it('should return 404 for non-existent customer', async () => {
      // Act
      const response = await request(app)
        .get('/api/v1/customers/99999/stats');

      // Assert
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('should include address and field counts', async () => {
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
      const response = await request(app)
        .get(`/api/v1/customers/${customer.id}/stats`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data.addressCount).toBe(1);
    });
  });

  describe('POST /api/v1/customers', () => {
    it('should create customer with valid data', async () => {
      // Arrange
      const data = createCustomerDTOFixture();

      // Act
      const response = await request(app)
        .post('/api/v1/customers')
        .send(data);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.data.code).toBe(data.code.toUpperCase());
      expect(response.body.data.isActive).toBe(true);
    });

    it('should return created customer', async () => {
      // Arrange
      const data = createCustomerDTOFixture();

      // Act
      const response = await request(app)
        .post('/api/v1/customers')
        .send(data);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe(data.name);
    });

    it('should return 400 for validation errors', async () => {
      // Arrange
      const data = { name: 'Test' }; // Missing required code

      // Act
      const response = await request(app)
        .post('/api/v1/customers')
        .send(data);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for duplicate code', async () => {
      // Arrange
      const data = createCustomerDTOFixture();
      await prisma.customer.create({ data });

      // Act
      const response = await request(app)
        .post('/api/v1/customers')
        .send(data);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for duplicate email', async () => {
      // Arrange
      const data = createCustomerDTOFixture({ email: 'duplicate@example.com' });
      await prisma.customer.create({ data });

      const newData = createCustomerDTOFixture({
        code: 'CUST002',
        email: 'duplicate@example.com',
      });

      // Act
      const response = await request(app)
        .post('/api/v1/customers')
        .send(newData);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should uppercase code automatically', async () => {
      // Arrange
      const data = createCustomerDTOFixture({ code: 'lowercase' });

      // Act
      const response = await request(app)
        .post('/api/v1/customers')
        .send(data);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.data.code).toBe('LOWERCASE');
    });

    it('should set default values', async () => {
      // Arrange
      const data = {
        code: 'CUST001',
        name: 'Test Customer',
        customerType: 'retail',
      };

      // Act
      const response = await request(app)
        .post('/api/v1/customers')
        .send(data);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.data.isActive).toBe(true);
      expect(response.body.data.currentBalance).toBe(0);
    });
  });

  describe('POST /api/v1/customers/bulk-import', () => {
    it('should import multiple customers', async () => {
      // Arrange
      const customers = [
        createCustomerDTOFixture({ code: 'BULK001', email: 'bulk1@example.com' }),
        createCustomerDTOFixture({ code: 'BULK002', email: 'bulk2@example.com' }),
        createCustomerDTOFixture({ code: 'BULK003', email: 'bulk3@example.com' }),
      ];

      // Act
      const response = await request(app)
        .post('/api/v1/customers/bulk-import')
        .send({ customers });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data.successCount).toBe(3);
      expect(response.body.data.failedCount).toBe(0);
    });

    it('should handle partial failures', async () => {
      // Arrange
      await prisma.customer.create({
        data: createCustomerDTOFixture({ code: 'BULK001', email: 'existing@example.com' }),
      });

      const customers = [
        createCustomerDTOFixture({ code: 'BULK001', email: 'bulk1@example.com' }), // Duplicate code
        createCustomerDTOFixture({ code: 'BULK002', email: 'bulk2@example.com' }),
      ];

      // Act
      const response = await request(app)
        .post('/api/v1/customers/bulk-import')
        .send({ customers });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data.successCount).toBe(1);
      expect(response.body.data.failedCount).toBe(1);
    });

    it('should return success/failed counts', async () => {
      // Arrange
      const customers = [
        createCustomerDTOFixture({ code: 'BULK001' }),
        { code: 'INVALID' }, // Invalid data
      ];

      // Act
      const response = await request(app)
        .post('/api/v1/customers/bulk-import')
        .send({ customers });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('successCount');
      expect(response.body.data).toHaveProperty('failedCount');
    });

    it('should return error messages', async () => {
      // Arrange
      const customers = [
        { code: 'INVALID' }, // Missing required fields
      ];

      // Act
      const response = await request(app)
        .post('/api/v1/customers/bulk-import')
        .send({ customers });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data.errors).toBeDefined();
      expect(response.body.data.errors.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/v1/customers/bulk-status', () => {
    it('should update status for multiple customers', async () => {
      // Arrange
      const customer1 = await prisma.customer.create({
        data: createCustomerDTOFixture({ code: 'CUST001' }),
      });
      const customer2 = await prisma.customer.create({
        data: createCustomerDTOFixture({ code: 'CUST002' }),
      });

      // Act
      const response = await request(app)
        .post('/api/v1/customers/bulk-status')
        .send({
          ids: [customer1.id, customer2.id],
          isActive: false,
        });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data.updatedCount).toBe(2);
    });

    it('should return 400 for invalid parameters', async () => {
      // Act
      const response = await request(app)
        .post('/api/v1/customers/bulk-status')
        .send({ ids: [] });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return updated count', async () => {
      // Arrange
      const customer = await prisma.customer.create({
        data: createCustomerDTOFixture(),
      });

      // Act
      const response = await request(app)
        .post('/api/v1/customers/bulk-status')
        .send({
          ids: [customer.id],
          isActive: false,
        });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data.updatedCount).toBe(1);
    });
  });

  describe('POST /api/v1/customers/:id/balance', () => {
    it('should update customer balance', async () => {
      // Arrange
      const customer = await prisma.customer.create({
        data: createCustomerDTOFixture(),
      });

      // Act
      const response = await request(app)
        .post(`/api/v1/customers/${customer.id}/balance`)
        .send({ amount: 100 });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data.currentBalance).toBe(100);
    });

    it('should return 400 for missing amount', async () => {
      // Arrange
      const customer = await prisma.customer.create({
        data: createCustomerDTOFixture(),
      });

      // Act
      const response = await request(app)
        .post(`/api/v1/customers/${customer.id}/balance`)
        .send({});

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return updated customer', async () => {
      // Arrange
      const customer = await prisma.customer.create({
        data: createCustomerDTOFixture(),
      });

      // Act
      const response = await request(app)
        .post(`/api/v1/customers/${customer.id}/balance`)
        .send({ amount: 100 });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('currentBalance');
    });
  });

  describe('POST /api/v1/customers/check-credit', () => {
    it('should check credit limit', async () => {
      // Arrange
      const customer = await prisma.customer.create({
        data: {
          ...createCustomerDTOFixture({
            creditLimit: 1000,
          }),
          currentBalance: 500,
        },
      });

      // Act
      const response = await request(app)
        .post('/api/v1/customers/check-credit')
        .send({ customerId: customer.id, amount: 400 });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data.canPurchase).toBe(true);
    });

    it('should return canPurchase flag', async () => {
      // Arrange
      const customer = await prisma.customer.create({
        data: {
          ...createCustomerDTOFixture({
            creditLimit: 1000,
          }),
          currentBalance: 900,
        },
      });

      // Act
      const response = await request(app)
        .post('/api/v1/customers/check-credit')
        .send({ customerId: customer.id, amount: 200 });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data.canPurchase).toBe(false);
    });

    it('should return 400 for missing parameters', async () => {
      // Act
      const response = await request(app)
        .post('/api/v1/customers/check-credit')
        .send({ customerId: 1 });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/v1/customers/:id/check-unique-code', () => {
    it('should check code uniqueness', async () => {
      // Arrange
      const customer = await prisma.customer.create({
        data: createCustomerDTOFixture({ code: 'CUST001' }),
      });

      // Act
      const response = await request(app)
        .post(`/api/v1/customers/${customer.id}/check-unique-code`)
        .send({ code: 'NEWCODE' });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data.isUnique).toBe(true);
    });

    it('should exclude current customer', async () => {
      // Arrange
      const customer = await prisma.customer.create({
        data: createCustomerDTOFixture({ code: 'CUST001' }),
      });

      // Act
      const response = await request(app)
        .post(`/api/v1/customers/${customer.id}/check-unique-code`)
        .send({ code: 'CUST001' });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data.isUnique).toBe(true);
    });

    it('should return isUnique flag', async () => {
      // Arrange
      const customer1 = await prisma.customer.create({
        data: createCustomerDTOFixture({ code: 'CUST001' }),
      });
      await prisma.customer.create({
        data: createCustomerDTOFixture({ code: 'CUST002' }),
      });

      // Act
      const response = await request(app)
        .post(`/api/v1/customers/${customer1.id}/check-unique-code`)
        .send({ code: 'CUST002' });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data.isUnique).toBe(false);
    });
  });

  describe('POST /api/v1/customers/:id/check-unique-email', () => {
    it('should check email uniqueness', async () => {
      // Arrange
      const customer = await prisma.customer.create({
        data: createCustomerDTOFixture({ email: 'test@example.com' }),
      });

      // Act
      const response = await request(app)
        .post(`/api/v1/customers/${customer.id}/check-unique-email`)
        .send({ email: 'new@example.com' });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data.isUnique).toBe(true);
    });

    it('should exclude current customer', async () => {
      // Arrange
      const customer = await prisma.customer.create({
        data: createCustomerDTOFixture({ email: 'test@example.com' }),
      });

      // Act
      const response = await request(app)
        .post(`/api/v1/customers/${customer.id}/check-unique-email`)
        .send({ email: 'test@example.com' });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data.isUnique).toBe(true);
    });

    it('should return isUnique flag', async () => {
      // Arrange
      const customer1 = await prisma.customer.create({
        data: createCustomerDTOFixture({ code: 'CUST001', email: 'test1@example.com' }),
      });
      await prisma.customer.create({
        data: createCustomerDTOFixture({ code: 'CUST002', email: 'test2@example.com' }),
      });

      // Act
      const response = await request(app)
        .post(`/api/v1/customers/${customer1.id}/check-unique-email`)
        .send({ email: 'test2@example.com' });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data.isUnique).toBe(false);
    });
  });

  describe('PUT /api/v1/customers/:id', () => {
    it('should update customer with valid data', async () => {
      // Arrange
      const customer = await prisma.customer.create({
        data: createCustomerDTOFixture(),
      });

      const updateData = {
        name: 'Updated Name',
        phone: '9999999999',
      };

      // Act
      const response = await request(app)
        .put(`/api/v1/customers/${customer.id}`)
        .send(updateData);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe('Updated Name');
    });

    it('should return updated customer', async () => {
      // Arrange
      const customer = await prisma.customer.create({
        data: createCustomerDTOFixture(),
      });

      // Act
      const response = await request(app)
        .put(`/api/v1/customers/${customer.id}`)
        .send({ name: 'Updated' });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe('Updated');
    });

    it('should return 400 for validation errors', async () => {
      // Arrange
      const customer = await prisma.customer.create({
        data: createCustomerDTOFixture(),
      });

      // Act
      const response = await request(app)
        .put(`/api/v1/customers/${customer.id}`)
        .send({ email: 'invalid-email' });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 404 for non-existent customer', async () => {
      // Act
      const response = await request(app)
        .put('/api/v1/customers/99999')
        .send({ name: 'Test' });

      // Assert
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('should allow email change if unique', async () => {
      // Arrange
      const customer = await prisma.customer.create({
        data: createCustomerDTOFixture({ email: 'old@example.com' }),
      });

      // Act
      const response = await request(app)
        .put(`/api/v1/customers/${customer.id}`)
        .send({ email: 'new@example.com' });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data.email).toBe('new@example.com');
    });
  });

  describe('DELETE /api/v1/customers/:id', () => {
    it('should soft delete customer', async () => {
      // Arrange
      const customer = await prisma.customer.create({
        data: createCustomerDTOFixture(),
      });

      // Act
      const response = await request(app)
        .delete(`/api/v1/customers/${customer.id}`);

      // Assert
      expect(response.status).toBe(200);

      // Verify soft delete
      const deletedCustomer = await prisma.customer.findUnique({
        where: { id: customer.id },
      });
      expect(deletedCustomer?.isActive).toBe(false);
    });

    it('should return 404 for non-existent customer', async () => {
      // Act
      const response = await request(app)
        .delete('/api/v1/customers/99999');

      // Assert
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 if customer has balance', async () => {
      // Arrange
      const customer = await prisma.customer.create({
        data: { ...createCustomerDTOFixture(), currentBalance: 100 },
      });

      // Act
      const response = await request(app)
        .delete(`/api/v1/customers/${customer.id}`);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });
});
