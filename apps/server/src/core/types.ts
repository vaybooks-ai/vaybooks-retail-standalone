/**
 * Base entity interface that all models should extend
 * Provides common fields for all entities
 */
export interface BaseEntity {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Pagination options for querying paginated results
 */
export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated result wrapper with metadata
 */
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Filter options for dynamic filtering
 */
export interface FilterOptions {
  [key: string]: any;
}

/**
 * Query options combining pagination, filtering, and search
 */
export interface QueryOptions extends PaginationOptions {
  filters?: FilterOptions;
  search?: string;
  searchFields?: string[];
  select?: Record<string, boolean>;
  include?: Record<string, any>;
}

/**
 * Type utilities for DTO creation
 */
export type WithoutTimestamps<T> = Omit<T, 'createdAt' | 'updatedAt'>;
export type WithoutId<T> = Omit<T, 'id'>;
export type CreateDTO<T> = WithoutId<WithoutTimestamps<T>>;
export type UpdateDTO<T> = Partial<CreateDTO<T>>;

/**
 * Prisma-specific types for advanced queries
 */
export interface PrismaWhereInput {
  [key: string]: any;
}

export interface PrismaOrderByInput {
  [key: string]: 'asc' | 'desc';
}

/**
 * Repository options for advanced Prisma queries
 */
export interface RepositoryFindOptions {
  where?: PrismaWhereInput;
  select?: Record<string, boolean>;
  include?: Record<string, any>;
  orderBy?: PrismaOrderByInput;
  skip?: number;
  take?: number;
}
