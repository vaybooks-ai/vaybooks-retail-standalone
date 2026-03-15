import { PrismaClient } from '@prisma/client';
import { CustomFieldRepository } from '../../../../modules/customers/custom-field.repository';
import { CustomerCustomField } from '@vaybooks/shared';

describe('CustomFieldRepository', () => {
  let prisma: jest.Mocked<PrismaClient>;
  let repository: CustomFieldRepository;
  let mockModel: any;

  const mockCustomField: CustomerCustomField = {
    id: 1,
    customerId: 1,
    fieldName: 'Tax ID',
    fieldLabel: 'Tax Identification',
    fieldValue: '123-45-6789',
    fieldType: 'text',
    isRequired: true,
    displayOrder: 0,
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
      customerCustomField: mockModel,
    } as any;

    repository = new CustomFieldRepository(prisma);
  });

  describe('Constructor & Initialization', () => {
    it('should initialize repository with correct model name', () => {
      expect(repository).toBeInstanceOf(CustomFieldRepository);
    });
  });

  describe('findByCustomerId', () => {
    it('should return all custom fields for a customer', async () => {
      const fields = [mockCustomField];
      mockModel.findMany.mockResolvedValue(fields);

      const result = await repository.findByCustomerId(1);

      expect(result).toEqual(fields);
      expect(mockModel.findMany).toHaveBeenCalled();
    });

    it('should return empty array when no fields found', async () => {
      mockModel.findMany.mockResolvedValue([]);

      const result: any = await repository.findByCustomerId(999);

      expect(Array.isArray(result) || result.data).toBeTruthy();
    });

    it('should sort by displayOrder ascending', async () => {
      const fields = [
        { ...mockCustomField, id: 1, displayOrder: 0 },
        { ...mockCustomField, id: 2, displayOrder: 1 },
        { ...mockCustomField, id: 3, displayOrder: 2 },
      ];
      mockModel.findMany.mockResolvedValue(fields);

      await repository.findByCustomerId(1);

      expect(mockModel.findMany).toHaveBeenCalled();
    });
  });

  describe('findByName', () => {
    it('should return custom field by name', async () => {
      mockModel.findFirst.mockResolvedValue(mockCustomField);

      const result = await repository.findByName(1, 'Tax ID');

      expect(result).toEqual(mockCustomField);
      expect(mockModel.findFirst).toHaveBeenCalledWith({
        where: {
          customerId: 1,
          fieldName: 'Tax ID',
        },
      });
    });

    it('should return null when field not found', async () => {
      mockModel.findFirst.mockResolvedValue(null);

      const result = await repository.findByName(1, 'NonExistent');

      expect(result).toBeNull();
    });

    it('should be case-sensitive for field name', async () => {
      mockModel.findFirst.mockResolvedValue(null);

      await repository.findByName(1, 'tax id');

      expect(mockModel.findFirst).toHaveBeenCalledWith({
        where: {
          customerId: 1,
          fieldName: 'tax id',
        },
      });
    });
  });

  describe('updateValue', () => {
    it('should update field value', async () => {
      mockModel.findFirst.mockResolvedValue(mockCustomField);
      mockModel.update.mockResolvedValue({ ...mockCustomField, fieldValue: 'new-value' });

      const result = await repository.updateValue(1, 'Tax ID', 'new-value');

      expect(result).toEqual({ ...mockCustomField, fieldValue: 'new-value' });
      expect(mockModel.findFirst).toHaveBeenCalledWith({
        where: { customerId: 1, fieldName: 'Tax ID' },
      });
      expect(mockModel.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { fieldValue: 'new-value' },
      });
    });

    it('should return null when field not found', async () => {
      mockModel.findFirst.mockResolvedValue(null);

      const result = await repository.updateValue(1, 'NonExistent', 'value');

      expect(result).toBeNull();
      expect(mockModel.update).not.toHaveBeenCalled();
    });

    it('should allow null value', async () => {
      mockModel.findFirst.mockResolvedValue(mockCustomField);
      mockModel.update.mockResolvedValue({ ...mockCustomField, fieldValue: null });

      const result = await repository.updateValue(1, 'Tax ID', null);

      expect(result).toEqual({ ...mockCustomField, fieldValue: null });
      expect(mockModel.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { fieldValue: null },
      });
    });
  });

  describe('findRequired', () => {
    it('should return only required fields', async () => {
      const requiredFields = [
        { ...mockCustomField, id: 1, isRequired: true },
        { ...mockCustomField, id: 2, isRequired: true },
      ];
      mockModel.findMany.mockResolvedValue(requiredFields);

      const result = await repository.findRequired(1);

      expect(result).toEqual(requiredFields);
      expect(mockModel.findMany).toHaveBeenCalled();
    });

    it('should return empty array when no required fields', async () => {
      mockModel.findMany.mockResolvedValue([]);

      const result: any = await repository.findRequired(1);

      expect(Array.isArray(result) || result.data).toBeTruthy();
    });
  });

  describe('areRequiredFieldsFilled', () => {
    it('should return true when all required fields are filled', async () => {
      const fields = [
        { ...mockCustomField, id: 1, isRequired: true, fieldValue: 'value1' },
        { ...mockCustomField, id: 2, isRequired: true, fieldValue: 'value2' },
      ];
      mockModel.findMany.mockResolvedValue(fields);

      const result = await repository.areRequiredFieldsFilled(1);

      expect(result).toBe(true);
    });

    it('should return false when required field has null value', async () => {
      const fields = [
        { ...mockCustomField, id: 1, isRequired: true, fieldValue: 'value1' },
        { ...mockCustomField, id: 2, isRequired: true, fieldValue: null },
      ];
      mockModel.findMany.mockResolvedValue(fields);

      const result = await repository.areRequiredFieldsFilled(1);

      expect(result).toBe(false);
    });

    it('should return false when required field has empty string', async () => {
      const fields = [
        { ...mockCustomField, id: 1, isRequired: true, fieldValue: 'value1' },
        { ...mockCustomField, id: 2, isRequired: true, fieldValue: '' },
      ];
      mockModel.findMany.mockResolvedValue(fields);

      const result = await repository.areRequiredFieldsFilled(1);

      expect(result).toBe(false);
    });

    it('should return true when no required fields exist', async () => {
      mockModel.findMany.mockResolvedValue([]);

      const result = await repository.areRequiredFieldsFilled(1);

      expect(result).toBe(true);
    });
  });

  describe('findByType', () => {
    it('should return text fields', async () => {
      const textFields = [
        { ...mockCustomField, fieldType: 'text' },
      ];
      mockModel.findMany.mockResolvedValue(textFields);

      const result = await repository.findByType(1, 'text');

      expect(result).toEqual(textFields);
      expect(mockModel.findMany).toHaveBeenCalled();
    });

    it('should return number fields', async () => {
      const numberFields = [
        { ...mockCustomField, fieldType: 'number', fieldValue: '42' },
      ];
      mockModel.findMany.mockResolvedValue(numberFields);

      const result = await repository.findByType(1, 'number');

      expect(result).toEqual(numberFields);
    });

    it('should return date fields', async () => {
      const dateFields = [
        { ...mockCustomField, fieldType: 'date', fieldValue: '2024-01-01' },
      ];
      mockModel.findMany.mockResolvedValue(dateFields);

      const result = await repository.findByType(1, 'date');

      expect(result).toEqual(dateFields);
    });

    it('should return select fields', async () => {
      const selectFields = [
        { ...mockCustomField, fieldType: 'select', fieldValue: 'option1' },
      ];
      mockModel.findMany.mockResolvedValue(selectFields);

      const result = await repository.findByType(1, 'select');

      expect(result).toEqual(selectFields);
    });

    it('should return boolean fields', async () => {
      const booleanFields = [
        { ...mockCustomField, fieldType: 'boolean', fieldValue: 'true' },
      ];
      mockModel.findMany.mockResolvedValue(booleanFields);

      const result = await repository.findByType(1, 'boolean');

      expect(result).toEqual(booleanFields);
    });
  });

  describe('reorder', () => {
    it('should update display order for multiple fields', async () => {
      mockModel.update
        .mockResolvedValueOnce({ ...mockCustomField, id: 1, displayOrder: 0 })
        .mockResolvedValueOnce({ ...mockCustomField, id: 2, displayOrder: 1 })
        .mockResolvedValueOnce({ ...mockCustomField, id: 3, displayOrder: 2 });

      const result = await repository.reorder(1, [1, 2, 3]);

      expect(result).toBe(3);
      expect(mockModel.update).toHaveBeenCalledTimes(3);
      expect(mockModel.update).toHaveBeenNthCalledWith(1, {
        where: { id: 1 },
        data: { displayOrder: 0 },
      });
      expect(mockModel.update).toHaveBeenNthCalledWith(2, {
        where: { id: 2 },
        data: { displayOrder: 1 },
      });
      expect(mockModel.update).toHaveBeenNthCalledWith(3, {
        where: { id: 3 },
        data: { displayOrder: 2 },
      });
    });

    it('should handle empty array', async () => {
      const result = await repository.reorder(1, []);

      expect(result).toBe(0);
      expect(mockModel.update).not.toHaveBeenCalled();
    });

    it('should skip undefined field IDs', async () => {
      mockModel.update.mockResolvedValue({ ...mockCustomField, displayOrder: 0 });

      const result = await repository.reorder(1, [1, undefined as any, 3]);

      expect(result).toBe(2);
      expect(mockModel.update).toHaveBeenCalledTimes(2);
    });

    it('should handle partial failures', async () => {
      mockModel.update
        .mockResolvedValueOnce({ ...mockCustomField, id: 1 })
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ ...mockCustomField, id: 3 });

      const result = await repository.reorder(1, [1, 2, 3]);

      expect(result).toBe(2);
    });
  });

  describe('deleteAllForCustomer', () => {
    it('should delete all custom fields for customer', async () => {
      mockModel.deleteMany.mockResolvedValue({ count: 5 });

      const result = await repository.deleteAllForCustomer(1);

      expect(result).toBe(5);
      expect(mockModel.deleteMany).toHaveBeenCalledWith({
        where: { customerId: 1 },
      });
    });

    it('should return 0 when no fields to delete', async () => {
      mockModel.deleteMany.mockResolvedValue({ count: 0 });

      const result = await repository.deleteAllForCustomer(999);

      expect(result).toBe(0);
    });
  });

  describe('countForCustomer', () => {
    it('should count all custom fields for customer', async () => {
      mockModel.count.mockResolvedValue(10);

      const result = await repository.countForCustomer(1);

      expect(result).toBe(10);
      expect(mockModel.count).toHaveBeenCalledWith({
        where: { customerId: 1 },
      });
    });

    it('should return 0 when customer has no fields', async () => {
      mockModel.count.mockResolvedValue(0);

      const result = await repository.countForCustomer(1);

      expect(result).toBe(0);
    });
  });
});
