import { PrismaClient } from '@prisma/client';
import { BaseRepository } from '../../../core/repository';
import { BaseEntity } from '../../../core/types';

// Test entity interface
interface TestEntity extends BaseEntity {
  id: number;
  name: string;
  email?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Concrete repository implementation for testing
class TestRepository extends BaseRepository<TestEntity> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'testModel');
  }
}

describe('BaseRepository', () => {
  let prisma: jest.Mocked<PrismaClient>;
  let repository: TestRepository;
  let mockModel: any;

  const mockEntity: TestEntity = {
    id: 1,
    name: 'Test Entity',
    email: 'test@example.com',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  beforeEach(() => {
    mockModel = {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      createMany: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
      upsert: jest.fn(),
    };

    prisma = {
      testModel: mockModel,
      $queryRawUnsafe: jest.fn(),
      $transaction: jest.fn(),
    } as any;

    repository = new TestRepository(prisma);
  });

  describe('Constructor & Initialization', () => {
    it('should initialize with prisma client and model name', () => {
      expect(repository).toBeInstanceOf(BaseRepository);
      expect(repository).toBeInstanceOf(TestRepository);
    });
  });

  describe('findAll', () => {
    it('should return all records without pagination', async () => {
      mockModel.findMany.mockResolvedValue([mockEntity]);

      const result = await repository.findAll();

      expect(result).toEqual([mockEntity]);
      expect(mockModel.findMany).toHaveBeenCalled();
    });

    it('should apply filters', async () => {
      mockModel.findMany.mockResolvedValue([mockEntity]);

      await repository.findAll({
        page: 1,
        limit: 10,
        filters: { isActive: true },
      });

      expect(mockModel.findMany).toHaveBeenCalled();
    });

    it('should apply search across multiple fields', async () => {
      mockModel.findMany.mockResolvedValue([mockEntity]);
      mockModel.count.mockResolvedValue(1);

      await repository.findAll({
        page: 1,
        limit: 10,
        search: 'test',
        searchFields: ['name', 'email'],
      });

      expect(mockModel.findMany).toHaveBeenCalled();
    });

    it('should apply sorting', async () => {
      mockModel.findMany.mockResolvedValue([mockEntity]);

      await repository.findAll({
        page: 1,
        limit: 10,
        sortBy: 'name',
        sortOrder: 'asc',
      });

      expect(mockModel.findMany).toHaveBeenCalled();
    });

    it('should return paginated results when page and limit provided', async () => {
      mockModel.findMany.mockResolvedValue([mockEntity]);
      mockModel.count.mockResolvedValue(25);

      const result: any = await repository.findAll({
        page: 1,
        limit: 10,
      });

      expect(result.data).toBeDefined();
      expect(result.pagination).toBeDefined();
    });
  });

  describe('findPaginated', () => {
    it('should return paginated results with metadata', async () => {
      mockModel.findMany.mockResolvedValue([mockEntity]);
      mockModel.count.mockResolvedValue(25);

      const result = await repository.findPaginated({
        page: 2,
        limit: 10,
      });

      expect(result.data).toEqual([mockEntity]);
      expect(result.pagination).toEqual({
        page: 2,
        limit: 10,
        total: 25,
        totalPages: 3,
        hasNext: true,
        hasPrev: true,
      });
    });

    it('should handle first page', async () => {
      mockModel.findMany.mockResolvedValue([mockEntity]);
      mockModel.count.mockResolvedValue(25);

      const result = await repository.findPaginated({
        page: 1,
        limit: 10,
      });

      expect(result.pagination.hasPrev).toBe(false);
      expect(result.pagination.hasNext).toBe(true);
    });

    it('should handle last page', async () => {
      mockModel.findMany.mockResolvedValue([mockEntity]);
      mockModel.count.mockResolvedValue(25);

      const result = await repository.findPaginated({
        page: 3,
        limit: 10,
      });

      expect(result.pagination.hasPrev).toBe(true);
      expect(result.pagination.hasNext).toBe(false);
    });

    it('should enforce minimum page of 1', async () => {
      mockModel.findMany.mockResolvedValue([mockEntity]);
      mockModel.count.mockResolvedValue(10);

      const result = await repository.findPaginated({
        page: 0,
        limit: 10,
      });

      expect(result.pagination.page).toBe(1);
    });

    it('should enforce maximum limit of 100', async () => {
      mockModel.findMany.mockResolvedValue([mockEntity]);
      mockModel.count.mockResolvedValue(200);

      const result = await repository.findPaginated({
        page: 1,
        limit: 200,
      });

      expect(result.pagination.limit).toBe(100);
    });
  });

  describe('findById', () => {
    it('should return entity by ID', async () => {
      mockModel.findUnique.mockResolvedValue(mockEntity);

      const result = await repository.findById(1);

      expect(result).toEqual(mockEntity);
      expect(mockModel.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: undefined,
        include: undefined,
      });
    });

    it('should return null when not found', async () => {
      mockModel.findUnique.mockResolvedValue(null);

      const result = await repository.findById(999);

      expect(result).toBeNull();
    });

    it('should support select option', async () => {
      mockModel.findUnique.mockResolvedValue({ id: 1, name: 'Test' });

      await repository.findById(1, { select: { id: true, name: true } });

      expect(mockModel.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: { id: true, name: true },
        include: undefined,
      });
    });
  });

  describe('findOne', () => {
    it('should return first matching entity', async () => {
      mockModel.findFirst.mockResolvedValue(mockEntity);

      const result = await repository.findOne({ name: 'Test Entity' });

      expect(result).toEqual(mockEntity);
      expect(mockModel.findFirst).toHaveBeenCalledWith({
        where: { name: 'Test Entity' },
        select: undefined,
        include: undefined,
      });
    });

    it('should return null when not found', async () => {
      mockModel.findFirst.mockResolvedValue(null);

      const result = await repository.findOne({ name: 'NonExistent' });

      expect(result).toBeNull();
    });

    it('should return null for empty conditions', async () => {
      const result = await repository.findOne({});

      expect(result).toBeNull();
      expect(mockModel.findFirst).not.toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create new entity', async () => {
      const createData = { name: 'New Entity', isActive: true };
      mockModel.create.mockResolvedValue(mockEntity);

      const result = await repository.create(createData as any);

      expect(result).toEqual(mockEntity);
      expect(mockModel.create).toHaveBeenCalledWith({
        data: createData,
      });
    });
  });

  describe('createMany', () => {
    it('should create multiple entities', async () => {
      const createData = [
        { name: 'Entity 1', isActive: true },
        { name: 'Entity 2', isActive: true },
      ];
      mockModel.createMany.mockResolvedValue([mockEntity, { ...mockEntity, id: 2 }]);

      const result = await repository.createMany(createData as any);

      expect(result).toHaveLength(2);
      expect(mockModel.createMany).toHaveBeenCalledWith({
        data: createData,
      });
    });

    it('should return empty array for empty input', async () => {
      const result = await repository.createMany([]);

      expect(result).toEqual([]);
      expect(mockModel.createMany).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update entity by ID', async () => {
      const updateData = { name: 'Updated Name' };
      mockModel.update.mockResolvedValue({ ...mockEntity, name: 'Updated Name' });

      const result = await repository.update(1, updateData);

      expect(result).toEqual({ ...mockEntity, name: 'Updated Name' });
      expect(mockModel.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateData,
      });
    });

    it('should return null when entity not found', async () => {
      mockModel.update.mockRejectedValue({ code: 'P2025' });

      const result = await repository.update(999, { name: 'Test' });

      expect(result).toBeNull();
    });

    it('should throw error for other database errors', async () => {
      const error = new Error('Database error');
      mockModel.update.mockRejectedValue(error);

      await expect(repository.update(1, { name: 'Test' })).rejects.toThrow('Database error');
    });

    it('should return current entity when no data provided', async () => {
      mockModel.findUnique.mockResolvedValue(mockEntity);

      const result = await repository.update(1, {});

      expect(result).toEqual(mockEntity);
      expect(mockModel.update).not.toHaveBeenCalled();
    });
  });

  describe('updateMany', () => {
    it('should update multiple entities', async () => {
      mockModel.updateMany.mockResolvedValue({ count: 3 });

      const result = await repository.updateMany(
        { isActive: true },
        { name: 'Updated' }
      );

      expect(result).toBe(3);
      expect(mockModel.updateMany).toHaveBeenCalledWith({
        where: { isActive: true },
        data: { name: 'Updated' },
      });
    });
  });

  describe('delete', () => {
    it('should delete entity by ID', async () => {
      mockModel.delete.mockResolvedValue(mockEntity);

      const result = await repository.delete(1);

      expect(result).toBe(true);
      expect(mockModel.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should return false when entity not found', async () => {
      mockModel.delete.mockRejectedValue({ code: 'P2025' });

      const result = await repository.delete(999);

      expect(result).toBe(false);
    });

    it('should throw error for other database errors', async () => {
      const error = new Error('Database error');
      mockModel.delete.mockRejectedValue(error);

      await expect(repository.delete(1)).rejects.toThrow('Database error');
    });
  });

  describe('deleteMany', () => {
    it('should delete multiple entities by IDs', async () => {
      mockModel.deleteMany.mockResolvedValue({ count: 3 });

      const result = await repository.deleteMany([1, 2, 3]);

      expect(result).toBe(3);
      expect(mockModel.deleteMany).toHaveBeenCalledWith({
        where: {
          id: { in: [1, 2, 3] },
        },
      });
    });

    it('should return 0 for empty array', async () => {
      const result = await repository.deleteMany([]);

      expect(result).toBe(0);
      expect(mockModel.deleteMany).not.toHaveBeenCalled();
    });
  });

  describe('deleteManyByConditions', () => {
    it('should delete entities matching conditions', async () => {
      mockModel.deleteMany.mockResolvedValue({ count: 5 });

      const result = await repository.deleteManyByConditions({ isActive: false });

      expect(result).toBe(5);
      expect(mockModel.deleteMany).toHaveBeenCalledWith({
        where: { isActive: false },
      });
    });
  });

  describe('count', () => {
    it('should count all entities', async () => {
      mockModel.count.mockResolvedValue(10);

      const result = await repository.count();

      expect(result).toBe(10);
      expect(mockModel.count).toHaveBeenCalledWith({ where: {} });
    });

    it('should count entities matching conditions', async () => {
      mockModel.count.mockResolvedValue(5);

      const result = await repository.count({ isActive: true });

      expect(result).toBe(5);
      expect(mockModel.count).toHaveBeenCalledWith({
        where: { isActive: true },
      });
    });
  });

  describe('exists', () => {
    it('should return true when entities exist', async () => {
      mockModel.count.mockResolvedValue(3);

      const result = await repository.exists({ isActive: true });

      expect(result).toBe(true);
    });

    it('should return false when no entities exist', async () => {
      mockModel.count.mockResolvedValue(0);

      const result = await repository.exists({ isActive: false });

      expect(result).toBe(false);
    });
  });

  describe('upsert', () => {
    it('should create or update entity', async () => {
      mockModel.upsert.mockResolvedValue(mockEntity);

      const result = await repository.upsert(
        { id: 1 },
        { name: 'New', isActive: true } as any,
        { name: 'Updated' }
      );

      expect(result).toEqual(mockEntity);
      expect(mockModel.upsert).toHaveBeenCalledWith({
        where: { id: 1 },
        create: { name: 'New', isActive: true },
        update: { name: 'Updated' },
      });
    });
  });

  describe('findWithOptions', () => {
    it('should find entities with advanced options', async () => {
      mockModel.findMany.mockResolvedValue([mockEntity]);

      const result = await repository.findWithOptions({
        where: { isActive: true },
        orderBy: { name: 'asc' },
        take: 10,
      });

      expect(result).toEqual([mockEntity]);
      expect(mockModel.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { name: 'asc' },
        take: 10,
      });
    });
  });

  describe('distinct', () => {
    it('should return distinct values for field', async () => {
      mockModel.findMany.mockResolvedValue([
        { name: 'Test 1' },
        { name: 'Test 2' },
      ]);

      const result = await repository.distinct('name');

      expect(result).toHaveLength(2);
      expect(mockModel.findMany).toHaveBeenCalledWith({
        where: undefined,
        distinct: ['name'],
        select: { name: true },
      });
    });

    it('should support where conditions', async () => {
      mockModel.findMany.mockResolvedValue([{ name: 'Test' }]);

      await repository.distinct('name', { isActive: true });

      expect(mockModel.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        distinct: ['name'],
        select: { name: true },
      });
    });
  });
});
