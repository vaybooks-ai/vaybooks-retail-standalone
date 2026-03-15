/**
 * Shared types for VayBooks Retail Standalone
 * Used across frontend and backend applications
 */

// Base types
export interface BaseEntity {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Timestamps {
  createdAt: Date;
  updatedAt: Date;
}

export interface SoftDelete {
  deletedAt?: Date;
  isDeleted?: boolean;
}

export interface Auditable {
  createdBy?: number;
  updatedBy?: number;
  createdByName?: string;
  updatedByName?: string;
}

// Pagination types
export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

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

// Query and filter types
export interface FilterOptions {
  [key: string]: any;
}

export interface QueryOptions extends PaginationOptions {
  filters?: FilterOptions;
  search?: string;
  searchFields?: string[];
  select?: Record<string, boolean>;
  include?: Record<string, any>;
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: string[];
  message?: string;
  timestamp?: Date;
}

export interface ValidationError {
  field: string;
  message: string;
}

// Re-export entity types
export * from './customer';
export * from './address';
export * from './master-data';

// Future exports
// export * from './product';
// export * from './supplier';
// export * from './invoice';
// export * from './user';
// export * from './inventory';
