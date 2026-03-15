import { apiClient } from '../api';
import {
  Customer,
  CreateCustomerDTO,
  UpdateCustomerDTO,
  PaginatedResult,
  ApiResponse,
} from '@vaybooks/shared';

export interface CustomerFilters {
  search?: string;
  is_active?: boolean;
  has_balance?: boolean;
  city?: string;
  state?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const customersApi = {
  // Get all customers with filters
  async getCustomers(filters?: CustomerFilters): Promise<PaginatedResult<Customer>> {
    return apiClient.get<PaginatedResult<Customer>>('/customers', filters);
  },

  // Get customer by ID
  async getCustomer(id: number, includeStats?: boolean): Promise<ApiResponse<Customer>> {
    return apiClient.get<ApiResponse<Customer>>(`/customers/${id}`, { includeStats });
  },

  // Get customer by code
  async getCustomerByCode(code: string): Promise<ApiResponse<Customer>> {
    return apiClient.get<ApiResponse<Customer>>(`/customers/code/${code}`);
  },

  // Create new customer
  async createCustomer(data: CreateCustomerDTO): Promise<ApiResponse<Customer>> {
    return apiClient.post<ApiResponse<Customer>>('/customers', data);
  },

  // Update customer
  async updateCustomer(id: number, data: UpdateCustomerDTO): Promise<ApiResponse<Customer>> {
    return apiClient.put<ApiResponse<Customer>>(`/customers/${id}`, data);
  },

  // Delete customer
  async deleteCustomer(id: number): Promise<ApiResponse> {
    return apiClient.delete<ApiResponse>(`/customers/${id}`);
  },

  // Generate customer code
  async generateCode(prefix?: string): Promise<ApiResponse<{ code: string }>> {
    return apiClient.get<ApiResponse<{ code: string }>>('/customers/generate-code', { prefix });
  },

  // Get top customers
  async getTopCustomers(limit?: number): Promise<ApiResponse<Customer[]>> {
    return apiClient.get<ApiResponse<Customer[]>>('/customers/top', { limit });
  },

  // Update customer balance
  async updateBalance(
    id: number,
    amount: number,
    operation: 'add' | 'subtract'
  ): Promise<ApiResponse> {
    return apiClient.post<ApiResponse>(`/customers/${id}/balance`, { amount, operation });
  },

  // Bulk import customers
  async bulkImport(customers: CreateCustomerDTO[]): Promise<ApiResponse<{
    success: number;
    failed: number;
    errors: string[];
  }>> {
    return apiClient.post<ApiResponse<any>>('/customers/bulk-import', { customers });
  },
};

// Export for easy access
export default customersApi;
