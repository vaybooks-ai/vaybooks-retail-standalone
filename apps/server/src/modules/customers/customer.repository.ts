import { PrismaClient } from '@prisma/client';
import { BaseRepository } from '../../core/repository';
import {
  Customer,
  CustomerDetail,
  CustomerSummary,
  CustomerFilters,
  PaginatedResult,
  QueryOptions,
} from '@vaybooks/shared';

/**
 * Customer Repository
 * Handles all customer-related database operations
 */
export class CustomerRepository extends BaseRepository<Customer> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'customer');
  }

  /**
   * Find customer by code
   */
  async findByCode(code: string): Promise<Customer | null> {
    return this.findOne({ code } as any);
  }

  /**
   * Find customer by email
   */
  async findByEmail(email: string): Promise<Customer | null> {
    return this.findOne({ email } as any);
  }

  /**
   * Find customer with all related data (addresses and custom fields)
   */
  async findDetailById(id: number): Promise<CustomerDetail | null> {
    const customer = await this.findById(id, {
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

    return customer as CustomerDetail | null;
  }

  /**
   * Search customers with advanced filters
   */
  async searchCustomers(
    filters: CustomerFilters,
    options?: QueryOptions
  ): Promise<PaginatedResult<CustomerSummary>> {
    const where: any = {};

    // Apply filters
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { code: { contains: filters.search } },
        { email: { contains: filters.search } },
        { phone: { contains: filters.search } },
        { mobile: { contains: filters.search } },
      ];
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.customerType) {
      where.customerType = filters.customerType;
    }

    if (filters.taxExempt !== undefined) {
      where.taxExempt = filters.taxExempt;
    }

    if (filters.creditLimitMin !== undefined) {
      where.creditLimit = { gte: filters.creditLimitMin };
    }

    if (filters.creditLimitMax !== undefined) {
      if (where.creditLimit) {
        where.creditLimit.lte = filters.creditLimitMax;
      } else {
        where.creditLimit = { lte: filters.creditLimitMax };
      }
    }

    if (filters.hasBalance !== undefined) {
      if (filters.hasBalance) {
        where.currentBalance = { gt: 0 };
      } else {
        where.currentBalance = 0;
      }
    }

    // Search by address location
    if (filters.city || filters.state || filters.country) {
      where.addresses = {
        some: {
          isActive: true,
          ...(filters.city && { city: filters.city }),
          ...(filters.state && { state: filters.state }),
          ...(filters.country && { country: filters.country }),
        },
      };
    }

    // Use findPaginated from base repository
    const result = await this.findPaginated({
      page: options?.page || 1,
      limit: options?.limit || 10,
      ...options,
      filters: where,
      select: {
        id: true,
        code: true,
        name: true,
        email: true,
        phone: true,
        currentBalance: true,
        creditLimit: true,
        isActive: true,
        customerType: true,
      },
    });

    return result as PaginatedResult<CustomerSummary>;
  }

  /**
   * Get all active customers
   */
  async findActive(options?: QueryOptions): Promise<Customer[]> {
    const result = await this.findAll({
      page: options?.page || 1,
      limit: options?.limit || 1000,
      ...options,
      filters: { isActive: true },
    });
    return Array.isArray(result) ? result : result.data;
  }

  /**
   * Get customers with outstanding balance
   */
  async findWithBalance(options?: QueryOptions): Promise<Customer[]> {
    const result = await this.findAll({
      page: options?.page || 1,
      limit: options?.limit || 1000,
      ...options,
      filters: { currentBalance: { gt: 0 } },
    });
    return Array.isArray(result) ? result : result.data;
  }

  /**
   * Check if customer code is unique
   */
  async isCodeUnique(code: string, excludeId?: number): Promise<boolean> {
    const where: any = { code };
    if (excludeId) {
      where.id = { not: excludeId };
    }

    const count = await this.getModel().count({ where });
    return count === 0;
  }

  /**
   * Check if customer email is unique
   */
  async isEmailUnique(email: string, excludeId?: number): Promise<boolean> {
    if (!email) return true;

    const where: any = { email };
    if (excludeId) {
      where.id = { not: excludeId };
    }

    const count = await this.getModel().count({ where });
    return count === 0;
  }

  /**
   * Generate next customer code
   */
  async generateNextCode(prefix: string = 'CUST'): Promise<string> {
    const lastCustomer = await this.getModel().findFirst({
      where: { code: { startsWith: prefix } },
      orderBy: { code: 'desc' },
      select: { code: true },
    });

    if (!lastCustomer) {
      return `${prefix}001`;
    }

    // Extract number from code and increment
    const match = lastCustomer.code.match(/(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10) + 1;
      const paddedNum = num.toString().padStart(match[1].length, '0');
      return lastCustomer.code.replace(/\d+$/, paddedNum);
    }

    return `${prefix}001`;
  }

  /**
   * Update customer balance
   */
  async updateBalance(id: number, amount: number): Promise<Customer | null> {
    const customer = await this.findById(id);
    if (!customer) return null;

    return this.update(id, {
      currentBalance: customer.currentBalance + amount,
    } as any);
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
    const customer = await this.getModel().findUnique({
      where: { id },
      select: {
        addresses: {
          where: { isActive: true },
        },
        customFields: true,
      },
    });

    if (!customer) return null;

    const defaultBillingAddress = customer.addresses.find(
      (a: any) => a.type === 'billing' && a.isDefault
    );
    const defaultShippingAddress = customer.addresses.find(
      (a: any) => a.type === 'shipping' && a.isDefault
    );

    return {
      addressCount: customer.addresses.length,
      customFieldCount: customer.customFields.length,
      totalAddresses: customer.addresses.length,
      totalCustomFields: customer.customFields.length,
      defaultBillingAddress: defaultBillingAddress || null,
      defaultShippingAddress: defaultShippingAddress || null,
    };
  }

  /**
   * Get top customers by credit limit
   */
  async getTopCustomersByCredit(limit: number = 10): Promise<Customer[]> {
    return this.findWithOptions({
      where: { isActive: true },
      orderBy: { creditLimit: 'desc' },
      take: limit,
    });
  }

  /**
   * Get customers by type
   */
  async findByType(
    type: 'retail' | 'wholesale' | 'distributor',
    options?: QueryOptions
  ): Promise<Customer[]> {
    const result = await this.findAll({
      page: options?.page || 1,
      limit: options?.limit || 1000,
      ...options,
      filters: { customerType: type },
    });
    return Array.isArray(result) ? result : result.data;
  }

  /**
   * Bulk update customer status
   */
  async bulkUpdateStatus(ids: number[], isActive: boolean): Promise<number> {
    return this.updateMany(
      { id: { in: ids } },
      { isActive } as any
    );
  }

  /**
   * Delete customer with all related data (cascade handled by Prisma)
   */
  async deleteWithRelations(id: number): Promise<boolean> {
    try {
      await this.getModel().delete({ where: { id } });
      return true;
    } catch (error: any) {
      if (error.code === 'P2025') {
        return false;
      }
      throw error;
    }
  }
}
