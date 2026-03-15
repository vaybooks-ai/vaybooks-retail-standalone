import { PrismaClient } from '@prisma/client';
import {
  BaseEntity,
  PaginatedResult,
  QueryOptions,
  CreateDTO,
  UpdateDTO,
  PrismaWhereInput,
  PrismaOrderByInput,
  RepositoryFindOptions,
} from './types';

/**
 * Abstract base repository class providing generic CRUD operations
 * All entity-specific repositories should extend this class
 *
 * @template T - The entity type extending BaseEntity
 */
export abstract class BaseRepository<T extends BaseEntity> {
  protected prisma: PrismaClient;
  protected modelName: string;

  /**
   * Initialize the repository with Prisma client and model name
   * @param prisma - PrismaClient instance
   * @param modelName - Name of the Prisma model (e.g., 'user', 'customer')
   */
  constructor(prisma: PrismaClient, modelName: string) {
    this.prisma = prisma;
    this.modelName = modelName;
  }

  /**
   * Get the Prisma model delegate for the current entity
   * This allows dynamic access to any Prisma model
   * @returns The Prisma model delegate
   */
  protected getModel(): any {
    return (this.prisma as any)[this.modelName];
  }

  /**
   * Build Prisma where conditions from filters and search
   * @param options - Query options containing filters and search parameters
   * @returns Prisma where input object
   */
  protected buildWhereConditions(options?: QueryOptions): PrismaWhereInput {
    const where: PrismaWhereInput = {};

    // Apply filters
    if (options?.filters) {
      for (const [key, value] of Object.entries(options.filters)) {
        if (value !== undefined && value !== null) {
          where[key] = value;
        }
      }
    }

    // Apply search with OR conditions across multiple fields
    // Note: SQLite doesn't support mode: 'insensitive', but LIKE is case-insensitive by default
    if (options?.search && options?.searchFields && options.searchFields.length > 0) {
      where.OR = options.searchFields.map(field => ({
        [field]: {
          contains: options.search,
        },
      }));
    }

    return where;
  }

  /**
   * Build Prisma orderBy conditions
   * @param options - Query options containing sort parameters
   * @returns Prisma orderBy input object
   */
  protected buildOrderByConditions(options?: QueryOptions): PrismaOrderByInput {
    if (options?.sortBy) {
      return {
        [options.sortBy]: options.sortOrder || 'asc',
      };
    }
    return { id: 'desc' };
  }

  /**
   * Find all records with optional pagination, filtering, and sorting
   * @param options - Query options for filtering, sorting, and pagination
   * @returns Array of records or paginated result if page/limit provided
   */
  async findAll(options?: QueryOptions): Promise<T[] | PaginatedResult<T>> {
    if (options?.page && options?.limit) {
      return this.findPaginated(options);
    }

    const where = this.buildWhereConditions(options);
    const orderBy = this.buildOrderByConditions(options);

    const data = await this.getModel().findMany({
      where,
      orderBy,
      select: options?.select,
      include: options?.include,
    });

    return data as T[];
  }

  /**
   * Find records with pagination
   * @param options - Query options with page and limit
   * @returns Paginated result with metadata
   */
  async findPaginated(options: QueryOptions): Promise<PaginatedResult<T>> {
    const page = Math.max(1, options.page);
    const limit = Math.min(100, Math.max(1, options.limit));
    const skip = (page - 1) * limit;

    const where = this.buildWhereConditions(options);
    const orderBy = this.buildOrderByConditions(options);

    // Get total count
    const total = await this.getModel().count({ where });

    // Get paginated data
    const data = await this.getModel().findMany({
      where,
      orderBy,
      skip,
      take: limit,
      select: options?.select,
      include: options?.include,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: data as T[],
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Find a single record by ID
   * @param id - The record ID
   * @param options - Optional query options for select/include
   * @returns The record or null if not found
   */
  async findById(
    id: number,
    options?: Omit<QueryOptions, 'page' | 'limit'>
  ): Promise<T | null> {
    const result = await this.getModel().findUnique({
      where: { id },
      select: options?.select,
      include: options?.include,
    });

    return result || null;
  }

  /**
   * Find a single record by conditions
   * @param conditions - Partial entity object to match
   * @param options - Optional query options for select/include
   * @returns The first matching record or null
   */
  async findOne(
    conditions: Partial<T>,
    options?: Omit<QueryOptions, 'page' | 'limit'>
  ): Promise<T | null> {
    if (Object.keys(conditions).length === 0) {
      return null;
    }

    const result = await this.getModel().findFirst({
      where: conditions as PrismaWhereInput,
      select: options?.select,
      include: options?.include,
    });

    return result || null;
  }

  /**
   * Create a new record
   * @param data - Data for the new record (without id and timestamps)
   * @returns The created record
   */
  async create(data: CreateDTO<T>): Promise<T> {
    const result = await this.getModel().create({
      data: data as any,
    });

    return result as T;
  }

  /**
   * Create multiple records
   * @param data - Array of data objects for new records
   * @returns Array of created records
   */
  async createMany(data: CreateDTO<T>[]): Promise<T[]> {
    if (data.length === 0) {
      return [];
    }

    const results = await this.getModel().createMany({
      data: data as any[],
    });

    return results as T[];
  }

  /**
   * Update a record by ID
   * @param id - The record ID
   * @param data - Partial data to update
   * @returns The updated record or null if not found
   */
  async update(id: number, data: UpdateDTO<T>): Promise<T | null> {
    if (Object.keys(data).length === 0) {
      return this.findById(id);
    }

    try {
      const result = await this.getModel().update({
        where: { id },
        data: data as any,
      });

      return result as T;
    } catch (error: any) {
      // Handle record not found (Prisma error code P2025)
      if (error.code === 'P2025') {
        return null;
      }
      throw error;
    }
  }

  /**
   * Update multiple records by conditions
   * @param where - Conditions to match records
   * @param data - Partial data to update
   * @returns Number of records updated
   */
  async updateMany(where: PrismaWhereInput, data: UpdateDTO<T>): Promise<number> {
    const result = await this.getModel().updateMany({
      where,
      data: data as any,
    });

    return result.count;
  }

  /**
   * Delete a record by ID
   * @param id - The record ID
   * @returns True if deleted, false if not found
   */
  async delete(id: number): Promise<boolean> {
    try {
      await this.getModel().delete({
        where: { id },
      });
      return true;
    } catch (error: any) {
      // Handle record not found (Prisma error code P2025)
      if (error.code === 'P2025') {
        return false;
      }
      throw error;
    }
  }

  /**
   * Delete multiple records by IDs
   * @param ids - Array of record IDs
   * @returns Number of records deleted
   */
  async deleteMany(ids: number[]): Promise<number> {
    if (ids.length === 0) {
      return 0;
    }

    const result = await this.getModel().deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    return result.count;
  }

  /**
   * Delete multiple records by conditions
   * @param where - Conditions to match records for deletion
   * @returns Number of records deleted
   */
  async deleteManyByConditions(where: PrismaWhereInput): Promise<number> {
    const result = await this.getModel().deleteMany({
      where,
    });

    return result.count;
  }

  /**
   * Count records with optional conditions
   * @param conditions - Partial entity object to match
   * @returns Number of matching records
   */
  async count(conditions?: Partial<T>): Promise<number> {
    const where =
      conditions && Object.keys(conditions).length > 0
        ? (conditions as PrismaWhereInput)
        : {};

    return this.getModel().count({ where });
  }

  /**
   * Check if records exist matching conditions
   * @param conditions - Partial entity object to match
   * @returns True if at least one record exists
   */
  async exists(conditions: Partial<T>): Promise<boolean> {
    const count = await this.count(conditions);
    return count > 0;
  }

  /**
   * Execute a raw SQL query (use sparingly for complex cases)
   * @param sql - Raw SQL query string
   * @param params - Optional parameters for the query
   * @returns Array of results
   */
  protected async query<R = any>(sql: string, params?: any[]): Promise<R[]> {
    return this.prisma.$queryRawUnsafe(sql, ...(params || [])) as Promise<R[]>;
  }

  /**
   * Execute a raw SQL query for a single result
   * @param sql - Raw SQL query string
   * @param params - Optional parameters for the query
   * @returns Single result or null
   */
  protected async queryOne<R = any>(sql: string, params?: any[]): Promise<R | null> {
    const results = await this.query<R>(sql, params);
    return results.length > 0 ? (results[0] as R) : null;
  }

  /**
   * Execute operations within a transaction
   * @param fn - Async function receiving transaction client
   * @returns Result of the transaction function
   */
  protected async transaction<R>(
    fn: (prisma: any) => Promise<R>
  ): Promise<R> {
    return this.prisma.$transaction(async (tx: any) => {
      return fn(tx as PrismaClient);
    });
  }

  /**
   * Upsert a record (update if exists, create if not)
   * @param where - Conditions to find the record
   * @param create - Data for creating new record
   * @param update - Data for updating existing record
   * @returns The created or updated record
   */
  async upsert(
    where: PrismaWhereInput,
    create: CreateDTO<T>,
    update: UpdateDTO<T>
  ): Promise<T> {
    const result = await this.getModel().upsert({
      where,
      create: create as any,
      update: update as any,
    });

    return result as T;
  }

  /**
   * Find records with advanced Prisma options
   * @param options - Advanced Prisma find options
   * @returns Array of matching records
   */
  async findWithOptions(options: RepositoryFindOptions): Promise<T[]> {
    const results = await this.getModel().findMany(options);
    return results as T[];
  }

  /**
   * Get distinct values for a field
   * @param field - Field name to get distinct values for
   * @param where - Optional conditions to filter
   * @returns Array of distinct values
   */
  async distinct(field: string, where?: PrismaWhereInput): Promise<any[]> {
    return this.getModel().findMany({
      where,
      distinct: [field],
      select: {
        [field]: true,
      },
    });
  }
}
