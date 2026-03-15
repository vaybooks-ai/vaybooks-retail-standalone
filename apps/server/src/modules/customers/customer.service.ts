import { PrismaClient } from '@prisma/client';
import { CustomerRepository } from './customer.repository';
import {
  Customer,
  CreateCustomerDTO,
  UpdateCustomerDTO,
  CustomerDetail,
  CustomerFilters,
  PaginatedResult,
  QueryOptions,
} from '@vaybooks/shared';
import { NotFoundError, DuplicateError, BusinessRuleError } from '../../core/errors';

/**
 * Customer Service
 * Handles business logic, validation, and orchestrates repository operations
 */
export class CustomerService {
  private repository: CustomerRepository;

  constructor(prisma: PrismaClient) {
    this.repository = new CustomerRepository(prisma);
  }

  /**
   * Get all customers with optional search and filtering
   */
  async getAllCustomers(
    filters?: CustomerFilters,
    options?: QueryOptions
  ): Promise<PaginatedResult<Customer>> {
    if (filters && Object.keys(filters).length > 0) {
      return this.repository.searchCustomers(filters, options) as Promise<PaginatedResult<Customer>>;
    }

    return this.repository.findPaginated({
      page: options?.page || 1,
      limit: options?.limit || 20,
      sortBy: options?.sortBy || 'name',
      sortOrder: options?.sortOrder || 'asc',
    });
  }

  /**
   * Get customer by ID
   */
  async getCustomerById(id: number): Promise<Customer | null> {
    const customer = await this.repository.findById(id);
    if (!customer) {
      throw new NotFoundError(`Customer with ID ${id} not found`);
    }
    return customer;
  }

  /**
   * Get customer with all related data (addresses and custom fields)
   */
  async getCustomerDetail(id: number): Promise<CustomerDetail | null> {
    const customer = await this.repository.findDetailById(id);
    if (!customer) {
      throw new Error(`Customer with ID ${id} not found`);
    }
    return customer;
  }

  /**
   * Get customer by code
   */
  async getCustomerByCode(code: string): Promise<Customer | null> {
    return this.repository.findByCode(code);
  }

  /**
   * Create new customer
   */
  async createCustomer(data: CreateCustomerDTO, userId?: number): Promise<Customer> {
    // Check if code already exists
    const existingCode = await this.repository.findByCode(data.code.toUpperCase());
    if (existingCode) {
      throw new DuplicateError(`Customer with code ${data.code} already exists`);
    }

    // Check if email already exists
    if (data.email) {
      const isEmailUnique = await this.repository.isEmailUnique(data.email);
      if (!isEmailUnique) {
        throw new DuplicateError(`Customer with email ${data.email} already exists`);
      }
    }

    // Set defaults
    const customerData = {
      ...data,
      code: data.code.toUpperCase(),
      creditLimit: data.creditLimit || 0,
      currentBalance: 0,
      creditTermsDays: data.creditTermsDays || 0,
      taxExempt: data.taxExempt || false,
      isActive: true,
      customerType: data.customerType || 'retail',
      createdBy: userId,
    };

    // Create customer
    const customer = await this.repository.create(customerData as any);

    // Log audit
    console.log(`Customer created: ${customer.code} - ${customer.name}`);

    return customer;
  }

  /**
   * Update customer
   */
  async updateCustomer(id: number, data: UpdateCustomerDTO, userId?: number): Promise<Customer> {
    // Check if customer exists
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Customer with ID ${id} not found`);
    }

    // Check if email is being changed and already exists
    if (data.email && data.email !== existing.email) {
      const isEmailUnique = await this.repository.isEmailUnique(data.email, id);
      if (!isEmailUnique) {
        throw new DuplicateError(`Customer with email ${data.email} already exists`);
      }
    }

    // Update customer
    const updateData = {
      ...data,
      updatedBy: userId,
    };

    const updated = await this.repository.update(id, updateData as any);
    if (!updated) {
      throw new Error(`Failed to update customer with ID ${id}`);
    }

    // Log audit
    console.log(`Customer updated: ${updated.code} - ${updated.name}`);

    return updated;
  }

  /**
   * Delete customer (soft delete by marking as inactive)
   */
  async deleteCustomer(id: number): Promise<boolean> {
    // Check if customer exists
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Customer with ID ${id} not found`);
    }

    // Check if customer has outstanding balance
    if (existing.currentBalance !== 0) {
      throw new BusinessRuleError('Cannot delete customer with outstanding balance');
    }

    // Soft delete by marking as inactive
    await this.repository.update(id, { isActive: false } as any);

    // Log audit
    console.log(`Customer deactivated: ${existing.code} - ${existing.name}`);

    return true;
  }

  /**
   * Generate next customer code
   */
  async generateCustomerCode(prefix: string = 'CUST'): Promise<string> {
    return this.repository.generateNextCode(prefix);
  }

  /**
   * Get top customers by credit limit
   */
  async getTopCustomers(limit: number = 10): Promise<Customer[]> {
    return this.repository.getTopCustomersByCredit(limit);
  }

  /**
   * Update customer balance
   */
  async updateCustomerBalance(id: number, amount: number): Promise<Customer | null> {
    const updated = await this.repository.updateBalance(id, amount);

    if (updated) {
      console.log(`Customer ${id} balance updated by ${amount}`);
    }

    return updated;
  }

  /**
   * Check if customer can make a purchase based on credit limit
   */
  async checkCreditLimit(customerId: number, amount: number): Promise<boolean> {
    const customer = await this.repository.findById(customerId);
    if (!customer) {
      throw new Error(`Customer with ID ${customerId} not found`);
    }

    if (customer.creditLimit === 0) {
      return true; // No credit limit set
    }

    const newBalance = customer.currentBalance + amount;
    return newBalance <= customer.creditLimit;
  }

  /**
   * Get customers with outstanding balance
   */
  async getCustomersWithBalance(options?: QueryOptions): Promise<Customer[]> {
    return this.repository.findWithBalance(options);
  }

  /**
   * Get active customers
   */
  async getActiveCustomers(options?: QueryOptions): Promise<Customer[]> {
    return this.repository.findActive(options);
  }

  /**
   * Get customers by type
   */
  async getCustomersByType(
    type: 'retail' | 'wholesale' | 'distributor',
    options?: QueryOptions
  ): Promise<Customer[]> {
    return this.repository.findByType(type, options);
  }

  /**
   * Search customers with advanced filters
   */
  async searchCustomers(
    filters: CustomerFilters,
    options?: QueryOptions
  ): Promise<PaginatedResult<any>> {
    return this.repository.searchCustomers(filters, options);
  }

  /**
   * Get customer statistics
   */
  async getCustomerStats(id: number): Promise<{
    addressCount: number;
    customFieldCount: number;
    totalAddresses: number;
    totalCustomFields: number;
    defaultBillingAddress: any | null;
    defaultShippingAddress: any | null;
  } | null> {
    return this.repository.getCustomerStats(id);
  }

  /**
   * Bulk update customer status
   */
  async bulkUpdateStatus(ids: number[], isActive: boolean): Promise<number> {
    return this.repository.bulkUpdateStatus(ids, isActive);
  }

  /**
   * Bulk import customers
   */
  async bulkImportCustomers(
    customers: CreateCustomerDTO[],
    userId?: number
  ): Promise<{
    successCount: number;
    failedCount: number;
    errors: string[];
  }> {
    const results = {
      successCount: 0,
      failedCount: 0,
      errors: [] as string[],
    };

    for (const customerData of customers) {
      try {
        await this.createCustomer(customerData, userId);
        results.successCount++;
      } catch (error: any) {
        results.failedCount++;
        results.errors.push(`${customerData.code}: ${error.message}`);
      }
    }

    return results;
  }

  /**
   * Check if customer code is unique
   */
  async isCodeUnique(code: string, excludeId?: number): Promise<boolean> {
    return this.repository.isCodeUnique(code, excludeId);
  }

  /**
   * Check if customer email is unique
   */
  async isEmailUnique(email: string, excludeId?: number): Promise<boolean> {
    return this.repository.isEmailUnique(email, excludeId);
  }

  /**
   * Delete customer with all related data
   */
  async deleteWithRelations(id: number): Promise<boolean> {
    // Check if customer exists
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error(`Customer with ID ${id} not found`);
    }

    // Log audit
    console.log(`Customer deleted: ${existing.code} - ${existing.name}`);

    return this.repository.deleteWithRelations(id);
  }
}
