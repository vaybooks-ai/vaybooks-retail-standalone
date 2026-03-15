# Testing Guide for VayBooks Server

## Overview

This guide explains the testing setup, configuration, and best practices for the VayBooks server application.

## Test Configuration

### TypeScript Configuration Separation

We use separate TypeScript configurations for production and test code:

- **[`tsconfig.json`](tsconfig.json)** - Production code configuration (excludes test files)
- **[`tsconfig.test.json`](tsconfig.test.json)** - Test-specific configuration (includes Jest types)

This separation ensures:
- ✅ No test type pollution in production code
- ✅ Proper IDE support for both production and test files
- ✅ Clean builds without test files

### Jest Configuration

Jest is configured in [`jest.config.js`](jest.config.js) with:
- **ts-jest preset** - Transpiles TypeScript test files
- **Path mapping** - Resolves @ aliases and workspace packages
- **Coverage thresholds** - 70% minimum coverage
- **Test patterns** - Matches `*.test.ts` and `*.spec.ts` files

## Test Structure

```
src/
├── modules/               # Production code
│   └── customers/
│       ├── customer.service.ts
│       ├── customer.repository.ts
│       └── customer.controller.ts
└── __tests__/            # Test files
    ├── unit/             # Unit tests
    │   └── modules/
    │       └── customers/
    │           ├── customer.service.test.ts
    │           ├── customer.repository.test.ts
    │           └── customer.controller.test.ts
    ├── integration/      # Integration tests
    │   └── api/
    │       └── customers.integration.test.ts
    └── fixtures/         # Test fixtures and utilities
        ├── customer.fixtures.ts
        └── test-db.ts
```

## Running Tests

### All Tests
```bash
pnpm test
```

### Watch Mode
```bash
pnpm test:watch
```

### Unit Tests Only
```bash
pnpm test:unit
```

### Integration Tests Only
```bash
pnpm test:integration
```

### Coverage Report
```bash
pnpm test:coverage
```

### Debug Tests
```bash
pnpm test:debug
```

Then attach your debugger to the Node.js process.

## Writing Tests

### Unit Test Example

```typescript
import { CustomerService } from '../../../../modules/customers/customer.service';
import { CustomerRepository } from '../../../../modules/customers/customer.repository';
import { createCustomerFixture } from '../../../fixtures/customer.fixtures';

// Mock the repository
jest.mock('../../../../modules/customers/customer.repository');

describe('CustomerService', () => {
  let service: CustomerService;
  let mockRepository: jest.Mocked<CustomerRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create mock repository
    mockRepository = {
      findById: jest.fn(),
      create: jest.fn(),
      // ... other methods
    } as any;

    // Create service with mocked repository
    service = new CustomerService(null as any);
    (service as any).repository = mockRepository;
  });

  afterEach(() => {
    jest.restoreAllMocks();
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
      await expect(service.getCustomerById(999))
        .rejects.toThrow('Customer with ID 999 not found');
    });
  });
});
```

### Integration Test Example

```typescript
import request from 'supertest';
import { app } from '../../../app';
import { prisma } from '@vaybooks/database';

describe('Customers API', () => {
  beforeAll(async () => {
    // Setup test database
    await prisma.$connect();
  });

  afterAll(async () => {
    // Cleanup
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clear data before each test
    await prisma.customer.deleteMany();
  });

  describe('GET /api/customers', () => {
    it('should return empty list when no customers exist', async () => {
      const response = await request(app)
        .get('/api/customers')
        .expect(200);

      expect(response.body.data).toEqual([]);
      expect(response.body.pagination.total).toBe(0);
    });

    it('should return paginated customers', async () => {
      // Create test data
      await prisma.customer.create({
        data: {
          code: 'CUST001',
          name: 'Test Customer',
          email: 'test@example.com',
          // ... other fields
        }
      });

      const response = await request(app)
        .get('/api/customers')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].code).toBe('CUST001');
    });
  });
});
```

## Test Fixtures

Use fixtures for creating consistent test data:

```typescript
// __tests__/fixtures/customer.fixtures.ts
import { Customer } from '@vaybooks/shared';

export function createCustomerFixture(overrides?: Partial<Customer>): Customer {
  return {
    id: 1,
    code: 'CUST001',
    name: 'Test Customer',
    email: 'test@example.com',
    phone: '1234567890',
    customerType: 'retail',
    isActive: true,
    currentBalance: 0,
    creditLimit: 0,
    creditTermsDays: 0,
    taxExempt: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdById: 1,
    updatedById: null,
    ...overrides
  };
}

export const CUSTOMER_SAMPLES: Customer[] = [
  createCustomerFixture({ id: 1, code: 'CUST001', name: 'Customer One' }),
  createCustomerFixture({ id: 2, code: 'CUST002', name: 'Customer Two' }),
  createCustomerFixture({ id: 3, code: 'CUST003', name: 'Customer Three' }),
];
```

## Best Practices

### 1. Test Organization
- **Arrange-Act-Assert (AAA)** pattern for clarity
- Group related tests using `describe` blocks
- Use descriptive test names that explain the scenario

### 2. Mocking
- Mock external dependencies (database, APIs, file system)
- Use `jest.mock()` for module mocking
- Clear mocks between tests with `jest.clearAllMocks()`

### 3. Coverage
- Aim for 70%+ coverage (enforced by Jest config)
- Focus on testing business logic and edge cases
- Don't test framework code or third-party libraries

### 4. Test Isolation
- Each test should be independent
- Use `beforeEach` to set up fresh state
- Use `afterEach` to clean up resources

### 5. Naming Conventions
- Test files: `*.test.ts` or `*.spec.ts`
- Unit tests: `src/__tests__/unit/**/*.test.ts`
- Integration tests: `src/__tests__/integration/**/*.test.ts`

### 6. Async Testing
- Always use `async/await` for async operations
- Don't forget to `await` promises in tests
- Use `expect().rejects` for testing promise rejections

## Common Patterns

### Testing Error Cases
```typescript
it('should throw error for invalid input', async () => {
  await expect(service.createCustomer(invalidData))
    .rejects.toThrow('Validation error');
});
```

### Testing Validation
```typescript
it('should validate email format', async () => {
  const data = createCustomerDTOFixture({ email: 'invalid-email' });
  
  await expect(service.createCustomer(data))
    .rejects.toThrow('Invalid email format');
});
```

### Testing Business Logic
```typescript
it('should prevent deletion when customer has balance', async () => {
  const customer = createCustomerFixture({ currentBalance: 1000 });
  mockRepository.findById.mockResolvedValue(customer);

  await expect(service.deleteCustomer(1))
    .rejects.toThrow('Cannot delete customer with outstanding balance');
});
```

### Testing Pagination
```typescript
it('should apply pagination options', async () => {
  const mockResult = {
    data: CUSTOMER_SAMPLES,
    pagination: {
      page: 2,
      limit: 10,
      total: 30,
      totalPages: 3,
      hasNext: true,
      hasPrev: true,
    },
  };
  mockRepository.findPaginated.mockResolvedValue(mockResult);

  await service.getAllCustomers(undefined, { page: 2, limit: 10 });

  expect(mockRepository.findPaginated).toHaveBeenCalledWith({
    page: 2,
    limit: 10,
    sortBy: 'name',
    sortOrder: 'asc',
  });
});
```

## Troubleshooting

### VSCode Shows "Cannot find name 'jest'"
Make sure:
1. [`tsconfig.test.json`](tsconfig.test.json) includes Jest types
2. Jest extension is installed and configured
3. Reload VSCode window

### Tests Fail with Module Resolution Errors
Check:
1. Path mappings in [`jest.config.js`](jest.config.js) match [`tsconfig.json`](tsconfig.json)
2. Dependencies are installed (`pnpm install`)
3. Relative imports are correct

### Coverage Not Generated
Ensure:
1. Tests are passing
2. Coverage directory is writable
3. Coverage patterns in [`jest.config.js`](jest.config.js) are correct

## CI/CD Integration

Tests should be run in CI/CD pipeline:

```yaml
# Example GitHub Actions workflow
- name: Install dependencies
  run: pnpm install

- name: Run tests
  run: pnpm test:coverage

- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./apps/server/coverage/lcov.info
```

## Resources

- [Jest Documentation](https://jestjs.io/)
- [ts-jest Documentation](https://kulshekhar.github.io/ts-jest/)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [TypeScript Testing Guide](https://www.typescriptlang.org/docs/handbook/testing.html)
