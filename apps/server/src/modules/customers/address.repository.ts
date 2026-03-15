import { PrismaClient } from '@prisma/client';
import { BaseRepository } from '../../core/repository';
import { CustomerAddress } from '@vaybooks/shared';

/**
 * Customer Address Repository
 * Handles customer address management
 */
export class AddressRepository extends BaseRepository<CustomerAddress> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'customerAddress');
  }

  /**
   * Find all addresses for a customer
   */
  async findByCustomerId(customerId: number): Promise<CustomerAddress[]> {
    return this.findAll({
      page: 1,
      limit: 1000,
      filters: { customerId, isActive: true },
      sortBy: 'isDefault',
      sortOrder: 'desc',
    }) as Promise<CustomerAddress[]>;
  }

  /**
   * Find default address by type
   */
  async findDefaultByType(
    customerId: number,
    type: 'billing' | 'shipping' | 'other'
  ): Promise<CustomerAddress | null> {
    return this.findOne({
      customerId,
      type,
      isDefault: true,
      isActive: true,
    } as any);
  }

  /**
   * Set address as default for its type
   */
  async setAsDefault(
    id: number,
    customerId: number
  ): Promise<CustomerAddress | null> {
    const address = await this.findById(id);
    if (!address || address.customerId !== customerId) {
      return null;
    }

    // Remove default flag from other addresses of same type
    await this.updateMany(
      {
        customerId,
        type: address.type,
        id: { not: id },
      },
      { isDefault: false } as any
    );

    // Set this address as default
    return this.update(id, { isDefault: true } as any);
  }

  /**
   * Get billing addresses for customer
   */
  async findBillingAddresses(customerId: number): Promise<CustomerAddress[]> {
    const result = await this.findAll({
      page: 1,
      limit: 1000,
      filters: { customerId, type: 'billing', isActive: true },
    });
    return Array.isArray(result) ? result : result.data;
  }

  /**
   * Get shipping addresses for customer
   */
  async findShippingAddresses(customerId: number): Promise<CustomerAddress[]> {
    const result = await this.findAll({
      page: 1,
      limit: 1000,
      filters: { customerId, type: 'shipping', isActive: true },
    });
    return Array.isArray(result) ? result : result.data;
  }

  /**
   * Check if customer has at least one address
   */
  async hasAddress(customerId: number): Promise<boolean> {
    return this.exists({ customerId, isActive: true } as any);
  }

  /**
   * Deactivate all addresses for a customer
   */
  async deactivateAll(customerId: number): Promise<number> {
    return this.updateMany(
      { customerId },
      { isActive: false } as any
    );
  }

  /**
   * Get address count by type
   */
  async countByType(
    customerId: number,
    type: 'billing' | 'shipping' | 'other'
  ): Promise<number> {
    return this.count({
      customerId,
      type,
      isActive: true,
    } as any);
  }
}
