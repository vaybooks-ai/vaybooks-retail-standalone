import { PrismaClient } from '@prisma/client';
import { BaseRepository } from '../../core/repository';
import { CustomerCustomField } from '@vaybooks/shared';

/**
 * Customer Custom Field Repository
 * Handles customer custom field management
 */
export class CustomFieldRepository extends BaseRepository<CustomerCustomField> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'customerCustomField');
  }

  /**
   * Find all custom fields for a customer
   */
  async findByCustomerId(customerId: number): Promise<CustomerCustomField[]> {
    const result = await this.findAll({
      page: 1,
      limit: 1000,
      filters: { customerId },
      sortBy: 'displayOrder',
      sortOrder: 'asc',
    });
    return Array.isArray(result) ? result : result.data;
  }

  /**
   * Find custom field by name
   */
  async findByName(
    customerId: number,
    fieldName: string
  ): Promise<CustomerCustomField | null> {
    return this.findOne({
      customerId,
      fieldName,
    } as any);
  }

  /**
   * Update field value
   */
  async updateValue(
    customerId: number,
    fieldName: string,
    fieldValue: string | null
  ): Promise<CustomerCustomField | null> {
    const field = await this.findByName(customerId, fieldName);
    if (!field) return null;

    return this.update(field.id, { fieldValue } as any);
  }

  /**
   * Get all required fields for a customer
   */
  async findRequired(customerId: number): Promise<CustomerCustomField[]> {
    const result = await this.findAll({
      page: 1,
      limit: 1000,
      filters: { customerId, isRequired: true },
    });
    return Array.isArray(result) ? result : result.data;
  }

  /**
   * Check if all required fields are filled
   */
  async areRequiredFieldsFilled(customerId: number): Promise<boolean> {
    const requiredFields = await this.findRequired(customerId);
    return requiredFields.every((field) => field.fieldValue !== null && field.fieldValue !== '');
  }

  /**
   * Get custom fields by type
   */
  async findByType(
    customerId: number,
    fieldType: 'text' | 'number' | 'date' | 'select' | 'boolean'
  ): Promise<CustomerCustomField[]> {
    const result = await this.findAll({
      page: 1,
      limit: 1000,
      filters: { customerId, fieldType },
    });
    return Array.isArray(result) ? result : result.data;
  }

  /**
   * Reorder custom fields
   */
  async reorder(_customerId: number, fieldIds: number[]): Promise<number> {
    let updated = 0;
    for (let i = 0; i < fieldIds.length; i++) {
      const fieldId = fieldIds[i];
      if (fieldId !== undefined) {
        const result = await this.update(fieldId, {
          displayOrder: i,
        } as any);
        if (result) updated++;
      }
    }
    return updated;
  }

  /**
   * Delete all custom fields for a customer
   */
  async deleteAllForCustomer(customerId: number): Promise<number> {
    return this.deleteManyByConditions({ customerId });
  }

  /**
   * Get custom field count
   */
  async countForCustomer(customerId: number): Promise<number> {
    return this.count({ customerId } as any);
  }
}
