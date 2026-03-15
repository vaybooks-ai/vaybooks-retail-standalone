import { Customer, CreateCustomerDTO, UpdateCustomerDTO } from '@vaybooks/shared';

/**
 * Create a customer fixture with optional overrides
 */
export function createCustomerFixture(overrides?: Partial<Customer>): Customer {
  return {
    id: 1,
    code: 'CUST001',
    name: 'Test Customer',
    email: 'test@example.com',
    phone: '1234567890',
    mobile: '9876543210',
    website: 'https://example.com',
    contactPerson: 'John Doe',
    contactEmail: 'john@example.com',
    contactPhone: '1111111111',
    creditLimit: 10000,
    currentBalance: 0,
    creditTermsDays: 30,
    taxNumber: 'TAX123456',
    taxExempt: false,
    isActive: true,
    customerType: 'retail',
    notes: 'Test customer notes',
    statusValue: 'Active',
    paymentTermValue: 'Net 30',
    salesRepValue: 'John Smith',
    groupValue: 'Standard',
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 1,
    updatedBy: 1,
    ...overrides,
  };
}

/**
 * Create a CreateCustomerDTO fixture
 */
export function createCustomerDTOFixture(overrides?: any): any {
  return {
    code: 'CUST001',
    name: 'Test Customer',
    email: 'test@example.com',
    phone: '1234567890',
    mobile: '9876543210',
    website: 'https://example.com',
    contactPerson: 'John Doe',
    contactEmail: 'john@example.com',
    contactPhone: '1111111111',
    creditLimit: 10000,
    currentBalance: 0,
    creditTermsDays: 30,
    taxNumber: 'TAX123456',
    taxExempt: false,
    isActive: true,
    customerType: 'retail',
    notes: 'Test customer notes',
    statusValue: 'Active',
    paymentTermValue: 'Net 30',
    salesRepValue: 'John Smith',
    groupValue: 'Standard',
    ...overrides,
  };
}

/**
 * Create an UpdateCustomerDTO fixture
 */
export function createUpdateCustomerDTOFixture(overrides?: Partial<UpdateCustomerDTO>): UpdateCustomerDTO {
  return {
    name: 'Updated Customer',
    email: 'updated@example.com',
    phone: '9999999999',
    creditLimit: 20000,
    creditTermsDays: 60,
    isActive: true,
    ...overrides,
  };
}

/**
 * Valid customer data for testing
 */
export const VALID_CUSTOMER_DATA: CreateCustomerDTO = {
  code: 'VALID001',
  name: 'Valid Customer',
  email: 'valid@example.com',
  phone: '1234567890',
  creditLimit: 5000,
  customerType: 'retail',
};

/**
 * Invalid customer data for testing validation
 */
export const INVALID_CUSTOMER_DATA = {
  invalidCode: {
    code: 'invalid-code', // lowercase, should be uppercase
    name: 'Test',
  },
  invalidEmail: {
    code: 'CUST001',
    name: 'Test',
    email: 'invalid-email', // invalid format
  },
  invalidPhone: {
    code: 'CUST001',
    name: 'Test',
    phone: '123', // too short
  },
  missingCode: {
    name: 'Test',
  },
  missingName: {
    code: 'CUST001',
  },
};

/**
 * Sample customers for testing
 */
export const CUSTOMER_SAMPLES = [
  createCustomerFixture({
    id: 1,
    code: 'RETAIL001',
    name: 'Retail Customer 1',
    customerType: 'retail',
    creditLimit: 5000,
  }),
  createCustomerFixture({
    id: 2,
    code: 'WHOLE001',
    name: 'Wholesale Customer 1',
    customerType: 'wholesale',
    creditLimit: 50000,
  }),
  createCustomerFixture({
    id: 3,
    code: 'DIST001',
    name: 'Distributor Customer 1',
    customerType: 'distributor',
    creditLimit: 100000,
  }),
];
